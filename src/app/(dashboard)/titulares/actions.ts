"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { verifyCurrentUserPassword } from "@/lib/auth/verify-password";
import {
  registrarMembroAuditoria,
  snapshotTitular,
} from "@/lib/membros-auditoria";
import { createClient } from "@/lib/supabase/server";

export type TitularFormState = { error?: string } | null;

async function requireActiveProfile() {
  const profile = await getCurrentProfile();
  if (!profile?.ativo) {
    return { error: "Sessão inválida ou usuário inativo." };
  }
  return { profile };
}

export async function createTitular(
  _prev: TitularFormState,
  formData: FormData
): Promise<TitularFormState> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const nome = String(formData.get("nome") ?? "").trim();
  const cpf = String(formData.get("cpf") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
  const status = formData.get("status") === "inativo" ? "inativo" : "ativo";

  if (!nome) {
    return { error: "Nome é obrigatório." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("titulares")
    .insert({ nome, cpf, email, whatsapp, status })
    .select("id, nome, cpf, email, whatsapp, status")
    .single();

  if (error) {
    return { error: error.message };
  }

  await registrarMembroAuditoria({
    entidade: "titular",
    entidadeId: data.id,
    acao: "criacao",
    depois: snapshotTitular(data),
  });

  revalidatePath("/titulares");
  revalidatePath("/auditoria");
  redirect("/titulares");
}

export async function updateTitular(
  titularId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const id = titularId.trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const cpf = String(formData.get("cpf") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;

  if (!id) return { error: "Titular inválido." };
  if (!nome) return { error: "Nome é obrigatório." };

  const supabase = await createClient();
  const { data: antes, error: fetchErr } = await supabase
    .from("titulares")
    .select("id, nome, cpf, email, whatsapp, status, excluido_em")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!antes) return { error: "Titular não encontrado." };
  if (antes.excluido_em) return { error: "Este titular foi excluído." };

  const { data: depois, error } = await supabase
    .from("titulares")
    .update({ nome, cpf, email, whatsapp })
    .eq("id", id)
    .select("id, nome, cpf, email, whatsapp, status")
    .single();

  if (error) return { error: error.message };

  await registrarMembroAuditoria({
    entidade: "titular",
    entidadeId: id,
    acao: "edicao",
    antes: snapshotTitular(antes),
    depois: snapshotTitular(depois),
  });

  revalidatePath("/titulares");
  revalidatePath("/dashboard");
  revalidatePath("/auditoria");
  return {};
}

export async function toggleTitularStatus(
  titularId: string
): Promise<{ error?: string }> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const id = titularId.trim();
  if (!id) return { error: "Titular inválido." };

  const supabase = await createClient();
  const { data: antes, error: fetchErr } = await supabase
    .from("titulares")
    .select("id, nome, cpf, email, whatsapp, status, excluido_em")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!antes) return { error: "Titular não encontrado." };
  if (antes.excluido_em) return { error: "Este titular foi excluído." };

  const novoStatus = antes.status === "ativo" ? "inativo" : "ativo";
  const { data: depois, error } = await supabase
    .from("titulares")
    .update({ status: novoStatus })
    .eq("id", id)
    .select("id, nome, cpf, email, whatsapp, status")
    .single();

  if (error) return { error: error.message };

  await registrarMembroAuditoria({
    entidade: "titular",
    entidadeId: id,
    acao: novoStatus === "ativo" ? "ativacao" : "desativacao",
    antes: snapshotTitular(antes),
    depois: snapshotTitular(depois),
  });

  revalidatePath("/titulares");
  revalidatePath("/dashboard");
  revalidatePath("/auditoria");
  return {};
}

export async function excluirTitular(
  titularId: string,
  password: string
): Promise<{ error?: string }> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const pass = await verifyCurrentUserPassword(password);
  if (pass.error) return pass;

  const id = titularId.trim();
  if (!id) return { error: "Titular inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: antes, error: fetchErr } = await supabase
    .from("titulares")
    .select("id, nome, cpf, email, whatsapp, status, excluido_em")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!antes) return { error: "Titular não encontrado." };
  if (antes.excluido_em) return { error: "Este titular já foi excluído." };

  const { error } = await supabase
    .from("titulares")
    .update({
      excluido_em: new Date().toISOString(),
      excluido_por: user?.id ?? null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await registrarMembroAuditoria({
    entidade: "titular",
    entidadeId: id,
    acao: "exclusao",
    antes: snapshotTitular(antes),
    depois: null,
  });

  revalidatePath("/titulares");
  revalidatePath("/dependentes");
  revalidatePath("/dashboard");
  revalidatePath("/auditoria");
  return {};
}
