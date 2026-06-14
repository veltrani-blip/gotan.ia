import type { Variants } from "framer-motion";

// Entrada padrão de seções/cards — usada em todo o site para timing consistente.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Viewport padrão para animações on-scroll (dispara uma vez, com margem).
export const viewportOnce = { once: true, margin: "-80px" } as const;
