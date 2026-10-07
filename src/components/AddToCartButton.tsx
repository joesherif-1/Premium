import { Check, ShoppingBagOpen } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

export function AddToCartButton({
  product,
  quantity = 1,
  small = false,
  invert = false,
  primary = false,
  compact = false,
  className = '',
}: {
  product: Product;
  quantity?: number;
  small?: boolean;
  /** Ink button, for use on a yellow field where a yellow or outlined button would vanish. */
  invert?: boolean;
  /** Solid yellow. Reserved for the one primary action on a page (the product page). */
  primary?: boolean;
  /** Icon only below the sm breakpoint, for dense rows. */
  compact?: boolean;
  className?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef(0);
  const soldOut = product.stock <= 0;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = () => {
    addItem(product, quantity);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1400);
  };

  const state = soldOut ? 'sold' : added ? 'added' : 'idle';
  const label = compact ? 'sr-only sm:not-sr-only' : '';
  const tone = invert ? 'btn-ink' : primary ? 'btn-accent' : 'btn-quiet';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      aria-label={compact ? `Add ${product.name} to cart` : undefined}
      className={`btn ${tone} ${small ? 'btn-sm' : ''} ${
        compact ? 'size-10 px-0 sm:size-auto sm:px-4' : ''
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          className="inline-flex items-center gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {state === 'sold' && 'Sold out'}
          {state === 'added' && (
            <>
              <Check weight="bold" size={16} />
              <span className={label}>Added</span>
            </>
          )}
          {state === 'idle' && (
            <>
              <ShoppingBagOpen size={16} />
              <span className={label}>Add to cart</span>
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
