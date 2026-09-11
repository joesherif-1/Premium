-- Sample catalog data for local development / demos.
insert into public.categories (name, slug) values
  ('Audio', 'audio'),
  ('Wearables', 'wearables'),
  ('Home', 'home'),
  ('Accessories', 'accessories')
on conflict do nothing;

insert into public.products (category_id, name, slug, description, price_cents, image_url, stock)
select c.id, p.name, p.slug, p.description, p.price_cents, p.image_url, p.stock
from (values
  ('audio', 'Aria Wireless Headphones', 'aria-wireless-headphones',
   'Over-ear headphones with active noise cancellation and 40-hour battery life.',
   19900, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 42),
  ('audio', 'Pulse Bluetooth Speaker', 'pulse-bluetooth-speaker',
   'Compact speaker with 360-degree sound and IPX7 water resistance.',
   7900, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800', 65),
  ('wearables', 'Orbit Smartwatch', 'orbit-smartwatch',
   'Fitness tracking, heart-rate monitoring, and a seven-day battery.',
   24900, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 30),
  ('wearables', 'Flux Fitness Band', 'flux-fitness-band',
   'Lightweight activity tracker with sleep insights.',
   4900, 'https://images.unsplash.com/photo-1575311373937-14bb2b6f4a5b?w=800', 80),
  ('home', 'Halo Smart Lamp', 'halo-smart-lamp',
   'App-controlled ambient lighting with millions of colors.',
   5900, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', 54),
  ('home', 'Nimbus Air Purifier', 'nimbus-air-purifier',
   'HEPA filtration for rooms up to 500 sq ft, whisper-quiet operation.',
   16900, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', 21),
  ('accessories', 'Drift Laptop Sleeve', 'drift-laptop-sleeve',
   'Water-resistant sleeve with a soft interior lining, fits up to 15".',
   3400, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800', 90),
  ('accessories', 'Vector Wireless Mouse', 'vector-wireless-mouse',
   'Ergonomic mouse with silent clicks and a 2-year battery life.',
   3900, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', 75)
) as p(category_slug, name, slug, description, price_cents, image_url, stock)
join public.categories c on c.slug = p.category_slug
on conflict do nothing;
