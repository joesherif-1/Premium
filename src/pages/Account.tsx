import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/format';
import { supabase } from '../lib/supabaseClient';
import type { Order } from '../types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  fulfilled: 'bg-indigo-100 text-indigo-700',
  cancelled: 'bg-slate-200 text-slate-600',
};

export default function Account() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as Order[]);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">My account</h1>
      <p className="mt-1 text-slate-500">{profile?.full_name ?? user?.email}</p>

      <h2 className="mt-10 text-lg font-bold text-slate-900">Order history</h2>
      {loading ? (
        <p className="mt-4 text-slate-500">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="mt-4 text-slate-500">No orders yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {order.order_items?.map((item) => (
                  <li key={item.id} className="flex justify-between py-1.5">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-end text-sm font-semibold text-slate-900">
                Total: {formatPrice(order.total_cents, order.currency)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
