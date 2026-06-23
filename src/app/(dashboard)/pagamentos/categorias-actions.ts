"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CategoriaFormState = { error?: string } | null;

export async function createCategoria(
  _prev: CategoriaFormState,
  formData: FormData
): Promise<CategoriaFormState> {
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) {
    return { error: "Nome é obrigatório." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categorias").insert({ nome });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pagamentos");
  redirect("/pagamentos?aba=categorias");
}

export async function setCategoriaAtivo(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const ativo = formData.get("ativo") === "true";

  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("categorias")
    .update({ ativo })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/pagamentos");
}
