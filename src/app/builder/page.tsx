import { Suspense } from "react";
import { VoiceBuilder } from "@/components/voice/VoiceBuilder";

export default function BuilderPage() {
  return <Suspense fallback={<main className="empty-state">Carregando builder…</main>}><VoiceBuilder /></Suspense>;
}
