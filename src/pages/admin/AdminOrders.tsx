import { CaretDown } from '@phosphor-icons/react';
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
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setError(null);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    const { error: updateError } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (updateError) {
      setError(updateError.message);
      load();
    }
  };

  if (loading) {
    return (
      <div role="status" aria-label="Loading orders">
        <div className="skeleton h-12 w-48" />
        <div className="skeleton mt-8 h-72 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="display text-4xl md:text-6xl">Orders</h1>

      {error && (
        <p role="alert" className="error-text mt-4">
          {error}
        </p>
      )}

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-ink text-left">
              <th className="spec-label py-3 pr-4 font-semibold">Order</th>
              <th className="spec-label py-3 pr-4 font-semibold">Customer</th>
              <th className="spec-label py-3 pr-4 font-semibold">Total</th>
              <th className="spec-label py-3 pr-4 font-semibold">Status</th>
              <th className="spec-label py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const open = expanded === order.id;
              return (
                <Fragment key={order.id}>
                  <tr className="border-b border-line">
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => setExpanded(open ? null : order.id)}
                        aria-expanded={open}
                        className="num inline-flex items-center gap-1.5 font-medium hover:underline"
                      >
                        #{order.id.slice(0, 8)}
                        <CaretDown
                          size={14}
                          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </td>
                    <td className="py-3 pr-4">{profiles[order.user_id]?.full_name ?? 'Customer'}</td>
                    <td className="num py-3 pr-4">{formatPrice(order.total_cents, order.currency)}</td>
                    <td className="py-3 pr-4">
                      <label className="sr-only" htmlFor={`status-${order.id}`}>
                        Status for order {order.id.slice(0, 8)}
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                        className="field w-36! py-1.5 text-xs capitalize"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="num py-3 text-muted">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={5} className="bg-sunken p-4">
                        <ul className="space-y-1.5 text-sm">
                          {order.order_items?.map((item) => (
                            <li key={item.id} className="flex justify-between gap-4">
                              <span>
                                {item.product_name} <span className="num text-muted">x {item.quantity}</span>
                              </span>
                              <span className="num">
                                {formatPrice(item.unit_price_cents * item.quantity, order.currency)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <p className="py-10 text-muted">No orders yet.</p>}
      </div>
    </div>
  );
}
