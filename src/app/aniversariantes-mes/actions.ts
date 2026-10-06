"use server";

import {
  createAdminClient,
  getServiceRoleMissingMessage,
} from "@/lib/supabase/admin";
import { codigoTurmaCorreto, validarCodigoTurma } from "@/lib/turma-codigo";

export { validarCodigoTurma };

export type AniversariantePublico = {
  id: string;
  nome: string;
  dia: number;
  mes: number;
  chave: string;
};

export async function carregarAniversariantesMes(
  codigo: string
): Promise<{ error?: string; data?: AniversariantePublico[]; mesLabel?: string }> {
  const valid = await validarCodigoTurma(codigo);
  if (valid.error) return { error: valid.error };
  if (!codigoTurmaCorreto(codigo)) {
    return { error: "Código da turma inválido." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { error: getServiceRoleMissingMessage() };
  }

  const agora = new Date();
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();
  const mesLabel = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const mesLabelFmt =
    mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);

  const [{ data: titulares, error: e1 }, { data: dependentes, error: e2 }] =
    await Promise.all([
      admin
        .from("titulares")
        .select("id, nome, data_nascimento")
        .is("excluido_em", null)
        .not("data_nascimento", "is", null),
      admin
        .from("dependentes")
        .select("id, nome, data_nascimento")
        .is("excluido_em", null)
        .not("data_nascimento", "is", null),
    ]);

  if (e1) return { error: e1.message };
  if (e2) return { error: e2.message };

  const lista: AniversariantePublico[] = [];

  for (const t of titulares ?? []) {
    if (!t.data_nascimento) continue;
    const [, m, d] = t.data_nascimento.slice(0, 10).split("-").map(Number);
    if (m !== mes) continue;
    lista.push({
      id: t.id,
      nome: t.nome,
      dia: d,
      mes: m,
      chave: `t-${t.id}`,
    });
  }

  for (const dep of dependentes ?? []) {
    if (!dep.data_nascimento) continue;
    const [, m, d] = dep.data_nascimento.slice(0, 10).split("-").map(Number);
    if (m !== mes) continue;
    lista.push({
      id: dep.id,
      nome: dep.nome,
      dia: d,
      mes: m,
      chave: `d-${dep.id}`,
    });
  }

  lista.sort((a, b) => a.dia - b.dia || a.nome.localeCompare(b.nome, "pt-BR"));

  return { data: lista, mesLabel: mesLabelFmt };
}
