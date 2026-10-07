import { Plus, Trash, X } from '@phosphor-icons/react';
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
  const [tableError, setTableError] = useState<string | null>(null);

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
    setTableError(null);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    const { error: updateError } = await supabase.from('products').update(patch).eq('id', id);
    if (updateError) {
      setTableError(updateError.message);
      load();
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setTableError(null);
    const { error: deleteError } = await supabase.from('products').delete().eq('id', id);
    if (deleteError) {
      setTableError(deleteError.message);
      return;
    }
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

  if (loading) {
    return (
      <div role="status" aria-label="Loading inventory">
        <div className="skeleton h-12 w-56" />
        <div className="skeleton mt-8 h-72 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="display text-4xl md:text-6xl">Inventory</h1>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className={`btn btn-sm ${showForm ? 'btn-ghost' : 'btn-ink'}`}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add product'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createProduct}
          className="mt-8 grid gap-4 border border-ink p-5 sm:grid-cols-2 md:p-6"
        >
          <div className="sm:col-span-2">
            <label htmlFor="p-name" className="label">
              Name
            </label>
            <input
              id="p-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="p-desc" className="label">
              Description
            </label>
            <textarea
              id="p-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="field"
              rows={2}
            />
          </div>
          <div>
            <label htmlFor="p-price" className="label">
              Price (USD)
            </label>
            <input
              id="p-price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="p-stock" className="label">
              Stock
            </label>
            <input
              id="p-stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="p-image" className="label">
              Image URL
            </label>
            <input
              id="p-image"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="p-cat" className="label">
              Category
            </label>
            <select
              id="p-cat"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="field"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p role="alert" className="error-text sm:col-span-2">
              {error}
            </p>
          )}
          <button type="submit" disabled={saving} className="btn btn-ink sm:col-span-2">
            {saving ? 'Creating' : 'Create product'}
          </button>
        </form>
      )}

      {tableError && (
        <p role="alert" className="error-text mt-6">
          {tableError}
        </p>
      )}

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink text-left">
              <th className="spec-label py-3 pr-4 font-semibold">Product</th>
              <th className="spec-label py-3 pr-4 font-semibold">Price</th>
              <th className="spec-label py-3 pr-4 font-semibold">Stock</th>
              <th className="spec-label py-3 pr-4 font-semibold">Active</th>
              <th className="spec-label py-3 pr-4 font-semibold">Featured</th>
              <th className="py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="size-11 shrink-0 overflow-hidden bg-sunken">
                      {p.image_url && <img src={p.image_url} alt="" className="size-full object-cover" />}
                    </div>
                    <span className="font-bold">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <label className="sr-only" htmlFor={`price-${p.id}`}>
                    Price for {p.name}
                  </label>
                  <input
                    id={`price-${p.id}`}
                    type="number"
                    step="0.01"
                    defaultValue={(p.price_cents / 100).toFixed(2)}
                    onBlur={(e) =>
                      updateProduct(p.id, { price_cents: Math.round(Number(e.target.value) * 100) })
                    }
                    className="field num w-28! py-1.5"
                  />
                  <p className="num mt-1 text-xs text-muted">{formatPrice(p.price_cents)}</p>
                </td>
                <td className="py-3 pr-4">
                  <label className="sr-only" htmlFor={`stock-${p.id}`}>
                    Stock for {p.name}
                  </label>
                  <input
                    id={`stock-${p.id}`}
                    type="number"
                    min="0"
                    defaultValue={p.stock}
                    onBlur={(e) => updateProduct(p.id, { stock: Number(e.target.value) })}
                    className="field num w-24! py-1.5"
                  />
                </td>
                <td className="py-3 pr-4">
                  <input
                    type="checkbox"
                    checked={p.is_active}
                    onChange={(e) => updateProduct(p.id, { is_active: e.target.checked })}
                    aria-label={`${p.name} is active`}
                    className="size-4"
                  />
                </td>
                <td className="py-3 pr-4">
                  <input
                    type="checkbox"
                    checked={Boolean(p.is_featured)}
                    onChange={(e) => updateProduct(p.id, { is_featured: e.target.checked })}
                    aria-label={`${p.name} is featured`}
                    className="size-4"
                  />
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => deleteProduct(p.id)}
                    aria-label={`Delete ${p.name}`}
                    className="grid size-10 place-items-center text-muted transition-colors hover:bg-danger hover:text-bg"
                  >
                    <Trash size={18} />
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
