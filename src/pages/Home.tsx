import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';

export default function Home() {
  const { products, loading } = useProducts({ pageSize: 4, sort: 'newest' });
  const { categories } = useCategories();

  return (
    <div>
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everyday tech, thoughtfully made.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Curated electronics and accessories — browse the shop, add to your cart, and
            check out securely with Stripe.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Shop the collection
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-900 hover:text-slate-900"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">New arrivals</h2>
          <Link to="/shop" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
