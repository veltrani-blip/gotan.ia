"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/utils";
import { startCheckout, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

interface Plan {
  name: string;
  price: number;
  tagline: string;
  features: string[];
  cta: string;
  ctaVariant: "primary" | "outline";
  badge?: string;
  highlight?: boolean;
  // 'free' → cadastro; 'starter'/'pro'/'business' → checkout/contato.
  item: "free" | "starter" | "pro" | "business";
}

const plans: Plan[] = [
  {
    name: "Free",
    item: "free",
    price: 0,
    tagline: "Ideal para testar",
    features: ["5 créditos grátis", "Geração básica", "Histórico limitado"],
    cta: "Começar grátis",
    ctaVariant: "outline",
  },
  {
    name: "Starter",
    item: "starter",
    price: 3.99,
    tagline: "Preço de entrada",
    features: [
      "20 créditos",
      "Exportação dos projetos",
      "Histórico completo",
      "Suporte básico",
    ],
    cta: "Começar por $3.99",
    ctaVariant: "outline",
    badge: "Entrada",
  },
  {
    name: "Pro",
    item: "pro",
    price: 7.99,
    tagline: "Melhor custo-benefício",
    features: [
      "60 créditos",
      "Projetos ilimitados",
      "Templates premium",
      "Prioridade na geração",
    ],
    cta: "Assinar Pro",
    ctaVariant: "primary",
    badge: "Mais Popular",
    highlight: true,
  },
  {
    name: "Business",
    item: "business",
    price: 14.99,
    tagline: "Para equipes",
    features: ["150 créditos", "Uso comercial", "Equipe", "Suporte prioritário"],
    cta: "Falar com vendas",
    ctaVariant: "outline",
  },
];

export function PricingSection() {
  const router = useRouter();
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clique no plano: Free → cadastro; Business → contato; pagos → checkout Stripe real.
  async function handlePlan(item: Plan["item"]) {
    setError(null);

    if (item === "free") {
      router.push("/signup");
      return;
    }
    if (item === "business") {
      window.location.href = "mailto:vendas@gotan.ia?subject=Plano%20Business";
      return;
    }

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Precisa estar logado para assinar (o webhook grava na linha do usuário).
    if (!session?.user) {
      router.push("/signup");
      return;
    }

    setLoadingItem(item);
    try {
      const url = await startCheckout(item, {
        id: session.user.id,
        email: session.user.email ?? "",
      });
      window.location.href = url; // redireciona ao Stripe Checkout
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível iniciar o pagamento.");
      setLoadingItem(null);
    }
  }

  return (
    <section id="pricing" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-container px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Comece pequeno, <span className="text-gradient">escale quando precisar</span>
          </h2>
          <p className="mt-4 text-muted">
            Planos que acompanham seu ritmo — do primeiro teste à operação em equipe.
          </p>
          {error && <p className="mt-4 text-sm text-orange-bright">{error}</p>}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-surface/50 p-6 backdrop-blur transition-all duration-300",
                plan.highlight
                  ? "border-orange/60 shadow-[0_0_50px_-12px_var(--orange)] lg:-translate-y-3"
                  : "border-border hover:border-orange/40"
              )}
            >
              {plan.badge && (
                <span
                  className={cn(
                    "absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-medium",
                    plan.highlight
                      ? "bg-gradient-to-r from-orange to-accent text-white"
                      : "border border-border bg-surface-2 text-muted"
                  )}
                >
                  {plan.badge}
                </span>
              )}

              <h3 className="text-base font-medium text-fg">{plan.name}</h3>
              <p className="mt-1 text-xs text-muted">{plan.tagline}</p>

              <div className="mt-5 flex items-end gap-1">
                <span className="text-3xl font-semibold tracking-tight text-fg">
                  {formatPrice(plan.price)}
                </span>
                {plan.price > 0 && <span className="pb-1 text-sm text-muted">/mês</span>}
              </div>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0"
                      style={{ color: plan.highlight ? "var(--orange)" : "var(--accent)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.ctaVariant}
                size="md"
                className="mt-7 w-full"
                disabled={loadingItem === plan.item}
                onClick={() => handlePlan(plan.item)}
              >
                {loadingItem === plan.item ? "Redirecionando..." : plan.cta}
              </Button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
