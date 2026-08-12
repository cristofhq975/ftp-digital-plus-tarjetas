/* eslint-disable @typescript-eslint/no-require-imports */
// Genera íconos PWA (PNG) con la identidad FTP Digital Plus (esmeralda + oro)
// Ejecutar: node scripts/generate-pwa-icons.js
const sharp = require('sharp');
const path = require('path');

/**
 * Construye un SVG con la marca FTP Digital Plus:
 *  - Fondo con gradiente esmeralda (#059669 -> #10b981)
 *  - Tarjeta blanca translúcida en el centro (representa "tarjeta de presentación")
 *  - Líneas horizontales (texto/contacto)
 *  - Círculo dorado (#f59e0b -> #fbbf24) como acento (NFC/QR)
 *  - Texto "FTP" abajo en blanco
 */
function buildIconSVG(size) {
  const radius = Math.round(size * 0.22);
  const cardW = size * 0.62;
  const cardH = size * 0.42;
  const cardX = (size - cardW) / 2;
  const cardY = size * 0.26;
  const dotR = size * 0.13;
  const dotCX = size * 0.72;
  const dotCY = size * 0.62;
  const lineStroke = Math.max(2, size * 0.018);
  const fontSize = Math.round(size * 0.16);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size * 0.012}" stdDeviation="${size * 0.012}" flood-color="#000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <g filter="url(#shadow)">
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${size * 0.05}" fill="#ffffff" fill-opacity="0.96"/>
  </g>
  <g stroke="#10b981" stroke-width="${lineStroke}" stroke-linecap="round" opacity="0.9">
    <line x1="${cardX + cardW * 0.16}" y1="${cardY + cardH * 0.32}" x2="${cardX + cardW * 0.58}" y2="${cardY + cardH * 0.32}"/>
    <line x1="${cardX + cardW * 0.16}" y1="${cardY + cardH * 0.55}" x2="${cardX + cardW * 0.48}" y2="${cardY + cardH * 0.55}"/>
    <line x1="${cardX + cardW * 0.16}" y1="${cardY + cardH * 0.78}" x2="${cardX + cardW * 0.40}" y2="${cardY + cardH * 0.78}"/>
  </g>
  <circle cx="${dotCX}" cy="${dotCY}" r="${dotR}" fill="url(#gold)" stroke="#ffffff" stroke-width="${Math.max(2, size * 0.014)}"/>
  <text x="50%" y="${size * 0.86}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central" letter-spacing="${size * 0.01}">FTP</text>
</svg>`;
}

async function createIcon(size) {
  const svg = buildIconSVG(size);
  const outPath = path.join(__dirname, '..', 'public', `icon-${size}.png`);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`✓ Generado: public/icon-${size}.png`);
}

// Ícono favicon cuadrado simple (solo fondo + oro)
async function createFaviconPNG() {
  const size = 32;
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#059669"/>
        <stop offset="100%" stop-color="#10b981"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.25}" fill="url(#g)"/>
    <circle cx="${size * 0.72}" cy="${size * 0.72}" r="${size * 0.18}" fill="#f59e0b" stroke="#ffffff" stroke-width="${size * 0.05}"/>
  </svg>`;
  const outPath = path.join(__dirname, '..', 'public', 'favicon-32.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log('✓ Generado: public/favicon-32.png');
}

(async () => {
  try {
    await createIcon(192); // PWA estándar
    await createIcon(512); // PWA estándar (maskable)
    await createIcon(180); // Apple touch icon
    await createIcon(270); // Apple touch icon @2x (extra)
    await createFaviconPNG();
    console.log('\n✅ Todos los íconos PWA generados correctamente.');
  } catch (err) {
    console.error('Error generando íconos:', err);
    process.exit(1);
  }
})();
