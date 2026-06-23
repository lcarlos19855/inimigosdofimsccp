-- Execute no SQL Editor do Supabase se o projeto já existia antes das colunas de auditoria.
-- (Projetos novos podem usar só o schema.sql atualizado.)

alter table public.pagamentos
  add column if not exists observacao text,
  add column if not exists lancado_por uuid references public.profiles (id) on delete set null,
  add column if not exists excluido_em timestamptz,
  add column if not exists excluido_por uuid references public.profiles (id) on delete set null;

create or replace function public.pagamentos_set_lancado_por()
returns trigger
language plpgsql
as $$
begin
  new.lancado_por := auth.uid();
  return new;
end;
$$;

drop trigger if exists pagamentos_set_lancado_por on public.pagamentos;
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

drop policy if exists "pagamentos_authenticated_all" on public.pagamentos;

create policy "pagamentos_select_authenticated" on public.pagamentos
  for select to authenticated using (true);

create policy "pagamentos_insert_authenticated" on public.pagamentos
  for insert to authenticated with check (true);
