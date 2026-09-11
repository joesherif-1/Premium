// Creates a Stripe Checkout Session (test mode) for the caller's cart.
//
// The client sends only { items: [{ product_id, quantity }] } — prices are always
// re-read from the database here so a tampered client request can't change what
// gets charged. A "pending" order + order_items row is created first; the Stripe
// session's metadata carries the order id so the webhook can mark it paid later.
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

interface CartLine {
  product_id: string;
  quantity: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401);
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (userError || !userData.user) {
      return json({ error: 'Invalid session' }, 401);
    }
    const user = userData.user;

    const { items, success_url, cancel_url } = (await req.json()) as {
      items: CartLine[];
      success_url: string;
      cancel_url: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: 'Cart is empty' }, 400);
    }

    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price_cents, currency, stock, is_active, image_url')
      .in('id', productIds);

    if (productsError) throw productsError;

    const byId = new Map(products.map((p) => [p.id, p]));
    let totalCents = 0;
    const orderItems: {
      product_id: string;
      product_name: string;
      unit_price_cents: number;
      quantity: number;
    }[] = [];
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const line of items) {
      const product = byId.get(line.product_id);
      const quantity = Math.max(1, Math.floor(line.quantity));
      if (!product || !product.is_active) {
        return json({ error: `Product unavailable: ${line.product_id}` }, 400);
      }
      if (product.stock < quantity) {
        return json({ error: `Not enough stock for ${product.name}` }, 400);
      }

      totalCents += product.price_cents * quantity;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        unit_price_cents: product.price_cents,
        quantity,
      });
      lineItems.push({
        quantity,
        price_data: {
          currency: product.currency,
          unit_amount: product.price_cents,
          product_data: {
            name: product.name,
            images: product.image_url ? [product.image_url] : undefined,
          },
        },
      });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({ user_id: user.id, status: 'pending', total_cents: totalCents })
      .select()
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) throw itemsError;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: user.email,
      success_url,
      cancel_url,
      metadata: { order_id: order.id },
    });

    await supabaseAdmin
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id);

    return json({ url: session.url, order_id: order.id });
  } catch (err) {
    console.error(err);
    return json({ error: (err as Error).message ?? 'Unexpected error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
