import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const CREDITS_BY_PLAN: Record<string, number> = {
  starter: 20,
  pro: 60,
  business: 150,
};

const CREDITS_BY_PACK: Record<string, number> = {
  credits_60: 60,
};

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada.");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

function adminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin não configurado.");
  return createAdminClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, sig, secret);
  } catch {
    return NextResponse.json(
      { error: "Assinatura do webhook inválida." },
      { status: 400 },
    );
  }

  const db = adminSupabase();

  // Idempotência: ignorar eventos já processados.
  const { data: existing } = await db
    .from("stripe_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await db.from("stripe_events").insert({ event_id: event.id });

  const obj = event.data.object as unknown as Record<string, unknown>;

  if (event.type === "checkout.session.completed") {
    const metadata = (obj.metadata as Record<string, string>) ?? {};
    const userId =
      metadata.user_id ?? (obj.client_reference_id as string) ?? null;
    const item = metadata.item ?? "";

    if (!userId) {
      console.error("[webhook] checkout.session.completed sem user_id");
      return NextResponse.json({ received: true });
    }

    if (item in CREDITS_BY_PLAN) {
      await db.from("subscriptions").upsert(
        {
          user_id: userId,
          plan: item,
          status: "active",
          credits: CREDITS_BY_PLAN[item],
          stripe_customer_id: obj.customer ?? null,
          stripe_subscription_id: obj.subscription ?? null,
        },
        { onConflict: "user_id" },
      );

      await db.from("credit_ledger").insert({
        user_id: userId,
        delta: CREDITS_BY_PLAN[item],
        reason: "subscription_credit",
        idempotency_key: event.id,
      });
    } else if (item in CREDITS_BY_PACK) {
      // Somar créditos avulsos ao saldo existente via RPC.
      await db.rpc("add_credits", {
        p_user_id: userId,
        p_delta: CREDITS_BY_PACK[item],
      });

      await db.from("credit_ledger").insert({
        user_id: userId,
        delta: CREDITS_BY_PACK[item],
        reason: "credit_pack",
        idempotency_key: event.id,
      });
    }
  } else if (event.type === "customer.subscription.updated") {
    const subId = obj.id as string;
    const status = (obj.status as string) ?? "active";
    await db
      .from("subscriptions")
      .update({ status })
      .eq("stripe_subscription_id", subId);
  } else if (event.type === "customer.subscription.deleted") {
    const subId = obj.id as string;
    await db
      .from("subscriptions")
      .update({ status: "canceled", plan: "free" })
      .eq("stripe_subscription_id", subId);
  }

  return NextResponse.json({ received: true });
}
