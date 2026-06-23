"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import {
  createAdminClient,
  getServiceRoleMissingMessage,
} from "@/lib/supabase/admin";

async function requireAdministradorAtivo() {
  const p = await getCurrentProfile();
  if (!p || p.perfil !== "administrador" || !p.ativo) {
    return null;
  }
  return p;
}

export type UsuarioFormState = { error?: string } | null;

export async function criarUsuario(
  _prev: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  const adminProfile = await requireAdministradorAtivo();
  if (!adminProfile) {
    return { error: "Apenas administradores ativos podem incluir usuários." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { error: getServiceRoleMissingMessage() };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const perfilRaw = String(formData.get("perfil") ?? "operador");
  const perfil =
    perfilRaw === "administrador" ? "administrador" : "operador";

  if (!nome) {
    return { error: "Nome é obrigatório." };
  }
  if (!email) {
    return { error: "E-mail é obrigatório." };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
    });

  if (createError) {
    return { error: createError.message };
  }
  if (!created.user?.id) {
    return { error: "Não foi possível criar o usuário." };
  }

  const userId = created.user.id;

  const { error: profileError } = await admin
    .from("profiles")
    .update({ perfil })
    .eq("id", userId);

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: profileError.message };
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function alternarUsuarioAtivo(
  userId: string,
  proximoAtivo: boolean
): Promise<{ error?: string }> {
  const adminProfile = await requireAdministradorAtivo();
  if (!adminProfile) {
    return { error: "Apenas administradores ativos podem alterar usuários." };
  }

  const id = userId.trim();
  if (!id) {
    return { error: "Usuário inválido." };
  }

  if (adminProfile.id === id && !proximoAtivo) {
    return { error: "Você não pode inativar a própria conta." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ativo: proximoAtivo })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/usuarios");
  return {};
}

export async function excluirUsuario(userId: string): Promise<{ error?: string }> {
  const adminProfile = await requireAdministradorAtivo();
  if (!adminProfile) {
    return { error: "Apenas administradores ativos podem excluir usuários." };
  }

  const id = userId.trim();
  if (!id) {
    return { error: "Usuário inválido." };
  }

  if (adminProfile.id === id) {
    return { error: "Você não pode excluir a própria conta." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { error: getServiceRoleMissingMessage() };
  }

  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/usuarios");
  revalidatePath("/dashboard");
  return {};
}
