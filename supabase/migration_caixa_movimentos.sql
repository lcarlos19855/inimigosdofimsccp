-- Caixa: saldo em conta e saídas manuais (ledger).
-- Execute no SQL Editor do Supabase em projetos que já existiam antes desta feature.

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

-- Inclui na disponibilidade a soma de pagamentos com status "pago" (não excluídos).
-- (Mesma lógica que migration_caixa_inclui_pagamentos.sql para quem rodar só este arquivo.)
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
