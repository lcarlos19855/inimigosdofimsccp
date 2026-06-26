import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { personSearchQuery } from "@/lib/person-search";
import { searchParamOne } from "@/lib/search-params";
import type { Material } from "@/types/database";
import { ExportMateriaisPdfButton } from "./export-materiais-pdf-button";
import { MaterialRowActions } from "./material-row-actions";
import { MateriaisFiltersForm } from "./materiais-filters-form";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MateriaisPage({ searchParams }: Props) {
  const sp = await searchParams;
  const nomeInput = searchParamOne(sp.nome);
  const nome = personSearchQuery(nomeInput);

  const supabase = await createClient();
  let query = supabase
    .from("materiais")
    .select("*")
    .is("excluido_em", null)
    .order("nome");

  if (nome) {
    query = query.ilike("nome", `%${nome}%`);
  }

  const { data, error } = await query;
  const materiais = (data ?? []) as Material[];
  const hasFilters = Boolean(nome);
  const emptyBecauseFilter = materiais.length === 0 && hasFilters;

  const filterSummary = nome ? `Nome: ${nomeInput}` : "Todos os materiais";
  const pdfRows = materiais.map((m) => ({
    nome: m.nome,
    descricao: m.descricao ?? "—",
    quantidade: String(m.quantidade),
  }));
  const totalQuantidade = materiais.reduce((sum, m) => sum + m.quantidade, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Controle de Materiais
          </h1>
          <p className="text-sm text-slate-600">
            Cadastro de materiais do grupo com histórico de alterações
          </p>
        </div>
        <Link
          href="/materiais/novo"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Novo material
        </Link>
      </div>

      <MateriaisFiltersForm nome={nomeInput ?? ""} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {materiais.length} material{materiais.length === 1 ? "" : "is"} ·{" "}
          {totalQuantidade} unidade{totalQuantidade === 1 ? "" : "s"}
        </p>
        <ExportMateriaisPdfButton rows={pdfRows} filterSummary={filterSummary} />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
          {error.message.includes("materiais") ? (
            <>
              {" "}
              Rode no Supabase o script{" "}
              <code className="rounded bg-red-100 px-1">
                supabase/migration_materiais.sql
              </code>
              .
            </>
          ) : null}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3 text-center">Quantidade</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materiais.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {emptyBecauseFilter ? (
                      <>
                        Nenhum material encontrado com esse filtro.{" "}
                        <Link
                          href="/materiais"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Limpar filtro
                        </Link>
                      </>
                    ) : (
                      <>
                        Nenhum material cadastrado.{" "}
                        <Link
                          href="/materiais/novo"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Adicionar o primeiro
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                materiais.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {m.nome}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {m.descricao ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-800">
                      {m.quantidade}
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <MaterialRowActions material={m} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
