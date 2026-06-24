"use client";

import { useState } from "react";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
  time: string;
  iconColor: string;
  stroke: string;
  icon: "grid" | "rect" | "bag" | "cal" | "doc" | "clock" | "chat";
  active?: boolean;
}

interface TemplateCard {
  title: string;
  desc: string;
  tags: string[];
  users: string;
}

interface SectorTile {
  label: string;
  icon: string;
  count: number;
}

// ── Data ───────────────────────────────────────────────────────────────────
const PROJECTS_TODAY: Project[] = [
  { id: "crm-vet", name: "CRM clínica veterinária", time: "há 12 min", iconColor: "rgba(255,122,24,0.15)", stroke: "#ff9f1c", icon: "grid", active: true },
  { id: "fin-saas", name: "Painel financeiro SaaS", time: "há 2 h", iconColor: "rgba(124,58,237,0.15)", stroke: "#c084fc", icon: "rect" },
];

const PROJECTS_WEEK: Project[] = [
  { id: "cafe", name: "Loja de café artesanal", time: "terça", iconColor: "rgba(255,255,255,0.04)", stroke: "#9d94b8", icon: "bag" },
  { id: "agenda", name: "Agenda multi-profissional", time: "segunda", iconColor: "rgba(255,255,255,0.04)", stroke: "#9d94b8", icon: "cal" },
  { id: "contratos", name: "Gestão de contratos", time: "segunda", iconColor: "rgba(255,255,255,0.04)", stroke: "#9d94b8", icon: "doc" },
];

const PROJECTS_OLD: Project[] = [
  { id: "ponto", name: "Controle de ponto", time: "jun", iconColor: "rgba(255,255,255,0.04)", stroke: "#9d94b8", icon: "clock" },
  { id: "chatbot", name: "Chatbot atendimento", time: "mai", iconColor: "rgba(255,255,255,0.04)", stroke: "#9d94b8", icon: "chat" },
];

const SUGGESTION_CHIPS = ["CRM para clínicas", "Painel financeiro", "Loja com checkout", "App de agendamento", "Chatbot WhatsApp"];

const SECTORS: SectorTile[] = [
  { label: "Saúde", icon: "❤️", count: 18 },
  { label: "Varejo", icon: "🛍️", count: 24 },
  { label: "Serviços", icon: "⚡", count: 31 },
  { label: "Finanças", icon: "💰", count: 12 },
  { label: "Educação", icon: "📚", count: 9 },
  { label: "Jurídico", icon: "⚖️", count: 7 },
];

const TEMPLATES: TemplateCard[] = [
  { title: "Agendamento + Pix", desc: "Agenda online com confirmação automática e cobrança via Pix integrada", tags: ["Next.js", "Supabase", "Pix"], users: "1.2k" },
  { title: "Chatbot atendimento", desc: "Bot com IA para responder dúvidas, capturar leads e abrir tickets", tags: ["Next.js", "Claude", "WhatsApp"], users: "890" },
  { title: "Dashboard SaaS", desc: "Painel de métricas com gráficos, usuários e billing integrado ao Stripe", tags: ["Next.js", "Stripe", "Charts"], users: "2.1k" },
];

// ── Sub-components ─────────────────────────────────────────────────────────
function ProjectIcon({ icon, stroke }: { icon: Project["icon"]; stroke: string }) {
  const s = { width: 12, height: 12, fill: "none" as const, stroke, strokeWidth: 2 };
  switch (icon) {
    case "grid": return <svg {...s} viewBox="0 0 24 24"><path d="M3 9h18M9 21V9" /></svg>;
    case "rect": return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>;
    case "bag": return <svg {...s} viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /></svg>;
    case "cal": return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case "doc": return <svg {...s} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>;
    case "clock": return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
    case "chat": return <svg {...s} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
  }
}

