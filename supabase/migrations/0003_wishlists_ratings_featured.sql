-- Storefront features: featured products, per-user wishlists, rating aggregates.
-- Purely additive: no existing column, table or policy is changed.

-- ---------------------------------------------------------------------------
-- Featured flag (admin-editable through the existing "products: admin write" policy)
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists is_featured boolean not null default false;

create index if not exists products_is_featured_idx
  on public.products (is_featured) where is_featured;

-- ---------------------------------------------------------------------------
-- Wishlists: each signed-in user manages only their own rows
-- ---------------------------------------------------------------------------
create table if not exists public.wishlists (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists wishlists_product_id_idx on public.wishlists (product_id);

alter table public.wishlists enable row level security;

create policy "wishlists: read own" on public.wishlists
  for select using (user_id = (select auth.uid()));
create policy "wishlists: insert own" on public.wishlists
  for insert with check (user_id = (select auth.uid()));
create policy "wishlists: delete own" on public.wishlists
  for delete using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Rating aggregates, so list pages don't have to download every review.
-- security_invoker makes the view obey the caller's RLS on public.reviews.
-- ---------------------------------------------------------------------------
create or replace view public.product_rating_stats
with (security_invoker = true) as
select
  product_id,
  count(*)::int as review_count,
  round(avg(rating)::numeric, 2) as avg_rating
from public.reviews
group by product_id;

grant select on public.product_rating_stats to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Feature a few sample products
-- ---------------------------------------------------------------------------
update public.products
set is_featured = true
where slug in ('aria-wireless-headphones', 'orbit-smartwatch', 'halo-smart-lamp');
