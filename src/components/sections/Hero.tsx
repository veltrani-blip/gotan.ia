"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { useRotatingWord } from "@/lib/useRotatingWord";
import { PromptBox } from "./PromptBox";
import { Marquee } from "./Marquee";

const rotating = ["aplicativos", "dashboards", "APIs", "SaaS", "portais"];

export function Hero() {
  const word = useRotatingWord(rotating, 2200);

  return (
    <section className="bg-glow relative overflow-hidden">
      {/* Fundo cinematográfico Gotham + overlay escuro para legibilidade do texto */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/branding/gotan-city-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/60 to-bg" />
      </div>

      <div className="mx-auto flex max-w-container flex-col items-center px-6 pb-16 pt-16 text-center sm:pb-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge>
            <Sparkles size={12} className="text-accent" /> Construa em minutos, não em meses
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
        >
          Crie{" "}
          <span className="relative inline-block min-w-[5ch] text-gradient">
            <AnimatePresence mode="wait">
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="inline-block"
              >
                {word}
              </motion.span>
            </AnimatePresence>
          </span>{" "}
          completos conversando com a IA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 max-w-xl text-balance text-base text-muted sm:text-lg"
        >
          Descreva sua ideia em linguagem natural e a gotan.ia entrega uma aplicação
          full-stack pronta para produção.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 w-full"
        >
          <PromptBox />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 w-full"
        >
          <Marquee />
        </motion.div>
      </div>
    </section>
  );
}
