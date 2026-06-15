-- Ledger de créditos: registra cada movimentação com motivo e idempotência.
create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,                          -- positivo = crédito, negativo = débito
  reason text not null,                            -- generation | patch | refund | subscription_credit | credit_pack | admin_adjustment
  project_id uuid references public.projects(id) on delete set null,
  idempotency_key text unique,                     -- evita débito/crédito duplicado
  created_at timestamptz not null default now()
);

create index credit_ledger_user_id_idx on public.credit_ledger(user_id);

alter table public.credit_ledger enable row level security;

create policy "owner can read credit_ledger"
  on public.credit_ledger for select
  using (auth.uid() = user_id);

-- Tabela de idempotência de eventos Stripe (evita processamento duplicado).
create table public.stripe_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

-- Stripe events são lidos/escritos apenas pela service_role (webhook server-side).
alter table public.stripe_events enable row level security;

-- RPC: soma créditos atomicamente sem negativar (usada para compra de pacotes).
create or replace function public.add_credits(p_user_id uuid, p_delta integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.subscriptions
  set credits = greatest(0, credits + p_delta),
      updated_at = now()
  where user_id = p_user_id;
end $$;

-- RPC: reserva créditos antes de uma operação paga. Retorna false se saldo insuficiente.
create or replace function public.reserve_credits(p_user_id uuid, p_amount integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  current_credits integer;
begin
  select credits into current_credits
  from public.subscriptions
  where user_id = p_user_id
  for update;

  if current_credits is null or current_credits < p_amount then
    return false;
  end if;

  update public.subscriptions
  set credits = credits - p_amount,
      updated_at = now()
  where user_id = p_user_id;

  return true;
end $$;
