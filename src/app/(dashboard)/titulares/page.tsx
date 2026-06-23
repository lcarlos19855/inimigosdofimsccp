import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TitularesFiltersForm } from "@/components/dashboard-list-filters";
import { personSearchQuery } from "@/lib/person-search";
import { searchParamOne } from "@/lib/search-params";
import type { Titular } from "@/types/database";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TitularesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pessoaInput = searchParamOne(sp.pessoa);
  const pessoa = personSearchQuery(pessoaInput);

  const supabase = await createClient();
  let query = supabase.from("titulares").select("*").order("nome");

  if (pessoa) {
    query = query.ilike("nome", `%${pessoa}%`);
  }

  const { data, error } = await query;

  const titulares = (data ?? []) as Titular[];
  const hasFilters = Boolean(pessoa);
  const emptyBecauseFilter = titulares.length === 0 && hasFilters;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Titulares</h1>
          <p className="text-sm text-slate-600">
            Cadastro de titulares do grupo
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
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {titulares.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
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
              ) : (
                titulares.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {t.nome}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.cpf ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.whatsapp ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          t.status === "ativo"
                            ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                            : "inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                        }
                      >
                        {t.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
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
