"use server";

import {
  createAdminClient,
  getServiceRoleMissingMessage,
} from "@/lib/supabase/admin";
import { codigoTurmaCorreto, validarCodigoTurma } from "@/lib/turma-codigo";

export { validarCodigoTurma };

export type ReceitaCategoria = {
  categoria: string;
  total: number;
  quantidade: number;
};

export type DespesaItem = {
  id: string;
  data: string;
  valor: number;
  descricao: string | null;
};

export type AcompanhamentoData = {
  saldoDisponivel: number;
  saldoCaixaManual: number;
  totalRecebimentosPago: number;
  receitaTotal: number;
  despesaTotal: number;
  receitasPorCategoria: ReceitaCategoria[];
  despesas: DespesaItem[];
  periodo: { de: string | null; ate: string | null };
};

function parseDateOnly(raw: string | null | undefined): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

function inRangeISO(
  iso: string | null | undefined,
  de: string | null,
  ate: string | null
): boolean {
  if (!iso) return false;
  const day = iso.slice(0, 10);
  if (de && day < de) return false;
  if (ate && day > ate) return false;
  return true;
}

export async function carregarAcompanhamento(
  codigo: string,
  dataDe?: string,
  dataAte?: string
): Promise<{ error?: string; data?: AcompanhamentoData }> {
  const valid = await validarCodigoTurma(codigo);
  if (valid.error) return { error: valid.error };
  if (!codigoTurmaCorreto(codigo)) {
    return { error: "Código da turma inválido." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { error: getServiceRoleMissingMessage() };
  }

  const de = parseDateOnly(dataDe);
  const ate = parseDateOnly(dataAte);

  const [caixaRes, pagosRes] = await Promise.all([
    admin.from("caixa_movimentos").select("id, tipo, valor, descricao, created_at"),
    admin
      .from("pagamentos")
      .select(
        `
        id,
        valor,
        data_pagamento,
        created_at,
        categorias ( nome )
      `
      )
      .eq("status", "pago")
      .is("excluido_em", null),
  ]);

  if (caixaRes.error) return { error: caixaRes.error.message };
  if (pagosRes.error) return { error: pagosRes.error.message };

  const movimentos = caixaRes.data ?? [];
  const pagos = pagosRes.data ?? [];

  // Saldo disponível: sempre o total atual (sem filtro de data)
  const saldoCaixaManual = movimentos.reduce((acc, m) => {
    const v = Number(m.valor);
    return acc + (m.tipo === "entrada" ? v : -v);
  }, 0);
  const totalRecebimentosPago = pagos.reduce(
    (acc, r) => acc + Number(r.valor),
    0
  );
  const saldoDisponivel = saldoCaixaManual + totalRecebimentosPago;

  // Receita no período: recebimentos pagos (por data_pagamento) + entradas manuais
  const pagosNoPeriodo = pagos.filter((p) =>
    inRangeISO(p.data_pagamento ?? p.created_at, de, ate)
  );
  const entradasNoPeriodo = movimentos.filter(
    (m) => m.tipo === "entrada" && inRangeISO(m.created_at, de, ate)
  );
  const saidasNoPeriodo = movimentos.filter(
    (m) => m.tipo === "saida" && inRangeISO(m.created_at, de, ate)
  );

  const porCategoria = new Map<string, { total: number; quantidade: number }>();
  for (const p of pagosNoPeriodo) {
    const catRaw = p.categorias;
    const nome =
      (Array.isArray(catRaw)
        ? catRaw[0]?.nome
        : (catRaw as { nome: string } | null)?.nome) ?? "Sem categoria";
    const cur = porCategoria.get(nome) ?? { total: 0, quantidade: 0 };
    cur.total += Number(p.valor);
    cur.quantidade += 1;
    porCategoria.set(nome, cur);
  }
  const totalEntradasManuais = entradasNoPeriodo.reduce(
    (acc, m) => acc + Number(m.valor),
    0
  );
  if (totalEntradasManuais > 0) {
    porCategoria.set("Entradas manuais (caixa)", {
      total: totalEntradasManuais,
      quantidade: entradasNoPeriodo.length,
    });
  }

  const receitasPorCategoria = Array.from(porCategoria.entries())
    .map(([categoria, v]) => ({
      categoria,
      total: v.total,
      quantidade: v.quantidade,
    }))
    .sort((a, b) => b.total - a.total);

  const receitaTotal = receitasPorCategoria.reduce((a, r) => a + r.total, 0);

  const despesas: DespesaItem[] = saidasNoPeriodo
    .map((m) => ({
      id: m.id,
      data: m.created_at,
      valor: Number(m.valor),
      descricao: m.descricao,
    }))
    .sort((a, b) => b.data.localeCompare(a.data));

  const despesaTotal = despesas.reduce((a, d) => a + d.valor, 0);

  return {
    data: {
      saldoDisponivel,
      saldoCaixaManual,
      totalRecebimentosPago,
      receitaTotal,
      despesaTotal,
      receitasPorCategoria,
      despesas,
      periodo: { de, ate },
    },
  };
}
