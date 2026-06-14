"use client";

import { motion } from "framer-motion";

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Descreva sua ideia",
    description:
      "Escreva em linguagem natural o que o aplicativo deve fazer. Sem jargão técnico necessário.",
  },
  {
    number: "02",
    title: "A IA gera o projeto",
    description:
      "A gotan.ia monta a interface, a lógica e os dados — um projeto coeso e funcional em segundos.",
  },
  {
    number: "03",
    title: "Publique e evolua",
    description:
      "Revise, ajuste por conversa e publique. Continue iterando quando e como quiser.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-container px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Como <span className="text-gradient">funciona</span>
          </h2>
          <p className="mt-4 text-muted">Três passos da ideia ao app publicado.</p>
        </div>

        <div className="relative mt-16">
          {/* Linha conectora — visível apenas no desktop, atrás dos cards */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative rounded-2xl border border-border bg-surface/50 p-7 backdrop-blur"
              >
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl font-mono text-lg font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--orange), var(--primary))",
                    color: "#fff",
                  }}
                >
                  {s.number}
                </span>
                <h3 className="mt-5 text-lg font-medium text-fg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
