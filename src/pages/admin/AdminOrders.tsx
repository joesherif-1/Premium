import { Fragment, useEffect, useState } from 'react';
import { formatPrice } from '../../lib/format';
import { supabase } from '../../lib/supabaseClient';
import type { Order, OrderStatus, Profile } from '../../types';

const STATUSES: OrderStatus[] = ['pending', 'paid', 'fulfilled', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      const list = (data ?? []) as Order[];
      setOrders(list);

      const userIds = [...new Set(list.map((o) => o.user_id))];
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .in('id', userIds);
        setProfiles(Object.fromEntries((profs ?? []).map((p) => [p.id, p as Profile])));
      }
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    await supabase.from('orders').update({ status }).eq('id', orderId);
  };

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Orders</h1>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <Fragment key={order.id}>
                <tr
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <td className="p-3 font-medium text-slate-900">#{order.id.slice(0, 8)}</td>
                  <td className="p-3">{profiles[order.user_id]?.full_name ?? 'Customer'}</td>
                  <td className="p-3">{formatPrice(order.total_cents, order.currency)}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs capitalize"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
                {expanded === order.id && (
                  <tr key={`${order.id}-detail`}>
                    <td colSpan={5} className="bg-slate-50 p-4">
                      <ul className="space-y-1 text-sm">
                        {order.order_items?.map((item) => (
                          <li key={item.id} className="flex justify-between">
                            <span>
                              {item.product_name} × {item.quantity}
                            </span>
                            <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-center text-slate-500">No orders yet.</p>}
      </div>
    </div>
  );
}
