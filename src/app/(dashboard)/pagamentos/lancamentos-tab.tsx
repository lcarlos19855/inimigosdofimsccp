import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PagamentosFiltersForm } from "@/components/dashboard-list-filters";
import {
  nextMonthFirstDay,
  parseMes,
  parseStatusPagamento,
  parseUuid,
  personSearchQuery,
} from "@/lib/person-search";
import { searchParamOne } from "@/lib/search-params";
import type { PagamentoComTitular } from "@/types/database";
import { ExcluirPagamentoButton } from "./excluir-pagamento-button";
import { ExportPagamentosPdfButton } from "./export-pagamentos-pdf-button";
import { RegistrarPagamentoDialog } from "./registrar-pagamento-dialog";

const PAGAMENTO_SELECT = `
  *,
  titulares ( nome ),
  categorias ( nome ),
  lancador:profiles!pagamentos_lancado_por_fkey ( nome )
`;

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export async function LancamentosTab({ searchParams: sp }: Props) {
  const pessoaInput = searchParamOne(sp.pessoa);
  const pessoa = personSearchQuery(pessoaInput);
  const titularIdParam = parseUuid(searchParamOne(sp.titular_id));
  const categoriaIdParam = parseUuid(searchParamOne(sp.categoria_id));
  const statusFilter = parseStatusPagamento(searchParamOne(sp.status));
  const mesFilter = parseMes(searchParamOne(sp.mes));

  const supabase = await createClient();

  const [{ data: titularesOpts }, { data: categoriasOpts }] = await Promise.all([
    supabase.from("titulares").select("id, nome").order("nome"),
    supabase.from("categorias").select("id, nome").eq("ativo", true).order("nome"),
  ]);

  const titularesLista = titularesOpts ?? [];
  const categoriasLista = categoriasOpts ?? [];

  let rows: PagamentoComTitular[] = [];
  let error: { message: string } | null = null;
  let skippedNoTitularMatch = false;

  function applyCommonFilters<
    Q extends {
      eq: (col: string, val: string) => Q;
      gte: (col: string, val: string) => Q;
      lt: (col: string, val: string) => Q;
    },
  >(q: Q) {
    if (statusFilter) q = q.eq("status", statusFilter);
    if (categoriaIdParam) q = q.eq("categoria_id", categoriaIdParam);
    if (mesFilter) {
      q = q
        .gte("vencimento", `${mesFilter}-01`)
        .lt("vencimento", nextMonthFirstDay(mesFilter));
    }
    return q;
  }

  if (titularIdParam) {
    let q = supabase
      .from("pagamentos")
      .select(PAGAMENTO_SELECT)
      .is("excluido_em", null)
      .eq("titular_id", titularIdParam);

    q = applyCommonFilters(q);

    const { data, error: e } = await q.order("vencimento", { ascending: false });
    error = e;
    rows = (data ?? []) as PagamentoComTitular[];
  } else if (pessoa) {
    const { data: ts } = await supabase
      .from("titulares")
      .select("id")
      .ilike("nome", `%${pessoa}%`);
    const ids = ts?.map((t) => t.id) ?? [];
    if (ids.length === 0) {
      skippedNoTitularMatch = true;
      rows = [];
    } else {
      let q = supabase
        .from("pagamentos")
        .select(PAGAMENTO_SELECT)
        .is("excluido_em", null)
        .in("titular_id", ids);

      q = applyCommonFilters(q);

      const { data, error: e } = await q.order("vencimento", {
        ascending: false,
      });
      error = e;
      rows = (data ?? []) as PagamentoComTitular[];
    }
  } else {
    let q = supabase
      .from("pagamentos")
      .select(PAGAMENTO_SELECT)
      .is("excluido_em", null);

    q = applyCommonFilters(q);

    const { data, error: e } = await q.order("vencimento", { ascending: false });
    error = e;
    rows = (data ?? []) as PagamentoComTitular[];
  }

  const fmt = (v: string | number) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const fmtDate = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("pt-BR");

  const fmtLancamento = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const statusLabel: Record<string, string> = {
    pago: "Pago",
    pendente: "Pendente",
    atrasado: "Atrasado",
  };

  const statusClass = (s: string) => {
    if (s === "pago")
      return "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800";
    if (s === "atrasado")
      return "inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800";
    return "inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800";
  };

  const rowTitle = (p: PagamentoComTitular) => {
    const parts: string[] = [];
    if (p.lancador?.nome) {
      parts.push(`Lançado por: ${p.lancador.nome}`);
    } else if (p.lancado_por) {
      parts.push("Lançado por: (perfil não encontrado)");
    }
    const obs = p.observacao?.trim();
    if (obs) {
      parts.push(`Observação: ${obs}`);
    }
    return parts.length > 0 ? parts.join(" · ") : undefined;
  };

  const colCount = 9;
  const hasFilters = Boolean(
    titularIdParam || categoriaIdParam || pessoa || statusFilter || mesFilter
  );
  const emptyBecauseFilter =
    rows.length === 0 &&
    (hasFilters || skippedNoTitularMatch) &&
    !error;

  const totalValor = rows.reduce((sum, p) => sum + Number(p.valor), 0);

  const pdfRows = rows.map((p) => ({
    titular: p.titulares?.nome ?? "—",
    categoria: p.categorias?.nome ?? "—",
    vencimento: fmtDate(p.vencimento),
    valor: fmt(p.valor),
    status: statusLabel[p.status] ?? p.status,
    pagoEm: p.data_pagamento ? fmtDate(p.data_pagamento) : "—",
    lancamento: `${p.lancador?.nome ?? (p.lancado_por ? "Perfil indisponível" : "—")} · ${
      p.created_at ? fmtLancamento(p.created_at) : "—"
    }`,
  }));

  const filterParts: string[] = [];
  if (categoriaIdParam) {
    const nome =
      categoriasLista.find((c) => c.id === categoriaIdParam)?.nome ?? "—";
    filterParts.push(`Categoria: ${nome}`);
  }
  if (titularIdParam) {
    const nome =
      titularesLista.find((t) => t.id === titularIdParam)?.nome ?? "—";
    filterParts.push(`Titular: ${nome}`);
  } else if (pessoa) {
    filterParts.push(`Nome: ${pessoa}`);
  }
  if (statusFilter) {
    filterParts.push(`Status: ${statusLabel[statusFilter] ?? statusFilter}`);
  }
  if (mesFilter) {
    const [y, m] = mesFilter.split("-");
    const mesLabel = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(
      "pt-BR",
      { month: "long", year: "numeric" }
    );
    filterParts.push(`Vencimento: ${mesLabel}`);
  }
  const filterSummary =
    filterParts.length > 0 ? filterParts.join(" · ") : "Todos os lançamentos";

  return (
    <div className="space-y-4">
      <PagamentosFiltersForm
        titulares={titularesLista}
        categorias={categoriasLista}
        pessoa={pessoaInput ?? ""}
        titularId={titularIdParam ?? ""}
        categoriaId={categoriaIdParam ?? ""}
        status={searchParamOne(sp.status) ?? ""}
        mes={searchParamOne(sp.mes) ?? ""}
      />

      <div className="flex justify-end">
        <ExportPagamentosPdfButton
          rows={pdfRows}
          filterSummary={filterSummary}
          totalValor={totalValor}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
          {error.message.includes("pagamentos_lancado_por_fkey") ||
          error.message.includes("categorias") ||
          error.message.includes("schema cache") ? (
            <>
              {" "}
              Rode no Supabase os scripts de migração em{" "}
              <code className="rounded bg-red-100 px-1">supabase/</code>.
            </>
          ) : null}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Titular</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pago em</th>
                <th className="px-4 py-3 text-center">Quitar</th>
                <th className="px-4 py-3 text-center">Excluir</th>
                <th className="px-4 py-3">Lançamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {emptyBecauseFilter ? (
                      <>
                        Nenhum pagamento encontrado com esses filtros.{" "}
                        <Link
                          href="/pagamentos"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Limpar filtros
                        </Link>
                      </>
                    ) : (
                      <>
                        Nenhum pagamento registrado.{" "}
                        <Link
                          href="/pagamentos/novo"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Registrar o primeiro
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80"
                    title={rowTitle(p)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.titulares?.nome ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.categorias?.nome ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {fmtDate(p.vencimento)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {fmt(p.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusClass(p.status)}>
                        {statusLabel[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.data_pagamento ? fmtDate(p.data_pagamento) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      {p.status === "pendente" || p.status === "atrasado" ? (
                        <RegistrarPagamentoDialog
                          pagamentoId={p.id}
                          titularNome={p.titulares?.nome ?? "Titular"}
                          valorFormatado={fmt(p.valor)}
                        />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <ExcluirPagamentoButton pagamentoId={p.id} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-800">
                          {p.lancador?.nome ??
                            (p.lancado_por ? "Perfil indisponível" : "—")}
                        </span>
                        <span className="text-xs text-slate-500">
                          Registrado em{" "}
                          {p.created_at
                            ? fmtLancamento(p.created_at)
                            : "—"}
                        </span>
                      </div>
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
