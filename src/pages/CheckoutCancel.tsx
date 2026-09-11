import { Link } from 'react-router-dom';

export default function CheckoutCancel() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Checkout cancelled</h1>
      <p className="mt-3 text-slate-600">No charge was made. Your cart is still saved.</p>
      <Link to="/cart" className="mt-8 inline-block rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Back to cart
      </Link>
    </div>
  );
}
