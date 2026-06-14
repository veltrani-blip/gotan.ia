# Deploy — gotan.ia

App: front em **Cloudflare Pages** sob `veltsapp.ia.br/gotan` · backend FastAPI no **Render**.

## 1. Backend (Render)
1. Suba o repo no GitHub. No Render: New > Blueprint, aponte para `backend/render.yaml`.
2. Preencha as env vars marcadas `sync: false` (chaves Stripe, Anthropic, Supabase service_role).
3. Anote a URL pública, ex.: `https://gotan-api.onrender.com`.
4. Stripe Dashboard > Webhooks: endpoint `https://gotan-api.onrender.com/billing/webhook`,
   eventos `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   Copie o signing secret para `STRIPE_WEBHOOK_SECRET`.
5. Cold start: o free tier dorme após inatividade (~30s no 1º request). Aceitável para começar.

## 2. Banco (Supabase)
Rode `supabase/migrations/0001_subscriptions.sql` no SQL Editor do seu projeto.

## 3. Front (Cloudflare Pages)
- Build command: `npx @cloudflare/next-on-pages@1`
- Output dir: `.vercel/output/static`
- Env vars (Production):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_URL=https://gotan-api.onrender.com`
- O app fica em `veltsapp.ia.br/gotan` por causa do `basePath` no `next.config.mjs`.
- Em Supabase > Authentication > URL Configuration, adicione a redirect:
  `https://veltsapp.ia.br/gotan/auth/callback` e o provider Google.

## Variáveis — resumo
Front:  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_URL
Backend: ANTHROPIC_API_KEY, ALLOWED_ORIGINS, FRONTEND_URL, STRIPE_SECRET_KEY,
         STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_*, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
