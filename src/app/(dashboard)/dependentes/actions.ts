"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { verifyCurrentUserPassword } from "@/lib/auth/verify-password";
import {
  registrarMembroAuditoria,
  snapshotDependente,
} from "@/lib/membros-auditoria";
import { createClient } from "@/lib/supabase/server";

export type DependenteFormState = { error?: string } | null;

async function requireActiveProfile() {
  const profile = await getCurrentProfile();
  if (!profile?.ativo) {
    return { error: "Sessão inválida ou usuário inativo." };
  }
  return { profile };
}

export async function createDependente(
  _prev: DependenteFormState,
  formData: FormData
): Promise<DependenteFormState> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

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
  const { data, error } = await supabase
    .from("dependentes")
    .insert({ titular_id: titularId, nome, email, whatsapp, status })
    .select("id, titular_id, nome, email, whatsapp, status")
    .single();

  if (error) {
    return { error: error.message };
  }

  await registrarMembroAuditoria({
    entidade: "dependente",
    entidadeId: data.id,
    acao: "criacao",
    depois: snapshotDependente(data),
  });

  revalidatePath("/dependentes");
  revalidatePath("/dashboard");
  redirect("/dependentes");
}

export async function updateDependente(
  dependenteId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const id = dependenteId.trim();
  const titularId = String(formData.get("titular_id") ?? "").trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;

  if (!id) return { error: "Dependente inválido." };
  if (!titularId) return { error: "Selecione um titular." };
  if (!nome) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { data: antes, error: fetchErr } = await supabase
    .from("dependentes")
    .select("id, titular_id, nome, email, whatsapp, status, excluido_em")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!antes) return { error: "Dependente não encontrado." };
  if (antes.excluido_em) return { error: "Este dependente foi excluído." };

  const { data: depois, error } = await supabase
    .from("dependentes")
    .update({ titular_id: titularId, nome, email, whatsapp })
    .eq("id", id)
    .select("id, titular_id, nome, email, whatsapp, status")
    .single();

  if (error) return { error: error.message };

  await registrarMembroAuditoria({
    entidade: "dependente",
    entidadeId: id,
    acao: "edicao",
    antes: snapshotDependente(antes),
    depois: snapshotDependente(depois),
  });

  revalidatePath("/dependentes");
  revalidatePath("/dashboard");
  return {};
}

export async function toggleDependenteStatus(
  dependenteId: string
): Promise<{ error?: string }> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const id = dependenteId.trim();
  if (!id) return { error: "Dependente inválido." };

  const supabase = await createClient();
  const { data: antes, error: fetchErr } = await supabase
    .from("dependentes")
    .select("id, titular_id, nome, email, whatsapp, status, excluido_em")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!antes) return { error: "Dependente não encontrado." };
  if (antes.excluido_em) return { error: "Este dependente foi excluído." };

  const novoStatus = antes.status === "ativo" ? "inativo" : "ativo";
  const { data: depois, error } = await supabase
    .from("dependentes")
    .update({ status: novoStatus })
    .eq("id", id)
    .select("id, titular_id, nome, email, whatsapp, status")
    .single();

  if (error) return { error: error.message };

  await registrarMembroAuditoria({
    entidade: "dependente",
    entidadeId: id,
    acao: novoStatus === "ativo" ? "ativacao" : "desativacao",
    antes: snapshotDependente(antes),
    depois: snapshotDependente(depois),
  });

  revalidatePath("/dependentes");
  revalidatePath("/dashboard");
  return {};
}

export async function excluirDependente(
  dependenteId: string,
  password: string
): Promise<{ error?: string }> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const pass = await verifyCurrentUserPassword(password);
  if (pass.error) return pass;

  const id = dependenteId.trim();
  if (!id) return { error: "Dependente inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: antes, error: fetchErr } = await supabase
    .from("dependentes")
    .select("id, titular_id, nome, email, whatsapp, status, excluido_em")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!antes) return { error: "Dependente não encontrado." };
  if (antes.excluido_em) return { error: "Este dependente já foi excluído." };

  const { error } = await supabase
    .from("dependentes")
    .update({
      excluido_em: new Date().toISOString(),
      excluido_por: user?.id ?? null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await registrarMembroAuditoria({
    entidade: "dependente",
    entidadeId: id,
    acao: "exclusao",
    antes: snapshotDependente(antes),
    depois: null,
  });

  revalidatePath("/dependentes");
  revalidatePath("/dashboard");
  return {};
}
