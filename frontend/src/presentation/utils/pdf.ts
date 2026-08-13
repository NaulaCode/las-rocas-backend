import jsPDF from 'jspdf';
import { TouristicService } from '../../domain/entities/TouristicService';
import { News } from '../../domain/entities/News';
import { Reservation } from '../../domain/entities/Reservation';
import { TouristicAttraction } from '../../domain/entities/TouristicAttraction';
import { PageContent } from '../../domain/entities/Organization';
import { ChatbotQuestion } from '../../domain/entities/ChatbotQuestion';

const C = {
  primary: [26, 54, 93] as [number, number, number],
  accent: [241, 101, 33] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  error: [239, 68, 68] as [number, number, number],
  info: [59, 130, 246] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  textLight: [100, 116, 139] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const PAGE_W = 210;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CELL_PAD = 3;

function headerBar(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, PAGE_W, 45, 'F');
  doc.setFillColor(...C.accent);
  doc.rect(0, 43, PAGE_W, 3, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN, 24);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, MARGIN, 35);
}

function footer(doc: jsPDF) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...C.textLight);
    doc.text(`Página ${i} de ${n}`, PAGE_W - MARGIN, 288, { align: 'right' });
    doc.text(`Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, MARGIN, 288);
  }
}

function sectionTitle(doc: jsPDF, text: string, y: number) {
  if (y > 260) { doc.addPage(); return MARGIN + 10; }
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 10;
  doc.setTextColor(...C.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(text, MARGIN, y);
  return y + 10;
}

function drawSummaryCards(doc: jsPDF, y: number, cards: { label: string; value: string; color: [number, number, number] }[]) {
  const gap = 6;
  const cardW = (CONTENT_W - (cards.length - 1) * gap) / cards.length;
  cards.forEach((c, i) => {
    const x = MARGIN + i * (cardW + gap);
    doc.setFillColor(...c.color);
    doc.roundedRect(x, y, cardW, 24, 3, 3, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(c.value.length > 6 ? 12 : 18);
    doc.setFont('helvetica', 'bold');
    doc.text(c.value, x + cardW / 2, y + 10, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(c.label.toUpperCase(), x + cardW / 2, y + 19, { align: 'center' });
  });
  return y + 32;
}

function fitText(doc: jsPDF, text: string, maxWidth: number): string {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let truncated = text;
  while (doc.getTextWidth(truncated + '...') > maxWidth && truncated.length > 1) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

function drawTable(
  doc: jsPDF,
  startY: number,
  headers: { label: string; x: number; w: number }[],
  rows: { cols: (string | number)[]; color?: [number, number, number] }[],
  rowH = 8,
  fontSize = 8,
) {
  let y = startY;
  const headerH = 9;

  function drawHeader() {
    doc.setFillColor(...C.primary);
    doc.rect(MARGIN, y - 5, CONTENT_W, headerH, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h) => doc.text(h.label, h.x + CELL_PAD, y));
    y += headerH + 1;
  }

  drawHeader();
  doc.setFont('helvetica', 'normal');

  rows.forEach((row, ri) => {
    if (y > 275) { doc.addPage(); y = MARGIN + 5; drawHeader(); }
    const bg = ri % 2 === 0 ? [255, 255, 255] : [245, 247, 250];
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(MARGIN, y - 4, CONTENT_W, rowH, 'F');
    doc.setFontSize(fontSize);
    row.cols.forEach((val, ci) => {
      const h = headers[ci];
      if (row.color && ci === row.cols.length - 1) doc.setTextColor(...row.color);
      else doc.setTextColor(...C.text);
      const cellW = ci < headers.length - 1 ? h.w - CELL_PAD : 999;
      const txt = fitText(doc, String(val), cellW);
      doc.text(txt, h.x + CELL_PAD, y);
    });
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y + rowH - 4, PAGE_W - MARGIN, y + rowH - 4);
    y += rowH + 2;
  });

  return y + 6;
}

function drawWrappedTable(
  doc: jsPDF,
  startY: number,
  headers: { label: string; x: number; w: number }[],
  rows: { cols: (string | number)[]; color?: [number, number, number] }[],
  fontSize = 8,
) {
  let y = startY;
  const headerH = 9;
  const rowPad = 4;
  const lineH = fontSize * 0.45;

  function drawHeader() {
    doc.setFillColor(...C.primary);
    doc.rect(MARGIN, y - 5, CONTENT_W, headerH, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h) => doc.text(h.label, h.x + CELL_PAD, y));
    y += headerH + 1;
  }

  function drawRow(row: { cols: (string | number)[]; color?: [number, number, number] }) {
    const linesPerCol: string[][] = headers.map((h, ci) => {
      const cellW = ci < headers.length - 1 ? h.w - CELL_PAD : 999;
      const txt = String(row.cols[ci] ?? '');
      return doc.splitTextToSize(txt, cellW) as string[];
    });
    const maxLines = Math.max(...linesPerCol.map((l) => l.length));
    const rowH = maxLines * lineH + rowPad * 2;
    if (y + rowH > 275) {
      doc.addPage();
      y = MARGIN + 5;
      drawHeader();
    }
    const bg: [number, number, number] = [255, 255, 255];
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(MARGIN, y - 4, CONTENT_W, rowH, 'F');
    doc.setFontSize(fontSize);
    headers.forEach((h, ci) => {
      const lines = linesPerCol[ci];
      if (row.color && ci === row.cols.length - 1) doc.setTextColor(...row.color);
      else doc.setTextColor(...C.text);
      const startY = y + rowPad;
      lines.forEach((ln, li) => doc.text(ln, h.x + CELL_PAD, startY + li * lineH));
    });
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y + rowH - 4, PAGE_W - MARGIN, y + rowH - 4);
    y += rowH + 2;
  }

  drawHeader();
  rows.forEach(drawRow);
  return y + 6;
}

const statusColors: Record<string, [number, number, number]> = {
  pendiente: C.warning,
  confirmada: C.info,
  completada: C.success,
  cancelada: C.error,
  activo: C.success,
  inactivo: C.textLight,
  publicado: C.success,
  borrador: C.warning,
};

const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  activo: 'Activo',
  inactivo: 'Inactivo',
  publicado: 'Publicado',
  borrador: 'Borrador',
};

export function exportServicesPDF(services: TouristicService[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  headerBar(doc, 'Reporte de Servicios', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} · Total: ${services.length} servicios`);

  let y = 60;
  const active = services.filter((s) => s.isActive).length;
  const inactive = services.length - active;
  const cats = [...new Set(services.map((s) => s.category))];

  y = drawSummaryCards(doc, y, [
    { label: 'Activos', value: String(active), color: C.success },
    { label: 'Inactivos', value: String(inactive), color: C.textLight },
    { label: 'Categorías', value: String(cats.length), color: C.info },
  ]);

  y = sectionTitle(doc, 'Detalle de Servicios', y);

  const headers = [
    { label: 'NOMBRE', x: MARGIN, w: 42 },
    { label: 'CATEGORÍA', x: MARGIN + 42, w: 28 },
    { label: 'PRECIO', x: MARGIN + 70, w: 22 },
    { label: 'DURACIÓN', x: MARGIN + 92, w: 20 },
    { label: 'UBICACIÓN', x: MARGIN + 112, w: 32 },
    { label: 'ESTADO', x: MARGIN + 144, w: 18 },
  ];

  const rows = services.map((s) => ({
    cols: [s.name, s.category, s.price ? `$${s.price}` : '-', s.duration || '-', s.location || '-', s.isActive ? 'Activo' : 'Inactivo'],
    color: s.isActive ? C.success : C.textLight,
  }));

  drawTable(doc, y, headers, rows, 8, 8);
  footer(doc);
  doc.save(`servicios_${new Date().toISOString().split('T')[0]}.pdf`);
  return doc.output('blob');
}

