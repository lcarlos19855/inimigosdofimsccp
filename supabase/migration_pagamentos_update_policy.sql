-- Permite atualizar pagamentos (ex.: marcar como pago com data).
-- Execute no SQL Editor se o projeto já existia sem política de UPDATE.

drop policy if exists "pagamentos_update_authenticated" on public.pagamentos;

create policy "pagamentos_update_authenticated" on public.pagamentos
  for update to authenticated
  using (excluido_em is null)
  with check (excluido_em is null);
