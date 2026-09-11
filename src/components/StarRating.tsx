export function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md';
}) {
  const stars = [1, 2, 3, 4, 5];
  const cls = size === 'sm' ? 'text-sm' : 'text-xl';

  return (
    <div className={`flex gap-0.5 ${cls}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`${onChange ? 'cursor-pointer' : 'cursor-default'} ${
            star <= value ? 'text-amber-400' : 'text-slate-300'
          }`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
