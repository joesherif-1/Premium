import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-28 border-t border-ink">
      <div className="page grid12 gap-y-10 py-12">
        <div className="col-span-12 md:col-span-6">
          <p className="display text-4xl md:text-5xl">
            Premium
            <span aria-hidden="true" className="ml-1 inline-block size-[0.28em] border border-ink bg-accent" />
          </p>
          <p className="mt-4 max-w-sm text-sm text-muted">
            Curated electronics and accessories, with secure checkout through Stripe.
          </p>
        </div>

        <nav aria-label="Shop links" className="col-span-6 md:col-span-3">
          <h2 className="text-sm font-bold">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/shop" className="hover:text-ink hover:underline">
                All products
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-ink hover:underline">
                Cart
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Account links" className="col-span-6 md:col-span-3">
          <h2 className="text-sm font-bold">Account</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/account" className="hover:text-ink hover:underline">
                Orders
              </Link>
            </li>
            <li>
              <Link to="/account?tab=wishlist" className="hover:text-ink hover:underline">
                Wishlist
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <p className="page py-5 text-[13px] text-muted">
          Demo storefront. Payments run through Stripe in test mode, so no real charges occur.
        </p>
      </div>
    </footer>
  );
}
