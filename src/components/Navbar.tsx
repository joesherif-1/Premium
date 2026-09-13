import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-slate-900 ${
    isActive ? 'text-slate-900' : 'text-slate-500'
  }`;

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount, bumpKey } = useCart();

  const [bumping, setBumping] = useState(false);
  useEffect(() => {
    if (bumpKey === 0) return;
    setBumping(true);
    const t = setTimeout(() => setBumping(false), 420);
    return () => clearTimeout(t);
  }, [bumpKey]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-6">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">
          Premium<span className="text-indigo-600">.</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>
          {user && (
            <NavLink to="/account" className={navLinkClass}>
              My Account
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link
            to="/cart"
            className={`relative text-sm font-medium text-slate-600 hover:text-slate-900 ${bumping ? 'animate-cart-bump' : ''}`}
          >
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <button
              onClick={signOut}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
