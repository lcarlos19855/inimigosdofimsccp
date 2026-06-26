import { createClient } from "@/lib/supabase/server";
import type { CaixaMovimentoComOperador } from "@/types/database";
import { CaixaForms } from "./caixa-forms";

export default async function CaixaPage() {
  const supabase = await createClient();

  const [movRes, pagRes] = await Promise.all([
    supabase
      .from("caixa_movimentos")
      .select(
        `
      *,
      operador:profiles!caixa_movimentos_perfil_id_fkey ( nome )
    `
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("pagamentos")
      .select("valor")
      .eq("status", "pago")
      .is("excluido_em", null),
  ]);

  const movimentos = (movRes.data ?? []) as CaixaMovimentoComOperador[];
  const caixaError = movRes.error;
  const pagamentosError = pagRes.error;

  const totalPagamentosPago =
    pagRes.data?.reduce((acc, row) => acc + Number(row.valor), 0) ?? 0;

  const saldoCaixaManual = movimentos.reduce((acc, m) => {
    const v = Number(m.valor);
    return acc + (m.tipo === "entrada" ? v : -v);
  }, 0);

  const saldoDisponivel =
    caixaError === null ? saldoCaixaManual + totalPagamentosPago : null;

  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const fmtDataHora = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Caixa</h1>
        <p className="text-sm text-slate-600">
          Saldo disponível soma os <strong>lançamentos manuais</strong> (entradas
          e saídas abaixo) com todos os <strong>recebimentos em status Pago</strong>{" "}
          da aba Recebimentos (não excluídos). Evite registrar uma{" "}
          <em>entrada</em> manual pelo mesmo valor de um recebimento já marcado
          como Pago, para não duplicar.
        </p>
      </div>

      {caixaError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {caixaError.message}
          {caixaError.message.includes("caixa_movimentos") ||
          caixaError.message.includes("schema cache") ? (
            <>
              {" "}
              Rode no Supabase o script{" "}
              <code className="rounded bg-red-100 px-1">
                supabase/migration_caixa_movimentos.sql
              </code>
              .
            </>
          ) : null}
        </p>
      )}

      {pagamentosError && !caixaError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Não foi possível carregar recebimentos para o saldo:{" "}
          {pagamentosError.message}
        </p>
      )}

      {saldoDisponivel !== null && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Saldo disponível
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            {fmt(saldoDisponivel)}
          </p>
          <dl className="mt-4 grid gap-2 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Lançamentos manuais (caixa)</dt>
              <dd className="font-medium text-slate-800">
                {fmt(saldoCaixaManual)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Recebimentos (Pago)</dt>
              <dd className="font-medium text-slate-800">
                {fmt(totalPagamentosPago)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-500">
            Saídas manuais não podem ultrapassar o saldo disponível acima. Ao
            marcar um recebimento como Pago em Recebimentos, o total disponível
            aumenta automaticamente.
          </p>
        </div>
      )}

      <CaixaForms />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Histórico de movimentos (somente caixa manual)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Data e hora</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Disponível após *</th>
                <th className="px-4 py-3">Operador</th>
                <th className="px-4 py-3">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimentos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Nenhum movimento manual ainda. O saldo ainda pode refletir
                    apenas recebimentos marcados como Pago.
                  </td>
                </tr>
              ) : (
                movimentos.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {fmtDataHora(m.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          m.tipo === "entrada"
                            ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                            : "inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
                        }
                      >
                        {m.tipo === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {m.tipo === "saida" ? "− " : "+ "}
                      {fmt(Number(m.valor))}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {fmt(Number(m.saldo_apos))}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {m.operador?.nome ?? "—"}
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-3 text-slate-600">
                      {m.descricao?.trim() ? m.descricao : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          * Total disponível logo após este lançamento (caixa manual + soma dos
          recebimentos Pago naquele instante). Se novos recebimentos forem marcados
          como Pago depois, o número no topo passa a refletir isso; linhas
          antigas não são recalculadas.
        </p>
      </div>
    </div>
  );
}
