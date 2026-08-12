import { BusinessCard, PlanType } from './types';
import { PLANS } from './plans';
import { buildWhatsappUrl, isQrExpired } from './card-utils';

// QR code generation using a simple API-free approach via canvas
// We'll use the qrcode library at runtime in the component

export interface CardImageOptions {
  width: number;
  height: number;
  includeWatermark: boolean;
  qrDataUrl: string;
}

/**
 * Generates a downloadable card image using HTML Canvas
 */
export async function generateCardImage(
  card: BusinessCard,
  userPlan: PlanType | string,
  qrDataUrl: string
): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1350; // Instagram portrait ratio
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  const plan = PLANS[userPlan as PlanType] || PLANS.gratis;
  const hasWatermark = plan.hasWatermark;
  const isExpired = plan.qrExpires && card.qrExpiresAt ? isQrExpired(card) : false;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, card.primaryColor);
  bgGrad.addColorStop(1, card.secondaryColor);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative circles
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(width - 100, 150, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, height - 200, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // White card area
  const cardX = 80;
  const cardY = 80;
  const cardW = width - 160;
  const cardH = height - 160;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Profile photo or avatar circle
  const photoX = width / 2;
  const photoY = 200;
  const photoR = 90;

  if (card.profilePhoto) {
    try {
      const img = await loadImage(card.profilePhoto);
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX, photoY, photoR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, photoX - photoR, photoY - photoR, photoR * 2, photoR * 2);
      ctx.restore();
    } catch {
      drawAvatarCircle(ctx, photoX, photoY, photoR, card.primaryColor);
    }
  } else {
    drawAvatarCircle(ctx, photoX, photoY, photoR, card.primaryColor);
  }

  // Border around photo
  ctx.strokeStyle = card.primaryColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(photoX, photoY, photoR + 4, 0, Math.PI * 2);
  ctx.stroke();

  // Name
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 52px Poppins, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(truncateText(ctx, card.cardName, cardW - 120), photoX, 360);

  // Divider line
  ctx.strokeStyle = card.secondaryColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 60, 410);
  ctx.lineTo(width / 2 + 60, 410);
  ctx.stroke();

  // Description
  if (card.description) {
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Poppins, Arial, sans-serif';
    const lines = wrapText(ctx, card.description, cardW - 160);
    let y = 460;
    const maxLines = 4;
    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
      ctx.fillText(lines[i], photoX, y);
      y += 34;
    }
  }

  // WhatsApp number
  if (card.whatsappNumber) {
    ctx.fillStyle = card.primaryColor;
    ctx.font = 'bold 28px Poppins, Arial, sans-serif';
    const formatted = formatPhone(card.whatsappNumber);
    ctx.fillText(`📱 ${formatted}`, photoX, 620);
  }

  // QR Code
  const qrSize = 280;
  const qrX = (width - qrSize) / 2;
  const qrY = 680;

  // QR background
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = card.primaryColor;
  ctx.lineWidth = 3;
  roundRect(ctx, qrX - 15, qrY - 15, qrSize + 30, qrSize + 30, 16);
  ctx.fill();
  ctx.stroke();

  // Draw QR
  try {
    const qrImg = await loadImage(qrDataUrl);
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch {
    // Fallback QR placeholder
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
  }

  // QR status text
  if (plan.qrExpires && card.qrExpiresAt) {
    if (isExpired) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 22px Poppins, Arial, sans-serif';
      ctx.fillText('⚠ QR EXPIRADO', photoX, qrY + qrSize + 50);
      ctx.fillStyle = '#64748b';
      ctx.font = '18px Poppins, Arial, sans-serif';
      ctx.fillText('Renueva en ftpdigitalplus.com', photoX, qrY + qrSize + 80);
    } else {
      const days = Math.ceil((new Date(card.qrExpiresAt).getTime() - Date.now()) / 86400000);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 20px Poppins, Arial, sans-serif';
      ctx.fillText(`⏳ Expira en ${days} día${days !== 1 ? 's' : ''}`, photoX, qrY + qrSize + 50);
    }
  } else {
    ctx.fillStyle = card.primaryColor;
    ctx.font = 'bold 22px Poppins, Arial, sans-serif';
    ctx.fillText('Escanea para WhatsApp', photoX, qrY + qrSize + 50);
  }

  // Watermark
  if (hasWatermark) {
    // Semi-transparent overlay at bottom
    const wmY = height - 120;
    ctx.fillStyle = 'rgba(5, 150, 105, 0.95)';
    ctx.fillRect(cardX, wmY, cardW, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Poppins, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FTP Digital Plus', cardX + 30, wmY + 38);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '20px Poppins, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Crea la tuya en ftpdigitalplus.com', cardX + cardW - 30, wmY + 38);

    ctx.textAlign = 'center';
  }

  return canvas.toDataURL('image/png');
}

function drawAvatarCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, shadeColor(color, -30));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Initials
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Poppins, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👤', x, y);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function formatPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 12) return `+${clean.slice(0, 2)} ${clean.slice(2, 7)} ${clean.slice(7)}`;
  if (clean.length === 10) return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  return phone;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
