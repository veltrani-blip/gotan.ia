"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-container px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-orange/30 bg-surface/40 px-6 py-16 text-center backdrop-blur"
        >
          {/* Glow cinematográfico atrás do CTA */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: "var(--orange)" }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Sua próxima aplicação começa com uma <span className="text-gradient">frase</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted">
              Comece pequeno, escale quando precisar. Sem cartão para testar.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/signup">
                <Button size="lg">Criar meu primeiro app</Button>
              </a>
              <a href="#pricing">
                <Button variant="outline" size="lg">
                  Ver planos
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
