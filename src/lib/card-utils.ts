import { BusinessCard, PlanType } from './types';
import { PLANS } from './plans';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function isFeatureAllowed(plan: PlanType, feature: string): boolean {
  const planConfig = PLANS[plan];
  const feat = planConfig.features.find(f => f.name.toLowerCase().includes(feature.toLowerCase()));
  return feat ? feat.included : false;
}

export function canCreateCard(plan: PlanType, currentCount: number): boolean {
  return currentCount < PLANS[plan].maxCards;
}

export function isQrExpired(card: BusinessCard): boolean {
  if (!card.qrExpiresAt) return false;
  return new Date(card.qrExpiresAt).getTime() < Date.now();
}

export function getQrDaysRemaining(card: BusinessCard): number {
  if (!card.qrExpiresAt) return 0;
  const diff = new Date(card.qrExpiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function generateQrExpiration(): { generatedAt: string; expiresAt: string } {
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    generatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

export function buildWhatsappUrl(number: string, message: string): string {
  const cleanNumber = number.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

export function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validatePhoneNumber(phone: string): boolean {
  const clean = phone.replace(/[^0-9]/g, '');
  return clean.length >= 10 && clean.length <= 15;
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 0) return '';
  if (clean.length >= 12) {
    // +CC NNN NNN NNNN
    return `+${clean.slice(0, clean.length - 10)} ${clean.slice(-10, -7)} ${clean.slice(-7, -4)} ${clean.slice(-4)}`;
  }
  if (clean.length === 10) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  return clean;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

export function getRelativeTime(date: string): string {
  const now = Date.now();
  const past = new Date(date).getTime();
  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(date);
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'hace un momento';
}
