import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PRICE_BY_PLAN: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

const CREDIT_PACKS: Record<string, string | undefined> = {
  credits_60: process.env.STRIPE_PRICE_CREDITS_60,
};

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada.");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = (await request.json()) as { item?: unknown };
    const item = typeof body.item === "string" ? body.item.trim() : "";

    const isSubscription = item in PRICE_BY_PLAN;
    const isPack = item in CREDIT_PACKS;

    if (!isSubscription && !isPack) {
      return NextResponse.json({ error: "Item inválido." }, { status: 422 });
    }

    const priceId = isSubscription ? PRICE_BY_PLAN[item] : CREDIT_PACKS[item];
    if (!priceId) {
      return NextResponse.json(
        { error: "Preço não configurado para este item." },
        { status: 503 },
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    const client = stripe();
    const session = await client.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, item },
      success_url: `${appUrl}/billing/success`,
      cancel_url: `${appUrl}/billing/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao iniciar o checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
