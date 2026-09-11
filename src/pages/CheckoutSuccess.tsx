import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CheckoutSuccess() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Payment successful 🎉</h1>
      <p className="mt-3 text-slate-600">
        Thanks for your order! Stripe's webhook will confirm it and update your order status
        shortly.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/account" className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700">
          View my orders
        </Link>
        <Link to="/shop" className="rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
