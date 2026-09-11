export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 sm:px-6">
        <p>Premium — a demo storefront built with React, Tailwind CSS, and Supabase.</p>
        <p className="mt-1">Payments run through Stripe in test mode — no real charges occur.</p>
      </div>
    </footer>
  );
}
