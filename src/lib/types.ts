// Tipos centrales para FTP Digital Plus - Tarjetas Digitales

export type PlanType = 'gratis' | 'basico' | 'pro';

export type ViewType =
  | 'landing'
  | 'pricing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'editor'
  | 'public-card'
  | 'qr-expired'
  | 'messages'
  | 'appointments'
  | 'orders'
  | 'virtual-funds'
  | 'affiliations'
  | 'storage'
  | 'settings'
  | 'stats'
  | 'template-gallery';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  plan: PlanType;
  createdAt: string;
  avatar?: string;
}

export interface Service {
  id: string;
  name: string;
  url: string;
  description: string;
  photo: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  image: string;
  url: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  photo: string;
  rating: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  appointmentDuration: number;
  appointmentPrice: number;
  isPaid: boolean;
}

export interface Appointment {
  id: string;
  teamMemberId: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
  whatsapp: string;
  telegram: string;
}

export interface FloatingFrame {
  id: string;
  title: string;
  url: string;
}

export interface Banner {
  enabled: boolean;
  title: string;
  text: string;
  imageUrl: string;
  linkUrl: string;
}

export interface Schedule {
  monday: { open: boolean; start: string; end: string };
  tuesday: { open: boolean; start: string; end: string };
  wednesday: { open: boolean; start: string; end: string };
  thursday: { open: boolean; start: string; end: string };
  friday: { open: boolean; start: string; end: string };
  saturday: { open: boolean; start: string; end: string };
  sunday: { open: boolean; start: string; end: string };
}

export interface ContactMessage {
  id: string;
  cardId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
}

export interface BusinessCard {
  id: string;
  userId: string;
  // Detalles básicos
  linkName: string;
  cardName: string;
  description: string;
  logo: string;
  coverPhoto: string;
  profilePhoto: string;
  // Plantilla
  template: 'moderno' | 'clasico' | 'minimalista' | 'elegante' | 'dinamica';
  // Personalización
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  customCSS: string;
  customJS: string;
  // QR
  qrStyle: 'cuadrado' | 'redondo' | 'puntos';
  qrColor: string;
  qrBgColor: string;
  qrLogo: string;
  qrGeneratedAt: string | null;
  qrExpiresAt: string | null;
  // WhatsApp
  whatsappNumber: string;
  whatsappVerified: boolean;
  whatsappMessage: string;
  // Horario
  schedule: Schedule;
  // Secciones
  services: Service[];
  products: Product[];
  gallery: GalleryItem[];
  blog: BlogPost[];
  testimonials: Testimonial[];
  team: TeamMember[];
  socialLinks: SocialLinks;
  instagramEmbed: string;
  floatingFrames: FloatingFrame[];
  banner: Banner;
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  // Legal
  privacyPolicy: string;
  terms: string;
  // Admin
  activeSections: string[];
  hideBrand: boolean;
  passwordProtected: boolean;
  cardPassword: string;
  // Stats
  views: number;
  qrScans: number;
  isActive: boolean;
  createdAt: string;
  // Afiliación
  affiliateCode: string;
  affiliateClicks: number;
}

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number;
  period: string;
  description: string;
  maxCards: number;
  storage: number;
  hasWebCard: boolean;
  hasWatermark: boolean;
  qrExpires: boolean;
  qrExpirationDays: number;
  features: PlanFeature[];
  highlight: boolean;
  badge?: string;
}
