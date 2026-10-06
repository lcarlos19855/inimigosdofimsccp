"use server";

import { timingSafeEqual } from "crypto";
import { validarPessoaPorIdade } from "@/lib/idade";
import {
  createAdminClient,
  getServiceRoleMissingMessage,
} from "@/lib/supabase/admin";

export type CadastroIntegranteState = {
  error?: string;
  success?: boolean;
} | null;

type DependentePayload = {
  nome: string;
  cpf: string;
  email: string;
  whatsapp: string;
  data_nascimento: string;
};

function codigoCorreto(informado: string): boolean {
  const esperado = process.env.CADASTRO_TURMA_CODIGO?.trim() ?? "";
  if (!esperado) return false;
  const a = Buffer.from(informado.trim());
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function parseDependentes(formData: FormData): DependentePayload[] {
  const nomes = formData.getAll("dep_nome").map((v) => String(v));
  const cpfs = formData.getAll("dep_cpf").map((v) => String(v));
  const emails = formData.getAll("dep_email").map((v) => String(v));
  const whatsapps = formData.getAll("dep_whatsapp").map((v) => String(v));
  const nascimentos = formData
    .getAll("dep_data_nascimento")
    .map((v) => String(v));

  const count = Math.max(
    nomes.length,
    cpfs.length,
    emails.length,
    whatsapps.length,
    nascimentos.length
  );

  const list: DependentePayload[] = [];
  for (let i = 0; i < count; i++) {
    const nome = (nomes[i] ?? "").trim();
    const data_nascimento = (nascimentos[i] ?? "").trim();
    // Ignora linhas completamente vazias
    if (!nome && !data_nascimento) continue;
    list.push({
      nome,
      cpf: (cpfs[i] ?? "").trim(),
      email: (emails[i] ?? "").trim(),
      whatsapp: (whatsapps[i] ?? "").trim(),
      data_nascimento,
    });
  }
  return list;
}

export async function enviarCadastroIntegrante(
  _prev: CadastroIntegranteState,
  formData: FormData
): Promise<CadastroIntegranteState> {
  // Honeypot
  if (String(formData.get("website") ?? "").trim()) {
    return { success: true };
  }

  if (!process.env.CADASTRO_TURMA_CODIGO?.trim()) {
    return {
      error:
        "Cadastro público ainda não configurado. Peça ao administrador para definir o código da turma.",
    };
  }

  const codigo = String(formData.get("codigo") ?? "");
  if (!codigoCorreto(codigo)) {
    return { error: "Código da turma inválido." };
  }

  const titular = {
    nome: String(formData.get("titular_nome") ?? "").trim(),
    cpf: String(formData.get("titular_cpf") ?? "").trim() || null,
    email: String(formData.get("titular_email") ?? "").trim() || null,
    whatsapp: String(formData.get("titular_whatsapp") ?? "").trim() || null,
    data_nascimento: String(formData.get("titular_data_nascimento") ?? "").trim(),
  };

  const errTitular = validarPessoaPorIdade(
    {
      nome: titular.nome,
      cpf: titular.cpf,
      email: titular.email,
      whatsapp: titular.whatsapp,
      data_nascimento: titular.data_nascimento,
    },
    "Titular"
  );
  if (errTitular) return { error: errTitular };

  const dependentes = parseDependentes(formData);
  for (let i = 0; i < dependentes.length; i++) {
    const d = dependentes[i];
    const err = validarPessoaPorIdade(
      {
        nome: d.nome,
        cpf: d.cpf || null,
        email: d.email || null,
        whatsapp: d.whatsapp || null,
        data_nascimento: d.data_nascimento,
      },
      `Dependente ${i + 1}`
    );
    if (err) return { error: err };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { error: getServiceRoleMissingMessage() };
  }

  const { data: inscricao, error } = await admin
    .from("inscricoes")
    .insert({
      titular_nome: titular.nome,
      titular_cpf: titular.cpf,
      titular_email: titular.email,
      titular_whatsapp: titular.whatsapp,
      titular_data_nascimento: titular.data_nascimento,
      status: "pendente",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (dependentes.length > 0) {
    const { error: depErr } = await admin.from("inscricao_dependentes").insert(
      dependentes.map((d) => ({
        inscricao_id: inscricao.id,
        nome: d.nome,
        cpf: d.cpf || null,
        email: d.email || null,
        whatsapp: d.whatsapp || null,
        data_nascimento: d.data_nascimento,
      }))
    );
    if (depErr) {
      await admin.from("inscricoes").delete().eq("id", inscricao.id);
      return { error: depErr.message };
    }
  }

  return { success: true };
}
