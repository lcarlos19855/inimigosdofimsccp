"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DependenteFormState = { error?: string } | null;

export async function createDependente(
  _prev: DependenteFormState,
  formData: FormData
): Promise<DependenteFormState> {
  const titularId = String(formData.get("titular_id") ?? "").trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
  const status = formData.get("status") === "inativo" ? "inativo" : "ativo";

  if (!titularId) {
    return { error: "Selecione um titular." };
  }
  if (!nome) {
    return { error: "Nome é obrigatório." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("dependentes").insert({
    titular_id: titularId,
    nome,
    email,
    whatsapp,
    status,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dependentes");
  revalidatePath("/dashboard");
  redirect("/dependentes");
}
