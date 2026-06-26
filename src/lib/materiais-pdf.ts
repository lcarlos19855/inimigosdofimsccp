import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type MaterialPdfRow = {
  nome: string;
  descricao: string;
  quantidade: string;
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

export async function exportMateriaisPdf(
  rows: MaterialPdfRow[],
  filterSummary: string
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const watermark = await loadWatermarkDataUrl();

  const title = "Controle de Materiais — Inimigos do Fim";
  const generatedAt = new Date().toLocaleString("pt-BR");
  const totalQuantidade = rows.reduce(
    (sum, r) => sum + Number.parseInt(r.quantidade, 10),
    0
  );

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Gerado em ${generatedAt}`, 14, 22);
  doc.text(`Filtros: ${filterSummary}`, 14, 27);
  doc.text(
    `Total: ${rows.length} material${rows.length === 1 ? "" : "is"} · ${totalQuantidade} unidade${totalQuantidade === 1 ? "" : "s"}`,
    14,
    32
  );
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: 38,
    head: [["Nome", "Descrição", "Quantidade"]],
    body: rows.map((r) => [r.nome, r.descricao, r.quantidade]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
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
      0: { cellWidth: 45 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 28, halign: "center" },
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
  doc.save(`materiais-${date}.pdf`);
}
