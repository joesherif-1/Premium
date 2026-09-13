import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StarRating } from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { supabase } from '../lib/supabaseClient';
import type { Product, Review } from '../types';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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

  useEffect(() => {
    if (!product) return;
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setReviews((data ?? []) as Review[]));
  }, [product]);

  const submitReview = async () => {
    if (!product || !user || myRating === 0) return;
    setSubmitting(true);
    const { error } = await supabase.from('reviews').upsert({
      product_id: product.id,
      user_id: user.id,
      rating: myRating,
      comment: myComment,
    });
    if (!error) {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      setReviews((data ?? []) as Review[]);
      setMyComment('');
      setMyRating(0);
    }
    setSubmitting(false);
  };

  if (loading) return <p className="p-10 text-center text-slate-500">Loading…</p>;
  if (!product) return <p className="p-10 text-center text-slate-500">Product not found.</p>;

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-6 text-sm text-slate-500 hover:underline">
        ← Back
      </button>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
          {reviews.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={Math.round(avgRating)} size="sm" />
              <span className="text-sm text-slate-500">
                {avgRating.toFixed(1)} ({reviews.length} review{reviews.length > 1 ? 's' : ''})
              </span>
            </div>
          )}
          <p className="mt-4 text-xl font-semibold text-slate-900">
            {formatPrice(product.price_cents, product.currency)}
          </p>
          <p className="mt-4 text-slate-600">{product.description}</p>
          <p className="mt-2 text-sm text-slate-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-20 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                addItem(product, quantity);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 900);
              }}
              disabled={product.stock <= 0}
              className={`rounded-md px-6 py-2 text-sm font-semibold text-white transition-all duration-200 active:scale-90 disabled:bg-slate-300 ${
                added ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-700'
              }`}
            >
              <span key={added ? 'added' : 'idle'} className="inline-block animate-add-pop">
                {added ? 'Added ✓' : 'Add to cart'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 max-w-2xl">
        <h2 className="text-lg font-bold text-slate-900">Reviews</h2>

        {user ? (
          <div className="mt-4 rounded-lg border border-slate-200 p-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Leave a review</p>
            <StarRating value={myRating} onChange={setMyRating} />
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="What did you think?"
              className="mt-3 w-full rounded-md border border-slate-300 p-2 text-sm"
              rows={3}
            />
            <button
              onClick={submitReview}
              disabled={myRating === 0 || submitting}
              className="mt-2 rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:bg-slate-300"
            >
              Submit review
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            <Link to="/login" className="text-indigo-600 hover:underline">
              Sign in
            </Link>{' '}
            to leave a review.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-t border-slate-200 pt-4">
              <StarRating value={r.rating} size="sm" />
              {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
