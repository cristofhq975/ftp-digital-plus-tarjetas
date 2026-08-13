/**
 * Export utilities for FTP Digital Plus — Tarjetas de Presentación Digitales.
 *
 * Funciones puras (lado cliente) para exportar tarjetas y datos del usuario a
 * diferentes formatos: JSON, CSV, vCard (.vcf) y PDF (vía ventana de impresión
 * del navegador).
 *
 * Paleta: esmeralda (#059669) + oro (#f59e0b) — sin azul/índigo.
 * Idioma: 100% español (México).
 */
import { BusinessCard, ContactMessage, Appointment } from './types';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Dispara la descarga de un Blob en el navegador.
 */
function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Liberar el objeto URL después de un breve delay para asegurar la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 200);
}

/**
 * Convierte un string en un nombre de archivo seguro (sin espacios ni acentos).
 */
function sanitizeFileName(name: string): string {
  return (name || 'tarjeta')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

/**
 * Escapa un valor para incluirlo de forma segura dentro de una celda CSV.
 */
function escapeCsvCell(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Genera un sello de fecha/hora legible para nombres de archivo.
 */
function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

// ---------------------------------------------------------------------------
// 1. Exportar tarjeta como JSON
// ---------------------------------------------------------------------------

/**
 * Exporta una tarjeta individual como archivo JSON.
 */
export function exportCardAsJSON(card: BusinessCard): void {
  const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `tarjeta-${sanitizeFileName(card.linkName)}.json`);
}

// ---------------------------------------------------------------------------
// 2. Exportar TODOS los datos del usuario como JSON
// ---------------------------------------------------------------------------

export interface AllExportData {
  exportedAt: string;
  version: string;
  cards: BusinessCard[];
  messages: ContactMessage[];
  appointments: Appointment[];
}

/**
 * Exporta todos los datos del usuario (tarjetas, mensajes, citas) como un
 * único archivo JSON empaquetado.
 */
export function exportAllDataAsJSON(
  cards: BusinessCard[],
  messages: ContactMessage[],
  appointments: Appointment[]
): void {
  const data: AllExportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    cards,
    messages,
    appointments,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `ftp-digital-plus-datos-${timestamp()}.json`);
}

// ---------------------------------------------------------------------------
// 3. Exportar estadísticas de tarjeta como CSV
// ---------------------------------------------------------------------------

/**
 * Exporta un CSV con estadísticas clave de la tarjeta: vistas, escaneos QR,
 * cantidades de servicios, productos, galería, equipo, testimonios, etc.
 */
export function exportCardStatsAsCSV(card: BusinessCard): void {
  const rows: Array<[string, string | number]> = [
    ['Métrica', 'Valor'],
    ['Nombre de la tarjeta', card.cardName],
    ['Enlace único', card.linkName],
    ['Descripción', card.description],
    ['Plantilla', card.template],
    ['Color primario', card.primaryColor],
    ['Color secundario', card.secondaryColor],
    ['Estado', card.isActive ? 'Activa' : 'Inactiva'],
    ['Fecha de creación', card.createdAt],
    ['Visitas totales', card.views],
    ['Escaneos QR', card.qrScans],
    ['Servicios', card.services.length],
    ['Productos', card.products.length],
    ['Galería (imágenes/videos)', card.gallery.length],
    ['Publicaciones de blog', card.blog.length],
    ['Testimonios', card.testimonials.length],
    ['Miembros del equipo', card.team.length],
    ['Marcos flotantes', card.floatingFrames.length],
    ['Código de afiliado', card.affiliateCode || '—'],
    ['Clics de afiliado', card.affiliateClicks],
    ['WhatsApp configurado', card.whatsappNumber ? 'Sí' : 'No'],
    ['WhatsApp verificado', card.whatsappVerified ? 'Sí' : 'No'],
    ['QR generado', card.qrGeneratedAt || '—'],
    ['QR expira', card.qrExpiresAt || 'Permanente'],
    ['Ocultar marca FTP', card.hideBrand ? 'Sí' : 'No'],
    ['Protegida con contraseña', card.passwordProtected ? 'Sí' : 'No'],
    ['SEO título', card.seoTitle || '—'],
    ['SEO descripción', card.seoDescription || '—'],
    ['SEO palabras clave', card.seoKeywords || '—'],
  ];

  const csv = rows.map(row => row.map(escapeCsvCell).join(',')).join('\r\n');
  // BOM al inicio para que Excel detecte UTF-8 correctamente.
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `estadisticas-${sanitizeFileName(card.linkName)}-${timestamp()}.csv`);
}

