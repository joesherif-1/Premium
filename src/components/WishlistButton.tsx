import { Heart } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

export function WishlistButton({
  productId,
  className = '',
}: {
  productId: string;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const active = has(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle(productId);
    if (result === 'auth') navigate('/login', { state: { from: location } });
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`grid size-10 place-items-center rounded-xs border border-ink transition-colors ${
        active ? 'bg-accent text-accent-ink' : 'bg-surface text-ink hover:bg-ink hover:text-bg'
      } ${className}`}
    >
      <Heart size={18} weight={active ? 'fill' : 'regular'} />
    </motion.button>
  );
}
