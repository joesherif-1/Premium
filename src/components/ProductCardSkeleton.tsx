/** Loading placeholder with the same geometry as a plate, so nothing shifts when data arrives. */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton aspect-[5/4]" />
      <div className="mt-px border-t border-ink p-3">
        <div className="flex justify-between gap-3">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-4 w-14" />
        </div>
        <div className="skeleton mt-4 h-10 w-32" />
      </div>
    </div>
  );
}
