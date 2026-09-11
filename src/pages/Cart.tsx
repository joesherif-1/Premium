import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { supabase } from '../lib/supabaseClient';

export default function Cart() {
  const { items, setQuantity, removeItem, subtotalCents } = useCart();
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
      const { data, error: fnError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
            success_url: `${window.location.origin}/checkout/success`,
            cancel_url: `${window.location.origin}/checkout/cancel`,
          },
        },
      );
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
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-bold text-slate-900">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-indigo-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Your cart</h1>

      <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900">{product.name}</p>
              <p className="text-sm text-slate-500">{formatPrice(product.price_cents)}</p>
            </div>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(product.id, Number(e.target.value))}
              className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
            <button
              onClick={() => removeItem(product.id)}
              className="text-sm text-slate-400 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg font-semibold text-slate-900">Subtotal</span>
        <span className="text-lg font-semibold text-slate-900">{formatPrice(subtotalCents)}</span>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={checkout}
        disabled={checkingOut}
        className="mt-6 w-full rounded-md bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-400"
      >
        {checkingOut ? 'Redirecting to Stripe…' : 'Checkout with Stripe'}
      </button>
      <p className="mt-2 text-center text-xs text-slate-400">
        Test mode — use card 4242 4242 4242 4242, any future date and CVC.
      </p>
    </div>
  );
}
