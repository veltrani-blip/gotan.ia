-- Tabela de assinaturas/créditos do gotan.ia.
-- Rode no SQL Editor do seu projeto Supabase.

create type plan_tier as enum ('free', 'starter', 'pro', 'business');

create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan plan_tier not null default 'free',
  status text not null default 'inactive',           -- active | inactive | past_due | canceled
  credits integer not null default 5,                 -- Free começa com 5 créditos
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Atualiza updated_at automaticamente.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger subscriptions_touch
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- Cria linha 'free' automaticamente quando um usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.subscriptions (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: o usuário lê apenas a própria linha. Escrita só pela service_role (webhook).
alter table public.subscriptions enable row level security;

create policy "read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
