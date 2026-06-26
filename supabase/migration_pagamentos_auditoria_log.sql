-- Auditoria de recebimentos (pagamentos).
-- Execute no SQL Editor do Supabase (projetos já existentes).

create table if not exists public.pagamentos_auditoria (
  id uuid primary key default gen_random_uuid(),
  pagamento_id uuid not null,
  acao text not null check (
    acao in ('criacao', 'edicao', 'registro_pagamento', 'exclusao')
  ),
  dados_antes jsonb,
  dados_depois jsonb,
  executado_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists pagamentos_auditoria_pagamento_idx
  on public.pagamentos_auditoria (pagamento_id, created_at desc);

alter table public.pagamentos_auditoria enable row level security;

drop policy if exists "pagamentos_auditoria_authenticated_all" on public.pagamentos_auditoria;
create policy "pagamentos_auditoria_authenticated_all" on public.pagamentos_auditoria
  for all to authenticated using (true) with check (true);
