import { Link } from 'react-router-dom';

export default function CheckoutCancel() {
  return (
    <div className="page py-16 md:py-24">
      <h1 className="display text-5xl md:text-7xl">Checkout cancelled.</h1>
      <p className="mt-4 max-w-md text-muted">No charge was made. Your cart is still saved.</p>
      <Link to="/cart" className="btn btn-ink mt-8 px-6 py-3.5">
        Back to cart
      </Link>
    </div>
  );
}
