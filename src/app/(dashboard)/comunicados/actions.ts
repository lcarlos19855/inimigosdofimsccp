"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { buildComunicadoHtml, sendBulkEmails } from "@/lib/mailjet";
import { createClient } from "@/lib/supabase/server";

export type ComunicadoFormState = {
  error?: string;
  success?: string;
} | null;

function collectEmails(rows: { email: string | null }[]) {
  const set = new Set<string>();
  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    if (email) set.add(email);
  }
  return Array.from(set);
}

export async function enviarComunicado(
  _prev: ComunicadoFormState,
  formData: FormData
): Promise<ComunicadoFormState> {
  const profile = await getCurrentProfile();
  if (!profile?.ativo) {
    return { error: "Sessão inválida ou usuário inativo." };
  }

  const assunto = String(formData.get("assunto") ?? "").trim();
  const mensagem = String(formData.get("mensagem") ?? "").trim();
  const enviarTitulares = formData.get("enviar_titulares") === "on";
  const enviarDependentes = formData.get("enviar_dependentes") === "on";

  if (!assunto) {
    return { error: "Informe o assunto do comunicado." };
  }
  if (!mensagem) {
    return { error: "Informe a mensagem." };
  }
  if (!enviarTitulares && !enviarDependentes) {
    return { error: "Selecione ao menos um grupo de destinatários." };
  }

  const supabase = await createClient();
  const emails: string[] = [];

  if (enviarTitulares) {
    const { data, error } = await supabase
      .from("titulares")
      .select("email")
      .eq("status", "ativo")
      .is("excluido_em", null)
      .not("email", "is", null);
    if (error) {
      return { error: error.message };
    }
    emails.push(...collectEmails(data ?? []));
  }

  if (enviarDependentes) {
    const { data, error } = await supabase
      .from("dependentes")
      .select("email")
      .eq("status", "ativo")
      .is("excluido_em", null)
      .not("email", "is", null);
    if (error) {
      return { error: error.message };
    }
    emails.push(...collectEmails(data ?? []));
  }

  const unique = Array.from(new Set(emails));
  if (unique.length === 0) {
    return {
      error:
        "Nenhum destinatário com e-mail cadastrado para os grupos selecionados.",
    };
  }

  const text = `${assunto}\n\n${mensagem}\n\n— Inimigos do Fim`;
  const html = buildComunicadoHtml(assunto, mensagem);
  const result = await sendBulkEmails(unique, assunto, text, html);

  if (result.sent === 0) {
    return {
      error:
        result.errors[0] ??
        "Nenhum e-mail foi enviado. Verifique as credenciais do Mailjet.",
    };
  }

  revalidatePath("/comunicados");

  if (result.failed > 0) {
    return {
      success: `${result.sent} e-mail(s) enviado(s). ${result.failed} falha(s).`,
    };
  }

  return {
    success: `Comunicado enviado para ${result.sent} destinatário(s).`,
  };
}
