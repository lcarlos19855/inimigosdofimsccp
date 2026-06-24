import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type PagamentoPdfRow = {
  titular: string;
  categoria: string;
  vencimento: string;
  valor: string;
  status: string;
  pagoEm: string;
  lancamento: string;
};

async function loadWatermarkDataUrl(): Promise<string | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("watermark load failed"));
      el.src = "/marca-dagua-grupo.png";
    });

    const maxSide = 520;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.globalAlpha = 0.1;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function drawWatermark(doc: jsPDF, dataUrl: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const size = Math.min(pageWidth, pageHeight) * 0.55;
  const x = (pageWidth - size) / 2;
  const y = (pageHeight - size) / 2;
  doc.addImage(dataUrl, "PNG", x, y, size, size, undefined, "FAST");
}

function formatTotalBrl(total: number) {
  return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function exportPagamentosPdf(
  rows: PagamentoPdfRow[],
  filterSummary: string,
  totalValor: number
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const watermark = await loadWatermarkDataUrl();

  const title = "Pagamentos — Inimigos do Fim";
  const generatedAt = new Date().toLocaleString("pt-BR");

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Gerado em ${generatedAt}`, 14, 22);
  doc.text(`Filtros: ${filterSummary}`, 14, 27);
  doc.text(`Total (${rows.length} lançamento${rows.length === 1 ? "" : "s"}): ${formatTotalBrl(totalValor)}`, 14, 32);
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: 38,
    head: [
      [
        "Titular",
        "Categoria",
        "Vencimento",
        "Valor",
        "Status",
        "Pago em",
        "Lançamento",
      ],
    ],
    body: rows.map((r) => [
      r.titular,
      r.categoria,
      r.vencimento,
      r.valor,
      r.status,
      r.pagoEm,
      r.lancamento,
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak",
      cellWidth: "wrap",
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [71, 85, 105],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    bodyStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 28 },
      2: { cellWidth: 24 },
      3: { cellWidth: 24 },
      4: { cellWidth: 22 },
      5: { cellWidth: 24 },
      6: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });

  if (watermark) {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      drawWatermark(doc, watermark);
    }
  }

  const date = new Date().toISOString().slice(0, 10);
  doc.save(`pagamentos-${date}.pdf`);
}
