/** Remove caracteres que quebram padrões ILIKE (% e _). */
export function personSearchQuery(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  const cleaned = t.replace(/[%_]/g, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseUuid(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t || !UUID_RE.test(t)) return null;
  return t;
}

export function parseMes(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t || !/^\d{4}-\d{2}$/.test(t)) return null;
  return t;
}

export function parseStatusPagamento(
  raw: string | undefined
): "pago" | "pendente" | "atrasado" | null {
  const t = raw?.trim();
  if (t === "pago" || t === "pendente" || t === "atrasado") return t;
  return null;
}

/** Primeiro dia do mês seguinte (YYYY-MM), para usar em vencimento < fim exclusivo. */
export function nextMonthFirstDay(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  if (m === 12) return `${y + 1}-01-01`;
  return `${y}-${String(m + 1).padStart(2, "0")}-01`;
}
