-- Data de nascimento + inscrições públicas (pendentes).
-- Execute no SQL Editor do Supabase (projetos já existentes).

alter table public.titulares
  add column if not exists data_nascimento date;

alter table public.dependentes
  add column if not exists data_nascimento date,
  add column if not exists cpf text;

create table if not exists public.inscricoes (
  id uuid primary key default gen_random_uuid(),
  titular_nome text not null,
  titular_cpf text,
  titular_email text,
  titular_whatsapp text,
  titular_data_nascimento date not null,
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'rejeitado')),
  motivo_rejeicao text,
  revisado_por uuid references public.profiles (id) on delete set null,
  revisado_em timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists inscricoes_status_created_idx
  on public.inscricoes (status, created_at desc);

create table if not exists public.inscricao_dependentes (
  id uuid primary key default gen_random_uuid(),
  inscricao_id uuid not null references public.inscricoes (id) on delete cascade,
  nome text not null,
  cpf text,
  email text,
  whatsapp text,
  data_nascimento date not null,
  created_at timestamptz not null default now()
);

create index if not exists inscricao_dependentes_inscricao_idx
  on public.inscricao_dependentes (inscricao_id);

alter table public.inscricoes enable row level security;
alter table public.inscricao_dependentes enable row level security;

drop policy if exists "inscricoes_authenticated_all" on public.inscricoes;
create policy "inscricoes_authenticated_all" on public.inscricoes
  for all to authenticated using (true) with check (true);

drop policy if exists "inscricao_dependentes_authenticated_all" on public.inscricao_dependentes;
create policy "inscricao_dependentes_authenticated_all" on public.inscricao_dependentes
  for all to authenticated using (true) with check (true);