export function exportNewsPDF(news: News[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  headerBar(doc, 'Reporte de Noticias y Eventos', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} · Total: ${news.length} publicaciones`);

  let y = 60;
  const published = news.filter((n) => n.isPublished).length;
  const drafts = news.length - published;
  const types = [...new Set(news.map((n) => n.type))];

  y = drawSummaryCards(doc, y, [
    { label: 'Publicadas', value: String(published), color: C.success },
    { label: 'Borradores', value: String(drafts), color: C.warning },
    { label: 'Tipos', value: String(types.length), color: C.info },
  ]);

  y = sectionTitle(doc, 'Detalle de Publicaciones', y);

  const headers = [
    { label: 'TÍTULO', x: MARGIN, w: 58 },
    { label: 'TIPO', x: MARGIN + 58, w: 24 },
    { label: 'FECHA EVENTO', x: MARGIN + 82, w: 28 },
    { label: 'UBICACIÓN', x: MARGIN + 110, w: 32 },
    { label: 'ESTADO', x: MARGIN + 142, w: 18 },
  ];

  const rows = news.map((n) => ({
    cols: [n.title.length > 50 ? n.title.slice(0, 48) + '...' : n.title, n.type, n.eventDate ? new Date(n.eventDate).toLocaleDateString('es-EC', { timeZone: 'UTC' }) : '-', n.location || '-', n.isPublished ? 'Publicado' : 'Borrador'],
    color: n.isPublished ? C.success : C.warning,
  }));

  drawTable(doc, y, headers, rows, 8, 8);
  footer(doc);
  doc.save(`noticias_${new Date().toISOString().split('T')[0]}.pdf`);
  return doc.output('blob');
}

export function exportReservationsPDF(reservations: Reservation[], services: TouristicService[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  headerBar(doc, 'Reporte de Reservas', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} · Total: ${reservations.length} reservas`);

  let y = 60;
  const pendientes = reservations.filter((r) => r.status === 'pendiente').length;
  const confirmadas = reservations.filter((r) => r.status === 'confirmada').length;
  const completadas = reservations.filter((r) => r.status === 'completada').length;
  const canceladas = reservations.filter((r) => r.status === 'cancelada').length;

  y = drawSummaryCards(doc, y, [
    { label: 'Pendientes', value: String(pendientes), color: C.warning },
    { label: 'Confirmadas', value: String(confirmadas), color: C.info },
    { label: 'Completadas', value: String(completadas), color: C.success },
    { label: 'Canceladas', value: String(canceladas), color: C.error },
  ]);

  y = sectionTitle(doc, 'Detalle de Reservas', y);

  const headers = [
    { label: 'CLIENTE', x: MARGIN, w: 30 },
    { label: 'EMAIL', x: MARGIN + 30, w: 40 },
    { label: 'SERVICIO', x: MARGIN + 70, w: 30 },
    { label: 'FECHA', x: MARGIN + 100, w: 22 },
    { label: 'PERS.', x: MARGIN + 122, w: 12 },
    { label: 'ESTADO', x: MARGIN + 134, w: 18 },
    { label: 'TELÉFONO', x: MARGIN + 152, w: 22 },
  ];

  const rows = reservations.map((r) => {
    const s = services.find((sv) => sv.id === r.serviceId);
    return {
      cols: [
        r.userName.length > 20 ? r.userName.slice(0, 18) + '...' : r.userName,
        r.userEmail.length > 26 ? r.userEmail.slice(0, 24) + '...' : r.userEmail,
        (s?.name || r.serviceName || '-').length > 20 ? (s?.name || r.serviceName || '-').slice(0, 18) + '...' : (s?.name || r.serviceName || '-'),
        r.preferredDate ? new Date(r.preferredDate).toLocaleDateString('es-EC') : '-',
        String(r.numberOfPeople || 1),
        statusLabels[r.status] || r.status,
        r.userPhone || '-',
      ],
      color: statusColors[r.status] || C.textLight,
    };
  });

  drawTable(doc, y, headers, rows, 8, 8);
  footer(doc);
  doc.save(`reservas_${new Date().toISOString().split('T')[0]}.pdf`);
  return doc.output('blob');
}

