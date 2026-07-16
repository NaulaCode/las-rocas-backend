import jsPDF from 'jspdf';
import { TouristicService } from '../../domain/entities/TouristicService';
import { News } from '../../domain/entities/News';
import { Reservation } from '../../domain/entities/Reservation';
import { TouristicAttraction } from '../../domain/entities/TouristicAttraction';
import { PageContent } from '../../domain/entities/Organization';
import { ChatbotQuestion } from '../../domain/entities/ChatbotQuestion';

// ── Color palette ──────────────────────────────────────────────
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

// ── Shared helpers ─────────────────────────────────────────────

function headerBar(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, PAGE_W, 40, 'F');
  doc.setFillColor(...C.accent);
  doc.rect(0, 38, PAGE_W, 3, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN, 22);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, MARGIN, 32);
}

function footer(doc: jsPDF) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...C.textLight);
    doc.text(`Página ${i} de ${n}`, PAGE_W - MARGIN, 290, { align: 'right' });
    doc.text(`Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, MARGIN, 290);
  }
}

function sectionTitle(doc: jsPDF, text: string, y: number) {
  if (y > 270) { doc.addPage(); return MARGIN; }
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;
  doc.setTextColor(...C.primary);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(text, MARGIN, y);
  return y + 8;
}

function drawSummaryCards(doc: jsPDF, y: number, cards: { label: string; value: string; color: [number, number, number] }[]) {
  const cardW = (CONTENT_W - (cards.length - 1) * 4) / cards.length;
  cards.forEach((c, i) => {
    const x = MARGIN + i * (cardW + 4);
    doc.setFillColor(...c.color);
    doc.roundedRect(x, y, cardW, 18, 2, 2, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(c.value.length > 6 ? 10 : 14);
    doc.setFont('helvetica', 'bold');
    doc.text(c.value, x + cardW / 2, y + 7, { align: 'center' });
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(c.label.toUpperCase(), x + cardW / 2, y + 14, { align: 'center' });
  });
  return y + 26;
}

function drawTable(
  doc: jsPDF,
  startY: number,
  headers: { label: string; x: number; w: number }[],
  rows: { cols: (string | number)[]; color?: [number, number, number] }[],
  rowH = 6,
  fontSize = 7,
) {
  let y = startY;
  const headerH = 7;

  function drawHeader() {
    doc.setFillColor(...C.light);
    doc.rect(MARGIN, y - 4, CONTENT_W, headerH, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y + 3, PAGE_W - MARGIN, y + 3);
    doc.setTextColor(...C.textLight);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h) => doc.text(h.label, h.x, y));
    y += 8;
  }

  drawHeader();
  doc.setFont('helvetica', 'normal');

  rows.forEach((row, ri) => {
    if (y > 278) { doc.addPage(); y = MARGIN + 5; drawHeader(); }
    const bg = ri % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(MARGIN, y - 4, CONTENT_W, rowH, 'F');
    doc.setTextColor(...C.text);
    doc.setFontSize(fontSize);
    row.cols.forEach((val, ci) => {
      const h = headers[ci];
      if (row.color && ci === row.cols.length - 1) doc.setTextColor(...row.color);
      else doc.setTextColor(...C.text);
      doc.text(String(val), h.x, y);
    });
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2);
    y += rowH + 1;
  });

  return y + 4;
}

// ── Status helpers ─────────────────────────────────────────────

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

// ── Export: Services ──────────────────────────────────────────

export function exportServicesPDF(services: TouristicService[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  headerBar(doc, 'Reporte de Servicios', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} · Total: ${services.length} servicios`);

  let y = 56;
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
    { label: 'NOMBRE', x: MARGIN, w: 40 },
    { label: 'CATEGORÍA', x: MARGIN + 40, w: 30 },
    { label: 'PRECIO', x: MARGIN + 70, w: 20 },
    { label: 'DURACIÓN', x: MARGIN + 90, w: 20 },
    { label: 'UBICACIÓN', x: MARGIN + 110, w: 30 },
    { label: 'ESTADO', x: MARGIN + 140, w: 15 },
  ];

  const rows = services.map((s) => ({
    cols: [s.name, s.category, s.price ? `$${s.price}` : '-', s.duration || '-', s.location || '-', s.isActive ? 'Activo' : 'Inactivo'],
    color: s.isActive ? C.success : C.textLight,
  }));

  drawTable(doc, y, headers, rows);
  footer(doc);
  doc.save(`servicios_${new Date().toISOString().split('T')[0]}.pdf`);
  return doc.output('blob');
}

// ── Export: News ──────────────────────────────────────────────

