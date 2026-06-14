# CLAUDE.md — gotan.ia

> Recriação **estrutural** (layout/UX/animações/espaçamentos) de uma landing page de plataforma de "vibecoding".
> Marca, textos, logo e cores são **originais** — nada protegido é reproduzido.

---

## 1. Resumo visual

Landing page SaaS dark-mode, single-page, estilo premium (Linear / Vercel / V0). Hero centralizado com headline grande + caixa de prompt interativa simulando geração de app, chips de categorias rolando, seções de benefícios em grid de 3 cards, pricing de 3 colunas (com destaque "Mais Popular"), seção explicativa em 3 passos, grid de soluções por setor, CTA final e footer multi-coluna. Forte uso de gradientes, glow sutil e glassmorphism.

## 2. Componentes identificados

- `Navbar` (logo + links âncora + CTA login)
- `Hero` (eyebrow badge, headline com palavra rotativa, subtítulo, **PromptBox** com chips + botão "Gerar App", chips de categorias em marquee)
- `BenefitsGrid` (3 cards: Rápido / Produção / Full-Stack — ícone + título + texto)
- `PricingSection` (3 `PricingCard`: Free / Pro[popular] / Business — preço, lista de features, CTA)
- `HowItWorks` (3 passos numerados: Descreva / IA gera / Publique)
- `SectorGrid` (cards "Explorar" por setor)
- `FinalCTA` (headline + botão)
- `Footer` (4 colunas: Produto / Recursos / Por Setor / Empresa + copyright + legal)
- Primitivos: `Button`, `Badge`, `Card`, `Chip`, `SectionHeading`

## 3. Seções da página (ordem)

1. Navbar (sticky)
2. Hero + PromptBox + marquee de chips
3. Benefícios (3 cards)
4. Pricing (3 planos)
5. How it works (3 passos)
6. Soluções por setor (grid)
7. CTA final
8. Footer

## 4. Paleta original percebida

| Token | Cor aprox. |
|---|---|
| Fundo | `#0A0A0F` quase-preto |
| Superfície | `#15151E` |
| Acento | violeta/roxo `#7C3AED` → `#A855F7` |
| Texto | `#FAFAFA` / muted `#A1A1AA` |
| Glow | gradiente roxo radial |

## 5. Nova paleta — gotan.ia (roxo/violeta original-redesign)

| Token | Hex |
|---|---|
| `--bg` | `#0B0712` |
| `--surface` | `#161023` |
| `--surface-2` | `#1F1733` |
| `--border` | `#2A2140` |
| `--primary` | `#8B5CF6` |
| `--primary-bright` | `#A78BFA` |
| `--primary-deep` | `#6D28D9` |
| `--accent` | `#C084FC` |
| `--orange` (acento Gotham, FASE 2+) | `#FF7A18` |
| `--orange-bright` | `#FF9D4D` |
| `--fg` | `#F5F3FF` |
| `--muted` | `#9D94B8` |
| Gradiente hero | `radial(#6D28D9 → transparent)` + `linear(#8B5CF6 → #C084FC)` |

## 6. Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (tokens via CSS vars + `@theme`)
- **Framer Motion** (animações de entrada, marquee, hover)
- **lucide-react** (ícones)
- Fontes: **Geist Sans** (UI) + **Geist Mono** (prompt/code chips)

## 7. Plano por fases

- **FASE 0** — Estrutura base, tema, fontes, tokens, layout global, primitivos (`Button`/`Badge`/`Card`).
- **FASE 1** — Navbar + Hero + PromptBox + marquee de chips.
- **FASE 2** — Benefícios (3 cards) + How it works (3 passos).
- **FASE 3** — Pricing + SectorGrid + FinalCTA + Footer.
- **FASE 4** — Animações Framer Motion, responsividade mobile, refinamento de glow/spacing.

## 8. Checklist de fidelidade visual

- [x] Hero centralizado com palavra rotativa
- [x] PromptBox com chips + botão acento
- [x] Marquee de categorias em loop infinito
- [x] 3 cards de benefícios alinhados ao baseline
- [x] Card "Pro" com badge "Mais Popular" elevado
- [x] Pricing com listas de features e check icons
- [x] How it works numerado 01/02/03
- [x] Grid de setores responsivo (4→2→1)
- [x] Footer 4 colunas → empilha no mobile
- [x] Glow roxo radial atrás do hero
- [x] Dark mode consistente, contraste AA
- [x] Breakpoints: desktop / tablet / mobile

## 9. Regras

Sem código antes do OK. Plano curto antes de cada fase, resumo após. TDD onde aplicável (lógica de componentes: rotação de palavra, marquee). Sem componentes inventados fora do escopo acima.
