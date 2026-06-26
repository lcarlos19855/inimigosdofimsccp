const ACAO_LABELS: Record<string, string> = {
  criacao: "Criação",
  edicao: "Edição",
  ativacao: "Ativação",
  desativacao: "Desativação",
  exclusao: "Exclusão",
  registro_pagamento: "Registro de pagamento",
};

export function labelAcaoAuditoria(acao: string): string {
  return ACAO_LABELS[acao] ?? acao;
}

export function formatAuditoriaDados(
  dados: Record<string, unknown> | null
): string {
  if (!dados || Object.keys(dados).length === 0) return "—";

  const parts: string[] = [];
  for (const [key, value] of Object.entries(dados)) {
    if (value === null || value === undefined || value === "") continue;
    parts.push(`${formatKey(key)}: ${formatValue(value)}`);
  }

  return parts.length > 0 ? parts.join(" · ") : "—";
}

function formatKey(key: string): string {
  const labels: Record<string, string> = {
    id: "ID",
    nome: "Nome",
    cpf: "CPF",
    email: "E-mail",
    whatsapp: "WhatsApp",
    status: "Status",
    titular_id: "Titular",
    categoria_id: "Categoria",
    vencimento: "Vencimento",
    valor: "Valor",
    data_pagamento: "Pago em",
    observacao: "Observação",
    descricao: "Descrição",
    quantidade: "Quantidade",
  };
  return labels[key] ?? key;
}

function formatValue(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const d = value.slice(0, 10);
      const [y, m, day] = d.split("-");
      return `${day}/${m}/${y}`;
    }
    return value;
  }
  return JSON.stringify(value);
}

export function fmtAuditoriaData(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
