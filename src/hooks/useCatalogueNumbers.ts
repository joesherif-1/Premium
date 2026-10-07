import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type NumberMap = Record<string, number>;

// A catalogue number is a product's rank among active products, oldest first (ties
// broken by slug). The same product therefore carries the same number on the home
// sheet, in the shop under any filter or sort, on its own page and in a wishlist.
// The numbers shift only when products are added or retired, like a reprinted catalogue.
let cache: NumberMap | null = null;
let inflight: Promise<NumberMap> | null = null;

function load(): Promise<NumberMap> {
  inflight ??= Promise.resolve(
    supabase
      .from('products')
      .select('id, slug, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .order('slug', { ascending: true }),
  ).then(({ data, error }) => {
    const map: NumberMap = {};
    if (!error) {
      (data ?? []).forEach((row, i) => {
        map[row.id as string] = i + 1;
      });
    }
    cache = map;
    return map;
  });
  return inflight;
}

export function invalidateCatalogueNumbers() {
  cache = null;
  inflight = null;
}

export function useCatalogueNumbers(): NumberMap {
  const [numbers, setNumbers] = useState<NumberMap>(cache ?? {});

  useEffect(() => {
    let live = true;
    load().then((map) => {
      if (live) setNumbers(map);
    });
    return () => {
      live = false;
    };
  }, []);

  return numbers;
}
