import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/format';
import { supabase } from '../../lib/supabaseClient';

interface Stats {
  revenueCents: number;
  orderCount: number;
  productCount: number;
  lowStockCount: number;
  /** null when the is_featured column has not been added yet (migration 0003). */
  featuredCount: number | null;
}

const LOW_STOCK_THRESHOLD = 10;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-ink pt-3">
      <p className="spec-label">{label}</p>
      <p className="num mt-2 text-4xl font-medium tracking-tight">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [paidOrders, orderCount, productCount, lowStock, featured] = await Promise.all([
        supabase.from('orders').select('total_cents').in('status', ['paid', 'fulfilled']),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .lt('stock', LOW_STOCK_THRESHOLD),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', true),
      ]);

      const revenueCents = (paidOrders.data ?? []).reduce((s, o) => s + o.total_cents, 0);

      setStats({
        revenueCents,
        orderCount: orderCount.count ?? 0,
        productCount: productCount.count ?? 0,
        lowStockCount: lowStock.count ?? 0,
        featuredCount: featured.error ? null : (featured.count ?? 0),
      });
    })();
  }, []);

  return (
    <div>
      <h1 className="display text-4xl md:text-6xl">Dashboard</h1>
      {!stats ? (
        <div
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3"
          role="status"
          aria-label="Loading stats"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
            <Stat label="Revenue (paid orders)" value={formatPrice(stats.revenueCents)} />
            <Stat label="Total orders" value={String(stats.orderCount)} />
            <Stat label="Products" value={String(stats.productCount)} />
            <Stat label={`Low stock (under ${LOW_STOCK_THRESHOLD})`} value={String(stats.lowStockCount)} />
            <Stat
              label="Featured on home"
              value={stats.featuredCount === null ? 'n/a' : String(stats.featuredCount)}
            />
          </div>
          {stats.lowStockCount > 0 && (
            <p className="mt-10 border-t border-ink pt-4 text-sm">
              <span className="font-semibold text-danger">
                {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's are' : ' is'} running low on
                stock.
              </span>{' '}
              <Link to="/admin/inventory" className="font-semibold underline">
                Review inventory
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
