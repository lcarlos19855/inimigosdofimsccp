"use client";

import { useState } from "react";
import {
  exportPagamentosPdf,
  type PagamentoPdfRow,
} from "@/lib/pagamentos-pdf";

type Props = {
  rows: PagamentoPdfRow[];
  filterSummary: string;
  totalValor: number;
};

export function ExportPagamentosPdfButton({
  rows,
  filterSummary,
  totalValor,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (rows.length === 0 || loading) return;
    setLoading(true);
    try {
      await exportPagamentosPdf(rows, filterSummary, totalValor);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleExport()}
      disabled={rows.length === 0 || loading}
      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Gerando PDF…" : "Baixar PDF"}
    </button>
  );
}
