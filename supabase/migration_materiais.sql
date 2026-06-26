-- Controle de materiais e auditoria.
-- Execute no SQL Editor do Supabase (projetos já existentes).

create table if not exists public.materiais (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  quantidade integer not null default 0 check (quantidade >= 0),
  excluido_em timestamptz,
  excluido_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists materiais_updated_at on public.materiais;
create trigger materiais_updated_at
  before update on public.materiais
  for each row execute function public.set_updated_at();

create table if not exists public.materiais_auditoria (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null,
  acao text not null check (acao in ('criacao', 'edicao', 'exclusao')),
  dados_antes jsonb,
  dados_depois jsonb,
  executado_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists materiais_auditoria_material_idx
  on public.materiais_auditoria (material_id, created_at desc);

alter table public.materiais enable row level security;
alter table public.materiais_auditoria enable row level security;

drop policy if exists "materiais_authenticated_all" on public.materiais;
create policy "materiais_authenticated_all" on public.materiais
  for all to authenticated using (true) with check (true);

drop policy if exists "materiais_auditoria_authenticated_all" on public.materiais_auditoria;
create policy "materiais_auditoria_authenticated_all" on public.materiais_auditoria
  for all to authenticated using (true) with check (true);
