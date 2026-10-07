# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Design-conscious shoppers browsing and buying everyday electronics and accessories (audio, wearables, home, accessories). They care about taste, want few well-chosen options over endless choice, and expect a fast, trustworthy path from browsing to paid order. Signed-in shoppers keep a wishlist, leave reviews and follow their orders. A store admin manages inventory, featured products and order status.

The project owner presents Premium as a portfolio and learning piece, so reviewers (recruiters, clients, teachers) will also try it as a shopper would. The shopper experience is the primary audience; reviewers are served by it being real, complete and honest.

## Product Purpose

Premium is a small online storefront: browse a curated catalog, search, filter and sort, read and write reviews, save products to a wishlist, build a cart, and pay through Stripe Checkout. Success is a shopper who reaches a paid order without friction or doubt, and a reviewer who finds every flow working.

It is a portfolio and learning demo, not a live business. Payments run in Stripe test mode and no real fulfilment exists.

## Positioning

Curated and small. A short, deliberately chosen catalog where the quality of the selection is the product, rather than a marketplace of everything. A neighboring shop with thousands of SKUs could not truthfully claim this.

## Operating Context

- Public storefront: home, shop, product detail, cart, Stripe Checkout, success and cancel pages.
- Shopper account: orders and wishlist.
- Admin area (role-gated): dashboard, inventory (create, price, stock, active, featured, delete), order status.
- Stripe Checkout runs in test mode; a Supabase Edge Function builds the session and re-prices the cart on the server, and a webhook marks orders paid and decrements stock.
- Data and auth live in Supabase (Postgres, Row Level Security, email and password auth). Hosted on Vercel.

## Capabilities and Constraints

- Stack is fixed by the existing codebase: React 19, Vite, TypeScript, Tailwind CSS v4, React Router, Supabase. Routes and checkout logic are stable and should not change without a reason.
- Catalog is currently 8 sample products in 4 categories (Audio, Wearables, Home, Accessories); one product is inactive.
- Cart is saved on the shopper's device (localStorage) until checkout.
- Terminology in use: products, categories, cart, wishlist, orders, featured.
- Undecided: whether Premium will ever become a real store, which would change payments mode, legal pages, shipping and returns.

## Brand Commitments

The name is "Premium" and the wordmark is "Premium" followed by an accent full stop. The existing home-page voice is plain and direct ("Everyday tech, thoughtfully made."). No other brand assets, logo files or voice guidelines were provided.

## Evidence on Hand

- 8 sample products with descriptions, prices and stock, loaded from `supabase/seed.sql`.
- Product photos are Unsplash images referenced by URL. Two do not match their products (Nimbus Air Purifier and Drift Laptop Sleeve) and need real replacements.
- No customer testimonials, press, case studies, ratings or sales figures exist. Future work must not invent any.
- No shipping, returns or warranty policies exist. Do not imply them.

## Product Principles

1. **Honest about being a demo.** Never imply real stock, real customers, shipping or returns that do not exist.
2. **Curation over breadth.** Fewer, better-chosen products shown with care beat more of everything.
3. **Trust is built from real mechanics.** Server-verified prices and payment-confirmed stock are the credibility; do not decorate trust with fabricated proof.
4. **Every flow works end to end.** A reviewer will try browse, wishlist, cart, checkout, account and admin; none may dead-end.
