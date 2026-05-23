import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface ExportPdfOptions {
  elementId: string;
  fileName?: string;
  period?: string;
}

export async function exportDashboardPdf({
  elementId,
  fileName = "dashboard-report.pdf",
  period = "",
}: ExportPdfOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  // Capture the element as a canvas
  const canvas = await html2canvas(element, {
    scale: 2,             // 2× for sharper output
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  // A4 page dimensions in mm
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 12;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Header ────────────────────────────────────────────────────────────
  pdf.setFillColor(37, 99, 235); // blue-600
  pdf.rect(0, 0, PAGE_W, 22, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.text("BOLAB – Dashboard Report", MARGIN, 14);

  if (period) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Period: ${period}`, PAGE_W - MARGIN, 14, { align: "right" });
  }

  // ── Date generated ────────────────────────────────────────────────────
  pdf.setTextColor(100, 116, 139); // slate-500
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  const now = new Date().toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  pdf.text(`Generated: ${now}`, MARGIN, 28);

  // ── Dashboard snapshot ────────────────────────────────────────────────
  const availableW = PAGE_W - MARGIN * 2;
  const imgW = canvas.width;
  const imgH = canvas.height;
  const ratio = imgW / imgH;

  const contentTop = 32;
  const maxContentH = PAGE_H - contentTop - MARGIN;

  let renderW = availableW;
  let renderH = availableW / ratio;

  // If taller than one page, scale down to fit
  if (renderH > maxContentH) {
    renderH = maxContentH;
    renderW = maxContentH * ratio;
  }

  const xOffset = MARGIN + (availableW - renderW) / 2;

  // If content overflows a single page, split into multiple pages
  const totalPages = Math.ceil(renderH / maxContentH);

  if (totalPages <= 1) {
    pdf.addImage(imgData, "PNG", xOffset, contentTop, renderW, renderH);
  } else {
    // Multi-page: slice the image per page
    const sliceH = (imgH / totalPages);
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage();

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = imgW;
      pageCanvas.height = Math.ceil(sliceH);
      const ctx = pageCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, Math.floor(sliceH * i),       // source x, y
          imgW, Math.ceil(sliceH),          // source w, h
          0, 0,                             // dest x, y
          imgW, Math.ceil(sliceH),          // dest w, h
        );
      }
      const pageImgData = pageCanvas.toDataURL("image/png");
      const pageRenderH = maxContentH;
      pdf.addImage(pageImgData, "PNG", xOffset, i === 0 ? contentTop : MARGIN, renderW, pageRenderH);
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────
  const pageCount = pdf.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    pdf.setPage(p);
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text(
      `Page ${p} / ${pageCount}  •  BOLAB Lab Room Management System`,
      PAGE_W / 2,
      PAGE_H - 5,
      { align: "center" },
    );
  }

  pdf.save(fileName);
}
