import { useEffect, useState } from 'react';
import { formatPrice } from '../../lib/format';
import { supabase } from '../../lib/supabaseClient';
import type { Category, Product } from '../../types';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  image_url: '',
  category_id: '',
};

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((p ?? []) as Product[]);
    setCategories((c ?? []) as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateProduct = async (id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    await supabase.from('products').update(patch).eq('id', id);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const price = Math.round(Number(form.price) * 100);
    const stock = Number(form.stock);
    if (!form.name.trim() || Number.isNaN(price) || Number.isNaN(stock)) {
      setError('Name, price and stock are required.');
      return;
    }
    setSaving(true);
    const { error: insertError } = await supabase.from('products').insert({
      name: form.name,
      slug: `${slugify(form.name)}-${Date.now().toString(36)}`,
      description: form.description,
      price_cents: price,
      stock,
      image_url: form.image_url || null,
      category_id: form.category_id || null,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {showForm ? 'Cancel' : 'Add product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProduct} className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 p-4">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm"
            rows={2}
          />
          <input
            placeholder="Price (USD)"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Stock"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 rounded-md bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-400"
          >
            Create product
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Active</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="flex items-center gap-3 p-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100">
                    {p.image_url && (
                      <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span className="font-medium text-slate-900">{p.name}</span>
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={(p.price_cents / 100).toFixed(2)}
                    onBlur={(e) =>
                      updateProduct(p.id, { price_cents: Math.round(Number(e.target.value) * 100) })
                    }
                    className="w-24 rounded-md border border-slate-300 px-2 py-1"
                  />
                  <p className="mt-0.5 text-xs text-slate-400">{formatPrice(p.price_cents)}</p>
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    defaultValue={p.stock}
                    onBlur={(e) => updateProduct(p.id, { stock: Number(e.target.value) })}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={p.is_active}
                    onChange={(e) => updateProduct(p.id, { is_active: e.target.checked })}
                  />
                </td>
                <td className="p-3">
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
