import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    caixaMovs,
    pagosPago,
    titularesTotal,
    titAtivos,
    titInativos,
    dependentesTotal,
    depAtivos,
    depInativos,
    pendentes,
    atrasados,
  ] = await Promise.all([
    supabase.from("caixa_movimentos").select("tipo, valor"),
    supabase
      .from("pagamentos")
      .select("valor")
      .eq("status", "pago")
      .is("excluido_em", null),
    supabase
      .from("titulares")
      .select("*", { count: "exact", head: true })
      .is("excluido_em", null),
    supabase
      .from("titulares")
      .select("*", { count: "exact", head: true })
      .eq("status", "ativo")
      .is("excluido_em", null),
    supabase
      .from("titulares")
      .select("*", { count: "exact", head: true })
      .eq("status", "inativo")
      .is("excluido_em", null),
    supabase
      .from("dependentes")
      .select("*", { count: "exact", head: true })
      .is("excluido_em", null),
    supabase
      .from("dependentes")
      .select("*", { count: "exact", head: true })
      .eq("status", "ativo")
      .is("excluido_em", null),
    supabase
      .from("dependentes")
      .select("*", { count: "exact", head: true })
      .eq("status", "inativo")
      .is("excluido_em", null),
    supabase
      .from("pagamentos")
      .select("valor")
      .eq("status", "pendente")
      .is("excluido_em", null),
    supabase
      .from("pagamentos")
      .select("valor")
      .eq("status", "atrasado")
      .is("excluido_em", null),
  ]);

  const saldoCaixaManual = (caixaMovs.data ?? []).reduce((acc, m) => {
    const v = Number(m.valor);
    return acc + (m.tipo === "entrada" ? v : -v);
  }, 0);

  const totalPagamentosPago =
    pagosPago.data?.reduce((acc, r) => acc + Number(r.valor), 0) ?? 0;

  const saldoDisponivel =
    caixaMovs.error === null
      ? saldoCaixaManual + totalPagamentosPago
      : null;

  const sumValor = (rows: { valor: string | number }[] | null) =>
    rows?.reduce((acc, r) => acc + Number(r.valor), 0) ?? 0;

  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">Resumo do grupo</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-full max-w-xl rounded-2xl border-2 border-blue-200 bg-white p-8 text-center shadow-md ring-1 ring-blue-100">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Saldo disponível em conta
          </p>
          {saldoDisponivel !== null ? (
            <>
              <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                {fmt(saldoDisponivel)}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Caixa manual {fmt(saldoCaixaManual)} + recebimentos{" "}
                <span className="whitespace-nowrap">Pago {fmt(totalPagamentosPago)}</span>
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-amber-800">
              Não foi possível carregar o caixa. Confira se a tabela existe ou
              rode as migrações do Supabase.
            </p>
          )}
          <Link
            href="/caixa"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Abrir caixa
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Titulares</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {titularesTotal.count ?? 0}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {titAtivos.count ?? 0} ativos · {titInativos.count ?? 0} inativos
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Dependentes</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {dependentesTotal.count ?? 0}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {depAtivos.count ?? 0} ativos · {depInativos.count ?? 0} inativos
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Recebimentos pendentes
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-700">
            {pendentes.data?.length ?? 0}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {fmt(sumValor(pendentes.data))}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Recebimentos atrasados
          </p>
          <p className="mt-1 text-2xl font-semibold text-red-700">
            {atrasados.data?.length ?? 0}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {fmt(sumValor(atrasados.data))}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Ações rápidas
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/titulares/novo"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Novo titular
          </Link>
          <Link
            href="/dependentes/novo"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Novo dependente
          </Link>
          <Link
            href="/pagamentos/novo"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Registrar recebimento
          </Link>
          <Link
            href="/caixa"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Caixa
          </Link>
          <Link
            href="/comunicados"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Comunicados
          </Link>
        </div>
      </div>
    </div>
  );
}
