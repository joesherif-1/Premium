import { CheckCircle } from '@phosphor-icons/react';
import { motion } from 'motion/react';
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
    <div className="page py-16 md:py-24">
      <div className="bg-accent p-8 text-accent-ink md:p-14">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="inline-block"
        >
          <CheckCircle size={56} weight="fill" />
        </motion.div>
        <h1 className="display mt-6 text-5xl md:text-7xl">Payment received.</h1>
        <p className="mt-4 max-w-md text-base">
          Thanks for your order. Stripe's webhook will confirm it and update your order status
          shortly.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/account" className="btn btn-ink px-6 py-3.5">
            View my orders
          </Link>
          <Link
            to="/shop"
            className="btn border border-accent-ink px-6 py-3.5 text-accent-ink hover:bg-accent-ink hover:text-accent"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
