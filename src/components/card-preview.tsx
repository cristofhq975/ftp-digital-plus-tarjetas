'use client';

import { BusinessCard } from '@/lib/types';
import { PLANS } from '@/lib/plans';
import { isQrExpired, getQrDaysRemaining, buildWhatsappUrl, formatPhone } from '@/lib/card-utils';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Phone, Mail, Globe, MapPin, Clock, MessageCircle, Instagram,
  Facebook, Linkedin, Youtube, Twitter, ShoppingBag, Briefcase,
  Star, Calendar, ExternalLink, Images, FileText, Quote, Users,
  Shield, Eye, QrCode as QrIcon, Sparkles, Heart,
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