export function exportNewsPDF(news: News[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  headerBar(doc, 'Reporte de Noticias y Eventos', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} · Total: ${news.length} publicaciones`);

  let y = 56;
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
    { label: 'TÍTULO', x: MARGIN, w: 55 },
    { label: 'TIPO', x: MARGIN + 55, w: 25 },
    { label: 'FECHA EVENTO', x: MARGIN + 80, w: 28 },
    { label: 'UBICACIÓN', x: MARGIN + 108, w: 30 },
    { label: 'ESTADO', x: MARGIN + 138, w: 15 },
  ];

  const rows = news.map((n) => ({
    cols: [n.title.length > 45 ? n.title.slice(0, 42) + '...' : n.title, n.type, n.eventDate ? new Date(n.eventDate).toLocaleDateString('es-EC') : '-', n.location || '-', n.isPublished ? 'Publicado' : 'Borrador'],
    color: n.isPublished ? C.success : C.warning,
  }));

  drawTable(doc, y, headers, rows, 6, 7);
  footer(doc);
  doc.save(`noticias_${new Date().toISOString().split('T')[0]}.pdf`);
  return doc.output('blob');
}

// ── Export: Reservations ──────────────────────────────────────

export function exportReservationsPDF(reservations: Reservation[], services: TouristicService[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  headerBar(doc, 'Reporte de Reservas', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} · Total: ${reservations.length} reservas`);

  let y = 56;
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
    { label: 'CLIENTE', x: MARGIN, w: 28 },
    { label: 'EMAIL', x: MARGIN + 28, w: 38 },
    { label: 'SERVICIO', x: MARGIN + 66, w: 30 },
    { label: 'FECHA', x: MARGIN + 96, w: 20 },
    { label: 'PERS.', x: MARGIN + 116, w: 10 },
    { label: 'ESTADO', x: MARGIN + 126, w: 15 },
    { label: 'TELÉFONO', x: MARGIN + 141, w: 25 },
  ];

  const rows = reservations.map((r) => {
    const s = services.find((sv) => sv.id === r.serviceId);
    return {
      cols: [
        r.userName.length > 16 ? r.userName.slice(0, 14) + '...' : r.userName,
        r.userEmail.length > 22 ? r.userEmail.slice(0, 20) + '...' : r.userEmail,
        (s?.name || r.serviceName || '-').length > 18 ? (s?.name || r.serviceName || '-').slice(0, 16) + '...' : (s?.name || r.serviceName || '-'),
        r.preferredDate ? new Date(r.preferredDate).toLocaleDateString('es-EC') : '-',
        String(r.numberOfPeople || 1),
        statusLabels[r.status] || r.status,
        r.userPhone || '-',
      ],
      color: statusColors[r.status] || C.textLight,
    };
  });

  drawTable(doc, y, headers, rows, 6, 6.5);
  footer(doc);
  doc.save(`reservas_${new Date().toISOString().split('T')[0]}.pdf`);
  return doc.output('blob');
}

// ── Export: Attractions ───────────────────────────────────────