// ---------------------------------------------------------------------------
// 4. Exportar tarjeta como vCard (.vcf)
// ---------------------------------------------------------------------------

/**
 * Genera el contenido vCard 3.0 para una tarjeta.
 */
export function generateVCardContent(card: BusinessCard): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');

  // N: Apellidos;Nombres
  const nameParts = card.cardName.trim().split(/\s+/);
  const firstName = nameParts[0] || card.cardName;
  const lastName = nameParts.slice(1).join(' ') || '';
  lines.push(`N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`);
  lines.push(`FN:${escapeVCard(card.cardName)}`);

  // Organización (usamos el linkName como organización si está disponible)
  if (card.linkName) {
    lines.push(`ORG:${escapeVCard(card.linkName)}`);
  }

  // Cargo / descripción
  if (card.description) {
    lines.push(`TITLE:${escapeVCard(card.description.split('\n')[0].slice(0, 100))}`);
    lines.push(`NOTE:${escapeVCard(card.description)}`);
  }

  // Teléfono (WhatsApp)
  if (card.whatsappNumber) {
    const cleanPhone = card.whatsappNumber.replace(/[^0-9+]/g, '');
    lines.push(`TEL;TYPE=CELL,WHATSAPP:${cleanPhone}`);
    if (card.whatsappVerified) {
      lines.push(`X-WA-VERIFIED:true`);
    }
  }

  // Email — la tarjeta no tiene un campo directo de email, pero los mensajes sí.
  // Para mantener el vCard válido, omitimos EMAIL si no existe. Podríamos
  // añadirlo si en el futuro BusinessCard incluye un campo de email propio.

  // URL — enlace público de la tarjeta
  if (card.linkName) {
    lines.push(`URL:https://ftpdigitalplus.com/t/${encodeURIComponent(card.linkName)}`);
  }

  // Sitios web adicionales (servicios con URL)
  card.services.forEach(svc => {
    if (svc.url) {
      lines.push(`URL;TYPE=SERVICE:${escapeVCard(svc.url)}`);
    }
  });

  // Redes sociales
  const social = card.socialLinks;
  if (social.facebook) lines.push(`URL;TYPE=FACEBOOK:${escapeVCard(social.facebook)}`);
  if (social.instagram) lines.push(`URL;TYPE=INSTAGRAM:${escapeVCard(social.instagram)}`);
  if (social.twitter) lines.push(`URL;TYPE=TWITTER:${escapeVCard(social.twitter)}`);
  if (social.linkedin) lines.push(`URL;TYPE=LINKEDIN:${escapeVCard(social.linkedin)}`);
  if (social.youtube) lines.push(`URL;TYPE=YOUTUBE:${escapeVCard(social.youtube)}`);
  if (social.tiktok) lines.push(`URL;TYPE=TIKTOK:${escapeVCard(social.tiktok)}`);
  if (social.telegram) lines.push(`URL;TYPE=TELEGRAM:${escapeVCard(social.telegram)}`);

  // Dirección de afiliado (si existe)
  if (card.affiliateCode) {
    lines.push(`X-AFFILIATE-CODE:${escapeVCard(card.affiliateCode)}`);
  }

  // Categorías (palabras clave SEO)
  if (card.seoKeywords) {
    const cats = card.seoKeywords.split(/[,;]+/).map(s => s.trim()).filter(Boolean).join(',');
    if (cats) lines.push(`CATEGORIES:${escapeVCard(cats)}`);
  }

  // Foto (si existe como data URL)
  if (card.profilePhoto && card.profilePhoto.startsWith('data:image/')) {
    // Codificar la foto en base64 dentro del vCard
    const matches = card.profilePhoto.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (matches) {
      const ext = matches[1].toUpperCase();
      const b64 = matches[2];
      lines.push(`PHOTO;ENCODING=b;TYPE=${ext}:${b64}`);
    }
  }

  // Marca temporal
  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
  lines.push(`PRODID:-//FTP Digital Plus//Tarjetas Digitales//ES`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Escapa caracteres especiales para vCard según RFC 6350.
 */
function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Descarga la tarjeta como archivo .vcf (vCard 3.0).
 */
export function exportCardAsVCard(card: BusinessCard): void {
  const content = generateVCardContent(card);
  const blob = new Blob([content], { type: 'text/vcard;charset=utf-8' });
  downloadBlob(blob, `${sanitizeFileName(card.cardName)}.vcf`);
}

// ---------------------------------------------------------------------------
// 5. Exportar reporte PDF (vía ventana de impresión del navegador)
// ---------------------------------------------------------------------------

/**
 * Abre una nueva ventana con un reporte HTML formateado de la tarjeta y
 * dispara el diálogo de impresión del navegador, permitiendo al usuario
 * guardar como PDF.
 */
export function exportCardReportAsPDF(card: BusinessCard): void {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    // Bloqueado por popup blocker
    return;
  }

  const html = buildPdfReportHtml(card);

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  // Esperar a que las imágenes carguen antes de imprimir
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Cerrar la ventana después de imprimir (algunos navegadores lo hacen
      // automáticamente; otros no).
      // setTimeout(() => printWindow.close(), 500);
    }, 300);
  };
}

