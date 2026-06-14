"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExpandIcon, MicIcon, PaperclipIcon, SendIcon } from "./icons";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

const suggestions = [
  "Plataforma SaaS de gestão financeira",
  "App de delivery com rastreamento",
  "Site premium para agência de marketing",
  "Loja virtual de roupas com checkout",
];

export function VoicePrompt() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendTranscript = useCallback((text: string) => {
    setPrompt((current) => `${current}${current.trim() ? " " : ""}${text}`);
  }, []);
  const voice = useSpeechRecognition(appendTranscript);

  const submit = () => {
    const value = prompt.trim();
    if (value.length < 8) {
      setError("Descreva com um pouco mais de detalhe o que deseja criar.");
      return;
    }
    sessionStorage.setItem("gotan:lastPrompt", value);
    router.push(`/builder?prompt=${encodeURIComponent(value)}`);
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 300_000) {
      setError("O arquivo de contexto deve ter no máximo 300 KB.");
      return;
    }
    const allowed = ["text/plain", "text/markdown", "application/json", "text/csv"];
    if (!allowed.includes(file.type) && !/\.(txt|md|json|csv)$/i.test(file.name)) {
      setError("Envie somente arquivos TXT, MD, JSON ou CSV nesta versão.");
      return;
    }
    const text = await file.text();
    setPrompt((current) => `${current}\n\nContexto do arquivo ${file.name}:\n${text}`.trim());
  };

  return (
    <>
      <div className="prompt-card glass">
        <textarea
          value={prompt}
          onChange={(event) => { setPrompt(event.target.value); setError(null); }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          rows={expanded ? 10 : 3}
          placeholder="Descreva o app, site ou plataforma que você quer criar…"
          aria-label="Prompt do aplicativo"
        />
        {voice.interimText && <div style={{ color: "#ff9a4d", fontSize: 13, padding: "4px 6px 8px" }}>Ouvindo: {voice.interimText}</div>}
        <div className="prompt-toolbar">
          <div className="prompt-status"><span className="status-dot"/> gotan engine · pronto</div>
          <div className="prompt-actions">
            <input ref={fileInputRef} hidden type="file" accept=".txt,.md,.json,.csv,text/plain,text/markdown,application/json,text/csv" onChange={(event) => void onFile(event.target.files?.[0])}/>
            <button className="icon-button" type="button" style={{ width: 48, height: 48 }} title="Adicionar contexto" onClick={() => fileInputRef.current?.click()}><PaperclipIcon width={21}/></button>
            <button className="icon-button" type="button" style={{ width: 48, height: 48 }} title={expanded ? "Recolher" : "Expandir"} onClick={() => setExpanded((value) => !value)}><ExpandIcon width={21}/></button>
            <button className={`icon-button ${voice.listening ? "mic-live" : ""}`} disabled={!voice.supported} type="button" style={{ width: 48, height: 48 }} title={voice.supported ? "Falar" : "Reconhecimento de voz indisponível"} onClick={voice.toggle}><MicIcon width={22}/></button>
            <button className="gradient-button" type="button" style={{ height: 48, padding: "0 22px", borderRadius: 14, cursor: "pointer", fontWeight: 800, display: "flex", alignItems: "center", gap: 9 }} onClick={submit}>Criar app <SendIcon width={18}/></button>
          </div>
        </div>
        {(error || voice.error) && <div className="error-banner">{error || voice.error}</div>}
      </div>
      <div className="suggestions">
        {suggestions.map((suggestion) => <button className="suggestion" key={suggestion} onClick={() => setPrompt(suggestion)}>{suggestion}</button>)}
      </div>
    </>
  );
}
