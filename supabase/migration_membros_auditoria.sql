-- Auditoria e exclusão lógica de titulares e dependentes.
-- Execute no SQL Editor do Supabase (projetos já existentes).

alter table public.titulares
  add column if not exists excluido_em timestamptz,
  add column if not exists excluido_por uuid references public.profiles (id) on delete set null;

alter table public.dependentes
  add column if not exists excluido_em timestamptz,
  add column if not exists excluido_por uuid references public.profiles (id) on delete set null;

create table if not exists public.membros_auditoria (
  id uuid primary key default gen_random_uuid(),
  entidade text not null check (entidade in ('titular', 'dependente')),
  entidade_id uuid not null,
  acao text not null check (
    acao in ('criacao', 'edicao', 'ativacao', 'desativacao', 'exclusao')
  ),
  dados_antes jsonb,
  dados_depois jsonb,
  executado_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists membros_auditoria_entidade_idx
  on public.membros_auditoria (entidade, entidade_id, created_at desc);

alter table public.membros_auditoria enable row level security;

drop policy if exists "membros_auditoria_authenticated_all" on public.membros_auditoria;
create policy "membros_auditoria_authenticated_all" on public.membros_auditoria
  for all to authenticated using (true) with check (true);
