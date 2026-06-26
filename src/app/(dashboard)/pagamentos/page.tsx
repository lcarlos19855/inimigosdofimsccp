import Link from "next/link";
import { searchParamOne } from "@/lib/search-params";
import { CategoriasTab } from "./categorias-tab";
import { LancamentosTab } from "./lancamentos-tab";
import { PagamentosTabs } from "./pagamentos-tabs";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PagamentosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const aba =
    searchParamOne(sp.aba) === "categorias" ? "categorias" : "lancamentos";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Recebimentos</h1>
          <p className="text-sm text-slate-600">
            {aba === "categorias"
              ? "Cadastre categorias para classificar os recebimentos."
              : "Lançamentos por titular. Filtros por categoria, titular, status e mês de vencimento."}
          </p>
        </div>
        {aba === "lancamentos" ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/pagamentos/excluidos"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Recebimentos excluídos
            </Link>
            <Link
              href="/pagamentos/novo"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Registrar recebimento
            </Link>
          </div>
        ) : null}
      </div>

      <PagamentosTabs active={aba} />

      {aba === "categorias" ? (
        <CategoriasTab />
      ) : (
        <LancamentosTab searchParams={sp} />
      )}
    </div>
  );
}
