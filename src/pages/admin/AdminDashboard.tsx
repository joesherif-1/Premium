import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/format';
import { supabase } from '../../lib/supabaseClient';

interface Stats {
  revenueCents: number;
  orderCount: number;
  productCount: number;
  lowStockCount: number;
}

const LOW_STOCK_THRESHOLD = 10;

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [paidOrders, orderCount, productCount, lowStock] = await Promise.all([
        supabase.from('orders').select('total_cents').in('status', ['paid', 'fulfilled']),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .lt('stock', LOW_STOCK_THRESHOLD),
      ]);

      const revenueCents = (paidOrders.data ?? []).reduce((s, o) => s + o.total_cents, 0);

      setStats({
        revenueCents,
        orderCount: orderCount.count ?? 0,
        productCount: productCount.count ?? 0,
        lowStockCount: lowStock.count ?? 0,
      });
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      {!stats ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Revenue (paid orders)" value={formatPrice(stats.revenueCents)} />
            <StatCard label="Total orders" value={String(stats.orderCount)} />
            <StatCard label="Products" value={String(stats.productCount)} />
            <StatCard label="Low stock (< 10)" value={String(stats.lowStockCount)} />
          </div>
          {stats.lowStockCount > 0 && (
            <p className="mt-6 text-sm text-amber-700">
              {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's are' : ' is'} running low
              on stock —{' '}
              <Link to="/admin/inventory" className="underline">
                review inventory
              </Link>
              .
            </p>
          )}
        </>
      )}
    </div>
  );
}
