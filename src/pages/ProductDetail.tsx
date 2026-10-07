import { CaretRight, Minus, Plus, ShieldCheck } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AddToCartButton } from '../components/AddToCartButton';
import { StarRating } from '../components/StarRating';
import { WishlistButton } from '../components/WishlistButton';
import { useAuth } from '../context/AuthContext';
import { useCatalogueNumbers } from '../hooks/useCatalogueNumbers';
import { useCategories } from '../hooks/useCategories';
import { invalidateRatingStats } from '../hooks/useRatingStats';
import { formatPrice } from '../lib/format';
import { supabase } from '../lib/supabaseClient';
import type { Product, Review } from '../types';

function DetailSkeleton() {
  return (
    <div className="page grid12 gap-y-8 py-10" role="status" aria-label="Loading product">
      <div className="skeleton col-span-12 aspect-[4/5] lg:col-span-7" />
      <div className="col-span-12 space-y-4 lg:col-span-5">
        <div className="skeleton h-14 w-3/4" />
        <div className="skeleton h-5 w-1/3" />
        <div className="skeleton h-28 w-full" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { categories } = useCategories();
  const numbers = useCatalogueNumbers();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSaved, setReviewSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setQuantity(1);
    supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        setProduct(data as Product | null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const loadReviews = async (productId: string) => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews((data ?? []) as Review[]);
  };

  useEffect(() => {
    if (product) loadReviews(product.id);
  }, [product]);

  // Pre-fill the form with the signed-in user's existing review, if any.
  useEffect(() => {
    const mine = reviews.find((r) => r.user_id === user?.id);
    if (mine) {
      setMyRating(mine.rating);
      setMyComment(mine.comment);
    }
  }, [reviews, user?.id]);

  const myReview = reviews.find((r) => r.user_id === user?.id);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user || myRating === 0) return;
    setSubmitting(true);
    setReviewError(null);
    setReviewSaved(false);
    const { error } = await supabase.from('reviews').upsert(
      {
        product_id: product.id,
        user_id: user.id,
        rating: myRating,
        comment: myComment,
      },
      { onConflict: 'product_id,user_id' },
    );
    if (error) {
      setReviewError(error.message);
    } else {
      await loadReviews(product.id);
      invalidateRatingStats();
      setReviewSaved(true);
    }
    setSubmitting(false);
  };

  if (loading) return <DetailSkeleton />;

  if (!product) {
    return (
      <div className="page py-24">
        <h1 className="display text-5xl md:text-7xl">Product not found.</h1>
        <p className="mt-4 text-muted">It may have been removed or the link is out of date.</p>
        <Link to="/shop" className="btn btn-ink mt-8">
          Back to shop
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.category_id);
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 5;

  return (
    <div className="page py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
        <Link to="/shop" className="hover:text-ink hover:underline">
          Shop
        </Link>
        {category && (
          <>
            <CaretRight size={14} />
            <Link to={`/shop?category=${category.id}`} className="hover:text-ink hover:underline">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid12 mt-6 gap-y-8 border-t border-ink pt-6">
        <div className="col-span-12 lg:col-span-6">
          <div className="aspect-square overflow-hidden bg-sunken">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                fetchPriority="high"
                className="size-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="col-span-12 lg:sticky lg:top-24 lg:col-span-5 lg:col-start-8 lg:self-start">
          <h1 className="display text-4xl md:text-6xl">{product.name}</h1>

          <dl className="mt-8">
            {numbers[product.id] !== undefined && (
              <div className="spec">
                <dt className="spec-label">Catalogue</dt>
                <dd className="num font-medium">No. {String(numbers[product.id]).padStart(2, '0')}</dd>
              </div>
            )}
            <div className="spec">
              <dt className="spec-label pt-2">Price</dt>
              <dd className="num text-3xl font-medium">
                {formatPrice(product.price_cents, product.currency)}
              </dd>
            </div>
            {category && (
              <div className="spec">
                <dt className="spec-label">Category</dt>
                <dd>
                  <Link
                    to={`/shop?category=${category.id}`}
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    {category.name}
                  </Link>
                </dd>
              </div>
            )}
            <div className="spec">
              <dt className="spec-label">Availability</dt>
              <dd
                className={`num font-semibold ${
                  soldOut || lowStock ? 'text-danger' : 'text-ok'
                }`}
              >
                {soldOut ? 'Sold out' : lowStock ? `Only ${product.stock} left` : `${product.stock} in stock`}
              </dd>
            </div>
            <div className="spec">
              <dt className="spec-label">Rating</dt>
              <dd>
                {reviews.length > 0 ? (
                  <a href="#reviews" className="inline-flex items-center gap-2">
                    <StarRating value={Math.round(avgRating)} size="sm" />
                    <span className="num text-sm text-muted">
                      {avgRating.toFixed(1)} ({reviews.length})
                    </span>
                  </a>
                ) : (
                  <span className="num text-sm text-muted">No ratings yet</span>
                )}
              </dd>
            </div>
          </dl>

          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center border border-ink" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="grid size-11 place-items-center transition-colors hover:bg-ink hover:text-bg disabled:opacity-40"
              >
                <Minus size={16} />
              </button>
              <span className="num w-9 text-center text-sm font-medium" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
                className="grid size-11 place-items-center transition-colors hover:bg-ink hover:text-bg disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>

            <AddToCartButton
              product={product}
              quantity={quantity}
              primary
              className="h-11 min-w-44 flex-1 px-8"
            />
            <WishlistButton productId={product.id} className="size-11!" />
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-muted">
            <ShieldCheck size={18} />
            Secure checkout with Stripe
          </p>
        </div>
      </div>

      <section id="reviews" className="mt-24 scroll-mt-24 md:mt-32">
        <div className="grid12 gap-y-10 border-t border-ink pt-8">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="display text-3xl md:text-4xl">Reviews</h2>
            {reviews.length > 0 && (
              <div className="mt-6">
                <p className="num text-6xl font-medium">{avgRating.toFixed(1)}</p>
                <div className="mt-2">
                  <StarRating value={Math.round(avgRating)} />
                </div>
                <p className="mt-2 text-sm text-muted">
                  Based on {reviews.length} review{reviews.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-8">
            {user ? (
              <form onSubmit={submitReview} className="max-w-xl border border-ink p-5 md:p-6">
                <p className="label">Your rating</p>
                <StarRating value={myRating} onChange={setMyRating} />

                <label htmlFor="review-comment" className="label mt-5">
                  Your review
                </label>
                <textarea
                  id="review-comment"
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  rows={4}
                  className="field resize-y"
                  placeholder="What stood out, good or bad?"
                />
                {reviewError && (
                  <p role="alert" className="error-text">
                    {reviewError}
                  </p>
                )}
                {reviewSaved && (
                  <p role="status" className="mt-3 text-sm font-semibold text-ok">
                    Thanks, your review is saved.
                  </p>
                )}
                <button type="submit" disabled={myRating === 0 || submitting} className="btn btn-ink mt-5">
                  {submitting ? 'Saving' : myReview ? 'Update review' : 'Submit review'}
                </button>
              </form>
            ) : (
              <p className="text-muted">
                <Link
                  to="/login"
                  state={{ from: { pathname: `/products/${product.slug}` } }}
                  className="font-semibold text-ink underline"
                >
                  Sign in
                </Link>{' '}
                to leave a review.
              </p>
            )}

            {reviews.length === 0 ? (
              <p className="mt-8 text-muted">No reviews yet. Be the first to share what you think.</p>
            ) : (
              <ul className="mt-10 max-w-2xl divide-y divide-line border-t border-ink">
                {reviews.map((r) => (
                  <li key={r.id} className="py-6">
                    <div className="flex items-center justify-between gap-4">
                      <StarRating value={r.rating} size="sm" />
                      <time className="num text-[13px] text-muted" dateTime={r.created_at}>
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                    {r.comment && <p className="mt-3 leading-relaxed">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