export function exportAttractionsPDF(attractions: TouristicAttraction[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  headerBar(doc, 'Reporte de Atractivos Turísticos', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} · Total: ${attractions.length} atractivos`);

  let y = 56;
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
    { label: 'NOMBRE', x: MARGIN, w: 35 },
    { label: 'CATEGORÍA', x: MARGIN + 35, w: 25 },
    { label: 'UBICACIÓN', x: MARGIN + 60, w: 30 },
    { label: 'PRECIO', x: MARGIN + 90, w: 18 },
    { label: 'DURACIÓN', x: MARGIN + 108, w: 18 },
    { label: 'ESTADO', x: MARGIN + 126, w: 15 },
    { label: 'HORARIO', x: MARGIN + 141, w: 25 },
  ];

  const rows = attractions.map((a) => ({
    cols: [
      a.name.length > 18 ? a.name.slice(0, 16) + '...' : a.name,
      a.category,
      a.location || '-',
      a.price ? `$${a.price}` : '-',
      a.duration || '-',
      a.isActive ? 'Activo' : 'Inactivo',
      a.schedule || '-',
    ],
    color: a.isActive ? C.success : C.textLight,
  }));

  drawTable(doc, y, headers, rows, 6, 6.5);
  footer(doc);
  doc.save(`atractivos_${new Date().toISOString().split('T')[0]}.pdf`);
  return doc.output('blob');
}

// ── Helper: trigger browser download ──────────────────────────

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

// ── Dashboard: Reservations PDF (with summary) ────────────────

export function downloadPDF(reservations: Reservation[], services: TouristicService[]) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    headerBar(doc, 'Reporte de Reservas', `Generado: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} · Total: ${reservations.length} reservas`);

    let y = 56;
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
    doc.setFontSize(9);
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
      if (y > 280) { doc.addPage(); y = MARGIN; }
      doc.text(l, MARGIN + 2, y);
      y += 5.5;
    });

    y = sectionTitle(doc, 'Detalle de Reservas', y + 4);

    const headers = [
      { label: 'CLIENTE', x: MARGIN, w: 28 },
      { label: 'EMAIL', x: MARGIN + 28, w: 38 },
      { label: 'SERVICIO', x: MARGIN + 66, w: 30 },
      { label: 'FECHA', x: MARGIN + 96, w: 20 },
      { label: 'PERS.', x: MARGIN + 116, w: 10 },
      { label: 'ESTADO', x: MARGIN + 126, w: 15 },
    ];

    const rows = reservations.map((r) => {
      const s = services.find((sv) => sv.id === r.serviceId);
      return {
        cols: [
          r.userName.substring(0, 16),
          r.userEmail.substring(0, 22),
          (s?.name || r.serviceName || '-').substring(0, 18),
          r.preferredDate ? new Date(r.preferredDate).toLocaleDateString('es-EC') : '-',
          String(r.numberOfPeople || 1),
          statusLabels[r.status] || r.status,
        ],
        color: statusColors[r.status] || C.textLight,
      };
    });

    drawTable(doc, y, headers, rows);
    footer(doc);
    doc.save(`reservas_${new Date().toISOString().split('T')[0]}.pdf`);
    return doc.output('blob');
  } catch (e) { console.error('PDF error:', e); alert('Error al generar PDF: ' + e); }
}

// ── Dashboard: Full Platform Report ───────────────────────────

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

    let y = 56;
    const pendientes = reservations.filter((r) => r.status === 'pendiente').length;
    const confirmadas = reservations.filter((r) => r.status === 'confirmada').length;
    const completadas = reservations.filter((r) => r.status === 'completada').length;
    const canceladas = reservations.filter((r) => r.status === 'cancelada').length;
    const totalRev = (pageContent.reviews || []).length;
    const approvedRev = (pageContent.reviews || []).filter((r: any) => r.approved).length;

    // Summary cards
    y = drawSummaryCards(doc, y, [
      { label: 'Servicios', value: String(services.length), color: C.primary },
      { label: 'Reservas', value: String(reservations.length), color: C.info },
      { label: 'Noticias', value: String(news.length), color: C.accent },
      { label: 'Reseñas', value: String(totalRev), color: C.success },
    ]);

    // 1. Executive Summary
    y = sectionTitle(doc, '1. Resumen Ejecutivo', y);
    doc.setTextColor(...C.text);
    doc.setFontSize(9);
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
      if (y > 280) { doc.addPage(); y = MARGIN + 10; }
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, MARGIN, y);
      const lw = doc.getTextWidth(item.label + '  ');
      doc.setFont('helvetica', 'normal');
      doc.text(item.value, MARGIN + lw, y);
      y += 6;
    });

    // 2. Services
    y = sectionTitle(doc, '2. Detalle de Servicios', y + 4);
    const svcHeaders = [
      { label: 'NOMBRE', x: MARGIN, w: 40 },
      { label: 'CATEGORÍA', x: MARGIN + 40, w: 30 },
      { label: 'PRECIO', x: MARGIN + 70, w: 20 },
      { label: 'ESTADO', x: MARGIN + 90, w: 15 },
    ];
    const svcRows = services.map((s) => ({
      cols: [s.name, s.category, s.price ? `$${s.price}` : '-', s.isActive ? 'Activo' : 'Inactivo'],
      color: s.isActive ? C.success : C.textLight,
    }));
    y = drawTable(doc, y, svcHeaders, svcRows, 6, 7);

    // 3. Reservations
    y = sectionTitle(doc, '3. Detalle de Reservas', y);
    const resHeaders = [
      { label: 'CLIENTE', x: MARGIN, w: 22 },
      { label: 'EMAIL', x: MARGIN + 22, w: 30 },
      { label: 'SERVICIO', x: MARGIN + 52, w: 28 },
      { label: 'FECHA', x: MARGIN + 80, w: 16 },
      { label: 'PERS.', x: MARGIN + 96, w: 10 },
      { label: 'ESTADO', x: MARGIN + 106, w: 14 },
    ];
    const resRows = reservations.map((r) => {
      const s = services.find((sv) => sv.id === r.serviceId);
      return {
        cols: [
          r.userName.substring(0, 14),
          r.userEmail.substring(0, 18),
          (s?.name || r.serviceName || '-').substring(0, 16),
          r.preferredDate ? new Date(r.preferredDate).toLocaleDateString('es-EC') : '-',
          String(r.numberOfPeople || 1),
          statusLabels[r.status] || r.status,
        ],
        color: statusColors[r.status] || C.textLight,
      };
    });
    y = drawTable(doc, y, resHeaders, resRows, 5.5, 6.5);

    // 4. News
    y = sectionTitle(doc, '4. Detalle de Noticias', y);
    const newsHeaders = [
      { label: 'TÍTULO', x: MARGIN, w: 50 },
      { label: 'TIPO', x: MARGIN + 50, w: 20 },
      { label: 'ESTADO', x: MARGIN + 70, w: 15 },
    ];
    const newsRows = news.map((n) => ({
      cols: [n.title.length > 40 ? n.title.slice(0, 38) + '...' : n.title, n.type, n.isPublished ? 'Publicado' : 'Borrador'],
      color: n.isPublished ? C.success : C.warning,
    }));
    y = drawTable(doc, y, newsHeaders, newsRows, 5.5, 6.5);

    // 5. Reviews
    y = sectionTitle(doc, '5. Estadísticas de Reseñas', y);
    doc.setTextColor(...C.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de reseñas: ${totalRev}`, MARGIN, y); y += 6;
    doc.text(`Aprobadas: ${approvedRev}`, MARGIN, y); y += 6;
    doc.text(`Pendientes de revisión: ${totalRev - approvedRev}`, MARGIN, y); y += 7;

    const reviews = pageContent.reviews || [];
    (reviews as any[]).filter((r: any) => r.approved).forEach((r: any) => {
      if (y > 280) { doc.addPage(); y = MARGIN + 10; }
      doc.setFontSize(8);
      doc.setTextColor(...C.text);
      doc.text(`• ${r.name}: "${r.text}" (${r.rating}★)`, MARGIN, y);
      y += 5;
    });

    footer(doc);
    doc.save(`reporte_completo_${new Date().toISOString().split('T')[0]}.pdf`);
    return doc.output('blob');
  } catch (e) { console.error('Full report PDF error:', e); alert('Error al generar reporte PDF: ' + e); }
}

