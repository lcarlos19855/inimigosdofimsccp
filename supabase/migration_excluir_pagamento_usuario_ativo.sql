-- Se você já rodou migration_pagamentos_auditoria.sql com a regra "só administrador",
-- execute este script para permitir que qualquer usuário com perfil ativo exclua (soft delete)
-- e veja o botão Excluir funcionar como operador.

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
