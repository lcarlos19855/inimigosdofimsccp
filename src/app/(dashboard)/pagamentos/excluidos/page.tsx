import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PagamentoExcluidoRow } from "@/types/database";

export default async function PagamentosExcluidosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pagamentos")
    .select(
      `
      *,
      titulares ( nome ),
      categorias ( nome ),
      lancador:profiles!pagamentos_lancado_por_fkey ( nome ),
      excluido_por_perfil:profiles!pagamentos_excluido_por_fkey ( nome )
    `
    )
    .not("excluido_em", "is", null)
    .order("excluido_em", { ascending: false });

  const rows = (data ?? []) as PagamentoExcluidoRow[];

  const fmt = (v: string | number) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const fmtDate = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("pt-BR");

  const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const statusLabel: Record<string, string> = {
    pago: "Pago",
    pendente: "Pendente",
    atrasado: "Atrasado",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/pagamentos"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Voltar para pagamentos ativos
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Pagamentos excluídos
          </h1>
          <p className="text-sm text-slate-600">
            Registros removidos da lista principal; permanecem para auditoria.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Titular</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Lançado por</th>
                <th className="px-4 py-3">Observação</th>
                <th className="px-4 py-3">Excluído em</th>
                <th className="px-4 py-3">Excluído por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Nenhum pagamento excluído.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
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
                    <td className="px-4 py-3 text-slate-600">
                      {statusLabel[p.status] ?? p.status}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.lancador?.nome ?? "—"}
                    </td>
                    <td
                      className="max-w-[200px] truncate px-4 py-3 text-slate-600"
                      title={p.observacao ?? undefined}
                    >
                      {p.observacao?.trim() ? p.observacao.trim() : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.excluido_em ? fmtDateTime(p.excluido_em) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.excluido_por_perfil?.nome ?? "—"}
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
