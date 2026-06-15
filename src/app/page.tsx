import Image from "next/image";
import { VoicePrompt } from "@/components/voice/VoicePrompt";
import { PricingSection } from "@/components/pricing/PricingSection";

export default function HomePage() {
  return (
    <main className="shell">
      <nav className="nav">
        <Image src="/branding/gotan-logo.png" alt="gotan.ia" width={220} height={68} priority />
        <div className="nav-actions">
          <a className="nav-link" href="#builder">Builder</a>
          <a className="nav-link" href="#pricing">Planos</a>
          <a className="nav-link" href="/login">Entrar</a>
          <a href="#builder" className="gradient-button" style={{ padding: "10px 18px", borderRadius: 11, textDecoration: "none", fontSize: 14, fontWeight: 800 }}>Criar agora</a>
        </div>
      </nav>
      <section className="hero" id="builder">
        <Image className="hero-city" src="/branding/gotan-emblem.png" alt="" width={1200} height={400} priority />
        <div className="hero-content">
          <div className="eyebrow glass"><span className="eyebrow-dot"/> Crie por voz ou texto — sem progresso falso</div>
          <h1>Diga o que imaginar.<br/><span className="gradient-text">A Gotan constrói.</span></h1>
          <p className="hero-subtitle">Gere um projeto React real, veja os arquivos, edite o código, acompanhe o preview e baixe o ZIP.</p>
          <VoicePrompt />
        </div>
      </section>
      <PricingSection />
    </main>
  );
}
