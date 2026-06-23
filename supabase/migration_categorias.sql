-- Categorias de pagamento + vínculo em pagamentos.
-- Rode no SQL Editor do Supabase se o projeto já existia antes desta feature.

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categorias_updated_at
  before update on public.categorias
  for each row execute function public.set_updated_at();

alter table public.pagamentos
  add column if not exists categoria_id uuid
    references public.categorias (id) on delete restrict;

create index if not exists pagamentos_categoria_id_idx
  on public.pagamentos (categoria_id);

alter table public.categorias enable row level security;

create policy "categorias_authenticated_all" on public.categorias
  for all to authenticated using (true) with check (true);
