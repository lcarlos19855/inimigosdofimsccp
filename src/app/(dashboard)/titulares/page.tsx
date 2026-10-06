import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TitularesFiltersForm } from "@/components/dashboard-list-filters";
import { personSearchQuery } from "@/lib/person-search";
import { searchParamOne } from "@/lib/search-params";
import type { Dependente, Titular } from "@/types/database";
import type { DependenteResumo } from "./titular-dependentes-dialog";
import { TitularesTable } from "./titulares-table";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TitularesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pessoaInput = searchParamOne(sp.pessoa);
  const pessoa = personSearchQuery(pessoaInput);

  const supabase = await createClient();
  let query = supabase
    .from("titulares")
    .select("*")
    .is("excluido_em", null)
    .order("nome");

  if (pessoa) {
    query = query.ilike("nome", `%${pessoa}%`);
  }

  const { data, error } = await query;

  const titulares = (data ?? []) as Titular[];
  const hasFilters = Boolean(pessoa);
  const emptyBecauseFilter = titulares.length === 0 && hasFilters;

  const dependentesByTitular: Record<string, DependenteResumo[]> = {};

  if (titulares.length > 0) {
    const ids = titulares.map((t) => t.id);
    const { data: deps } = await supabase
      .from("dependentes")
      .select("id, titular_id, nome, email, whatsapp, data_nascimento, status")
      .in("titular_id", ids)
      .is("excluido_em", null)
      .order("nome");

    for (const d of (deps ?? []) as Dependente[]) {
      const resumo: DependenteResumo = {
        id: d.id,
        nome: d.nome,
        email: d.email,
        whatsapp: d.whatsapp,
        data_nascimento: d.data_nascimento,
        status: d.status,
      };
      if (!dependentesByTitular[d.titular_id]) {
        dependentesByTitular[d.titular_id] = [];
      }
      dependentesByTitular[d.titular_id].push(resumo);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Titulares</h1>
          <p className="text-sm text-slate-600">
            Cadastro de titulares do grupo — clique em um registro para ver os
            dependentes
          </p>
        </div>
        <Link
          href="/titulares/novo"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Novo titular
        </Link>
      </div>

      <TitularesFiltersForm pessoa={pessoaInput ?? ""} />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Nascimento</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            {titulares.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {emptyBecauseFilter ? (
                      <>
                        Nenhum titular encontrado com esse filtro.{" "}
                        <Link
                          href="/titulares"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Limpar filtro
                        </Link>
                      </>
                    ) : (
                      <>
                        Nenhum titular cadastrado.{" "}
                        <Link
                          href="/titulares/novo"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Adicionar o primeiro
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              </tbody>
            ) : (
              <TitularesTable
                titulares={titulares}
                dependentesByTitular={dependentesByTitular}
              />
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
