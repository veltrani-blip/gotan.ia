"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { generateApp, ApiError, PENDING_PROMPT_KEY } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Envia o prompt real ao backend via cliente compartilhado.
  async function send(promptText: string) {
    const prompt = promptText.trim();
    if (!prompt || loading) return; // impede vazio e envios duplicados

    setError(null);
    setMessages((m) => [...m, { role: "user", content: prompt }]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { reply } = await generateApp(prompt, controller.signal);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Geração cancelada.");
      } else {
        setError(err instanceof ApiError ? err.message : "Erro inesperado.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  // Recupera o prompt vindo da landing (após login) e dispara a geração.
  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_PROMPT_KEY);
    if (pending) {
      sessionStorage.removeItem(PENDING_PROMPT_KEY);
      send(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-6 py-8">
        {messages.length === 0 && !loading && (
          <div className="mt-20 text-center text-muted">
            <p className="text-lg">O que você quer construir hoje?</p>
            <p className="mt-1 text-sm">Descreva sua ideia abaixo e a gotan.ia monta a base.</p>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl bg-gradient-to-r from-orange to-accent px-4 py-3 text-sm text-white"
                    : "max-w-[80%] whitespace-pre-wrap rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-fg backdrop-blur"
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-muted">Gerando...</div>}
          {error && <div className="text-sm text-orange-bright">{error}</div>}
        </div>
      </div>

      <div className="border-t border-border bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-6 py-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface/60 p-2 backdrop-blur">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Descreva o aplicativo que você quer criar..."
              className="min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none"
            />
            {loading ? (
              <button
                type="button"
                onClick={cancel}
                aria-label="Cancelar"
                className="mb-1 mr-1 flex h-10 w-10 items-center justify-center rounded-xl border border-border text-fg transition-colors hover:border-orange/40"
              >
                <Square size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => send(input)}
                disabled={!input.trim()}
                aria-label="Enviar"
                className="mb-1 mr-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange to-accent text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <ArrowUp size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