export function exportAttractionsPDF(attractions: TouristicAttraction[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  headerBar(doc, 'Reporte de Atractivos Turísticos', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} · Total: ${attractions.length} atractivos`);

  let y = 60;
  const active = attractions.filter((a) => a.isActive).length;
  const inactive = attractions.length - active;
  const cats = [...new Set(attractions.map((a) => a.category))];

  y = drawSummaryCards(doc, y, [
    { label: 'Activos', value: String(active), color: C.success },
    { label: 'Inactivos', value: String(inactive), color: C.textLight },
    { label: 'Categorías', value: String(cats.length), color: C.info },
  ]);

  y = sectionTitle(doc, 'Detalle de Atractivos', y);

  const headers = [
    { label: 'NOMBRE', x: MARGIN, w: 38 },
    { label: 'CATEGORÍA', x: MARGIN + 38, w: 26 },
    { label: 'UBICACIÓN', x: MARGIN + 64, w: 30 },
    { label: 'PRECIO', x: MARGIN + 94, w: 20 },
    { label: 'DURACIÓN', x: MARGIN + 114, w: 18 },
    { label: 'HORARIO', x: MARGIN + 132, w: 28 },
    { label: 'ESTADO', x: MARGIN + 160, w: 16 },
  ];

  const rows = attractions.map((a) => ({
    cols: [
      a.name.length > 22 ? a.name.slice(0, 20) + '...' : a.name,
      a.category,
      a.location || '-',
      a.price ? `$${a.price}` : '-',
      a.duration || '-',
      a.schedule || '-',
      a.isActive ? 'Activo' : 'Inactivo',
    ],
    color: a.isActive ? C.success : C.textLight,
  }));

  drawTable(doc, y, headers, rows, 8, 8);
  footer(doc);
  doc.save(`atractivos_${new Date().toISOString().split('T')[0]}.pdf`);
  return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPDF(reservations: Reservation[], services: TouristicService[]) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    headerBar(doc, 'Reporte de Reservas', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} · Total: ${reservations.length} reservas`);

    let y = 60;
    const pendientes = reservations.filter((r) => r.status === 'pendiente').length;
    const confirmadas = reservations.filter((r) => r.status === 'confirmada').length;
    const completadas = reservations.filter((r) => r.status === 'completada').length;
    const canceladas = reservations.filter((r) => r.status === 'cancelada').length;

    y = drawSummaryCards(doc, y, [
      { label: 'Pendientes', value: String(pendientes), color: C.warning },
      { label: 'Confirmadas', value: String(confirmadas), color: C.info },
      { label: 'Completadas', value: String(completadas), color: C.success },
      { label: 'Canceladas', value: String(canceladas), color: C.error },
    ]);

    y = sectionTitle(doc, 'Resumen Ejecutivo', y);
    if (y > 270) y = MARGIN;
    doc.setTextColor(...C.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const convRate = reservations.length > 0 ? Math.round((confirmadas + completadas) / reservations.length * 100) : 0;
    const lines = [
      `• Reservas pendientes por confirmar: ${pendientes} (${reservations.length > 0 ? Math.round(pendientes / reservations.length * 100) : 0}%)`,
      `• Reservas confirmadas: ${confirmadas} (${reservations.length > 0 ? Math.round(confirmadas / reservations.length * 100) : 0}%)`,
      `• Reservas completadas: ${completadas} (${reservations.length > 0 ? Math.round(completadas / reservations.length * 100) : 0}%)`,
      `• Reservas canceladas: ${canceladas} (${reservations.length > 0 ? Math.round(canceladas / reservations.length * 100) : 0}%)`,
      `• Tasa de conversión (confirmadas + completadas): ${convRate}%`,
    ];
    lines.forEach((l) => {
      if (y > 278) { doc.addPage(); y = MARGIN; }
      doc.text(l, MARGIN + 3, y);
      y += 7;
    });

    y = sectionTitle(doc, 'Detalle de Reservas', y + 6);

    const headers = [
      { label: 'CLIENTE', x: MARGIN, w: 30 },
      { label: 'EMAIL', x: MARGIN + 30, w: 40 },
      { label: 'SERVICIO', x: MARGIN + 70, w: 30 },
      { label: 'FECHA', x: MARGIN + 100, w: 22 },
      { label: 'PERS.', x: MARGIN + 122, w: 12 },
      { label: 'ESTADO', x: MARGIN + 134, w: 18 },
    ];

    const rows = reservations.map((r) => {
      const s = services.find((sv) => sv.id === r.serviceId);
      return {
        cols: [
          r.userName.length > 20 ? r.userName.slice(0, 18) + '...' : r.userName,
          r.userEmail.length > 26 ? r.userEmail.slice(0, 24) + '...' : r.userEmail,
          (s?.name || r.serviceName || '-').length > 20 ? (s?.name || r.serviceName || '-').slice(0, 18) + '...' : (s?.name || r.serviceName || '-'),
          r.preferredDate ? new Date(r.preferredDate).toLocaleDateString('es-EC') : '-',
          String(r.numberOfPeople || 1),
          statusLabels[r.status] || r.status,
        ],
        color: statusColors[r.status] || C.textLight,
      };
    });

    drawTable(doc, y, headers, rows, 8, 8);
    footer(doc);
    doc.save(`reservas_${new Date().toISOString().split('T')[0]}.pdf`);
    return doc.output('blob');
  } catch (e) { console.error('PDF error:', e); alert('Error al generar PDF: ' + e); }
}

