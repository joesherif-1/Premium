import { Package, Receipt, SquaresFour } from '@phosphor-icons/react';
import { NavLink, Outlet } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors lg:border-b lg:border-line ${
    isActive ? 'bg-ink text-bg' : 'text-ink hover:bg-sunken'
  }`;

export function AdminLayout() {
  return (
    <div className="page grid12 gap-y-6 py-8 md:py-12">
      <aside className="col-span-12 lg:col-span-2">
        <nav
          aria-label="Admin"
          className="no-scrollbar flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:gap-0 lg:border-t lg:border-ink"
        >
          <NavLink to="/admin" end className={linkClass}>
            <SquaresFour size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/inventory" className={linkClass}>
            <Package size={18} />
            Inventory
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            <Receipt size={18} />
            Orders
          </NavLink>
        </nav>
      </aside>
      <div className="col-span-12 min-w-0 lg:col-span-10">
        <Outlet />
      </div>
    </div>
  );
}