/**
 * Construye el HTML completo del reporte PDF con la paleta esmeralda+oro.
 */
function buildPdfReportHtml(card: BusinessCard): string {
  const created = new Date(card.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const now = new Date().toLocaleString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const esc = (s: string) => (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Calcular conversión de visitas a escaneos
  const conversionRate = card.views > 0
    ? ((card.qrScans / card.views) * 100).toFixed(1)
    : '0.0';

  // Servicios y productos tablas
  const servicesRows = card.services.length > 0
    ? card.services.map(s => `
      <tr>
        <td>${esc(s.name)}</td>
        <td>${esc(s.description)}</td>
        ${s.url ? `<td><a href="${esc(s.url)}">${esc(s.url)}</a></td>` : '<td>—</td>'}
      </tr>`).join('')
    : '<tr><td colspan="3" style="text-align:center;color:#94a3b8">Sin servicios registrados</td></tr>';

  const productsRows = card.products.length > 0
    ? card.products.map(p => `
      <tr>
        <td>${esc(p.name)}</td>
        <td>${esc(p.description)}</td>
        <td style="text-align:right">$${p.price.toLocaleString('es-MX')} ${esc(p.currency)}</td>
      </tr>`).join('')
    : '<tr><td colspan="3" style="text-align:center;color:#94a3b8">Sin productos registrados</td></tr>';

  // Testimonios
  const testimonialsHtml = card.testimonials.length > 0
    ? card.testimonials.map(t => `
      <blockquote class="testimonial">
        <p>“${esc(t.text)}”</p>
        <footer>— ${esc(t.name)} ${'★'.repeat(Math.max(1, Math.min(5, t.rating)))}</footer>
      </blockquote>`).join('')
    : '<p style="color:#94a3b8;text-align:center">Sin testimonios registrados.</p>';

  // Redes sociales
  const socialEntries = Object.entries(card.socialLinks).filter(([, v]) => v);
  const socialHtml = socialEntries.length > 0
    ? `<div class="social-grid">${socialEntries.map(([k, v]) => `
        <div class="social-item"><strong>${esc(capitalize(k))}:</strong> <a href="${esc(v)}">${esc(v)}</a></div>`).join('')}</div>`
    : '<p style="color:#94a3b8">Sin redes sociales configuradas.</p>';

  // Horario
  const dayLabels: Record<string, string> = {
    monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
    thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
  };
  const scheduleRows = Object.entries(card.schedule).map(([day, info]) => `
    <tr>
      <td>${dayLabels[day] || day}</td>
      <td style="text-align:center">
        ${info.open
          ? `<span class="badge badge-open">Abierto</span> ${esc(info.start)} — ${esc(info.end)}`
          : '<span class="badge badge-closed">Cerrado</span>'}
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reporte de Tarjeta — ${esc(card.cardName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 32px;
      line-height: 1.5;
    }
    .header {
      background: linear-gradient(135deg, ${card.primaryColor} 0%, ${card.secondaryColor} 100%);
      color: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(5, 150, 105, 0.15);
      position: relative;
      overflow: hidden;
    }
    .header::after {
      content: 'FTP+';
      position: absolute;
      top: 16px;
      right: 20px;
      background: rgba(255,255,255,0.18);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .header h1 { font-size: 28px; margin-bottom: 4px; }
    .header .subtitle { font-size: 14px; opacity: 0.9; }
    .header .meta { margin-top: 16px; display: flex; gap: 16px; font-size: 12px; opacity: 0.92; flex-wrap: wrap; }
    .profile-row { display: flex; gap: 20px; align-items: center; }
    .profile-photo {
      width: 80px; height: 80px; border-radius: 50%;
      border: 4px solid rgba(255,255,255,0.4);
      object-fit: cover; flex-shrink: 0;
      background: rgba(255,255,255,0.2);
    }
    .section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-top: 20px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
    }
    .section h2 {
      font-size: 16px;
      color: #059669;
      margin-bottom: 12px;
      border-bottom: 2px solid #f59e0b;
      padding-bottom: 6px;
      display: flex; align-items: center; gap: 8px;
    }
    .section h2 .num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 24px; height: 24px;
      background: linear-gradient(135deg, #059669, #f59e0b);
      color: white; border-radius: 50%;
      font-size: 12px; font-weight: 700;
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.04em; }
    tr:hover td { background: #f8fafc; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .stat-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #fef3c7 100%);
      border-radius: 10px;
      padding: 14px;
      text-align: center;
      border: 1px solid #d1fae5;
    }
    .stat-card .label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
    .stat-card .value { font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    .stat-card .value.emerald { color: #059669; }
    .stat-card .value.amber { color: #f59e0b; }
    .testimonial {
      border-left: 4px solid #f59e0b;
      padding: 10px 14px;
      margin-bottom: 8px;
      background: #fffbeb;
      border-radius: 0 8px 8px 0;
    }
    .testimonial p { font-size: 13px; color: #475569; font-style: italic; }
    .testimonial footer { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    .social-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 13px; }
    .social-item { padding: 6px 10px; background: #f8fafc; border-radius: 6px; }
    .social-item a { color: #059669; text-decoration: none; word-break: break-all; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .badge-open { background: #d1fae5; color: #065f46; }
    .badge-closed { background: #fee2e2; color: #991b1b; }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .footer strong { color: #059669; }
    .info-row { display: flex; gap: 12px; font-size: 13px; margin-bottom: 6px; }
    .info-row .k { font-weight: 600; color: #475569; min-width: 140px; }
    .info-row .v { color: #0f172a; word-break: break-word; }
    @media print {
      body { padding: 0; background: white; }
      .section { box-shadow: none; border: 1px solid #e2e8f0; page-break-inside: avoid; }
      .header { box-shadow: none; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="profile-row">
      ${card.profilePhoto
        ? `<img class="profile-photo" src="${esc(card.profilePhoto)}" alt="${esc(card.cardName)}" />`
        : `<div class="profile-photo" style="display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;">${esc((card.cardName || '?').charAt(0).toUpperCase())}</div>`}
      <div style="flex:1;">
        <h1>${esc(card.cardName)}</h1>
        ${card.description ? `<p class="subtitle">${esc(card.description)}</p>` : ''}
        <div class="meta">
          <span>🔗 ftpdigitalplus.com/t/${esc(card.linkName)}</span>
          ${card.whatsappNumber ? `<span>📱 WhatsApp: ${esc(card.whatsappNumber)}</span>` : ''}
          <span>📅 Creada: ${esc(created)}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2><span class="num">1</span> Estadísticas de Rendimiento</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">Visitas totales</div>
        <div class="value emerald">${card.views.toLocaleString('es-MX')}</div>
      </div>
      <div class="stat-card">
        <div class="label">Escaneos QR</div>
        <div class="value amber">${card.qrScans.toLocaleString('es-MX')}</div>
      </div>
      <div class="stat-card">
        <div class="label">Tasa conversión</div>
        <div class="value">${conversionRate}%</div>
      </div>
      <div class="stat-card">
        <div class="label">Servicios</div>
        <div class="value emerald">${card.services.length}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2><span class="num">2</span> Información de Contacto</h2>
    <div class="info-row"><span class="k">Teléfono / WhatsApp:</span><span class="v">${card.whatsappNumber ? esc(card.whatsappNumber) + (card.whatsappVerified ? ' ✓ verificado' : '') : '—'}</span></div>
    <div class="info-row"><span class="k">Enlace público:</span><span class="v">ftpdigitalplus.com/t/${esc(card.linkName)}</span></div>
    <div class="info-row"><span class="k">Código de afiliado:</span><span class="v">${card.affiliateCode ? esc(card.affiliateCode) + ` (${card.affiliateClicks} clics)` : '—'}</span></div>
    <div class="info-row"><span class="k">Plantilla:</span><span class="v">${esc(card.template)}</span></div>
    <div class="info-row"><span class="k">Color primario:</span><span class="v"><span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${esc(card.primaryColor)};vertical-align:middle;margin-right:4px;"></span>${esc(card.primaryColor)}</span></div>
    <div class="info-row"><span class="k">Color secundario:</span><span class="v"><span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${esc(card.secondaryColor)};vertical-align:middle;margin-right:4px;"></span>${esc(card.secondaryColor)}</span></div>
  </div>

  <div class="section">
    <h2><span class="num">3</span> Servicios (${card.services.length})</h2>
    <table>
      <thead><tr><th>Nombre</th><th>Descripción</th><th>Enlace</th></tr></thead>
      <tbody>${servicesRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2><span class="num">4</span> Productos (${card.products.length})</h2>
    <table>
      <thead><tr><th>Nombre</th><th>Descripción</th><th style="text-align:right">Precio</th></tr></thead>
      <tbody>${productsRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2><span class="num">5</span> Testimonios (${card.testimonials.length})</h2>
    ${testimonialsHtml}
  </div>

  <div class="section">
    <h2><span class="num">6</span> Redes Sociales</h2>
    ${socialHtml}
  </div>

  <div class="section">
    <h2><span class="num">7</span> Horario de Atención</h2>
    <table>
      <thead><tr><th>Día</th><th style="text-align:center">Disponibilidad</th></tr></thead>
      <tbody>${scheduleRows}</tbody>
    </table>
  </div>

  ${card.seoTitle || card.seoDescription || card.seoKeywords ? `
  <div class="section">
    <h2><span class="num">8</span> Información SEO</h2>
    ${card.seoTitle ? `<div class="info-row"><span class="k">Título SEO:</span><span class="v">${esc(card.seoTitle)}</span></div>` : ''}
    ${card.seoDescription ? `<div class="info-row"><span class="k">Descripción SEO:</span><span class="v">${esc(card.seoDescription)}</span></div>` : ''}
    ${card.seoKeywords ? `<div class="info-row"><span class="k">Palabras clave:</span><span class="v">${esc(card.seoKeywords)}</span></div>` : ''}
  </div>` : ''}

  <div class="footer">
    Reporte generado el ${esc(now)} por <strong>FTP Digital Plus</strong> — Tarjetas de Presentación Digitales<br/>
    © ${new Date().getFullYear()} FTP Digital Plus · Hecho con ❤️ en México
  </div>

  <script>
    // Auto-print una vez cargado (algunos navegadores requieren interacción)
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 400);
    });
  </script>
</body>
</html>`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// 6. Plantilla JSON de tarjeta (para importación)
// ---------------------------------------------------------------------------

/**
 * Genera una tarjeta plantilla en blanco lista para ser descargada como
 * referencia de importación. Incluye todos los campos disponibles con
 * valores de ejemplo comentados (en formato JSON no existen comentarios
 * oficiales, así que usamos una estructura con valores vacíos).
 */
export function downloadCardTemplate(): void {
  const template = {
    _instrucciones: 'Edita este archivo con tus datos y luego impórtalo desde el botón "Importar tarjeta". Los campos marcados como vacíos ("") son opcionales.',
    cardName: 'Mi Negocio Ejemplo',
    linkName: 'mi-negocio',
    description: 'Breve descripción de tu negocio o servicios profesionales.',
    logo: '',
    coverPhoto: '',
    profilePhoto: '',
    template: 'moderno',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    fontFamily: 'poppins',
    fontSize: 16,
    qrStyle: 'cuadrado',
    qrColor: '#059669',
    qrBgColor: '#ffffff',
    whatsappNumber: '525512345678',
    whatsappMessage: '¡Hola! Me contacto desde tu tarjeta digital. Me gustaría más información.',
    services: [
      {
        id: 'srv-1',
        name: 'Consulta inicial',
        url: '',
        description: 'Sesión de 45 minutos para conocer tus necesidades.',
        photo: '',
      },
    ],
    products: [
      {
        id: 'prd-1',
        name: 'Producto ejemplo',
        price: 199,
        currency: 'MXN',
        description: 'Descripción del producto.',
        image: '',
        url: '',
      },
    ],
    gallery: [],
    blog: [],
    testimonials: [],
    team: [],
    socialLinks: {
      facebook: 'https://facebook.com/tu-pagina',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
      tiktok: '',
      whatsapp: '',
      telegram: '',
    },
    schedule: {
      monday:    { open: true,  start: '09:00', end: '18:00' },
      tuesday:   { open: true,  start: '09:00', end: '18:00' },
      wednesday: { open: true,  start: '09:00', end: '18:00' },
      thursday:  { open: true,  start: '09:00', end: '18:00' },
      friday:    { open: true,  start: '09:00', end: '18:00' },
      saturday:  { open: true,  start: '10:00', end: '14:00' },
      sunday:    { open: false, start: '00:00', end: '00:00' },
    },
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    hideBrand: false,
  };

  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, 'plantilla-tarjeta-ftp.json');
}
