import { ArrowRight } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { AddToCartButton } from '../components/AddToCartButton';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { Reveal } from '../components/Reveal';
import { useAuth } from '../context/AuthContext';
import { useCatalogueNumbers } from '../hooks/useCatalogueNumbers';
import { useCategories } from '../hooks/useCategories';
import { useFeatured } from '../hooks/useFeatured';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../lib/format';
import type { Product } from '../types';

const ease = [0.16, 1, 0.3, 1] as const;
const pad = (n: number) => String(n).padStart(2, '0');

const checkoutNotes = [
  {
    label: 'Prices',
    body: 'Your total is recalculated from the catalog before you pay, so what you see is what Stripe charges.',
  },
  { label: 'Stock', body: 'Inventory only drops after Stripe confirms your payment.' },
  { label: 'Cart', body: 'It is saved on this device until you check out.' },
];

/** The overflow of the range, set as an index line: catalogue number, photograph, name, price, add. */
function IndexRow({ product }: { product: Product }) {
  const number = useCatalogueNumbers()[product.id];
  const soldOut = product.stock <= 0;
  const low = !soldOut && product.stock <= 5;
  const href = `/products/${product.slug}`;

  return (
    <li className="grid grid-cols-[1.5rem_4rem_1fr_auto_auto] items-center gap-x-3 py-4 sm:grid-cols-[2rem_6rem_1fr_auto_auto] sm:gap-x-5">
      <span className="num text-sm">{number !== undefined ? pad(number) : ''}</span>
      <Link to={href} aria-label={product.name} className="block aspect-square overflow-hidden bg-sunken">
        {product.image_url && (
          <img src={product.image_url} alt="" loading="lazy" className="size-full object-cover" />
        )}
      </Link>
      <div className="min-w-0">
        <Link
          to={href}
          className="line-clamp-2 block font-bold leading-snug underline-offset-4 hover:underline"
        >
          {product.name}
        </Link>
        <p className="mt-0.5 hidden line-clamp-2 text-[13px] leading-5 text-muted sm:block">
          {product.description}
        </p>
      </div>
      <div className="text-right">
        <p className="num text-sm font-medium">{formatPrice(product.price_cents, product.currency)}</p>
        <p className={`num text-[12px] ${low ? 'font-semibold text-danger' : 'text-muted'}`}>
          {soldOut ? 'Sold out' : low ? `Only ${product.stock} left` : `${product.stock} in stock`}
        </p>
      </div>
      <AddToCartButton product={product} small compact />
    </li>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { products: featured, loading: featuredLoading } = useFeatured(1);
  const { products: newest, total, loading } = useProducts({ pageSize: 12, sort: 'newest' });
  const { categories } = useCategories();

  const lead = featured[0] ?? newest[0];
  const rest = newest.filter((p) => p.id !== lead?.id);
  const plates = rest.slice(0, 4);
  const more = rest.slice(4);
  const countIn = (categoryId: string) => newest.filter((p) => p.category_id === categoryId).length;

  return (
    <div>
      {/* The sheet: headline, then the range as a lead plate and a block of plates */}
      <section className="page pt-8 md:pt-12">
        <div className="grid12 items-end gap-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="display col-span-12 text-5xl sm:text-6xl lg:col-span-9 lg:text-7xl xl:text-[6rem]"
          >
            Everyday tech, thoughtfully made.
          </motion.h1>
          <div className="col-span-12 flex items-center justify-between gap-4 lg:col-span-3 lg:flex-col lg:items-end lg:justify-end">
            <p className="num text-sm text-muted">{loading ? '' : `${pad(total)} products`}</p>
            <Link to="/shop" className="btn btn-ink">
              Shop the range
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="grid12 mt-8 gap-y-8 border-t border-ink pt-5 md:mt-10">
          <div className="col-span-12 lg:col-span-5">
            {featuredLoading && !lead ? (
              <ProductCardSkeleton />
            ) : (
              lead && <ProductCard product={lead} tone="lead" />
            )}
          </div>

          <div className="col-span-12 grid grid-cols-1 gap-x-6 gap-y-6 self-start sm:grid-cols-2 lg:col-span-7">
            {loading
              ? Array.from({ length: 4 }, (_, i) => (
                  <div key={i} aria-hidden="true">
                    <div className="skeleton aspect-[16/7]" />
                    <div className="mt-px border-t border-ink p-3">
                      <div className="skeleton h-4 w-2/3" />
                      <div className="skeleton mt-3 h-10 w-32" />
                    </div>
                  </div>
                ))
              : plates.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 + i * 0.07, ease }}
                  >
                    <ProductCard product={p} compact />
                  </motion.div>
                ))}
          </div>
        </div>

        {more.length > 0 && (
          <div className="mt-12">
            <h2 className="display text-2xl md:text-3xl">Also in the range</h2>
            <ol className="mt-4 divide-y divide-line border-y border-ink">
              {more.map((p) => (
                <IndexRow key={p.id} product={p} />
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* Contents: the range by category */}
      <section className="page pt-24 md:pt-32">
        <Reveal>
          <h2 className="display text-3xl md:text-5xl">Shop by category</h2>
          <ul className="mt-8 border-t border-ink">
            {categories.map((c) => {
              const n = countIn(c.id);
              return (
                <li key={c.id} className="border-b border-line">
                  <Link
                    to={`/shop?category=${c.id}`}
                    className="group grid12 items-center py-5 transition-colors hover:bg-accent hover:text-accent-ink md:py-6"
                  >
                    <span className="display col-span-8 pl-1 text-2xl md:text-3xl">{c.name}</span>
                    <span className="num col-span-3 text-sm md:text-base">
                      {pad(n)}
                      <span className="hidden sm:inline"> product{n === 1 ? '' : 's'}</span>
                      <span className="sr-only sm:hidden"> product{n === 1 ? '' : 's'}</span>
                    </span>
                    <ArrowRight
                      size={24}
                      className="col-span-1 justify-self-end transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </section>

      {/* Checkout notes, set as spec rows */}
      <section className="page pt-24 md:pt-32">
        <Reveal>
          <div className="grid12 gap-y-8">
            <h2 className="display col-span-12 text-3xl md:text-5xl lg:col-span-5">
              Checkout you can trust.
            </h2>
            <dl className="col-span-12 lg:col-span-7">
              {checkoutNotes.map((n) => (
                <div key={n.label} className="spec">
                  <dt className="spec-label pt-0.5">{n.label}</dt>
                  <dd className="max-w-[56ch] text-base">{n.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </section>

      {/* Closing: one flat field of yellow */}
      <section className="page pt-24 md:pt-32">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 bg-accent p-8 text-accent-ink md:flex-row md:items-end md:p-12">
            <div>
              <h2 className="display text-4xl md:text-6xl">
                {user ? 'Your wishlist is waiting.' : 'Save what you love.'}
              </h2>
              <p className="mt-3 max-w-[44ch] text-base">
                {user
                  ? 'Pick up where you left off with the pieces you saved.'
                  : 'Create an account to keep a wishlist and follow your orders.'}
              </p>
            </div>
            <Link to={user ? '/account?tab=wishlist' : '/signup'} className="btn btn-ink px-6 py-3.5">
              {user ? 'Open wishlist' : 'Create account'}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
