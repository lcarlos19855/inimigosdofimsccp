import { createClient } from "@/lib/supabase/server";

export type MembroEntidade = "titular" | "dependente";
export type MembroAcao =
  | "criacao"
  | "edicao"
  | "ativacao"
  | "desativacao"
  | "exclusao";

type AuditPayload = {
  entidade: MembroEntidade;
  entidadeId: string;
  acao: MembroAcao;
  antes?: Record<string, unknown> | null;
  depois?: Record<string, unknown> | null;
};

export async function registrarMembroAuditoria(
  payload: AuditPayload
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("membros_auditoria").insert({
    entidade: payload.entidade,
    entidade_id: payload.entidadeId,
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

export function snapshotTitular(row: {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  whatsapp: string | null;
  status: string;
}) {
  return {
    id: row.id,
    nome: row.nome,
    cpf: row.cpf,
    email: row.email,
    whatsapp: row.whatsapp,
    status: row.status,
  };
}

export function snapshotDependente(row: {
  id: string;
  titular_id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  status: string;
}) {
  return {
    id: row.id,
    titular_id: row.titular_id,
    nome: row.nome,
    email: row.email,
    whatsapp: row.whatsapp,
    status: row.status,
  };
}
