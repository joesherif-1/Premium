import { CaretLeft, CaretRight, MagnifyingGlass } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { Reveal } from '../components/Reveal';
import { useCategories } from '../hooks/useCategories';
import { useProducts, type SortOption } from '../hooks/useProducts';

const PAGE_SIZE = 12;
const SORTS: SortOption[] = ['newest', 'price_asc', 'price_desc'];

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const sortParam = searchParams.get('sort') as SortOption | null;
  const sort: SortOption = sortParam && SORTS.includes(sortParam) ? sortParam : 'newest';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const urlQuery = searchParams.get('q') ?? '';

  const [search, setSearch] = useState(urlQuery);
  const debouncedSearch = useDebounced(search, 300);

  // Keep the URL in step with what was typed, so filtered views can be shared.
  useEffect(() => {
    if (debouncedSearch === urlQuery) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set('q', debouncedSearch);
        else next.delete('q');
        next.delete('page');
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { categories } = useCategories();
  const { products, total, loading, error } = useProducts({
    search: debouncedSearch,
    categoryId,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = Boolean(debouncedSearch || categoryId);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  const categoryClass = (active: boolean) =>
    `shrink-0 border px-3 py-2 text-left text-sm font-semibold transition-colors lg:w-full lg:border-0 lg:border-b lg:px-2 ${
      active
        ? 'border-ink bg-ink text-bg lg:border-ink'
        : 'border-ink/45 text-ink hover:bg-sunken lg:border-line'
    }`;

  return (
    <div className="page py-10 md:py-14">
      <div className="grid12 items-end gap-y-3">
        <h1 className="display col-span-12 text-5xl md:col-span-8 md:text-7xl">Shop</h1>
        {!loading && !error && (
          <p className="num col-span-12 text-sm text-muted md:col-span-4 md:text-right">
            {String(total).padStart(2, '0')} product{total === 1 ? '' : 's'}
          </p>
        )}
      </div>

      <div className="grid12 mt-10 gap-y-8 border-t border-ink pt-6">
        <aside className="col-span-12 lg:col-span-3">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="relative">
              <label htmlFor="shop-search" className="sr-only">
                Search products
              </label>
              <MagnifyingGlass
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="shop-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                className="field pl-10"
              />
            </div>

            <div>
              <p className="spec-label mb-2">Category</p>
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0 lg:px-0">
                <button
                  type="button"
                  aria-pressed={!categoryId}
                  onClick={() => updateParam('category', null)}
                  className={categoryClass(!categoryId)}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={categoryId === c.id}
                    onClick={() => updateParam('category', c.id)}
                    className={categoryClass(categoryId === c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="shop-sort" className="spec-label mb-2 block">
                Sort
              </label>
              <select
                id="shop-sort"
                value={sort}
                onChange={(e) =>
                  updateParam('sort', e.target.value === 'newest' ? null : e.target.value)
                }
                className="field"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="col-span-12 lg:col-span-9">
          {error ? (
            <div role="alert" className="border border-ink p-8">
              <p className="font-bold">We could not load the catalog.</p>
              <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn btn-ink btn-sm mt-5"
              >
                Reload
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16">
              <p className="display text-3xl md:text-4xl">Nothing matches that search.</p>
              <p className="mt-3 text-muted">Try a different word or remove a filter.</p>
              {filtered && (
                <button type="button" onClick={clearFilters} className="btn btn-ink mt-6">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
              {products.map((p, i) => {
                // The first plate of the unfiltered first page leads the sheet across both columns.
                const lead = page === 1 && i === 0 && !filtered;
                return (
                  <Reveal
                    key={p.id}
                    delay={Math.min(i, 5) * 0.05}
                    y={16}
                    className={lead ? 'sm:col-span-2' : ''}
                  >
                    <ProductCard product={p} tone={lead ? 'lead' : 'plain'} wide={lead} />
                  </Reveal>
                );
              })}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <nav aria-label="Pagination" className="mt-14 flex items-center gap-1.5 border-t border-ink pt-6">
              <button
                type="button"
                onClick={() => updateParam('page', String(page - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className="grid size-10 place-items-center border border-ink transition-colors hover:bg-ink hover:text-bg disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
              >
                <CaretLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateParam('page', String(p))}
                  aria-current={p === page ? 'page' : undefined}
                  className={`num size-10 text-sm transition-colors ${
                    p === page ? 'bg-ink text-bg' : 'hover:bg-sunken'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => updateParam('page', String(page + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
                className="grid size-10 place-items-center border border-ink transition-colors hover:bg-ink hover:text-bg disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
              >
                <CaretRight />
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
