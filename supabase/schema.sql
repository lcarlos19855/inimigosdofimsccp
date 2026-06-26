-- Nosso Grupo — execute no SQL Editor do Supabase (projeto novo).
--
-- Configuração rápida:
-- 1. Crie projeto em supabase.com → copie URL e anon key para .env.local (veja .env.local.example).
-- 2. Authentication → Providers → Email: habilitado.
-- 3. Authentication → URL Configuration → Site URL: http://localhost:3000
-- 4. Rode este script no SQL Editor (projeto novo). Se o banco já existia antes, use
--    supabase/migration_pagamentos_auditoria.sql para colunas de auditoria e exclusão lógica.
-- 5. Authentication → Users → Add user (primeiro admin). Demais usuários pelo painel em Usuários.
-- 6. (Opcional) Para tornar alguém administrador: update profiles set perfil = 'administrador' where id = 'uuid';

-- Perfis de administradores (espelha auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  perfil text not null default 'operador'
    check (perfil in ('administrador', 'operador')),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, perfil)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    'operador'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Titulares
create table public.titulares (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text,
  email text,
  whatsapp text,
  status text not null default 'ativo'
    check (status in ('ativo', 'inativo')),
  excluido_em timestamptz,
  excluido_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger titulares_updated_at
  before update on public.titulares
  for each row execute function public.set_updated_at();

-- Dependentes
create table public.dependentes (
  id uuid primary key default gen_random_uuid(),
  titular_id uuid not null references public.titulares (id) on delete cascade,
  nome text not null,
  email text,
  whatsapp text,
  status text not null default 'ativo'
    check (status in ('ativo', 'inativo')),
  excluido_em timestamptz,
  excluido_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger dependentes_updated_at
  before update on public.dependentes
  for each row execute function public.set_updated_at();

-- Categorias de pagamento
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categorias_updated_at
  before update on public.categorias
  for each row execute function public.set_updated_at();

-- Pagamentos quadrimestrais (marcação manual)
create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  titular_id uuid not null references public.titulares (id) on delete cascade,
  categoria_id uuid references public.categorias (id) on delete restrict,
  vencimento date not null,
  valor numeric(12, 2) not null,
  status text not null default 'pendente'
    check (status in ('pago', 'pendente', 'atrasado')),
  data_pagamento date,
  observacao text,
  lancado_por uuid references public.profiles (id) on delete set null,
  excluido_em timestamptz,
  excluido_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pagamentos_updated_at
  before update on public.pagamentos
  for each row execute function public.set_updated_at();

create or replace function public.pagamentos_set_lancado_por()
returns trigger
language plpgsql
as $$
begin
  new.lancado_por := auth.uid();
  return new;
end;
$$;

create trigger pagamentos_set_lancado_por
  before insert on public.pagamentos
  for each row execute function public.pagamentos_set_lancado_por();

create or replace function public.soft_delete_pagamento(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid()
      and ativo = true
  ) then
    raise exception 'Somente usuários ativos do painel podem excluir pagamentos';
  end if;

  update public.pagamentos
  set excluido_em = now(), excluido_por = auth.uid()
  where id = p_id and excluido_em is null;

  if not found then
    raise exception 'Pagamento não encontrado ou já excluído';
  end if;
end;
$$;

grant execute on function public.soft_delete_pagamento(uuid) to authenticated;

-- Auditoria de titulares e dependentes
create table public.membros_auditoria (
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

create index membros_auditoria_entidade_idx
  on public.membros_auditoria (entidade, entidade_id, created_at desc);

-- Materiais
create table public.materiais (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  quantidade integer not null default 0 check (quantidade >= 0),
  excluido_em timestamptz,
  excluido_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger materiais_updated_at
  before update on public.materiais
  for each row execute function public.set_updated_at();

create table public.materiais_auditoria (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null,
  acao text not null check (acao in ('criacao', 'edicao', 'exclusao')),
  dados_antes jsonb,
  dados_depois jsonb,
  executado_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index materiais_auditoria_material_idx
  on public.materiais_auditoria (material_id, created_at desc);

create table public.pagamentos_auditoria (
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

create index pagamentos_auditoria_pagamento_idx
  on public.pagamentos_auditoria (pagamento_id, created_at desc);

-- RLS
alter table public.profiles enable row level security;
alter table public.titulares enable row level security;
alter table public.dependentes enable row level security;
alter table public.categorias enable row level security;
alter table public.pagamentos enable row level security;
alter table public.membros_auditoria enable row level security;
alter table public.materiais enable row level security;
alter table public.materiais_auditoria enable row level security;
alter table public.pagamentos_auditoria enable row level security;

-- Painel interno: qualquer usuário autenticado acessa tudo (MVP)
create policy "profiles_authenticated_all" on public.profiles
  for all to authenticated using (true) with check (true);

create policy "titulares_authenticated_all" on public.titulares
  for all to authenticated using (true) with check (true);

create policy "dependentes_authenticated_all" on public.dependentes
  for all to authenticated using (true) with check (true);

create policy "membros_auditoria_authenticated_all" on public.membros_auditoria
  for all to authenticated using (true) with check (true);

create policy "materiais_authenticated_all" on public.materiais
  for all to authenticated using (true) with check (true);

create policy "materiais_auditoria_authenticated_all" on public.materiais_auditoria
  for all to authenticated using (true) with check (true);

create policy "pagamentos_auditoria_authenticated_all" on public.pagamentos_auditoria
  for all to authenticated using (true) with check (true);

create policy "categorias_authenticated_all" on public.categorias
  for all to authenticated using (true) with check (true);

create policy "pagamentos_select_authenticated" on public.pagamentos
  for select to authenticated using (true);

create policy "pagamentos_insert_authenticated" on public.pagamentos
  for insert to authenticated with check (true);

create policy "pagamentos_update_authenticated" on public.pagamentos
  for update to authenticated
  using (excluido_em is null)
  with check (excluido_em is null);

-- Caixa (saldo e movimentações manuais)
create table public.caixa_movimentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null
    check (tipo in ('entrada', 'saida')),
  valor numeric(12, 2) not null
    check (valor > 0),
  descricao text,
  saldo_apos numeric(12, 2) not null,
  perfil_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create or replace function public.caixa_movimento_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  saldo_caixa_manual numeric(12, 2);
  total_pagamentos_pago numeric(12, 2);
  disponivel_antes numeric(12, 2);
begin
  select coalesce(
    sum(case when tipo = 'entrada' then valor else -valor end),
    0
  )
  into saldo_caixa_manual
  from public.caixa_movimentos;

  select coalesce(sum(valor), 0)
  into total_pagamentos_pago
  from public.pagamentos
  where status = 'pago'
    and excluido_em is null;

  disponivel_antes := saldo_caixa_manual + total_pagamentos_pago;

  new.perfil_id := auth.uid();

  if new.tipo = 'entrada' then
    new.saldo_apos := disponivel_antes + new.valor;
  else
    if disponivel_antes < new.valor then
      raise exception 'Saldo insuficiente para esta saída. Disponível: % (caixa manual + pagamentos pagos).', disponivel_antes;
    end if;
    new.saldo_apos := disponivel_antes - new.valor;
  end if;

  return new;
end;
$$;

create trigger caixa_movimento_before_insert
  before insert on public.caixa_movimentos
  for each row execute function public.caixa_movimento_before_insert();

alter table public.caixa_movimentos enable row level security;

create policy "caixa_movimentos_select_authenticated" on public.caixa_movimentos
  for select to authenticated using (true);

create policy "caixa_movimentos_insert_authenticated" on public.caixa_movimentos
  for insert to authenticated with check (true);
