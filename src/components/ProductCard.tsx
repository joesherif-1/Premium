import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import type { Product } from '../types';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-lg">
      <Link to={`/products/${product.slug}`} className="aspect-square overflow-hidden bg-slate-100">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link to={`/products/${product.slug}`} className="font-medium text-slate-900 hover:underline">
          {product.name}
        </Link>
        <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-semibold text-slate-900">
            {formatPrice(product.price_cents, product.currency)}
          </span>
          <button
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {outOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