export function generateFullReport(
  services: TouristicService[],
  news: News[],
  reservations: Reservation[],
  questions: ChatbotQuestion[],
  pageContent: PageContent,
) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    headerBar(doc, 'Reporte Completo de la Plataforma', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);

    let y = 60;
    const pendientes = reservations.filter((r) => r.status === 'pendiente').length;
    const confirmadas = reservations.filter((r) => r.status === 'confirmada').length;
    const completadas = reservations.filter((r) => r.status === 'completada').length;
    const canceladas = reservations.filter((r) => r.status === 'cancelada').length;
    const totalRev = (pageContent.reviews || []).length;
    const approvedRev = (pageContent.reviews || []).filter((r: any) => r.approved).length;

    y = drawSummaryCards(doc, y, [
      { label: 'Servicios', value: String(services.length), color: C.primary },
      { label: 'Reservas', value: String(reservations.length), color: C.info },
      { label: 'Noticias', value: String(news.length), color: C.accent },
      { label: 'Reseñas', value: String(totalRev), color: C.success },
    ]);

    y = sectionTitle(doc, '1. Resumen Ejecutivo', y);
    doc.setTextColor(...C.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const execItems = [
      { label: 'Servicios', value: `${services.length} totales (${services.filter((s) => s.isActive).length} activos, ${services.filter((s) => !s.isActive).length} inactivos)` },
      { label: 'Noticias', value: `${news.length} totales (${news.filter((n) => n.isPublished).length} publicadas, ${news.filter((n) => !n.isPublished).length} borradores)` },
      { label: 'Reservas', value: `${reservations.length} totales — Pendientes: ${pendientes}, Confirmadas: ${confirmadas}, Completadas: ${completadas}, Canceladas: ${canceladas}` },
      { label: 'Conversión', value: `${reservations.length > 0 ? Math.round((confirmadas + completadas) / reservations.length * 100) : 0}% (confirmadas + completadas)` },
      { label: 'Preguntas FAQ', value: `${questions.length}` },
      { label: 'Reseñas', value: `${totalRev} totales (${approvedRev} aprobadas, ${totalRev - approvedRev} pendientes)` },
    ];

    execItems.forEach((item) => {
      if (y > 278) { doc.addPage(); y = MARGIN + 10; }
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, MARGIN, y);
      const lw = doc.getTextWidth(item.label + '  ');
      doc.setFont('helvetica', 'normal');
      doc.text(item.value, MARGIN + lw, y);
      y += 8;
    });

    y = sectionTitle(doc, '2. Detalle de Servicios', y + 6);
    const svcHeaders = [
      { label: 'NOMBRE', x: MARGIN, w: 42 },
      { label: 'CATEGORÍA', x: MARGIN + 42, w: 28 },
      { label: 'PRECIO', x: MARGIN + 70, w: 22 },
      { label: 'ESTADO', x: MARGIN + 92, w: 18 },
    ];
    const svcRows = services.map((s) => ({
      cols: [s.name, s.category, s.price ? `$${s.price}` : '-', s.isActive ? 'Activo' : 'Inactivo'],
      color: s.isActive ? C.success : C.textLight,
    }));
    y = drawTable(doc, y, svcHeaders, svcRows, 8, 8);

    y = sectionTitle(doc, '3. Detalle de Reservas', y);
    const resHeaders = [
      { label: 'CLIENTE', x: MARGIN, w: 24 },
      { label: 'EMAIL', x: MARGIN + 24, w: 32 },
      { label: 'SERVICIO', x: MARGIN + 56, w: 28 },
      { label: 'FECHA', x: MARGIN + 84, w: 20 },
      { label: 'PERS.', x: MARGIN + 104, w: 12 },
      { label: 'ESTADO', x: MARGIN + 116, w: 16 },
    ];
    const resRows = reservations.map((r) => {
      const s = services.find((sv) => sv.id === r.serviceId);
      return {
        cols: [
          r.userName.length > 16 ? r.userName.slice(0, 14) + '...' : r.userName,
          r.userEmail.length > 20 ? r.userEmail.slice(0, 18) + '...' : r.userEmail,
          (s?.name || r.serviceName || '-').length > 18 ? (s?.name || r.serviceName || '-').slice(0, 16) + '...' : (s?.name || r.serviceName || '-'),
          r.preferredDate ? new Date(r.preferredDate).toLocaleDateString('es-EC') : '-',
          String(r.numberOfPeople || 1),
          statusLabels[r.status] || r.status,
        ],
        color: statusColors[r.status] || C.textLight,
      };
    });
    y = drawTable(doc, y, resHeaders, resRows, 8, 8);

    y = sectionTitle(doc, '4. Detalle de Noticias', y);
    const newsHeaders = [
      { label: 'TÍTULO', x: MARGIN, w: 55 },
      { label: 'TIPO', x: MARGIN + 55, w: 22 },
      { label: 'ESTADO', x: MARGIN + 77, w: 18 },
    ];
    const newsRows = news.map((n) => ({
      cols: [n.title.length > 45 ? n.title.slice(0, 42) + '...' : n.title, n.type, n.isPublished ? 'Publicado' : 'Borrador'],
      color: n.isPublished ? C.success : C.warning,
    }));
    y = drawTable(doc, y, newsHeaders, newsRows, 8, 8);

    y = sectionTitle(doc, '5. Estadísticas de Reseñas', y);

    const reviews = pageContent.reviews || [];
    const approvedList = (reviews as any[]).filter((r: any) => r.approved);
    const avgRating = approvedList.length > 0
      ? (approvedList.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / approvedList.length).toFixed(1)
      : '0';

    y = drawSummaryCards(doc, y, [
      { label: 'Total', value: String(totalRev), color: C.primary },
      { label: 'Aprobadas', value: String(approvedRev), color: C.success },
      { label: 'Pendientes', value: String(totalRev - approvedRev), color: C.warning },
      { label: 'Promedio', value: `${avgRating}/5`, color: C.accent },
    ]);

    if (approvedList.length > 0) {
      const headers = [
        { label: 'NOMBRE', x: MARGIN, w: 30 },
        { label: 'SERVICIO', x: MARGIN + 30, w: 34 },
        { label: 'CALIF.', x: MARGIN + 64, w: 14 },
        { label: 'RESEÑA', x: MARGIN + 78, w: 62 },
        { label: 'FECHA', x: MARGIN + 140, w: 26 },
      ];
      const rows = approvedList.map((r: any) => ({
        cols: [
          r.name || '-',
          r.serviceName || '-',
          `${r.rating}/5`,
          r.text || '-',
          r.date ? new Date(r.date).toLocaleDateString('es-EC') : '-',
        ],
      }));
      y = drawWrappedTable(doc, y, headers, rows, 8);
    } else {
      if (y > 270) { doc.addPage(); y = MARGIN + 10; }
      doc.setTextColor(...C.textLight);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('No hay reseñas aprobadas aún.', MARGIN, y);
      y += 8;
    }

    footer(doc);
    doc.save(`reporte_completo_${new Date().toISOString().split('T')[0]}.pdf`);
    return doc.output('blob');
  } catch (e) { console.error('Full report PDF error:', e); alert('Error al generar reporte PDF: ' + e); }
}

