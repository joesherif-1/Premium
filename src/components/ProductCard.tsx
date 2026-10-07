import { Star } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useCatalogueNumbers } from '../hooks/useCatalogueNumbers';
import { useRatingStats } from '../hooks/useRatingStats';
import { formatPrice } from '../lib/format';
import type { Product } from '../types';
import { AddToCartButton } from './AddToCartButton';
import { WishlistButton } from './WishlistButton';

/**
 * One catalogue plate: photograph, then a ruled caption with its catalogue number,
 * name, price, rating and stock. The number is the product's rank in the active
 * catalogue, so it reads the same on every page, filter and sort.
 */
export function ProductCard({
  product,
  tone = 'plain',
  compact = false,
  wide = false,
}: {
  product: Product;
  /** "lead" prints the caption on the signal-yellow field. */
  tone?: 'plain' | 'lead';
  /** Shorter plate for dense sheets: no description, add and stock share a row. */
  compact?: boolean;
  /** Landscape photograph for a plate that spans two columns. */
  wide?: boolean;
}) {
  const stat = useRatingStats()[product.id];
  const number = useCatalogueNumbers()[product.id];
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 5;
  const href = `/products/${product.slug}`;
  const lead = tone === 'lead';
  const aspect = wide ? 'aspect-[16/9]' : compact ? 'aspect-[16/7]' : lead ? 'aspect-[3/2]' : 'aspect-[5/4]';

  const stock = (
    <p
      className={`num text-[13px] ${
        lowStock ? 'font-semibold text-danger' : lead ? 'text-accent-ink' : 'text-muted'
      }`}
    >
      {soldOut ? 'Sold out' : lowStock ? `Only ${product.stock} left` : `${product.stock} in stock`}
    </p>
  );

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link to={href} aria-label={product.name} className={`block overflow-hidden bg-sunken ${aspect}`}>
          {product.image_url && (
            <img
              src={product.image_url}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          )}
        </Link>
        <WishlistButton productId={product.id} className="absolute right-2 top-2" />
      </div>

      <div className={`flex flex-1 flex-col border-t border-ink p-3 ${lead ? 'bg-accent text-accent-ink' : ''}`}>
        <div className="flex items-baseline gap-3">
          {number !== undefined && (
            <span className="num text-sm font-medium">{String(number).padStart(2, '0')}</span>
          )}
          <Link
            to={href}
            className="min-w-0 flex-1 truncate text-[15px] font-bold underline-offset-4 hover:underline"
          >
            {product.name}
          </Link>
          <span className="num shrink-0 text-[15px] font-medium">
            {formatPrice(product.price_cents, product.currency)}
          </span>
        </div>

        {!compact && (
          <>
            <p className={`num mt-1 flex items-center gap-1.5 text-[12px] ${lead ? '' : 'text-muted'}`}>
              {stat ? (
                <>
                  <Star size={13} weight="fill" />
                  {stat.avg.toFixed(1)} ({stat.count})
                </>
              ) : (
                'No ratings yet'
              )}
            </p>
            <p className={`mt-2 line-clamp-2 min-h-10 text-[13px] leading-5 ${lead ? '' : 'text-muted'}`}>
              {product.description}
            </p>
          </>
        )}

        <div className={`flex items-center justify-between gap-3 ${compact ? 'mt-3' : 'mt-4'}`}>
          <AddToCartButton product={product} small invert={lead} />
          {stock}
        </div>
      </div>
    </article>
  );
}
