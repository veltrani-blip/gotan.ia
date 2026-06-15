-- Tabela de projetos gerados por usuário.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects(user_id);

create trigger projects_touch
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- Arquivos pertencentes a cada projeto.
create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  path text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (project_id, path)
);

create index project_files_project_id_idx on public.project_files(project_id);

-- RLS: usuário acessa apenas seus próprios projetos.
alter table public.projects enable row level security;
alter table public.project_files enable row level security;

create policy "owner can read projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "owner can insert projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "owner can update projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "owner can delete projects"
  on public.projects for delete
  using (auth.uid() = user_id);

create policy "owner can read project_files"
  on public.project_files for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "owner can insert project_files"
  on public.project_files for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "owner can update project_files"
  on public.project_files for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "owner can delete project_files"
  on public.project_files for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );
