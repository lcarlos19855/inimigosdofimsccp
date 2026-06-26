"use client";

import { useState } from "react";
import {
  exportMateriaisPdf,
  type MaterialPdfRow,
} from "@/lib/materiais-pdf";

type Props = {
  rows: MaterialPdfRow[];
  filterSummary: string;
};

export function ExportMateriaisPdfButton({ rows, filterSummary }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (rows.length === 0 || loading) return;
    setLoading(true);
    try {
      await exportMateriaisPdf(rows, filterSummary);
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
