import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface RatingStat {
  avg: number;
  count: number;
}
type StatMap = Record<string, RatingStat>;

// The catalog is small, so one aggregate query serves every card on every page.
// If the product_rating_stats view is missing the map stays empty and cards just
// render without a rating.
let cache: StatMap | null = null;
let inflight: Promise<StatMap> | null = null;

function load(): Promise<StatMap> {
  inflight ??= Promise.resolve(
    supabase.from('product_rating_stats').select('product_id, review_count, avg_rating'),
  ).then(({ data, error }) => {
    const map: StatMap = {};
    if (!error) {
      for (const row of data ?? []) {
        map[row.product_id as string] = {
          avg: Number(row.avg_rating),
          count: Number(row.review_count),
        };
      }
    }
    cache = map;
    return map;
  });
  return inflight;
}

export function invalidateRatingStats() {
  cache = null;
  inflight = null;
}

export function useRatingStats(): StatMap {
  const [stats, setStats] = useState<StatMap>(cache ?? {});

  useEffect(() => {
    let live = true;
    load().then((map) => {
      if (live) setStats(map);
    });
    return () => {
      live = false;
    };
  }, []);

  return stats;
}
