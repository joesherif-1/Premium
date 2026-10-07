import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Product } from '../types';

/**
 * Featured products for the hero. Falls back to the newest products when the
 * is_featured column does not exist yet or nothing is flagged.
 */
export function useFeatured(limit = 3) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      const base = () =>
        supabase.from('products').select('*').eq('is_active', true).order('created_at', {
          ascending: false,
        });

      const featured = await base().eq('is_featured', true).limit(limit);
      let rows = featured.error ? [] : (featured.data ?? []);
      if (rows.length === 0) {
        const fallback = await base().limit(limit);
        rows = fallback.data ?? [];
      }
      if (live) {
        setProducts(rows as Product[]);
        setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [limit]);

  return { products, loading };
}
