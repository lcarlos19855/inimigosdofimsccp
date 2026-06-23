"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type TitularFormState = { error?: string } | null;

export async function createTitular(
  _prev: TitularFormState,
  formData: FormData
): Promise<TitularFormState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const cpf = String(formData.get("cpf") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
  const status = formData.get("status") === "inativo" ? "inativo" : "ativo";

  if (!nome) {
    return { error: "Nome é obrigatório." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("titulares").insert({
    nome,
    cpf,
    email,
    whatsapp,
    status,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/titulares");
  redirect("/titulares");
}
