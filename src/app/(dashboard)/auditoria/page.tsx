import { createClient } from "@/lib/supabase/server";
import { searchParamOne } from "@/lib/search-params";
import {
  AuditoriaTable,
  mapMaterialAuditoria,
  mapMembroAuditoria,
  mapPagamentoAuditoria,
} from "./auditoria-table";
import { AuditoriaTabs, type AuditoriaAba } from "./auditoria-tabs";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ABAS: AuditoriaAba[] = [
  "titulares",
  "dependentes",
  "recebimentos",
  "materiais",
];

function parseAba(raw: string | undefined): AuditoriaAba {
  if (raw && ABAS.includes(raw as AuditoriaAba)) {
    return raw as AuditoriaAba;
  }
  return "titulares";
}

export default async function AuditoriaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const aba = parseAba(searchParamOne(sp.aba));

  const supabase = await createClient();
  let linhas: ReturnType<typeof mapMembroAuditoria> = [];
  let error: { message: string } | null = null;
  let emptyMessage = "Nenhum registro de auditoria encontrado.";

  if (aba === "titulares") {
    const { data, error: e } = await supabase
      .from("membros_auditoria")
      .select(
        "id, acao, dados_antes, dados_depois, created_at, executor:profiles!membros_auditoria_executado_por_fkey ( nome )"
      )
      .eq("entidade", "titular")
      .order("created_at", { ascending: false })
      .limit(200);
    error = e;
    linhas = mapMembroAuditoria(data ?? []);
  } else if (aba === "dependentes") {
    const { data, error: e } = await supabase
      .from("membros_auditoria")
      .select(
        "id, acao, dados_antes, dados_depois, created_at, executor:profiles!membros_auditoria_executado_por_fkey ( nome )"
      )
      .eq("entidade", "dependente")
      .order("created_at", { ascending: false })
      .limit(200);
    error = e;
    linhas = mapMembroAuditoria(data ?? []);
  } else if (aba === "recebimentos") {
    const { data, error: e } = await supabase
      .from("pagamentos_auditoria")
      .select(
        "id, acao, dados_antes, dados_depois, created_at, executor:profiles!pagamentos_auditoria_executado_por_fkey ( nome )"
      )
      .order("created_at", { ascending: false })
      .limit(200);
    error = e;
    if (e?.message.includes("pagamentos_auditoria")) {
      emptyMessage =
        "Tabela de auditoria de recebimentos ainda não existe. Rode supabase/migration_pagamentos_auditoria_log.sql no Supabase.";
    }
    linhas = mapPagamentoAuditoria(data ?? []);
  } else {
    const { data, error: e } = await supabase
      .from("materiais_auditoria")
      .select(
        "id, acao, dados_antes, dados_depois, created_at, executor:profiles!materiais_auditoria_executado_por_fkey ( nome )"
      )
      .order("created_at", { ascending: false })
      .limit(200);
    error = e;
    if (e?.message.includes("materiais_auditoria")) {
      emptyMessage =
        "Tabela de auditoria de materiais ainda não existe. Rode supabase/migration_materiais.sql no Supabase.";
    }
    linhas = mapMaterialAuditoria(data ?? []);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Auditoria</h1>
        <p className="text-sm text-slate-600">
          Histórico de alterações registradas no sistema (últimos 200 registros
          por aba)
        </p>
      </div>

      <AuditoriaTabs active={aba} />

      {error && !error.message.includes("does not exist") && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </p>
      )}

      <AuditoriaTable linhas={linhas} emptyMessage={emptyMessage} />
    </div>
  );
}
