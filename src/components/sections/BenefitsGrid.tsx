"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  glow: string; // cor do glow sutil por card
}

const benefits: Benefit[] = [
  {
    icon: Zap,
    title: "Da ideia ao app em minutos",
    description:
      "Descreva o que precisa e receba uma base funcional na hora — sem boilerplate, sem configuração inicial.",
    glow: "var(--orange)",
  },
  {
    icon: ShieldCheck,
    title: "Pronto para produção",
    description:
      "Código limpo, seguro e testável desde o primeiro gerador, com boas práticas aplicadas por padrão.",
    glow: "var(--primary)",
  },
  {
    icon: Layers,
    title: "Full-stack de verdade",
    description:
      "Front-end, API e banco de dados conectados e versionados, prontos para você publicar e evoluir.",
    glow: "var(--accent)",
  },
];

export function BenefitsGrid() {
  return (
    <section id="features" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-container px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Tudo que você precisa para <span className="text-gradient">construir</span>
          </h2>
          <p className="mt-4 text-muted">
            Uma plataforma única que cobre todo o ciclo, da descrição ao deploy.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.article
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                {/* Glow sutil que aparece no hover, cor própria por card */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                  style={{ background: b.glow }}
                />
                <div
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-2"
                  style={{ color: b.glow }}
                >
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-medium text-fg">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{b.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
