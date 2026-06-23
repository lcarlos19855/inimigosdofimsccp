import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DependentesFiltersForm } from "@/components/dashboard-list-filters";
import { personSearchQuery } from "@/lib/person-search";
import { searchParamOne } from "@/lib/search-params";
import type { DependenteComTitular } from "@/types/database";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function mergeById(rows: DependenteComTitular[]): DependenteComTitular[] {
  const map = new Map<string, DependenteComTitular>();
  for (const r of rows) {
    map.set(r.id, r);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

export default async function DependentesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pessoaInput = searchParamOne(sp.pessoa);
  const pessoa = personSearchQuery(pessoaInput);

  const supabase = await createClient();

  let dependentes: DependenteComTitular[] = [];
  let error: { message: string } | null = null;

  if (pessoa) {
    const [{ data: byNome, error: e1 }, { data: titMatches, error: e2 }] =
      await Promise.all([
        supabase
          .from("dependentes")
          .select("*, titulares(nome)")
          .ilike("nome", `%${pessoa}%`)
          .order("nome"),
        supabase.from("titulares").select("id").ilike("nome", `%${pessoa}%`),
      ]);

    error = e1 ?? e2;
    const tids = titMatches?.map((t) => t.id) ?? [];

    let byTitular: DependenteComTitular[] = [];
    if (tids.length > 0) {
      const { data: dt, error: e3 } = await supabase
        .from("dependentes")
        .select("*, titulares(nome)")
        .in("titular_id", tids)
        .order("nome");
      if (e3) error = e3;
      byTitular = (dt ?? []) as DependenteComTitular[];
    }

    dependentes = mergeById([
      ...((byNome ?? []) as DependenteComTitular[]),
      ...byTitular,
    ]);
  } else {
    const { data, error: e } = await supabase
      .from("dependentes")
      .select("*, titulares(nome)")
      .order("nome");
    error = e;
    dependentes = (data ?? []) as DependenteComTitular[];
  }

  const hasFilters = Boolean(pessoa);
  const emptyBecauseFilter = dependentes.length === 0 && hasFilters;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dependentes</h1>
          <p className="text-sm text-slate-600">
            Membros vinculados a titulares
          </p>
        </div>
        <Link
          href="/dependentes/novo"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Novo dependente
        </Link>
      </div>

      <DependentesFiltersForm pessoa={pessoaInput ?? ""} />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Titular</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dependentes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {emptyBecauseFilter ? (
                      <>
                        Nenhum dependente encontrado com esse filtro.{" "}
                        <Link
                          href="/dependentes"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Limpar filtro
                        </Link>
                      </>
                    ) : (
                      <>
                        Nenhum dependente cadastrado.{" "}
                        <Link
                          href="/dependentes/novo"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Adicionar o primeiro
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                dependentes.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {d.nome}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {d.titulares?.nome ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {d.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {d.whatsapp ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          d.status === "ativo"
                            ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                            : "inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                        }
                      >
                        {d.status === "ativo" ? "Ativo" : "Inativo"}
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
