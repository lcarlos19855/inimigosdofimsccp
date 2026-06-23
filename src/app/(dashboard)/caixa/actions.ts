"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CaixaFormState = { error?: string } | null;

function parseValor(formData: FormData): number {
  const valorRaw = String(formData.get("valor") ?? "")
    .trim()
    .replace(",", ".");
  return Number(valorRaw);
}

export async function registrarCaixaEntrada(
  _prev: CaixaFormState,
  formData: FormData
): Promise<CaixaFormState> {
  const valor = parseValor(formData);
  const descricao = String(formData.get("descricao") ?? "").trim() || null;

  if (!Number.isFinite(valor) || valor <= 0) {
    return { error: "Informe um valor válido maior que zero." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("caixa_movimentos").insert({
    tipo: "entrada",
    valor,
    descricao,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/caixa");
  return null;
}

export async function registrarCaixaSaida(
  _prev: CaixaFormState,
  formData: FormData
): Promise<CaixaFormState> {
  const valor = parseValor(formData);
  const descricao = String(formData.get("descricao") ?? "").trim() || null;

  if (!Number.isFinite(valor) || valor <= 0) {
    return { error: "Informe um valor válido maior que zero." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("caixa_movimentos").insert({
    tipo: "saida",
    valor,
    descricao,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/caixa");
  return null;
}
