"use client";

import { motion } from "framer-motion";
import { HeartPulse, ShoppingBag, Briefcase, GraduationCap, Utensils, Building2, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Sector {
  icon: LucideIcon;
  name: string;
  description: string;
}

const sectors: Sector[] = [
  { icon: HeartPulse, name: "Saúde", description: "Agendamentos, prontuários e portais de paciente." },
  { icon: ShoppingBag, name: "Varejo", description: "Catálogos, checkout e gestão de pedidos." },
  { icon: Briefcase, name: "Serviços", description: "CRMs, propostas e fluxos de atendimento." },
  { icon: GraduationCap, name: "Educação", description: "Cursos, turmas e acompanhamento de alunos." },
  { icon: Utensils, name: "Alimentação", description: "Cardápios, reservas e pedidos online." },
  { icon: Building2, name: "Imobiliário", description: "Listagens, visitas e funis de captação." },
];

export function SectorGrid() {
  return (
    <section id="sectors" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-container px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Feito para o seu <span className="text-gradient">setor</span>
          </h2>
          <p className="mt-4 text-muted">Pontos de partida pensados para cada tipo de operação.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.a
                key={s.name}
                href="#"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group relative flex flex-col rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-orange/40"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-2 text-orange">
                    <Icon size={20} />
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-muted transition-colors group-hover:text-orange"
                  />
                </div>
                <h3 className="text-base font-medium text-fg">{s.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.description}</p>
                <span className="mt-4 text-sm font-medium text-accent">Explorar</span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
