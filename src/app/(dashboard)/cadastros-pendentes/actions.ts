"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import {
  registrarMembroAuditoria,
  snapshotDependente,
  snapshotTitular,
} from "@/lib/membros-auditoria";
import { createClient } from "@/lib/supabase/server";

async function requireActiveProfile() {
  const profile = await getCurrentProfile();
  if (!profile?.ativo) {
    return { error: "Sessão inválida ou usuário inativo." };
  }
  return { profile };
}

export async function aprovarInscricao(
  inscricaoId: string
): Promise<{ error?: string }> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const id = inscricaoId.trim();
  if (!id) return { error: "Inscrição inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: inscricao, error: fetchErr } = await supabase
    .from("inscricoes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!inscricao) return { error: "Inscrição não encontrada." };
  if (inscricao.status !== "pendente") {
    return { error: "Esta inscrição já foi revisada." };
  }

  const { data: deps, error: depsErr } = await supabase
    .from("inscricao_dependentes")
    .select("*")
    .eq("inscricao_id", id);

  if (depsErr) return { error: depsErr.message };

  const { data: titular, error: titErr } = await supabase
    .from("titulares")
    .insert({
      nome: inscricao.titular_nome,
      cpf: inscricao.titular_cpf,
      email: inscricao.titular_email,
      whatsapp: inscricao.titular_whatsapp,
      data_nascimento: inscricao.titular_data_nascimento,
      status: "ativo",
    })
    .select("id, nome, cpf, email, whatsapp, data_nascimento, status")
    .single();

  if (titErr) return { error: titErr.message };

  await registrarMembroAuditoria({
    entidade: "titular",
    entidadeId: titular.id,
    acao: "criacao",
    depois: snapshotTitular(titular),
  });

  for (const d of deps ?? []) {
    const { data: dep, error: depErr } = await supabase
      .from("dependentes")
      .insert({
        titular_id: titular.id,
        nome: d.nome,
        cpf: d.cpf,
        email: d.email,
        whatsapp: d.whatsapp,
        data_nascimento: d.data_nascimento,
        status: "ativo",
      })
      .select(
        "id, titular_id, nome, cpf, email, whatsapp, data_nascimento, status"
      )
      .single();

    if (depErr) {
      return {
        error: `Titular criado, mas falhou ao criar dependente ${d.nome}: ${depErr.message}`,
      };
    }

    await registrarMembroAuditoria({
      entidade: "dependente",
      entidadeId: dep.id,
      acao: "criacao",
      depois: snapshotDependente(dep),
    });
  }

  const { error: updErr } = await supabase
    .from("inscricoes")
    .update({
      status: "aprovado",
      revisado_por: user?.id ?? null,
      revisado_em: new Date().toISOString(),
      motivo_rejeicao: null,
    })
    .eq("id", id);

  if (updErr) return { error: updErr.message };

  revalidatePath("/cadastros-pendentes");
  revalidatePath("/titulares");
  revalidatePath("/dependentes");
  revalidatePath("/dashboard");
  revalidatePath("/auditoria");
  return {};
}

export async function rejeitarInscricao(
  inscricaoId: string,
  motivo: string
): Promise<{ error?: string }> {
  const auth = await requireActiveProfile();
  if ("error" in auth) return auth;

  const id = inscricaoId.trim();
  if (!id) return { error: "Inscrição inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: inscricao, error: fetchErr } = await supabase
    .from("inscricoes")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!inscricao) return { error: "Inscrição não encontrada." };
  if (inscricao.status !== "pendente") {
    return { error: "Esta inscrição já foi revisada." };
  }

  const { error } = await supabase
    .from("inscricoes")
    .update({
      status: "rejeitado",
      motivo_rejeicao: motivo.trim() || null,
      revisado_por: user?.id ?? null,
      revisado_em: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/cadastros-pendentes");
  return {};
}
