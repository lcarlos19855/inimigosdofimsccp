-- Atualiza o trigger do caixa: saldo disponível = lançamentos manuais + soma dos pagamentos com status "pago" (não excluídos).
-- Execute no SQL Editor após migration_caixa_movimentos.sql.

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
