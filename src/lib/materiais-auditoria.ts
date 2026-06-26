import { createClient } from "@/lib/supabase/server";

export type MaterialAcao = "criacao" | "edicao" | "exclusao";

type AuditPayload = {
  materialId: string;
  acao: MaterialAcao;
  antes?: Record<string, unknown> | null;
  depois?: Record<string, unknown> | null;
};

export async function registrarMaterialAuditoria(
  payload: AuditPayload
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("materiais_auditoria").insert({
    material_id: payload.materialId,
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

export function snapshotMaterial(row: {
  id: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
}) {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    quantidade: row.quantidade,
  };
}
