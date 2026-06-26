import { createClient } from "@/lib/supabase/server";

export type PagamentoAcao =
  | "criacao"
  | "edicao"
  | "registro_pagamento"
  | "exclusao";

type AuditPayload = {
  pagamentoId: string;
  acao: PagamentoAcao;
  antes?: Record<string, unknown> | null;
  depois?: Record<string, unknown> | null;
};

export async function registrarPagamentoAuditoria(
  payload: AuditPayload
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("pagamentos_auditoria").insert({
    pagamento_id: payload.pagamentoId,
    acao: payload.acao,
    dados_antes: payload.antes ?? null,
    dados_depois: payload.depois ?? null,
    executado_por: user?.id ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}

export function snapshotPagamento(row: {
  titular_id: string;
  categoria_id: string | null;
  vencimento: string;
  valor: string | number;
  status: string;
  data_pagamento: string | null;
  observacao: string | null;
}) {
  return {
    titular_id: row.titular_id,
    categoria_id: row.categoria_id,
    vencimento: row.vencimento,
    valor: row.valor,
    status: row.status,
    data_pagamento: row.data_pagamento,
    observacao: row.observacao,
  };
}
