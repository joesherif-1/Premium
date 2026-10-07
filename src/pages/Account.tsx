import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../lib/format';
import { supabase } from '../lib/supabaseClient';
import type { Order, OrderStatus, Product } from '../types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'border-warn text-warn',
  paid: 'border-ok text-ok',
  fulfilled: 'border-ink bg-ink text-bg',
  cancelled: 'border-line text-muted',
};

type Tab = 'orders' | 'wishlist';

function OrdersTab({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as Order[]);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading orders">
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-12">
        <p className="display text-3xl md:text-4xl">No orders yet.</p>
        <p className="mt-3 text-muted">When you check out, your orders will show up here.</p>
        <Link to="/shop" className="btn btn-ink mt-6">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-10">
      {orders.map((order) => (
        <li key={order.id} className="border-t border-ink pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="num text-base font-medium">#{order.id.slice(0, 8)}</p>
              <p className="num text-[13px] text-muted">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <span
              className={`border px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}
            >
              {order.status}
            </span>
          </div>

          <ul className="mt-4 divide-y divide-line text-sm">
            {order.order_items?.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-2">
                <span className="min-w-0 truncate">
                  {item.product_name} <span className="num text-muted">x {item.quantity}</span>
                </span>
                <span className="num">
                  {formatPrice(item.unit_price_cents * item.quantity, order.currency)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-ink pt-3 font-bold">
            <span>Total</span>
            <span className="num">{formatPrice(order.total_cents, order.currency)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

function WishlistTab() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const idKey = [...ids].sort().join(',');

  useEffect(() => {
    if (!idKey) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let live = true;
    supabase
      .from('products')
      .select('*')
      .in('id', idKey.split(','))
      .then(({ data }) => {
        if (!live) return;
        setProducts((data ?? []) as Product[]);
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [idKey]);

  // Removing a heart drops the plate immediately, before any refetch lands.
  const visible = products.filter((p) => ids.has(p.id));

  if (loading && ids.size > 0) {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: Math.min(ids.size, 3) }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="py-12">
        <p className="display text-3xl md:text-4xl">Nothing saved yet.</p>
        <p className="mt-3 text-muted">Tap the heart on any product to keep it here.</p>
        <Link to="/shop" className="btn btn-ink mt-6">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default function Account() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'wishlist' ? 'wishlist' : 'orders';
  const { ids } = useWishlist();

  const firstName = profile?.full_name?.split(' ')[0];

  const tabClass = (active: boolean) =>
    `border-b-2 pb-3 text-sm font-semibold transition-colors ${
      active ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
    }`;

  return (
    <div className="page py-10 md:py-14">
      <h1 className="display text-5xl md:text-7xl">
        {firstName ? `Hello, ${firstName}.` : 'My account'}
      </h1>
      <p className="mt-3 text-muted">{user?.email}</p>

      <div
        role="tablist"
        aria-label="Account sections"
        className="mt-12 flex gap-8 border-b border-ink"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'orders'}
          onClick={() => setSearchParams({})}
          className={tabClass(tab === 'orders')}
        >
          Orders
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'wishlist'}
          onClick={() => setSearchParams({ tab: 'wishlist' })}
          className={tabClass(tab === 'wishlist')}
        >
          Wishlist
          {ids.size > 0 && <span className="num ml-2 text-muted">{String(ids.size).padStart(2, '0')}</span>}
        </button>
      </div>

      <div role="tabpanel" className="mt-10">
        {tab === 'orders' ? user && <OrdersTab userId={user.id} /> : <WishlistTab />}
      </div>
    </div>
  );
}
