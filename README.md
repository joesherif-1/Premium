# Premium — E-commerce Demo

A multi-page e-commerce site built with **React + Tailwind CSS + Supabase**, with
Stripe Checkout wired up in test mode.

## Features

- **Storefront**: home page, shop with search/filter/sort/pagination, product detail
  pages with reviews and ratings.
- **Cart & checkout**: cart persisted in `localStorage`, Stripe Checkout (test mode)
  via a Supabase Edge Function, success/cancel pages.
- **Auth**: Supabase email/password auth, order history under "My Account".
- **Admin dashboard** (role-gated): revenue/order/stock stats, inventory CRUD
  (add/edit price & stock/activate/delete products), order list with status updates.
- **Payments**: a second Edge Function verifies Stripe's webhook signature, marks
  orders paid, and decrements stock — all server-side, so nothing depends on the
  browser staying open after checkout.

## Stack

- [Vite](https://vite.dev) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- [React Router](https://reactrouter.com)
- [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security, Edge Functions
- [Stripe](https://stripe.com) Checkout, test mode

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then link it:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
3. Apply the schema (tables, RLS policies) and sample catalog:
   ```bash
   supabase db push                                   # runs supabase/migrations/*.sql
   psql "$(supabase db --db-url)" -f supabase/seed.sql # optional sample products
   ```
4. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**.
5. Make yourself an admin after signing up once in the app:
   ```sql
   update public.profiles set role = 'admin' where id = '<your-user-id>';
   ```

## 2. Set up Stripe (test mode)

1. Grab your **test mode** secret key from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys).
2. Set it and the Supabase service role key as Edge Function secrets (never put
   these in `.env` / the frontend — Checkout is created server-side and the browser
   only ever sees the resulting redirect URL):
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<from Project Settings → API>
   ```
4. Deploy the functions:
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   ```
5. In the Stripe dashboard, add a webhook endpoint pointing at your deployed
   `stripe-webhook` function URL, subscribed to `checkout.session.completed`, then
   set its signing secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. Test with card `4242 4242 4242 4242`, any future expiry, any CVC.

## 3. Run locally

```bash
npm install
npm run dev
```

## Project structure

```
src/
  pages/            route-level pages (Home, Shop, ProductDetail, Cart, Account, …)
  pages/admin/       admin dashboard, inventory, orders
  components/        Navbar, ProductCard, route guards, admin layout
  context/            AuthContext (Supabase auth + profile/role), CartContext (localStorage cart)
  hooks/              useProducts (search/filter/sort/paginate), useCategories
  lib/                supabaseClient, price formatting
supabase/
  migrations/         schema + RLS policies
  seed.sql            sample catalog
  functions/
    create-checkout-session/  builds a Stripe Checkout Session from the cart (re-prices server-side)
    stripe-webhook/           confirms payment, decrements stock
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run Oxlint
