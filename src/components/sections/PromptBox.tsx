"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Sparkles } from "lucide-react";
import { Chip } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { CodingOverlay, type GenStatus } from "./CodingOverlay";
import { generateApp, ApiError, PENDING_PROMPT_KEY } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

const suggestions = [
  "Um CRM para clínicas",
  "Painel financeiro com gráficos",
  "Loja com checkout",
  "App de agendamento",
];

export function PromptBox() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<GenStatus>("idle");
  const [reply, setReply] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Clique em "Gerar App": valida, checa sessão e dispara o fluxo REAL.
  async function handleGenerate() {
    const prompt = value.trim();
    if (!prompt || status === "sending") return; // vazio + envio duplicado bloqueados

    // Se não houver sessão, preserva o prompt e leva ao cadastro.
    // O /app recupera de PENDING_PROMPT_KEY e gera sem redigitar.
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      sessionStorage.setItem(PENDING_PROMPT_KEY, prompt);
      router.push("/signup");
      return;
    }

    setErrorMessage(null);
    setReply(null);
    setStatus("sending");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { reply: text } = await generateApp(prompt, controller.signal);
      setReply(text);
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("cancelled");
      } else {
        setErrorMessage(err instanceof ApiError ? err.message : "Erro inesperado.");
        setStatus("error");
      }
      // prompt preservado em `value` — o usuário pode reenviar
    } finally {
      abortRef.current = null;
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  function closeOverlay() {
    setStatus("idle");
  }

  const sending = status === "sending";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-border bg-surface/60 p-2 shadow-[0_0_60px_-20px_var(--primary)] backdrop-blur">
        <div className="flex items-end gap-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            rows={2}
            placeholder="Descreva o aplicativo que você quer criar..."
            className="min-h-[64px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!value.trim() || sending}
            aria-label="Gerar App"
            className={cn(
              "mb-1 mr-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange to-accent text-white transition-opacity hover:opacity-90",
              (!value.trim() || sending) && "opacity-60"
            )}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Sparkles size={12} /> Tente:
        </span>
        {suggestions.map((s) => (
          <button key={s} type="button" onClick={() => setValue(s)} className="cursor-pointer">
            <Chip className="transition-colors hover:border-primary hover:text-fg">{s}</Chip>
          </button>
        ))}
      </div>

      <CodingOverlay
        status={status}
        reply={reply}
        errorMessage={errorMessage}
        onCancel={cancel}
        onClose={closeOverlay}
      />
    </div>
  );
}