function SidebarItem({ project }: { project: Project }) {
  return (
    <div
      className="flex items-center gap-[10px] rounded-lg px-3 py-[9px] cursor-pointer mb-[2px] transition-colors"
      style={{
        background: project.active ? "rgba(255,122,24,0.08)" : undefined,
        border: project.active ? "1px solid rgba(255,122,24,0.15)" : "1px solid transparent",
      }}
      onMouseEnter={e => { if (!project.active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!project.active) (e.currentTarget as HTMLElement).style.background = ""; }}
    >
      <div
        className="w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0"
        style={{ background: project.iconColor }}
      >
        <ProjectIcon icon={project.icon} stroke={project.stroke} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[#f8f4ec] text-[12.5px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">{project.name}</div>
        <div className="text-[#6b6478] text-[11px]">{project.time}</div>
      </div>
    </div>
  );
}

function Sidebar({ userEmail, hasProjects }: { userEmail: string; hasProjects: boolean }) {
  const initial = userEmail?.[0]?.toUpperCase() ?? "U";
  return (
    <aside
      className="absolute top-0 left-0 bottom-0 w-[264px] flex flex-col z-10"
      style={{ background: "rgba(13,10,18,0.7)", backdropFilter: "blur(12px)", borderRight: "1px solid #1f1828" }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #1f1828" }}>
        <Image src="/gotan-logo-horizontal.png" alt="gotan.ia" width={140} height={40} className="h-7 w-auto" />
      </div>

      {/* Novo projeto + busca */}
      <div className="p-4">
        <button
          className="w-full flex items-center justify-center gap-2 py-[10px] px-[14px] rounded-[10px] font-semibold text-[13.5px] text-white cursor-pointer"
          style={{ background: "linear-gradient(90deg,#ff7a18,#ff9f1c)", border: "none", boxShadow: "0 8px 24px -8px rgba(255,122,24,0.5)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Novo projeto
        </button>
        <div className="relative mt-[10px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6478" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute top-1/2 left-[11px] -translate-y-1/2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar projetos…"
            className="w-full py-2 pl-8 pr-[10px] text-[12.5px] rounded-lg outline-none"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1f1828", color: "#f8f4ec", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Projetos */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="px-3 pt-2 pb-[6px] text-[#6b6478] text-[10.5px] font-semibold tracking-[0.08em] uppercase">Hoje</div>
        {PROJECTS_TODAY.map(p => <SidebarItem key={p.id} project={p} />)}

        <div className="px-3 pt-[14px] pb-[6px] text-[#6b6478] text-[10.5px] font-semibold tracking-[0.08em] uppercase">Esta semana</div>
        {PROJECTS_WEEK.map(p => <SidebarItem key={p.id} project={p} />)}

        {hasProjects && (
          <>
            <div className="px-3 pt-[14px] pb-[6px] text-[#6b6478] text-[10.5px] font-semibold tracking-[0.08em] uppercase">Mais antigos</div>
            {PROJECTS_OLD.map(p => <SidebarItem key={p.id} project={p} />)}
          </>
        )}
      </div>

      {/* User */}
      <div className="p-3 flex items-center gap-[10px]" style={{ borderTop: "1px solid #1f1828" }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-[13px] flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#ff7a18,#7c3aed)" }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[#f8f4ec] text-[12.5px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">{userEmail}</div>
          <div className="text-[#6b6478] text-[11px]">Plano Pro</div>
        </div>
        <button className="p-[6px] rounded-[6px] text-[#9d94b8] cursor-pointer bg-transparent border-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

// ── Mini template previews ─────────────────────────────────────────────────
function MiniCRM() {
  return (
    <div style={{ position: "absolute", top: 9, left: 22, right: 0, bottom: 0, padding: "5px 6px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div style={{ height: 5, width: 36, background: "#f8f4ec", borderRadius: 1 }} />
          <div style={{ height: 3, width: 16, background: "rgba(255,122,24,0.25)", borderRadius: 2 }} />
        </div>
        <div style={{ height: 7, width: 18, background: "linear-gradient(90deg,#ff7a18,#ff9f1c)", borderRadius: 2 }} />
      </div>
      {[["#ff9f1c", "rgba(34,197,94,0.5)"], ["#c084fc", "rgba(255,159,28,0.55)"], ["#22c55e", "rgba(34,197,94,0.5)"], ["#7c3aed", "rgba(255,159,28,0.55)"]].map(([dot, bar], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 3px", background: "rgba(255,255,255,0.025)", borderRadius: 2, marginBottom: 2 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />
          <div style={{ flex: 1, height: 2, background: "#3a2a22", borderRadius: 1 }} />
          <div style={{ height: 4, width: 14, background: bar, borderRadius: 2 }} />
        </div>
      ))}
    </div>
  );
}

function MiniChart() {
  return (
    <div style={{ position: "absolute", top: 9, left: 0, right: 0, bottom: 0, padding: 5 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ height: 5, width: 42, background: "#f8f4ec", borderRadius: 1 }} />
        <div style={{ display: "flex", gap: 2 }}>
          <div style={{ width: 8, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 2 }} />
          <div style={{ width: 8, height: 6, background: "rgba(124,58,237,0.4)", borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, marginBottom: 3 }}>
        {[["#22c55e"], ["#ff9f1c"], ["#c084fc"]].map(([color], i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 2, padding: "2px 3px" }}>
            <div style={{ height: 2, width: 12, background: "#6b6478", borderRadius: 1, marginBottom: 1 }} />
            <div style={{ height: 4, width: 16, background: color, borderRadius: 1 }} />
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 3, padding: 3, height: "calc(100% - 24px)" }}>
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="lg1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ff7a18" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ff7a18" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,22 L14,18 L28,20 L42,12 L56,14 L70,8 L84,10 L100,4 L100,30 L0,30 Z" fill="url(#lg1)" />
          <path d="M0,22 L14,18 L28,20 L42,12 L56,14 L70,8 L84,10 L100,4" fill="none" stroke="#ff9f1c" strokeWidth="1" />
          <path d="M0,26 L14,24 L28,23 L42,22 L56,19 L70,17 L84,15 L100,12" fill="none" stroke="#c084fc" strokeWidth="0.8" strokeDasharray="2,1" />
        </svg>
      </div>
    </div>
  );
}

function MiniStore() {
  const products = ["linear-gradient(135deg,#3a2010,#1a1209)", "linear-gradient(135deg,#2a1a3a,#1a1428)", "linear-gradient(135deg,#3a2010,#2a1f12)", "linear-gradient(135deg,#2a1a3a,#1a1428)", "linear-gradient(135deg,#3a2010,#1a1209)", "linear-gradient(135deg,#2a1a3a,#1a1428)"];
  return (
    <>
      <div style={{ position: "absolute", top: 9, left: 0, right: 0, height: 11, background: "rgba(255,122,24,0.04)", borderBottom: "1px solid #1f1828", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff7a18" }} />
          <div style={{ height: 3, width: 24, background: "#f8f4ec", borderRadius: 1 }} />
        </div>
        <div style={{ height: 6, width: 14, background: "linear-gradient(90deg,#ff7a18,#ff9f1c)", borderRadius: 2 }} />
      </div>
      <div style={{ position: "absolute", top: 20, left: 0, right: 0, bottom: 0, padding: 4, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3 }}>
        {products.map((bg, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1f1828", borderRadius: 3, padding: "3px 3px 2px", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ background: bg, borderRadius: 2, height: 18 }} />
            <div style={{ height: 2, width: "80%", background: "#3a2a22", borderRadius: 1 }} />
            <div style={{ height: 3, width: "60%", background: "#ff9f1c", borderRadius: 1 }} />
          </div>
        ))}
      </div>
    </>
  );
}

function MiniCalendar() {
  const colors = ["rgba(255,255,255,0.025)", "rgba(255,122,24,0.55)", "rgba(255,255,255,0.025)", "rgba(124,58,237,0.5)", "rgba(255,255,255,0.025)", "rgba(255,255,255,0.025)", "rgba(34,197,94,0.4)", "rgba(255,255,255,0.025)", "rgba(255,255,255,0.025)", "rgba(124,58,237,0.5)", "rgba(255,255,255,0.025)", "rgba(255,122,24,0.55)", "rgba(34,197,94,0.4)", "rgba(255,255,255,0.025)", "rgba(255,122,24,0.55)", "rgba(255,255,255,0.025)", "rgba(124,58,237,0.5)", "rgba(255,255,255,0.025)", "rgba(34,197,94,0.4)", "rgba(255,255,255,0.025)", "rgba(255,255,255,0.025)", "rgba(255,255,255,0.025)", "rgba(255,122,24,0.55)", "rgba(255,255,255,0.025)", "rgba(124,58,237,0.5)", "rgba(255,255,255,0.025)", "rgba(255,255,255,0.025)", "rgba(34,197,94,0.4)"];
  return (
    <>
      <div style={{ position: "absolute", top: 9, left: 0, right: 0, padding: "3px 5px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div style={{ height: 5, width: 30, background: "#f8f4ec", borderRadius: 1 }} />
          <div style={{ height: 3, width: 18, background: "rgba(124,58,237,0.5)", borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 22, left: 0, right: 0, padding: "0 4px", display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {[false, false, false, true, false, false, false].map((active, i) => (
          <div key={i} style={{ height: 2, background: active ? "#ff9f1c" : "#3a2a22", borderRadius: 1 }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 28, left: 0, right: 0, bottom: 0, padding: "0 4px 4px", display: "grid", gridTemplateColumns: "repeat(7,1fr)", gridTemplateRows: "repeat(4,1fr)", gap: 2 }}>
        {colors.map((bg, i) => <div key={i} style={{ background: bg, borderRadius: 2 }} />)}
      </div>
    </>
  );
}

function BrowserChrome() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 9, background: "#0e0810", borderBottom: "1px solid #1f1828", display: "flex", alignItems: "center", gap: 2, padding: "0 4px" }}>
      <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#ff5f56" }} />
      <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#ffbd2e" }} />
      <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#27c93f" }} />
    </div>
  );
}

function MiniSidebar() {
  return (
    <div style={{ position: "absolute", top: 9, left: 0, bottom: 0, width: 22, background: "#0d0a12", borderRight: "1px solid #1f1828", padding: "4px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(135deg,#ff7a18,#7c3aed)" }} />
      <div style={{ width: 12, height: 2, background: "#ff7a18", borderRadius: 1 }} />
      <div style={{ width: 12, height: 2, background: "#2a1f2a", borderRadius: 1 }} />
      <div style={{ width: 12, height: 2, background: "#2a1f2a", borderRadius: 1 }} />
    </div>
  );
}

function InspirationGrid() {
  const cards = [
    { title: "CRM Clínicas", desc: "Pacientes, consultas, prontuário", preview: <><BrowserChrome /><MiniSidebar /><MiniCRM /></> },
    { title: "Painel financeiro", desc: "Receita, despesa, fluxo", preview: <><BrowserChrome /><MiniChart /></> },
    { title: "Loja com checkout", desc: "Catálogo, carrinho, Pix", preview: <><BrowserChrome /><MiniStore /></> },
    { title: "Agenda multi-pro", desc: "Horários, equipe, lembrete", preview: <><BrowserChrome /><MiniCalendar /></> },
  ];

  return (
    <div style={{ width: "100%", maxWidth: 880, marginTop: 48 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff9f1c" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          <span style={{ color: "#f8f4ec", fontSize: 13, fontWeight: 600 }}>Inspire-se</span>
          <span style={{ color: "#6b6478", fontSize: 12 }}>templates da comunidade</span>
        </div>
        <button style={{ background: "none", border: "none", color: "#9d94b8", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Ver todos →</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {cards.map((c, i) => (
          <div
            key={i}
            className="tmpl-card"
            style={{ background: "rgba(13,10,18,0.6)", border: "1px solid #1f1828", borderRadius: 14, padding: 14, cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,122,24,0.3)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1f1828"; (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            <div style={{ aspectRatio: "16/10", background: "#0a0610", borderRadius: 8, marginBottom: 10, position: "relative", overflow: "hidden", border: "1px solid #1f1828" }}>
              {c.preview}
            </div>
            <div style={{ color: "#f8f4ec", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{c.title}</div>
            <div style={{ color: "#6b6478", fontSize: 11.5 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Variation A: Creation hero ─────────────────────────────────────────────
function VariationA() {
  const [prompt, setPrompt] = useState("um sistema de agendamento para barbearia com pagamento via Pix e notificação no WhatsApp");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 80px 0", overflow: "hidden" }}>
      {/* Eyebrow */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(255,122,24,0.08)", border: "1px solid rgba(255,122,24,0.2)", borderRadius: 999, color: "#ff9f1c", fontSize: 12, fontWeight: 500, marginBottom: 24 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" /></svg>
        gotan.ia v2 · agora com deploy em 1 clique
      </div>

      {/* H1 */}
      <h1 style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.025em", color: "#f8f4ec", textAlign: "center", margin: "0 0 14px", maxWidth: 760 }}>
        O que você quer{" "}
        <span style={{ background: "linear-gradient(90deg,#ff7a18,#ff9f1c,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>construir</span>{" "}
        hoje?
      </h1>
      <p style={{ fontSize: 16, color: "#9d94b8", textAlign: "center", margin: "0 0 36px", maxWidth: 560, lineHeight: 1.5 }}>
        Descreva sua ideia em uma frase. A gotan.ia gera a base — front, back e banco — pronta pra você refinar no chat.
      </p>

      {/* Prompt box */}
      <div
        style={{ width: "100%", maxWidth: 720, background: "rgba(13,10,18,0.8)", backdropFilter: "blur(12px)", border: "1px solid #2a1a12", borderRadius: 18, padding: 6, transition: "all 0.2s ease" }}
        onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,122,24,0.4)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 4px rgba(255,122,24,0.08), 0 20px 60px -20px rgba(255,122,24,0.3)"; }}
        onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2a1a12"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
      >
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ex: um sistema de agendamento para barbearia com pagamento via Pix…"
          style={{ width: "100%", minHeight: 88, padding: "16px 18px 8px", background: "transparent", border: "none", color: "#f8f4ec", fontSize: 15, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.5 }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {["Anexar", "Importar Figma"].map(label => (
              <button key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "transparent", border: "1px solid #2a1a12", borderRadius: 8, color: "#9d94b8", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                {label}
              </button>
            ))}
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "linear-gradient(90deg,#ff7a18,#ff9f1c)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 20px -6px rgba(255,122,24,0.5)" }}>
            Gerar app
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7M19 12H5" /></svg>
          </button>
        </div>
      </div>

      {/* Chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 18, maxWidth: 720 }}>
        <span style={{ color: "#6b6478", fontSize: 12, padding: "6px 0" }}>Tente:</span>
        {SUGGESTION_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => setPrompt(chip)}
            style={{ padding: "6px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid #2a1a12", borderRadius: 999, color: "#c2b8a8", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
          >
            {chip}
          </button>
        ))}
      </div>

      <InspirationGrid />
    </div>
  );
}

// ── Variation B: Workspace ─────────────────────────────────────────────────
function VariationB({ userEmail }: { userEmail: string }) {
  const [composer, setComposer] = useState("");
  const firstName = userEmail.split("@")[0].split(".")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 48px 220px", position: "relative" }}>
      {/* Saudação */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 28 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 999, color: "#c084fc", fontSize: 11.5, fontWeight: 500, marginBottom: 12 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            terça, 24 de junho
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#f8f4ec", margin: "0 0 6px" }}>Olá, {displayName}</h1>
          <p style={{ fontSize: 14.5, color: "#9d94b8", margin: 0 }}>O que vamos construir agora? Continue um projeto ou comece do zero.</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid #2a1a12", borderRadius: 9, color: "#f8f4ec", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
          Preferências
        </button>
      </div>

      {/* Continuar onde parou */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff9f1c" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            <span style={{ color: "#f8f4ec", fontSize: 14, fontWeight: 600 }}>Continuar onde parou</span>
          </div>
          <button style={{ background: "none", border: "none", color: "#9d94b8", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Todos os projetos →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { name: "CRM clínica veterinária", stack: "Next.js + Supabase", files: 14, accent: "#ff7a18" },
            { name: "Painel financeiro SaaS", stack: "Next.js + Charts", files: 22, accent: "#c084fc" },
            { name: "Loja de café artesanal", stack: "Next.js + Stripe", files: 18, accent: "#22c55e" },
          ].map((proj, i) => (
            <div
              key={i}
              style={{ background: "rgba(13,10,18,0.7)", border: "1px solid #1f1828", borderRadius: 14, cursor: "pointer", overflow: "hidden", transition: "all 0.2s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,122,24,0.3)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1f1828"; (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              <div style={{ height: 80, background: "#0a0610", position: "relative", borderBottom: "1px solid #1f1828", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${proj.accent}33,${proj.accent}11)`, border: `1px solid ${proj.accent}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: proj.accent, opacity: 0.8 }} />
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ color: "#f8f4ec", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{proj.name}</div>
                <div style={{ color: "#6b6478", fontSize: 11.5, marginBottom: 8 }}>{proj.stack} · {proj.files} arquivos</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, height: 3, background: "#1f1828", borderRadius: 2 }}>
                    <div style={{ width: `${60 + i * 10}%`, height: "100%", background: `linear-gradient(90deg,${proj.accent},${proj.accent}88)`, borderRadius: 2 }} />
                  </div>
                  <span style={{ color: "#6b6478", fontSize: 10.5 }}>{60 + i * 10}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setores */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          <span style={{ color: "#f8f4ec", fontSize: 14, fontWeight: 600 }}>Comece por uma ideia</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
          {SECTORS.map(s => (
            <button
              key={s.label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 10px", background: "rgba(13,10,18,0.5)", border: "1px solid #1f1828", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.4)"; (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1f1828"; (e.currentTarget as HTMLElement).style.background = "rgba(13,10,18,0.5)"; }}
            >
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ color: "#f8f4ec", fontSize: 12, fontWeight: 500 }}>{s.label}</span>
              <span style={{ color: "#6b6478", fontSize: 10.5 }}>{s.count} templates</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates em destaque */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff9f1c" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          <span style={{ color: "#f8f4ec", fontSize: 14, fontWeight: 600 }}>Templates em destaque</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {TEMPLATES.map((t, i) => (
            <div
              key={i}
              style={{ background: "rgba(13,10,18,0.6)", border: "1px solid #1f1828", borderRadius: 14, padding: 16, cursor: "pointer", transition: "all 0.2s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,122,24,0.3)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1f1828"; (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              <div style={{ color: "#f8f4ec", fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>{t.title}</div>
              <div style={{ color: "#9d94b8", fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{t.desc}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {t.tags.map(tag => (
                    <span key={tag} style={{ padding: "2px 8px", background: "rgba(255,255,255,0.04)", border: "1px solid #2a1a12", borderRadius: 999, color: "#9d94b8", fontSize: 10.5 }}>{tag}</span>
                  ))}
                </div>
                <span style={{ color: "#6b6478", fontSize: 10.5 }}>👥 {t.users}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Composer ancorado */}
      <div style={{ position: "fixed", bottom: 0, left: 264, right: 0, padding: "16px 48px 24px", background: "linear-gradient(to top, #050505 60%, transparent)", zIndex: 20 }}>
        <div
          style={{ maxWidth: 800, margin: "0 auto", background: "rgba(13,10,18,0.95)", backdropFilter: "blur(16px)", border: "1px solid #2a1a12", borderRadius: 16, padding: "10px 12px", transition: "all 0.2s ease" }}
          onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,122,24,0.4)"; }}
          onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2a1a12"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", background: "rgba(255,122,24,0.1)", border: "1px solid rgba(255,122,24,0.25)", borderRadius: 999, color: "#ff9f1c", fontSize: 11, fontWeight: 500 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff9f1c", boxShadow: "0 0 6px #ff9f1c", display: "inline-block" }} />
              gotan-3 · pro
            </span>
          </div>
          <textarea
            value={composer}
            onChange={e => setComposer(e.target.value)}
            placeholder="Descreva o que quer construir…"
            rows={2}
            style={{ width: "100%", background: "transparent", border: "none", color: "#f8f4ec", fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.5 }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["Anexar", "Imagem", "Inspirar-me"].map(btn => (
                <button key={btn} style={{ padding: "5px 10px", background: "transparent", border: "1px solid #2a1a12", borderRadius: 7, color: "#9d94b8", fontSize: 11.5, cursor: "pointer", fontFamily: "inherit" }}>{btn}</button>
              ))}
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "linear-gradient(90deg,#ff7a18,#ff9f1c)", border: "none", borderRadius: 9, color: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 18px -6px rgba(255,122,24,0.5)" }}>
              Gerar app
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7M19 12H5" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Topbar ─────────────────────────────────────────────────────────────────
function Topbar({ view, onToggle }: { view: "A" | "B"; onToggle: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid #1f1828" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9d94b8", fontSize: 12.5 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 999, color: "#c084fc", fontWeight: 500 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c084fc", boxShadow: "0 0 8px #c084fc", display: "inline-block" }} />
          Beta
        </span>
        <span>Workspace pessoal</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={onToggle}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "rgba(255,122,24,0.08)", border: "1px solid rgba(255,122,24,0.25)", borderRadius: 8, color: "#ff9f1c", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
        >
          {view === "A" ? "Ver Workspace (B)" : "Ver Criação (A)"}
        </button>
        {["Importar", "Docs"].map(label => (
          <button key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "transparent", border: "1px solid #2a1a12", borderRadius: 8, color: "#f8f4ec", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export function Workspace({ userEmail }: { userEmail: string }) {
  const [view, setView] = useState<"A" | "B">("A");
  const hasProjects = view === "B";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#050505", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}>
      {/* Ambient glows */}
      <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 900, height: 600, borderRadius: "50%", filter: "blur(80px)", background: "radial-gradient(circle, rgba(255,122,24,0.14), transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -150, left: "35%", width: 600, height: 400, borderRadius: "50%", filter: "blur(80px)", background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 60%)", pointerEvents: "none" }} />

      <Sidebar userEmail={userEmail} hasProjects={hasProjects} />

      <main style={{ position: "absolute", top: 0, left: 264, right: 0, bottom: 0, display: "flex", flexDirection: "column", zIndex: 5 }}>
        <Topbar view={view} onToggle={() => setView(v => v === "A" ? "B" : "A")} />
        {view === "A" ? <VariationA /> : <VariationB userEmail={userEmail} />}
      </main>
    </div>
  );
}
