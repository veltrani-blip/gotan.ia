"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const plans = [
  {
    item: "free" as const,
    name: "Free",
    tagline: "Ideal para testar",
    price: 0,
    credits: "5 créditos",
    features: ["5 créditos grátis", "Geração básica", "Download ZIP"],
    cta: "Começar grátis",
    outline: true,
    highlighted: false,
  },
  {
    item: "starter" as const,
    name: "Starter",
    tagline: "Preço de entrada",
    price: 3.99,
    credits: "20 créditos/mês",
    features: ["20 créditos", "Exportação dos projetos", "Histórico completo"],
    cta: "Começar por $3,99",
    outline: true,
    highlighted: false,
  },
  {
    item: "pro" as const,
    name: "Pro",
    tagline: "Melhor custo-benefício",
    price: 7.99,
    credits: "60 créditos/mês",
    features: ["60 créditos", "Projetos ilimitados", "Prioridade na geração", "Suporte"],
    cta: "Assinar Pro",
    outline: false,
    highlighted: true,
    badge: "Mais Popular",
  },
  {
    item: "business" as const,
    name: "Business",
    tagline: "Para equipes",
    price: 14.99,
    credits: "150 créditos/mês",
    features: ["150 créditos", "Uso comercial", "Equipe", "Suporte prioritário"],
    cta: "Falar com vendas",
    outline: true,
    highlighted: false,
  },
];

export function PricingSection() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePlan(item: typeof plans[number]["item"]) {
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
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/signup");
      return;
    }

    setLoading(item);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Falha ao iniciar o checkout.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar o pagamento.");
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-heading">
        <h2>
          Comece pequeno,{" "}
          <span className="gradient-text">escale quando precisar</span>
        </h2>
        <p>Planos que acompanham seu ritmo — do primeiro teste à operação em equipe.</p>
        {error && <p style={{ color: "var(--danger)", marginTop: 12, fontSize: 14 }}>{error}</p>}
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            key={plan.item}
            className={`plan-card glass ${plan.highlighted ? "highlighted" : ""}`}
          >
            {plan.badge && <span className="plan-badge">{plan.badge}</span>}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-tagline">{plan.tagline}</div>
            <div className="plan-price">
              <strong>{plan.price === 0 ? "Grátis" : `$${plan.price.toFixed(2)}`}</strong>
              {plan.price > 0 && <span>/mês</span>}
            </div>
            <ul className="plan-features">
              {plan.features.map((f) => (
                <li key={f} className={plan.highlighted ? "highlighted" : ""}>{f}</li>
              ))}
            </ul>
            <button
              className={`plan-cta ${plan.outline ? "icon-button" : "gradient-button"}`}
              type="button"
              disabled={loading === plan.item}
              onClick={() => void handlePlan(plan.item)}
            >
              {loading === plan.item ? "Redirecionando…" : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
