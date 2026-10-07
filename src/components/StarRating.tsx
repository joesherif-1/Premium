import { Star } from '@phosphor-icons/react';

export function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md';
}) {
  const px = size === 'sm' ? 14 : 24;
  const stars = [1, 2, 3, 4, 5];

  if (!onChange) {
    return (
      <div className="flex gap-0.5" role="img" aria-label={`Rated ${value} out of 5`}>
        {stars.map((star) => (
          <Star
            key={star}
            size={px}
            weight={star <= value ? 'fill' : 'regular'}
            className={star <= value ? 'text-ink' : 'text-muted/60'}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          className="rounded-xs p-1 transition-transform active:translate-y-px"
        >
          <Star
            size={px}
            weight={star <= value ? 'fill' : 'regular'}
            className={star <= value ? 'text-ink' : 'text-muted hover:text-ink'}
          />
        </button>
      ))}
    </div>
  );
}
