import { LockKey, Minus, Plus, Trash } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { supabase } from '../lib/supabaseClient';

export default function Cart() {
  const { items, setQuantity, removeItem, subtotalCents, itemCount } = useCart();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const checkout = async () => {
    if (!user || !session) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    setError(null);
    setCheckingOut(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page py-24">
        <h1 className="display text-5xl md:text-7xl">Your cart is empty.</h1>
        <p className="mt-4 max-w-md text-muted">Add something you like and it will wait for you here.</p>
        <Link to="/shop" className="btn btn-ink mt-8 px-6 py-3.5">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page py-10 md:py-14">
      <div className="grid12 items-end gap-y-3">
        <h1 className="display col-span-12 text-5xl md:col-span-8 md:text-7xl">Your cart</h1>
        <p className="num col-span-12 text-sm text-muted md:col-span-4 md:text-right">
          {String(itemCount).padStart(2, '0')} item{itemCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid12 mt-10 gap-y-10 border-t border-ink pt-2">
        <ul className="col-span-12 divide-y divide-line lg:col-span-8">
          <AnimatePresence initial={false}>
            {items.map(({ product, quantity }, i) => (
              <motion.li
                key={product.id}
                layout
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-[1.5rem_5rem_1fr_auto] gap-x-4 py-5 sm:grid-cols-[2rem_6.5rem_1fr_auto] sm:gap-x-5"
              >
                <span className="num pt-0.5 text-sm">{String(i + 1).padStart(2, '0')}</span>
                <Link
                  to={`/products/${product.slug}`}
                  className="block aspect-square overflow-hidden bg-sunken"
                >
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="size-full object-cover" />
                  )}
                </Link>

                <div className="flex min-w-0 flex-col justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/products/${product.slug}`}
                      className="block truncate font-bold underline-offset-4 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="num mt-0.5 text-sm text-muted">
                      {formatPrice(product.price_cents, product.currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="inline-flex items-center border border-ink"
                      role="group"
                      aria-label={`Quantity for ${product.name}`}
                    >
                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, quantity - 1)}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                        className="grid size-9 place-items-center transition-colors hover:bg-ink hover:text-bg disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="num w-8 text-center text-sm font-medium" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        aria-label="Increase quantity"
                        className="grid size-9 place-items-center transition-colors hover:bg-ink hover:text-bg disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      aria-label={`Remove ${product.name} from cart`}
                      className="grid size-9 place-items-center text-muted transition-colors hover:bg-ink hover:text-bg"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>

                <p className="num text-right font-medium">
                  {formatPrice(product.price_cents * quantity, product.currency)}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="col-span-12 lg:col-span-4">
          <div className="bg-accent p-6 text-accent-ink lg:sticky lg:top-24">
            <h2 className="text-sm font-bold">Order total</h2>
            <p className="num mt-3 text-5xl font-medium">{formatPrice(subtotalCents)}</p>
            <p className="mt-1 text-sm">Subtotal for {itemCount} item{itemCount === 1 ? '' : 's'}</p>

            {error && (
              <p role="alert" className="mt-4 border-t border-accent-ink pt-3 text-sm font-bold">
                Checkout failed: {error}
              </p>
            )}

            <button
              type="button"
              onClick={checkout}
              disabled={checkingOut}
              className="btn btn-ink mt-6 w-full py-3.5 text-[15px]"
            >
              <LockKey size={18} />
              {checkingOut ? 'Redirecting to Stripe' : 'Checkout with Stripe'}
            </button>
            <p className="mt-3 text-[13px]">
              Test mode: use card 4242 4242 4242 4242 with any future date and CVC.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