// ── Public: Reservation Receipt ───────────────────────────────

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

export function generateReservationPDF(data: ReservationPDFData, t: (key: string) => string) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = MARGIN;

  // Header bar
  headerBar(doc, t('pdf.titulo'), data.orgName || 'Las Rocas');
  y = 55;

  // Subtitle
  doc.setTextColor(...C.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.subtitulo'), MARGIN, y);
  y += 10;

  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 10;

  // Reservation code
  doc.setTextColor(...C.textLight);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t('pdf.codigo')}:`, MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.text);
  doc.text(data.id.slice(0, 8).toUpperCase(), MARGIN + 40, y);
  y += 8;

  // Status badge
  const sc = statusColors[data.status] || C.textLight;
  doc.setFillColor(...sc);
  doc.roundedRect(MARGIN + 40, y - 5, 35, 7, 2, 2, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const statusLabel = t(`checkReservation.${data.status}`) || data.status;
  doc.text(statusLabel, MARGIN + 43, y);
  y += 14;
  doc.setTextColor(...C.text);

  // Detail table
  doc.setFontSize(9);
  const rows: [string, string][] = [
    [t('pdf.servicio'), data.serviceName],
    [t('pdf.cliente'), data.userName],
    [t('pdf.email'), data.userEmail],
    [t('pdf.telefono'), data.userPhone || '-'],
    [t('pdf.personas'), data.numberOfPeople?.toString() || '-'],
    [t('pdf.fecha'), data.preferredDate ? new Date(data.preferredDate).toLocaleDateString('es-EC') : '-'],
  ];
  if (data.message) rows.push([t('pdf.mensaje'), data.message]);

  let tableY = y;
  rows.forEach(([label, value], i) => {
    const bgColor = i % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(MARGIN, tableY, CONTENT_W, 9, 'F');
    doc.setTextColor(...C.textLight);
    doc.setFont('helvetica', 'bold');
    doc.text(label, MARGIN + 4, tableY + 6);
    doc.setTextColor(...C.text);
    doc.setFont('helvetica', 'normal');
    doc.text(value, MARGIN + 50, tableY + 6);
    tableY += 9;
  });

  y = tableY + 15;

  // Footer section
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;
  doc.setTextColor(...C.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.gracias'), MARGIN, y);
  y += 6;
  doc.setTextColor(...C.textLight);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t('pdf.generado')}: ${new Date().toLocaleDateString('es-EC')}`, MARGIN, y);

  doc.save(`reserva-${data.id.slice(0, 8)}.pdf`);
  return doc.output('blob');
}
