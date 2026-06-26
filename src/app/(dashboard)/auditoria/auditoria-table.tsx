import {
  fmtAuditoriaData,
  formatAuditoriaDados,
  labelAcaoAuditoria,
} from "@/lib/auditoria-labels";

export type AuditoriaLinha = {
  id: string;
  created_at: string;
  acao: string;
  executado_por_nome: string | null;
  resumo_antes: string;
  resumo_depois: string;
  entidade_id?: string;
};

export function AuditoriaTable({
  linhas,
  emptyMessage,
}: {
  linhas: AuditoriaLinha[];
  emptyMessage: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Data e hora</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Executado por</th>
              <th className="px-4 py-3">Antes</th>
              <th className="px-4 py-3">Depois</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {linhas.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              linhas.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {fmtAuditoriaData(l.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                      {labelAcaoAuditoria(l.acao)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {l.executado_por_nome ?? "—"}
                  </td>
                  <td className="max-w-[280px] px-4 py-3 text-xs leading-relaxed text-slate-600">
                    {l.resumo_antes}
                  </td>
                  <td className="max-w-[280px] px-4 py-3 text-xs leading-relaxed text-slate-600">
                    {l.resumo_depois}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function mapMembroAuditoria(
  rows: {
    id: string;
    acao: string;
    dados_antes: Record<string, unknown> | null;
    dados_depois: Record<string, unknown> | null;
    created_at: string;
    executor: { nome: string } | { nome: string }[] | null;
  }[]
): AuditoriaLinha[] {
  return rows.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    acao: r.acao,
    executado_por_nome: normalizeExecutorNome(r.executor),
    resumo_antes: formatAuditoriaDados(r.dados_antes),
    resumo_depois: formatAuditoriaDados(r.dados_depois),
  }));
}

function normalizeExecutorNome(
  executor: { nome: string } | { nome: string }[] | null
): string | null {
  if (!executor) return null;
  if (Array.isArray(executor)) return executor[0]?.nome ?? null;
  return executor.nome;
}

export function mapMaterialAuditoria(
  rows: {
    id: string;
    acao: string;
    dados_antes: Record<string, unknown> | null;
    dados_depois: Record<string, unknown> | null;
    created_at: string;
    executor: { nome: string } | { nome: string }[] | null;
  }[]
): AuditoriaLinha[] {
  return mapMembroAuditoria(rows);
}

export function mapPagamentoAuditoria(
  rows: {
    id: string;
    acao: string;
    dados_antes: Record<string, unknown> | null;
    dados_depois: Record<string, unknown> | null;
    created_at: string;
    executor: { nome: string } | { nome: string }[] | null;
  }[]
): AuditoriaLinha[] {
  return mapMembroAuditoria(rows);
}
