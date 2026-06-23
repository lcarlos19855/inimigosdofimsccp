import Link from "next/link";

export function TitularesFiltersForm({
  pessoa,
}: {
  pessoa?: string;
}) {
  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Filtrar por pessoa (nome)</span>
        <input
          type="search"
          name="pessoa"
          defaultValue={pessoa ?? ""}
          placeholder="Nome do titular…"
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
        >
          Filtrar
        </button>
        <Link
          href="/titulares"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Limpar
        </Link>
      </div>
    </form>
  );
}

export function DependentesFiltersForm({
  pessoa,
}: {
  pessoa?: string;
}) {
  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">
          Filtrar por pessoa (dependente ou titular)
        </span>
        <input
          type="search"
          name="pessoa"
          defaultValue={pessoa ?? ""}
          placeholder="Parte do nome…"
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
        >
          Filtrar
        </button>
        <Link
          href="/dependentes"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Limpar
        </Link>
      </div>
    </form>
  );
}

type TitularOpt = { id: string; nome: string };
type CategoriaOpt = { id: string; nome: string };

export function PagamentosFiltersForm({
  titulares,
  categorias,
  pessoa,
  titularId,
  categoriaId,
  status,
  mes,
}: {
  titulares: TitularOpt[];
  categorias: CategoriaOpt[];
  pessoa?: string;
  titularId?: string;
  categoriaId?: string;
  status?: string;
  mes?: string;
}) {
  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:flex-wrap lg:items-end"
    >
      <label className="flex min-w-[160px] flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Categoria</span>
        <select
          name="categoria_id"
          defaultValue={categoriaId ?? ""}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Titular (lista)</span>
        <select
          name="titular_id"
          defaultValue={titularId ?? ""}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
        >
          <option value="">Todos</option>
          {titulares.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Ou nome do titular</span>
        <input
          type="search"
          name="pessoa"
          defaultValue={pessoa ?? ""}
          placeholder="Busca no nome…"
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
        />
      </label>
      <label className="flex min-w-[140px] flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Status</span>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
        >
          <option value="">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="atrasado">Atrasado</option>
        </select>
      </label>
      <label className="flex min-w-[160px] flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Mês (vencimento)</span>
        <input
          type="month"
          name="mes"
          defaultValue={mes ?? ""}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
        >
          Filtrar
        </button>
        <Link
          href="/pagamentos"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Limpar
        </Link>
      </div>
    </form>
  );
}