interface ReservationPDFData {
  id: string;
  serviceName: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  numberOfPeople?: number;
  preferredDate?: string;
  message?: string;
  status: string;
  orgName?: string;
  orgLogo?: string;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = url;
  });
}

export async function generateReservationPDF(data: ReservationPDFData, t: (key: string) => string) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const brand = data.orgName || 'Asociación Turística Las Rocas';

  let logo: HTMLImageElement | null = null;
  if (data.orgLogo) {
    try {
      logo = await loadImage(data.orgLogo);
    } catch {
      logo = null;
    }
  }

  // Header institucional: logo + nombre
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, PAGE_W, 50, 'F');
  doc.setFillColor(...C.accent);
  doc.rect(0, 49, PAGE_W, 2.5, 'F');

  if (logo) {
    const size = 26;
    const lx = MARGIN;
    const ly = 11;
    doc.setFillColor(...C.white);
    doc.circle(lx + size / 2, ly + size / 2, size / 2 + 1.5, 'F');
    doc.addImage(logo, 'PNG', lx, ly, size, size);
    doc.setTextColor(...C.white);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(brand.toUpperCase(), lx + size + 8, ly + 13);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 201, 168);
    doc.text(t('pdf.eslogan'), lx + size + 8, ly + 22);
  } else {
    doc.setTextColor(...C.white);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(brand.toUpperCase(), MARGIN, 24);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 201, 168);
    doc.text(t('pdf.eslogan'), MARGIN, 34);
  }

  let y = 64;

  doc.setTextColor(...C.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.titulo').toUpperCase(), MARGIN, y);
  y += 7;
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 14;

  // Código y estado destacados
  const boxH = 32;
  doc.setFillColor(...C.light);
  doc.roundedRect(MARGIN, y - 8, CONTENT_W, boxH, 4, 4, 'F');

  doc.setTextColor(...C.textLight);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.codigo').toUpperCase(), MARGIN + 10, y);
  doc.setTextColor(...C.primary);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.id.slice(0, 8).toUpperCase(), MARGIN + 10, y + 12);

  const sc = statusColors[data.status] || C.textLight;
  const statusLabel = t(`checkReservation.${data.status}`) || data.status;
  doc.setTextColor(...C.textLight);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.estado').toUpperCase(), PAGE_W - MARGIN - 10, y, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  const pillW = Math.max(40, doc.getTextWidth(statusLabel) + 12);
  const pillH = 10;
  const pillX = PAGE_W - MARGIN - pillW;
  const pillY = y + 2;
  doc.setFillColor(...sc);
  doc.roundedRect(pillX, pillY, pillW, pillH, pillH / 2, pillH / 2, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(10);
  doc.text(statusLabel, pillX + pillW / 2, pillY + 6.8, { align: 'center' });

  y += boxH + 12;

  const block = (title: string, rows: [string, string][]) => {
    doc.setTextColor(...C.primary);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, MARGIN, y);
    y += 5;
    doc.setDrawColor(...C.accent);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, y, MARGIN + 50, y);
    y += 8;
    rows.forEach(([label, value], i) => {
      if (y > 260) { doc.addPage(); y = MARGIN + 5; }
      doc.setFillColor(...(i % 2 === 0 ? ([249, 250, 251] as [number, number, number]) : ([255, 255, 255] as [number, number, number])));
      doc.rect(MARGIN, y, CONTENT_W, 10, 'F');
      doc.setTextColor(...C.textLight);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(label, MARGIN + 5, y + 7);
      doc.setTextColor(...C.text);
      doc.setFont('helvetica', 'normal');
      doc.text(fitText(doc, value, CONTENT_W - 65), MARGIN + 65, y + 7);
      y += 10;
    });
    y += 12;
  };

  block(t('pdf.detallesReserva'), [
    [t('pdf.servicio'), data.serviceName],
    [t('pdf.fecha'), data.preferredDate
      ? new Date(data.preferredDate).toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : '-'],
    [t('pdf.personas'), data.numberOfPeople ? `${data.numberOfPeople}` : '-'],
    [t('pdf.codigo'), data.id.slice(0, 8).toUpperCase()],
  ]);

  block(t('pdf.datosCliente'), [
    [t('pdf.cliente'), data.userName],
    [t('pdf.email'), data.userEmail],
    [t('pdf.telefono'), data.userPhone || '-'],
  ]);

  if (data.message) {
    doc.setTextColor(...C.primary);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(t('pdf.mensajeCliente'), MARGIN, y);
    y += 5;
    doc.setDrawColor(...C.accent);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, y, MARGIN + 50, y);
    y += 8;
    const msgLines = doc.splitTextToSize(`“${data.message}”`, CONTENT_W - 14);
    const msgH = msgLines.length * 5 + 8;
    doc.setFillColor(...C.light);
    doc.roundedRect(MARGIN, y, CONTENT_W, msgH, 3, 3, 'F');
    doc.setTextColor(...C.text);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal', 'italic');
    doc.text(msgLines, MARGIN + 7, y + 7);
    y += msgH + 14;
  }

  doc.setTextColor(...C.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.informacionImportante'), MARGIN, y);
  y += 5;
  doc.setDrawColor(...C.warning);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, MARGIN + 50, y);
  y += 8;
  const infoLines = doc.splitTextToSize(t('pdf.infoImportante'), CONTENT_W - 14);
  const infoH = infoLines.length * 5 + 8;
  doc.setFillColor(255, 250, 240);
  doc.roundedRect(MARGIN, y, CONTENT_W, infoH, 3, 3, 'F');
  doc.setTextColor(...C.text);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(infoLines, MARGIN + 7, y + 7);
  y += infoH + 16;

  if (y > 258) { doc.addPage(); y = MARGIN + 5; }
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 11;
  doc.setTextColor(...C.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.gracias'), MARGIN, y);
  y += 6.5;
  doc.setTextColor(...C.textLight);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(t('pdf.fraseFinal'), MARGIN, y);
  y += 8;
  doc.text(`${t('pdf.generado')}: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}`, MARGIN, y);

  doc.setFillColor(...C.primary);
  doc.rect(0, 285, PAGE_W, 12, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(brand, MARGIN, 291);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(t('pdf.direccion'), PAGE_W - MARGIN, 291, { align: 'right' });

  doc.save(`reserva-${data.id.slice(0, 8)}.pdf`);
  return doc.output('blob');
}
