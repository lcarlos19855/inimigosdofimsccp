"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PagamentoFormState = { error?: string } | null;

export async function createPagamento(
  _prev: PagamentoFormState,
  formData: FormData
): Promise<PagamentoFormState> {
  const titularIds = formData
    .getAll("titular_id")
    .map((id) => String(id).trim())
    .filter(Boolean);
  const categoriaId = String(formData.get("categoria_id") ?? "").trim();
  const vencimento = String(formData.get("vencimento") ?? "").trim();
  const valorRaw = String(formData.get("valor") ?? "")
    .trim()
    .replace(",", ".");
  const valor = Number(valorRaw);
  const statusRaw = String(formData.get("status") ?? "pendente");
  const status =
    statusRaw === "pago" || statusRaw === "atrasado" ? statusRaw : "pendente";
  const dataPagamento =
    String(formData.get("data_pagamento") ?? "").trim() || null;
  const observacao =
    String(formData.get("observacao") ?? "").trim() || null;

  if (titularIds.length === 0) {
    return { error: "Selecione ao menos um titular." };
  }
  if (!categoriaId) {
    return { error: "Selecione uma categoria." };
  }
  if (!vencimento) {
    return { error: "Informe o vencimento." };
  }
  if (!Number.isFinite(valor) || valor <= 0) {
    return { error: "Valor inválido." };
  }

  if (status === "pago" && !dataPagamento) {
    return { error: "Para status pago, informe a data do pagamento." };
  }

  const supabase = await createClient();
  const rows = titularIds.map((titularId) => ({
    titular_id: titularId,
    categoria_id: categoriaId,
    vencimento,
    valor,
    status,
    data_pagamento: status === "pago" ? dataPagamento : null,
    observacao,
  }));

  const { error } = await supabase.from("pagamentos").insert(rows);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pagamentos");
  revalidatePath("/dashboard");
  redirect("/pagamentos");
}

export async function excluirPagamento(
  pagamentoId: string
): Promise<{ error?: string }> {
  const id = pagamentoId.trim();
  if (!id) {
    return { error: "Identificador inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("soft_delete_pagamento", {
    p_id: id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pagamentos");
  revalidatePath("/pagamentos/excluidos");
  revalidatePath("/dashboard");
  return {};
}

export async function registrarRecebimentoPagamento(
  pagamentoId: string,
  dataPagamento: string
): Promise<{ error?: string }> {
  const id = pagamentoId.trim();
  const data = dataPagamento.trim();

  if (!id) {
    return { error: "Pagamento inválido." };
  }
  if (!data) {
    return { error: "Informe a data do pagamento." };
  }

  const supabase = await createClient();
  const { data: row, error: fetchErr } = await supabase
    .from("pagamentos")
    .select("id, status, excluido_em")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    return { error: fetchErr.message };
  }
  if (!row) {
    return { error: "Pagamento não encontrado." };
  }
  if (row.excluido_em) {
    return { error: "Este pagamento foi excluído." };
  }
  if (row.status === "pago") {
    return { error: "Este pagamento já está como pago." };
  }
  if (row.status !== "pendente" && row.status !== "atrasado") {
    return { error: "Só é possível registrar recebimento para pendente ou atrasado." };
  }

  const { error } = await supabase
    .from("pagamentos")
    .update({
      status: "pago",
      data_pagamento: data,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pagamentos");
  revalidatePath("/dashboard");
  revalidatePath("/caixa");
  return {};
}
