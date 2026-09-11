import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Product } from '../types';

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export interface ProductFilters {
  search?: string;
  categoryId?: string | null;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

interface ProductsResult {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
}

export function useProducts(filters: ProductFilters): ProductsResult {
  const { search = '', categoryId, sort = 'newest', page = 1, pageSize = 12 } = filters;
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (search.trim()) query = query.ilike('name', `%${search.trim()}%`);
    if (categoryId) query = query.eq('category_id', categoryId);

    if (sort === 'price_asc') query = query.order('price_cents', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price_cents', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    query.then(({ data, count, error: err }) => {
      if (cancelled) return;
      if (err) setError(err.message);
      else {
        setProducts((data ?? []) as Product[]);
        setTotal(count ?? 0);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [search, categoryId, sort, page, pageSize]);

  return { products, total, loading, error };
}
