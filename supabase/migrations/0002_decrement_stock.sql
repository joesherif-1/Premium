-- Atomically reduce a product's stock; used by the Stripe webhook after payment.
-- Runs as security definer so the webhook's service-role call can't be blocked by RLS,
-- and clamps at zero so a double-fired webhook can't go negative.
create function public.decrement_stock(p_product_id uuid, p_quantity integer)
returns void
language sql security definer set search_path = public
as $$
  update public.products
  set stock = greatest(stock - p_quantity, 0)
  where id = p_product_id;
$$;
