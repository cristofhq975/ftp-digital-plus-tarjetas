'use client';

import { BusinessCard } from '@/lib/types';
import { PLANS } from '@/lib/plans';
import { isQrExpired, getQrDaysRemaining, buildWhatsappUrl, formatPhone } from '@/lib/card-utils';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Phone, Mail, Globe, MapPin, Clock, MessageCircle, Instagram,
  Facebook, Linkedin, Youtube, Twitter, ShoppingBag, Briefcase,
  Star, Calendar, ExternalLink, Images, FileText, Quote, Users,
  Shield, Eye, QrCode as QrIcon, Sparkles, Heart, Building2,
  Cpu, Hash, Zap, Diamond,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardPreviewProps {
  card: BusinessCard;
  userPlan: string;
  previewMode?: 'full' | 'compact';
}

export function CardPreview({ card, userPlan, previewMode = 'full' }: CardPreviewProps) {
  const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.gratis;
  const isFreePlan = plan.id === 'gratis';
  const qrExpired = plan.qrExpires && card.qrExpiresAt ? isQrExpired(card) : false;
  const daysLeft = plan.qrExpires && card.qrExpiresAt ? getQrDaysRemaining(card) : 0;

  // WhatsApp URL for QR
  const whatsappUrl = card.whatsappNumber
    ? buildWhatsappUrl(card.whatsappNumber, card.whatsappMessage || 'Hola, vi tu tarjeta digital')
    : '';

  const qrValue = qrExpired
    ? 'https://ftpdigitalplus.com/qr-expirado'
    : whatsappUrl || 'https://ftpdigitalplus.com';

  const fontFamilyMap: Record<string, string> = {
    poppins: "'Poppins', sans-serif",
    inter: "'Inter', sans-serif",
    roboto: "'Roboto', sans-serif",
    montserrat: "'Montserrat', sans-serif",
    playfair: "'Playfair Display', serif",
    lora: "'Lora', serif",
    oswald: "'Oswald', sans-serif",
    raleway: "'Raleway', sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    fontFamily: fontFamilyMap[card.fontFamily] || "'Poppins', sans-serif",
    fontSize: `${card.fontSize}px`,
    color: card.textColor,
  };

  if (isFreePlan) {
    // Free plan: only show the downloadable image preview
    return <FreeCardPreview card={card} qrValue={qrValue} qrExpired={qrExpired} daysLeft={daysLeft} cardStyle={cardStyle} />;
  }

  // Dispatch to template-specific renderers for the 5 new premium templates.
  // The 5 original templates (moderno, clasico, minimalista, elegante, dinamica)
  // share a single layout defined below.
  switch (card.template) {
    case 'corporativo':
      return <CorporativoCard card={card} cardStyle={cardStyle} whatsappUrl={whatsappUrl} qrValue={qrValue} />;
    case 'creativo':
      return <CreativoCard card={card} cardStyle={cardStyle} whatsappUrl={whatsappUrl} qrValue={qrValue} />;
    case 'oscuro':
      return <OscuroCard card={card} cardStyle={cardStyle} whatsappUrl={whatsappUrl} qrValue={qrValue} />;
    case 'vintage':
      return <VintageCard card={card} cardStyle={cardStyle} whatsappUrl={whatsappUrl} qrValue={qrValue} />;
    case 'tech':
      return <TechCard card={card} cardStyle={cardStyle} whatsappUrl={whatsappUrl} qrValue={qrValue} />;
  }

  // Paid plans: full web card
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-2xl shadow-2xl',
        card.template === 'dinamica' && 'animate-[float_4s_ease-in-out_infinite]'
      )}
      style={{
        background: card.backgroundColor,
        ...cardStyle,
      }}
    >
      {/* Cover Photo */}
      <div className="relative h-40 w-full overflow-hidden" style={{ background: `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})` }}>
        {card.coverPhoto ? (
          <img src={card.coverPhoto} alt="Portada" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Sparkles className="h-12 w-12 text-white/30" />
          </div>
        )}
        {/* Banner */}
        {card.banner.enabled && card.banner.title && (
          <div className="absolute top-4 left-4 right-4 rounded-lg bg-white/95 p-3 shadow-lg">
            <p className="text-sm font-bold" style={{ color: card.primaryColor }}>{card.banner.title}</p>
            {card.banner.text && <p className="text-xs text-muted-foreground">{card.banner.text}</p>}
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="relative px-6 pb-6">
        <div className="-mt-12 mb-4 flex justify-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 shadow-lg" style={{ borderColor: card.backgroundColor }}>
            {card.profilePhoto ? (
              <img src={card.profilePhoto} alt={card.cardName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl" style={{ background: card.primaryColor, color: '#fff' }}>
                {card.cardName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold" style={{ color: card.textColor }}>{card.cardName}</h2>
          {card.description && (
            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {card.whatsappNumber && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-105"
              style={{ background: '#25D366' }}
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
          {card.socialLinks.facebook && (
            <a href={card.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full shadow-md transition hover:scale-110" style={{ background: '#1877F2', color: '#fff' }}>
              <Facebook className="h-4 w-4" />
            </a>
          )}
          {card.socialLinks.instagram && (
            <a href={card.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full shadow-md transition hover:scale-110" style={{ background: '#E4405F', color: '#fff' }}>
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {card.socialLinks.linkedin && (
            <a href={card.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full shadow-md transition hover:scale-110" style={{ background: '#0A66C2', color: '#fff' }}>
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {card.socialLinks.youtube && (
            <a href={card.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full shadow-md transition hover:scale-110" style={{ background: '#FF0000', color: '#fff' }}>
              <Youtube className="h-4 w-4" />
            </a>
          )}
          {card.socialLinks.twitter && (
            <a href={card.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full shadow-md transition hover:scale-110" style={{ background: '#000', color: '#fff' }}>
              <Twitter className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 px-6 pb-8">
        {/* QR Section */}
        {card.activeSections.includes('qr') && (
          <CardSection title="Mi QR" icon={<QrIcon className="h-5 w-5" />} primaryColor={card.primaryColor}>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl border-2 p-4" style={{ borderColor: card.primaryColor, background: card.qrBgColor }}>
                <QRCodeCanvas
                  value={qrValue}
                  size={160}
                  fgColor={card.qrColor}
                  bgColor={card.qrBgColor}
                  level="H"
                  imageSettings={card.qrLogo ? undefined : undefined}
                />
              </div>
              <p className="text-xs text-muted-foreground">Escanea para contactarme</p>
            </div>
          </CardSection>
        )}

        {/* Services */}
        {card.activeSections.includes('servicios') && card.services.length > 0 && (
          <CardSection title="Servicios" icon={<Briefcase className="h-5 w-5" />} primaryColor={card.primaryColor}>
            <div className="grid gap-3 sm:grid-cols-2">
              {card.services.map(s => (
                <div key={s.id} className="rounded-lg border p-3" style={{ borderColor: card.primaryColor + '30' }}>
                  {s.photo && <img src={s.photo} alt={s.name} className="mb-2 h-24 w-full rounded object-cover" />}
                  <h4 className="font-semibold" style={{ color: card.textColor }}>{s.name}</h4>
                  {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                  {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium" style={{ color: card.primaryColor }}>Ver más <ExternalLink className="h-3 w-3" /></a>}
                </div>
              ))}
            </div>
          </CardSection>
        )}

        {/* Products */}
        {card.activeSections.includes('productos') && card.products.length > 0 && (
          <CardSection title="Productos" icon={<ShoppingBag className="h-5 w-5" />} primaryColor={card.primaryColor}>
            <div className="grid gap-3 sm:grid-cols-2">
              {card.products.map(p => (
                <div key={p.id} className="rounded-lg border p-3" style={{ borderColor: card.primaryColor + '30' }}>
                  {p.image && <img src={p.image} alt={p.name} className="mb-2 h-24 w-full rounded object-cover" />}
                  <h4 className="font-semibold" style={{ color: card.textColor }}>{p.name}</h4>
                  {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold" style={{ color: card.primaryColor }}>
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: p.currency }).format(p.price)}
                    </span>
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium" style={{ color: card.primaryColor }}>Comprar</a>}
                  </div>
                </div>
              ))}
            </div>
          </CardSection>
        )}

        {/* Gallery */}
        {card.activeSections.includes('galeria') && card.gallery.length > 0 && (
          <CardSection title="Galería" icon={<Images className="h-5 w-5" />} primaryColor={card.primaryColor}>
            <div className="grid grid-cols-3 gap-2">
              {card.gallery.map(g => (
                <div key={g.id} className="aspect-square overflow-hidden rounded-lg">
                  {g.type === 'image' ? (
                    <img src={g.url} alt={g.caption} className="h-full w-full object-cover" />
                  ) : (
                    <video src={g.url} className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </CardSection>
        )}

        {/* Blog */}
        {card.activeSections.includes('blog') && card.blog.length > 0 && (
          <CardSection title="Blog" icon={<FileText className="h-5 w-5" />} primaryColor={card.primaryColor}>
            <div className="space-y-3">
              {card.blog.map(b => (
                <div key={b.id} className="rounded-lg border p-3" style={{ borderColor: card.primaryColor + '30' }}>
                  {b.image && <img src={b.image} alt={b.title} className="mb-2 h-32 w-full rounded object-cover" />}
                  <h4 className="font-semibold" style={{ color: card.textColor }}>{b.title}</h4>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </CardSection>
        )}

        {/* Testimonials */}
        {card.activeSections.includes('testimonios') && card.testimonials.length > 0 && (
          <CardSection title="Testimonios" icon={<Quote className="h-5 w-5" />} primaryColor={card.primaryColor}>
            <div className="space-y-3">
              {card.testimonials.map(t => (
                <div key={t.id} className="rounded-lg border p-3" style={{ borderColor: card.primaryColor + '30' }}>
                  <div className="mb-2 flex items-center gap-3">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: card.primaryColor }}>
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm" style={{ color: card.textColor }}>{t.name}</p>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn('h-3 w-3', i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
                </div>
              ))}
            </div>
          </CardSection>
        )}

        {/* Team */}
        {card.activeSections.includes('equipo') && card.team.length > 0 && (
          <CardSection title="Equipo y Citas" icon={<Users className="h-5 w-5" />} primaryColor={card.primaryColor}>
            <div className="space-y-3">
              {card.team.map(m => (
                <div key={m.id} className="rounded-lg border p-3" style={{ borderColor: card.primaryColor + '30' }}>
                  <div className="flex items-center gap-3">
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full font-bold text-white" style={{ background: card.primaryColor }}>
                        {m.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold" style={{ color: card.textColor }}>{m.name}</p>
                      <p className="text-xs" style={{ color: card.primaryColor }}>{m.role}</p>
                    </div>
                  </div>
                  {m.bio && <p className="mt-2 text-xs text-muted-foreground">{m.bio}</p>}
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {m.appointmentDuration} min
                    </span>
                    {m.isPaid && (
                      <span className="font-semibold" style={{ color: card.primaryColor }}>
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(m.appointmentPrice)}
                      </span>
                    )}
                  </div>
                  <button className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold text-white" style={{ background: card.primaryColor }}>
                    <Calendar className="h-3 w-3" /> Agendar Cita
                  </button>
                </div>
              ))}
            </div>
          </CardSection>
        )}

        {/* Schedule */}
        {card.activeSections.includes('horario') && (
          <CardSection title="Horario de Atención" icon={<Clock className="h-5 w-5" />} primaryColor={card.primaryColor}>
            <div className="space-y-1 text-sm">
              {[
                { label: 'Lunes', data: card.schedule.monday },
                { label: 'Martes', data: card.schedule.tuesday },
                { label: 'Miércoles', data: card.schedule.wednesday },
                { label: 'Jueves', data: card.schedule.thursday },
                { label: 'Viernes', data: card.schedule.friday },
                { label: 'Sábado', data: card.schedule.saturday },
                { label: 'Domingo', data: card.schedule.sunday },
              ].map(day => (
                <div key={day.label} className="flex justify-between border-b pb-1" style={{ borderColor: card.primaryColor + '15' }}>
                  <span className="font-medium" style={{ color: card.textColor }}>{day.label}</span>
                  <span className={day.data.open ? '' : 'text-red-500'}>
                    {day.data.open ? `${day.data.start} - ${day.data.end}` : 'Cerrado'}
                  </span>
                </div>
              ))}
            </div>
          </CardSection>
        )}

        {/* Instagram Embed */}
        {card.instagramEmbed && (
          <CardSection title="Instagram" icon={<Instagram className="h-5 w-5" />} primaryColor={card.primaryColor}>
            <div className="rounded-lg border p-3 text-center" style={{ borderColor: card.primaryColor + '30' }}>
              <a href={card.instagramEmbed} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: card.primaryColor }}>
                <Instagram className="h-4 w-4" /> Ver perfil de Instagram
              </a>
            </div>
          </CardSection>
        )}

        {/* Floating Frames */}
        {card.floatingFrames.length > 0 && (
          <CardSection title="Enlaces" icon={<ExternalLink className="h-5 w-5" />} primaryColor={card.primaryColor}>
            <div className="space-y-2">
              {card.floatingFrames.map(f => (
                <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border p-2 text-sm transition hover:bg-muted" style={{ borderColor: card.primaryColor + '30' }}>
                  <ExternalLink className="h-4 w-4" style={{ color: card.primaryColor }} />
                  <span style={{ color: card.textColor }}>{f.title}</span>
                </a>
              ))}
            </div>
          </CardSection>
        )}
      </div>

      {/* Footer / Branding */}
      {!card.hideBrand && (
        <div className="border-t px-6 py-4 text-center" style={{ borderColor: card.primaryColor + '20' }}>
          <p className="text-xs text-muted-foreground">
            Creado con <Heart className="inline h-3 w-3 fill-red-500 text-red-500" /> por{' '}
            <span className="font-bold" style={{ color: card.primaryColor }}>FTP Digital Plus</span>
          </p>
        </div>
      )}
    </div>
  );
}

function CardSection({ title, icon, children, primaryColor }: { title: string; icon: React.ReactNode; children: React.ReactNode; primaryColor: string }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: primaryColor }}>
          {icon}
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FreeCardPreview({ card, qrValue, qrExpired, daysLeft, cardStyle }: {
  card: BusinessCard;
  qrValue: string;
  qrExpired: boolean;
  daysLeft: number;
  cardStyle: React.CSSProperties;
}) {
  const whatsappUrl = card.whatsappNumber
    ? buildWhatsappUrl(card.whatsappNumber, card.whatsappMessage || 'Hola, vi tu tarjeta digital')
    : '';

  return (
    <div className="mx-auto max-w-sm">
      <div className="overflow-hidden rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(135deg, ' + card.primaryColor + ', ' + card.secondaryColor + ')' }}>
        {/* Decorative elements */}
        <div className="relative px-6 pt-8 pb-6 text-center">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10" />

          {/* Profile */}
          <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg">
            {card.profilePhoto ? (
              <img src={card.profilePhoto} alt={card.cardName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                {card.cardName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white">{card.cardName}</h2>

          {card.description && (
            <p className="mt-2 text-sm text-white/90 line-clamp-3">{card.description}</p>
          )}

          {card.whatsappNumber && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
              <Phone className="h-3.5 w-3.5" />
              {formatPhone(card.whatsappNumber)}
            </div>
          )}
        </div>

        {/* QR Card */}
        <div className="bg-white p-6">
          <div className="mx-auto mb-4 flex flex-col items-center">
            <div className="rounded-xl border-2 p-3" style={{ borderColor: card.primaryColor }}>
              <QRCodeCanvas
                value={qrValue}
                size={160}
                fgColor={qrExpired ? '#ef4444' : card.qrColor}
                bgColor={card.qrBgColor}
                level="H"
              />
            </div>

            {qrExpired ? (
              <div className="mt-3 text-center">
                <p className="text-sm font-bold text-red-500">⚠ QR EXPIRADO</p>
                <p className="text-xs text-muted-foreground">Renueva en ftpdigitalplus.com</p>
              </div>
            ) : daysLeft > 0 ? (
              <div className="mt-3 text-center">
                <p className="text-xs font-semibold text-amber-600">
                  ⏳ Expira en {daysLeft} día{daysLeft !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">Escanea para WhatsApp</p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">Escanea para WhatsApp</p>
            )}
          </div>
        </div>

        {/* Watermark */}
        <div className="flex items-center justify-between bg-emerald-700 px-6 py-3">
          <span className="text-sm font-bold text-white">FTP Digital Plus</span>
          <span className="text-xs text-amber-300">ftpdigitalplus.com</span>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Vista previa de la imagen descargable (Plan Gratis)
      </p>
    </div>
  );
}

/* ============================================================
   Template-specific renderers — 5 new premium templates
   (Task 11-b)
   Each renderer receives the same shared props so they can
   compose their own layout while reusing colors / QR.
   ============================================================ */

interface TemplateRenderProps {
  card: BusinessCard;
  cardStyle: React.CSSProperties;
  whatsappUrl: string;
  qrValue: string;
}

/* --- Small helpers shared by the new templates --- */

function SocialRow({
  card,
  whatsappUrl,
  variant = 'light',
}: {
  card: BusinessCard;
  whatsappUrl: string;
  variant?: 'light' | 'dark' | 'tech';
}) {
  const items: { href?: string; label: string; icon: React.ReactNode; bg: string }[] = [];
  if (card.whatsappNumber) {
    items.push({ href: whatsappUrl, label: 'WhatsApp', icon: <MessageCircle className="h-3.5 w-3.5" />, bg: '#25D366' });
  }
  if (card.socialLinks.facebook) items.push({ href: card.socialLinks.facebook, label: 'Facebook', icon: <Facebook className="h-3.5 w-3.5" />, bg: '#1877F2' });
  if (card.socialLinks.instagram) items.push({ href: card.socialLinks.instagram, label: 'Instagram', icon: <Instagram className="h-3.5 w-3.5" />, bg: '#E4405F' });
  if (card.socialLinks.linkedin) items.push({ href: card.socialLinks.linkedin, label: 'LinkedIn', icon: <Linkedin className="h-3.5 w-3.5" />, bg: '#0A66C2' });
  if (card.socialLinks.youtube) items.push({ href: card.socialLinks.youtube, label: 'YouTube', icon: <Youtube className="h-3.5 w-3.5" />, bg: '#FF0000' });
  if (card.socialLinks.twitter) items.push({ href: card.socialLinks.twitter, label: 'X', icon: <Twitter className="h-3.5 w-3.5" />, bg: '#000000' });

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={it.label}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition hover:scale-110',
            variant === 'tech' && 'rounded-md',
          )}
          style={{ background: it.bg }}
        >
          {it.icon}
        </a>
      ))}
    </div>
  );
}

function QrBlock({
  card,
  qrValue,
  variant = 'light',
}: {
  card: BusinessCard;
  qrValue: string;
  variant?: 'light' | 'dark' | 'tech';
}) {
  if (!card.activeSections.includes('qr')) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'rounded-xl p-3',
          variant === 'tech' ? 'neon-border' : 'border-2',
        )}
        style={variant === 'tech' ? { background: 'rgba(0,0,0,0.6)' } : { borderColor: card.primaryColor, background: card.qrBgColor }}
      >
        <QRCodeCanvas value={qrValue} size={140} fgColor={card.qrColor} bgColor={variant === 'tech' ? 'rgba(0,0,0,0)' : card.qrBgColor} level="H" />
      </div>
      <p className="text-[11px] opacity-70">Escanea para contactarme</p>
    </div>
  );
}

/* ====================================================================
   1. CORPORATIVO — Formal sidebar layout, navy + serif fonts
   ==================================================================== */

function CorporativoCard({ card, cardStyle, whatsappUrl, qrValue }: TemplateRenderProps) {
  const navy = '#0f1e3d';
  const gold = card.primaryColor;
  const light = '#f5f5f0';

  return (
    <div
      className={cn('template-corporativo w-full overflow-hidden rounded-2xl shadow-2xl')}
      style={{ ...cardStyle, background: light, color: '#1c2540', fontFamily: "'Playfair Display', serif" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="relative p-6 text-white" style={{ background: navy }}>
          <div className="absolute right-0 top-0 h-24 w-24 opacity-20" style={{ background: `linear-gradient(135deg, ${gold}, transparent)` }} />
          <div className="mb-6 flex items-center gap-3">
            {card.profilePhoto ? (
              <img src={card.profilePhoto} alt={card.cardName} className="h-16 w-16 rounded-full border-2 object-cover" style={{ borderColor: gold }} />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 text-2xl font-bold" style={{ borderColor: gold, color: gold }}>
                {card.cardName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold leading-tight">{card.cardName}</h2>
          {card.description && <p className="mt-2 text-xs opacity-75">{card.description}</p>}
          <div className="my-5 h-px w-full opacity-30" style={{ background: gold }} />

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" style={{ color: gold }} />
              <span className="opacity-80">Empresa profesional</span>
            </div>
            {card.whatsappNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" style={{ color: gold }} />
                <span className="opacity-80">{formatPhone(card.whatsappNumber)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" style={{ color: gold }} />
              <span className="opacity-80">Lun–Vie 9–18h</span>
            </div>
          </div>

          <div className="mt-6">
            <QrBlock card={card} qrValue={qrValue} variant="dark" />
          </div>
        </aside>

        {/* Main content */}
        <main className="space-y-6 p-6">
          <header className="border-b-2 pb-3" style={{ borderColor: gold }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70" style={{ color: gold }}>
              {card.linkName || 'Perfil Corporativo'}
            </p>
            <h3 className="mt-1 text-2xl font-bold" style={{ color: navy }}>
              {card.cardName}
            </h3>
          </header>

          {card.activeSections.includes('servicios') && card.services.length > 0 && (
            <section>
              <SectionTitle label="Servicios" color={gold} />
              <div className="grid gap-3 sm:grid-cols-2">
                {card.services.map((s) => (
                  <div key={s.id} className="rounded-md border-l-2 bg-white/60 p-3 shadow-sm" style={{ borderColor: gold }}>
                    {s.photo && <img src={s.photo} alt={s.name} className="mb-2 h-20 w-full rounded object-cover" />}
                    <h4 className="text-sm font-semibold" style={{ color: navy }}>{s.name}</h4>
                    {s.description && <p className="text-[11px] opacity-70">{s.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {card.activeSections.includes('productos') && card.products.length > 0 && (
            <section>
              <SectionTitle label="Productos" color={gold} />
              <div className="grid gap-3 sm:grid-cols-2">
                {card.products.map((p) => (
                  <div key={p.id} className="rounded-md border-l-2 bg-white/60 p-3" style={{ borderColor: gold }}>
                    <h4 className="text-sm font-semibold" style={{ color: navy }}>{p.name}</h4>
                    <span className="text-xs font-bold" style={{ color: gold }}>
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: p.currency }).format(p.price)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {card.activeSections.includes('equipo') && card.team.length > 0 && (
            <section>
              <SectionTitle label="Equipo" color={gold} />
              <div className="grid gap-2 sm:grid-cols-2">
                {card.team.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 rounded-md bg-white/60 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: navy }}>
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: navy }}>{m.name}</p>
                      <p className="text-[10px] opacity-70">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <SocialRow card={card} whatsappUrl={whatsappUrl} variant="light" />

          {!card.hideBrand && (
            <footer className="border-t pt-3 text-center text-[10px] opacity-60" style={{ borderColor: gold + '40' }}>
              Creado con <Heart className="inline h-2.5 w-2.5 fill-red-500 text-red-500" /> por{' '}
              <span className="font-bold" style={{ color: gold }}>FTP Digital Plus</span>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionTitle({ label, color }: { label: string; color: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-4 w-1 rounded" style={{ background: color }} />
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1c2540' }}>
        {label}
      </h3>
      <span className="ml-auto h-px flex-1 opacity-30" style={{ background: color }} />
    </div>
  );
}

/* ====================================================================
   2. CREATIVO — Vibrant, asymmetric, blob shapes
   ==================================================================== */

function CreativoCard({ card, cardStyle, whatsappUrl, qrValue }: TemplateRenderProps) {
  return (
    <div
      className={cn('template-creativo relative w-full overflow-hidden rounded-[2rem] shadow-2xl')}
      style={{ ...cardStyle, background: `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})`, color: '#fff' }}
    >
      {/* Blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -left-12 bottom-20 h-48 w-48 rounded-[40%] bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute right-10 bottom-0 h-24 w-24 rounded-full bg-amber-300/30 blur-xl" />

      <div className="relative p-6">
        {/* Asymmetric header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex rotate-[-3deg] rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
              <Sparkles className="mr-1 h-3 w-3" /> Creativo
            </div>
            <h2 className="text-3xl font-black leading-none">{card.cardName}</h2>
            {card.description && <p className="mt-2 max-w-[80%] text-xs opacity-90">{card.description}</p>}
          </div>
          <div className="relative h-20 w-20 shrink-0 rotate-6 overflow-hidden rounded-3xl border-4 border-white/40 shadow-lg">
            {card.profilePhoto ? (
              <img src={card.profilePhoto} alt={card.cardName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-black">
                {card.cardName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Wave divider */}
        <svg viewBox="0 0 120 12" preserveAspectRatio="none" className="mt-5 h-3 w-full text-white/30">
          <path d="M0,6 Q15,0 30,6 T60,6 T90,6 T120,6 V12 H0 Z" fill="currentColor" />
        </svg>

        {/* Floating services */}
        {card.activeSections.includes('servicios') && card.services.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {card.services.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  'rounded-2xl bg-white/15 p-3 backdrop-blur transition hover:scale-105',
                  i % 2 === 0 ? 'rotate-[-1deg]' : 'rotate-1',
                )}
              >
                {s.photo && <img src={s.photo} alt={s.name} className="mb-2 h-16 w-full rounded-xl object-cover" />}
                <h4 className="text-sm font-bold">{s.name}</h4>
                {s.description && <p className="text-[10px] opacity-85">{s.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Bottom row */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {card.activeSections.includes('qr') && <QrBlock card={card} qrValue={qrValue} variant="dark" />}
          <div className="flex flex-col gap-3">
            {card.whatsappNumber && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow"
              >
                <MessageCircle className="h-4 w-4" /> {formatPhone(card.whatsappNumber)}
              </a>
            )}
            <SocialRow card={card} whatsappUrl={whatsappUrl} variant="dark" />
          </div>
        </div>

        {!card.hideBrand && (
          <p className="mt-5 text-center text-[10px] opacity-80">
            Creado con <Heart className="inline h-2.5 w-2.5 fill-red-300 text-red-300" /> por FTP Digital Plus
          </p>
        )}
      </div>
    </div>
  );
}

/* ====================================================================
   3. OSCURO — Dark slate background, emerald accents, glass cards
   ==================================================================== */

function OscuroCard({ card, cardStyle, whatsappUrl, qrValue }: TemplateRenderProps) {
  const accent = card.primaryColor;
  return (
    <div
      className={cn('template-oscuro relative w-full overflow-hidden rounded-2xl shadow-2xl')}
      style={{ ...cardStyle, background: '#0f172a', color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Aurora */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{ background: accent }} />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/15 shadow-lg"
            style={{ boxShadow: `0 0 30px -8px ${accent}80` }}
          >
            {card.profilePhoto ? (
              <img src={card.profilePhoto} alt={card.cardName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold" style={{ background: accent, color: '#fff' }}>
                {card.cardName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>Modo Oscuro</p>
            <h2 className="text-2xl font-bold">{card.cardName}</h2>
            {card.description && <p className="mt-1 text-xs text-slate-300/80">{card.description}</p>}
          </div>
        </div>

        {/* Glass sections */}
        <div className="mt-6 space-y-4">
          {card.activeSections.includes('servicios') && card.services.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Briefcase className="h-4 w-4" style={{ color: accent }} /> Servicios
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {card.services.map((s) => (
                  <div key={s.id} className="rounded-lg bg-white/5 p-2">
                    <h4 className="text-xs font-semibold">{s.name}</h4>
                    {s.description && <p className="text-[10px] text-slate-400">{s.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {card.activeSections.includes('testimonios') && card.testimonials.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Quote className="h-4 w-4" style={{ color: accent }} /> Testimonios
              </h3>
              <div className="space-y-2">
                {card.testimonials.map((t) => (
                  <div key={t.id} className="rounded-lg bg-white/5 p-2">
                    <p className="text-[11px] italic text-slate-300">"{t.text}"</p>
                    <p className="mt-1 text-[10px] font-semibold" style={{ color: accent }}>— {t.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* QR + socials */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <QrBlock card={card} qrValue={qrValue} variant="dark" />
          <div className="flex flex-col gap-3">
            <SocialRow card={card} whatsappUrl={whatsappUrl} variant="dark" />
          </div>
        </div>

        {!card.hideBrand && (
          <p className="mt-5 text-center text-[10px] text-slate-400">
            Creado con <Heart className="inline h-2.5 w-2.5 fill-emerald-400 text-emerald-400" /> por{' '}
            <span className="font-bold" style={{ color: accent }}>FTP Digital Plus</span>
          </p>
        )}
      </div>
    </div>
  );
}

/* ====================================================================
   4. VINTAGE — Sepia, serif, ornamental borders, paper texture
   ==================================================================== */

function VintageCard({ card, cardStyle, whatsappUrl, qrValue }: TemplateRenderProps) {
  const sepiaBg = '#f3ead3';
  const sepiaFg = '#5b3a1a';
  const accent = card.primaryColor || '#a16207';
  return (
    <div
      className={cn('template-vintage paper-texture relative w-full overflow-hidden rounded-sm shadow-2xl')}
      style={{ ...cardStyle, background: sepiaBg, color: sepiaFg, fontFamily: "'Playfair Display', serif" }}
    >
      {/* Ornamental border */}
      <div className="pointer-events-none absolute inset-2 border-2 border-double" style={{ borderColor: accent + '60' }} />
      <div className="pointer-events-none absolute inset-3 border" style={{ borderColor: accent + '40' }} />

      <div className="relative p-8">
        {/* Ornament top */}
        <div className="mb-4 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.4em]" style={{ color: accent }}>
          <span>✦</span>
          <span>Establecido</span>
          <span>✦</span>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center text-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-double shadow-md" style={{ borderColor: accent }}>
            {card.profilePhoto ? (
              <img src={card.profilePhoto} alt={card.cardName} className="h-full w-full object-cover" style={{ filter: 'sepia(0.3)' }} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold" style={{ color: accent, background: '#fff' }}>
                {card.cardName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="mt-3 text-3xl font-bold italic" style={{ color: sepiaFg }}>{card.cardName}</h2>
          {card.description && <p className="mt-2 max-w-md text-xs italic opacity-80">{card.description}</p>}
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 opacity-40" style={{ background: accent }} />
          <Diamond className="h-3 w-3" style={{ color: accent }} />
          <span className="h-px flex-1 opacity-40" style={{ background: accent }} />
        </div>

        {/* Sections */}
        {card.activeSections.includes('servicios') && card.services.length > 0 && (
          <section className="mb-5">
            <h3 className="mb-2 text-center text-sm font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>Servicios</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {card.services.map((s) => (
                <div key={s.id} className="border border-dashed p-2 text-center" style={{ borderColor: accent + '50' }}>
                  <h4 className="text-xs font-bold">{s.name}</h4>
                  {s.description && <p className="text-[10px] opacity-70">{s.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {card.activeSections.includes('testimonios') && card.testimonials.length > 0 && (
          <section className="mb-5 text-center">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>Testimonios</h3>
            <blockquote className="mx-auto max-w-md text-xs italic">
              "{card.testimonials[0].text}"
              <footer className="mt-1 text-[10px] not-italic opacity-70">— {card.testimonials[0].name}</footer>
            </blockquote>
          </section>
        )}

        {/* QR + contact */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <QrBlock card={card} qrValue={qrValue} variant="light" />
          {card.whatsappNumber && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
              style={{ borderColor: accent, color: accent }}
            >
              <MessageCircle className="h-3.5 w-3.5" /> {formatPhone(card.whatsappNumber)}
            </a>
          )}
          <SocialRow card={card} whatsappUrl={whatsappUrl} variant="light" />
        </div>

        {!card.hideBrand && (
          <p className="mt-6 text-center text-[10px] italic opacity-60">
            Creado con <Heart className="inline h-2.5 w-2.5 fill-red-700 text-red-700" /> por FTP Digital Plus
          </p>
        )}
      </div>
    </div>
  );
}

/* ====================================================================
   5. TECH — Dark, neon, monospace, grid pattern, glow effects
   ==================================================================== */

function TechCard({ card, cardStyle, whatsappUrl, qrValue }: TemplateRenderProps) {
  const neon = card.primaryColor || '#10b981';
  const cyan = card.secondaryColor || '#06b6d4';
  return (
    <div
      className={cn('template-tech relative w-full overflow-hidden rounded-lg shadow-2xl')}
      style={{ ...cardStyle, background: '#0a0f1c', color: '#e2f5e9', fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Grid overlay handled via ::before in CSS */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-20 blur-3xl" style={{ background: neon }} />

      <div className="relative p-5">
        {/* Header bar — terminal style */}
        <div className="mb-4 flex items-center justify-between rounded border border-white/10 bg-black/40 px-3 py-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full" style={{ background: neon }} />
          </div>
          <span className="opacity-70">~/ftp-digital-plus/{card.linkName || 'card'}</span>
          <span className="hidden sm:inline opacity-50">v2.0.1</span>
        </div>

        {/* Identity */}
        <div className="flex items-center gap-4">
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-lg border text-2xl font-bold neon-border"
            style={{ background: 'rgba(0,0,0,0.5)', color: neon }}
          >
            {card.profilePhoto ? (
              <img src={card.profilePhoto} alt={card.cardName} className="h-full w-full rounded-lg object-cover" />
            ) : (
              <span className="neon-text" style={{ color: neon }}>
                {card.cardName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] opacity-60">
              <Hash className="mr-1 inline h-3 w-3" />user_id
            </p>
            <h2 className="text-xl font-bold neon-text" style={{ color: neon }}>
              {card.cardName}
            </h2>
            {card.description && <p className="mt-1 max-w-xs text-[11px] opacity-70">{card.description}</p>}
          </div>
        </div>

        {/* Stats line */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
          <div className="rounded border border-white/10 bg-black/30 p-2">
            <p className="opacity-60">visitas</p>
            <p className="font-bold" style={{ color: cyan }}>{card.views}</p>
          </div>
          <div className="rounded border border-white/10 bg-black/30 p-2">
            <p className="opacity-60">qr_scans</p>
            <p className="font-bold" style={{ color: cyan }}>{card.qrScans}</p>
          </div>
          <div className="rounded border border-white/10 bg-black/30 p-2">
            <p className="opacity-60">status</p>
            <p className="font-bold neon-text" style={{ color: neon }}>online</p>
          </div>
        </div>

        {/* Services as code-like list */}
        {card.activeSections.includes('servicios') && card.services.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[10px] opacity-60">
              <Cpu className="mr-1 inline h-3 w-3" />services[]
            </p>
            <div className="space-y-1.5">
              {card.services.slice(0, 4).map((s, i) => (
                <div key={s.id} className="flex items-start gap-2 rounded border border-white/5 bg-black/30 px-2 py-1.5 text-[11px]">
                  <span style={{ color: cyan }}>{String(i).padStart(2, '0')}</span>
                  <span className="font-semibold" style={{ color: neon }}>{s.name}</span>
                  {s.description && <span className="opacity-60">{'// '}{s.description.slice(0, 40)}{s.description.length > 40 ? '...' : ''}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR + actions */}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <QrBlock card={card} qrValue={qrValue} variant="tech" />
          <div className="flex flex-col gap-2">
            {card.whatsappNumber && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start rounded border px-3 py-1.5 text-[11px] font-bold neon-border"
                style={{ color: neon }}
              >
                <Zap className="h-3 w-3" /> /contact
              </a>
            )}
            <SocialRow card={card} whatsappUrl={whatsappUrl} variant="tech" />
          </div>
        </div>

        {!card.hideBrand && (
          <p className="mt-5 text-center text-[10px] opacity-50">
            <span className="opacity-70">{'//'}</span> built with{' '}
            <span className="neon-text font-bold" style={{ color: neon }}>FTP_Digital_Plus</span>
          </p>
        )}
      </div>
    </div>
  );
}
