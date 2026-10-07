import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export type ToggleResult = 'added' | 'removed' | 'auth' | 'error';

interface WishlistContextValue {
  ids: Set<string>;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<ToggleResult>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) {
      setIds(new Set());
      return;
    }
    let live = true;
    Promise.resolve(supabase.from('wishlists').select('product_id').eq('user_id', userId)).then(
      ({ data, error }) => {
        if (live && !error) setIds(new Set((data ?? []).map((r) => r.product_id as string)));
      },
    );
    return () => {
      live = false;
    };
  }, [userId]);

  const flip = useCallback((productId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const toggle = useCallback(
    async (productId: string): Promise<ToggleResult> => {
      if (!userId) return 'auth';
      const had = ids.has(productId);
      flip(productId);
      const { error } = had
        ? await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId)
        : await supabase.from('wishlists').insert({ user_id: userId, product_id: productId });
      if (error) {
        flip(productId);
        return 'error';
      }
      return had ? 'removed' : 'added';
    },
    [userId, ids, flip],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, has: (id) => ids.has(id), toggle }),
    [ids, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
