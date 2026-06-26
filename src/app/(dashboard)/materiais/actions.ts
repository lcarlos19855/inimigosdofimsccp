"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { verifyCurrentUserPassword } from "@/lib/auth/verify-password";
import {
  registrarMaterialAuditoria,
  snapshotMaterial,
} from "@/lib/materiais-auditoria";
import { createClient } from "@/lib/supabase/server";

export type MaterialFormState = { error?: string } | null;

async function requireActiveProfile() {
  const profile = await getCurrentProfile();
  if (!profile?.ativo) {
    return { error: "Sessão inválida ou usuário inativo." };
  }
  return { profile };
}

function parseQuantidade(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export async function createMaterial(
  _prev: MaterialFormState,
  formData: FormData
): Promise<MaterialFormState> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const quantidade = parseQuantidade(formData.get("quantidade"));

  if (!nome) return { error: "Nome é obrigatório." };
  if (quantidade === null) {
    return { error: "Informe uma quantidade válida (número inteiro ≥ 0)." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materiais")
    .insert({ nome, descricao, quantidade })
    .select("id, nome, descricao, quantidade")
    .single();

  if (error) return { error: error.message };

  await registrarMaterialAuditoria({
    materialId: data.id,
    acao: "criacao",
    depois: snapshotMaterial(data),
  });

  revalidatePath("/materiais");
  revalidatePath("/auditoria");
  redirect("/materiais");
}

export async function updateMaterial(
  materialId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const id = materialId.trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  const quantidade = parseQuantidade(formData.get("quantidade"));

  if (!id) return { error: "Material inválido." };
  if (!nome) return { error: "Nome é obrigatório." };
  if (quantidade === null) {
    return { error: "Informe uma quantidade válida (número inteiro ≥ 0)." };
  }

  const supabase = await createClient();
  const { data: antes, error: fetchErr } = await supabase
    .from("materiais")
    .select("id, nome, descricao, quantidade, excluido_em")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!antes) return { error: "Material não encontrado." };
  if (antes.excluido_em) return { error: "Este material foi excluído." };

  const { data: depois, error } = await supabase
    .from("materiais")
    .update({ nome, descricao, quantidade })
    .eq("id", id)
    .select("id, nome, descricao, quantidade")
    .single();

  if (error) return { error: error.message };

  await registrarMaterialAuditoria({
    materialId: id,
    acao: "edicao",
    antes: snapshotMaterial(antes),
    depois: snapshotMaterial(depois),
  });

  revalidatePath("/materiais");
  revalidatePath("/auditoria");
  return {};
}

export async function excluirMaterial(
  materialId: string,
  password: string
): Promise<{ error?: string }> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const pass = await verifyCurrentUserPassword(password);
  if (pass.error) return pass;

  const id = materialId.trim();
  if (!id) return { error: "Material inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: antes, error: fetchErr } = await supabase
    .from("materiais")
    .select("id, nome, descricao, quantidade, excluido_em")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!antes) return { error: "Material não encontrado." };
  if (antes.excluido_em) return { error: "Este material já foi excluído." };

  const { error } = await supabase
    .from("materiais")
    .update({
      excluido_em: new Date().toISOString(),
      excluido_por: user?.id ?? null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await registrarMaterialAuditoria({
    materialId: id,
    acao: "exclusao",
    antes: snapshotMaterial(antes),
    depois: null,
  });

  revalidatePath("/materiais");
  revalidatePath("/auditoria");
  return {};
}
