import { Heart, List, ShoppingBagOpen, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ThemeToggle } from './ThemeToggle';

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 py-1 text-sm font-semibold transition-colors ${
    isActive ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
  }`;

const mobileLink = ({ isActive }: { isActive: boolean }) =>
  `block border-b border-line py-3.5 text-lg font-semibold ${isActive ? 'text-ink' : 'text-muted'}`;

const iconButton =
  'grid size-10 place-items-center rounded-xs text-ink transition-colors hover:bg-ink hover:text-bg';

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount, bumpKey } = useCart();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-bg">
      <div className="page flex h-16 items-center gap-8">
        <Link to="/" className="text-xl font-extrabold tracking-[-0.03em] text-ink">
          Premium
          <span aria-hidden="true" className="ml-0.5 inline-block size-[0.3em] border border-ink bg-accent" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          <NavLink to="/shop" className={desktopLink}>
            Shop
          </NavLink>
          {user && (
            <NavLink to="/account" className={desktopLink}>
              My account
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={desktopLink}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {user && (
            <Link to="/account?tab=wishlist" aria-label="Wishlist" className={iconButton}>
              <Heart />
            </Link>
          )}

          <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            className={`${iconButton} relative`}
          >
            <ShoppingBagOpen />
            {itemCount > 0 && (
              <motion.span
                key={bumpKey}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className="num absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center bg-accent px-1 text-[10px] font-medium text-accent-ink"
              >
                {itemCount}
              </motion.span>
            )}
          </Link>

          <ThemeToggle />

          <div className="ml-3 hidden items-center md:flex">
            {user ? (
              <button type="button" onClick={signOut} className="btn btn-ghost btn-sm">
                Sign out
              </button>
            ) : (
              <Link to="/login" className="btn btn-ink btn-sm">
                Sign in
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={`${iconButton} md:hidden`}
          >
            {open ? <X /> : <List />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
            className="overflow-hidden border-t border-ink bg-bg md:hidden"
          >
            <div className="page py-2">
              <NavLink to="/shop" className={mobileLink}>
                Shop
              </NavLink>
              {user && (
                <>
                  <NavLink to="/account" end className={mobileLink}>
                    My account
                  </NavLink>
                  <NavLink to="/account?tab=wishlist" className={mobileLink}>
                    Wishlist
                  </NavLink>
                </>
              )}
              {isAdmin && (
                <NavLink to="/admin" className={mobileLink}>
                  Admin
                </NavLink>
              )}
              <div className="py-4">
                {user ? (
                  <button type="button" onClick={signOut} className="btn btn-ghost w-full">
                    Sign out
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-ink w-full">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
