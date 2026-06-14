"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, AlertTriangle } from "lucide-react";

// Estados REAIS do fluxo de geração — refletem a requisição, não uma simulação.
export type GenStatus = "idle" | "sending" | "done" | "error" | "cancelled";

interface CodingOverlayProps {
  status: GenStatus;
  reply?: string | null;
  errorMessage?: string | null;
  onClose: () => void;
  onCancel: () => void;
}

const CODE_GLYPHS = ["</>", "{}", "[]", "function", "const", "API", "=>", "( )"];

function Bat({ glyph }: { glyph?: string }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <svg width="34" height="16" viewBox="0 0 34 16" fill="none" aria-hidden>
        <path
          d="M17 9c-1.6-3-3.4-4.6-5.4-4.6-1.7 0-2.4 1.3-3.7.4C6.3 4 5.3 1.8 4 2.2c-1 .3-.6 2-1.4 2.7-.8.6-2.6.3-2.6.3s2 2 4.2 2.4C6.6 10 8.6 9 11 11c2 1.7 4.4 3 6 3s4-1.3 6-3c2.4-2 4.4-1 6.8-3.4 2.2-.4 4.2-2.4 4.2-2.4s-1.8.3-2.6-.3c-.8-.7-.4-2.4-1.4-2.7-1.3-.4-2.3 1.8-3.9 2.6-1.3.9-2-.4-3.7-.4-2 0-3.8 1.6-5.4 4.6Z"
          fill="currentColor"
        />
      </svg>
      {glyph && (
        <span className="pointer-events-none absolute font-mono text-[8px] text-bg/80">{glyph}</span>
      )}
    </span>
  );
}

function useBats(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 80 + 5,
        delay: Math.random() * 4,
        duration: 8 + Math.random() * 8,
        scale: 0.6 + Math.random() * 0.9,
        glyph: Math.random() > 0.5 ? CODE_GLYPHS[i % CODE_GLYPHS.length] : undefined,
        dir: Math.random() > 0.5 ? 1 : -1,
      })),
    [count]
  );
}

function StatusBlock({
  status,
  reply,
  errorMessage,
}: Pick<CodingOverlayProps, "status" | "reply" | "errorMessage">) {
  if (status === "sending") {
    return (
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-orange" />
        <p className="text-sm text-muted">Aguardando a resposta da IA...</p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3">
        <AlertTriangle size={28} className="text-orange-bright" />
        <p className="text-sm text-orange-bright">{errorMessage ?? "Algo deu errado."}</p>
      </div>
    );
  }
  if (status === "cancelled") {
    return <p className="text-sm text-muted">Geração cancelada.</p>;
  }
  if (status === "done") {
    return (
      <div className="flex flex-col gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-orange-bright">
          <Check size={16} /> Resposta gerada
        </span>
        <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-surface-2/60 p-4 text-left text-sm text-fg">
          {reply}
        </div>
      </div>
    );
  }
  return null;
}

export function CodingOverlay({
  status,
  reply,
  errorMessage,
  onClose,
  onCancel,
}: CodingOverlayProps) {
  const bats = useBats(10);
  const open = status !== "idle";
  const sending = status === "sending";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-bg/80 px-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Geração de aplicação"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--orange)" }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full opacity-25 blur-3xl"
            style={{ background: "var(--purple)" }}
          />

          {sending &&
            bats.map((b) => (
              <motion.span
                key={b.id}
                aria-hidden
                className="pointer-events-none absolute text-orange/70"
                style={{ top: `${b.top}%` }}
                initial={{ x: b.dir > 0 ? "-10vw" : "110vw", opacity: 0 }}
                animate={{
                  x: b.dir > 0 ? "110vw" : "-10vw",
                  opacity: [0, 0.8, 0.8, 0],
                  y: [0, -14, 8, -10, 0],
                }}
                transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "linear" }}
              >
                <span style={{ transform: `scale(${b.scale})`, display: "inline-block" }}>
                  <Bat glyph={b.glyph} />
                </span>
              </motion.span>
            ))}

          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-orange/30 bg-surface/70 p-7 text-center backdrop-blur-xl"
          >
            <h2 className="text-xl font-semibold sm:text-2xl">
              A <span className="text-gradient">gotan.ia</span>{" "}
              {sending ? "está construindo seu app..." : "gerou sua base"}
            </h2>

            <div className="mt-6">
              <StatusBlock status={status} reply={reply} errorMessage={errorMessage} />
            </div>

            <div className="mt-7 flex items-center justify-center gap-3">
              {sending ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-orange/40 hover:text-fg"
                >
                  <X size={14} /> Cancelar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-orange/40 hover:text-fg"
                >
                  <X size={14} /> Fechar
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
