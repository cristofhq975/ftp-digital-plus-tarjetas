'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import {
  Copy, Check, Download, Share2, Mail, Link2, X, Code2,
  MessageCircle, Facebook, Send, QrCode, Image as ImageIcon,
} from 'lucide-react';

import { BusinessCard, PlanType } from '@/lib/types';
import { PLANS } from '@/lib/plans';
import {
  buildWhatsappUrl, isQrExpired,
} from '@/lib/card-utils';
import { generateCardImage, downloadDataUrl } from '@/lib/card-image';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: BusinessCard | null;
}

const PUBLIC_URL_BASE = 'https://ftpdigitalplus.com/t/';

function getQrValue(card: BusinessCard, plan: PlanType): string {
  const planConfig = PLANS[plan];
  const expired = planConfig.qrExpires && card.qrExpiresAt ? isQrExpired(card) : false;
  if (expired) return 'https://ftpdigitalplus.com/qr-expirado';
  if (card.whatsappNumber) {
    return buildWhatsappUrl(card.whatsappNumber, card.whatsappMessage || 'Hola, vi tu tarjeta digital');
  }
  return `${PUBLIC_URL_BASE}${card.linkName}`;
}

/**
 * Modal de compartir reutilizable.
 * - URL pública + copiar
 * - Código QR descargable
 * - Botones sociales (WhatsApp, Facebook, X, LinkedIn, Telegram, Email)
 * - Native share (móvil)
 * - Descarga de imagen de tarjeta
 * - Código embed (iframe) con copiar
 * - Mensaje personalizado que se anexa a las URLs de share
 */
export function ShareModal({ open, onOpenChange, card }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [activeTab, setActiveTab] = useState('share');

  // Reset states on close
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCopied(false);
      setCopiedEmbed(false);
      setCustomMessage('');
      setActiveTab('share');
    }
  }, [open]);

  if (!card) return null;

  const shareUrl = `${PUBLIC_URL_BASE}${card.linkName}`;
  const fullShareText = customMessage.trim()
    ? `${customMessage.trim()} ${shareUrl}`
    : `Mira mi tarjeta digital: ${shareUrl}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast.error('Tu navegador no soporta compartir nativo');
      return;
    }
    try {
      await navigator.share({
        title: card.cardName,
        text: customMessage.trim() || `Mira mi tarjeta digital`,
        url: shareUrl,
      });
    } catch {
      // User cancelled — silent
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-emerald-100/60 bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/40 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
              <Share2 className="h-4 w-4" />
            </span>
            Compartir tarjeta
          </DialogTitle>
          <DialogDescription className="text-xs">
            Comparte <span className="font-semibold text-emerald-700">{card.cardName}</span> por QR, redes sociales o copiando su enlace público.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3 bg-emerald-50/60">
              <TabsTrigger value="share" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                <Share2 className="h-3.5 w-3.5" /> Compartir
              </TabsTrigger>
              <TabsTrigger value="qr" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                <QrCode className="h-3.5 w-3.5" /> Código QR
              </TabsTrigger>
              <TabsTrigger value="embed" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                <Code2 className="h-3.5 w-3.5" /> Embebido
              </TabsTrigger>
            </TabsList>
          </div>

          {/* SHARE TAB */}
          <TabsContent value="share" className="mt-4 px-6 pb-6 focus-visible:outline-none">
            <ShareTabBody
              card={card}
              shareUrl={shareUrl}
              fullShareText={fullShareText}
              copied={copied}
              onCopyUrl={handleCopyUrl}
              onNativeShare={handleNativeShare}
              customMessage={customMessage}
              setCustomMessage={setCustomMessage}
            />
          </TabsContent>

          {/* QR TAB */}
          <TabsContent value="qr" className="mt-4 px-6 pb-6 focus-visible:outline-none">
            <QrTabBody card={card} shareUrl={shareUrl} />
          </TabsContent>

          {/* EMBED TAB */}
          <TabsContent value="embed" className="mt-4 px-6 pb-6 focus-visible:outline-none">
            <EmbedTabBody
              card={card}
              shareUrl={shareUrl}
              copiedEmbed={copiedEmbed}
              setCopiedEmbed={setCopiedEmbed}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/* ============================== SHARE TAB ============================== */

function ShareTabBody({
  card, shareUrl, fullShareText, copied, onCopyUrl, onNativeShare,
  customMessage, setCustomMessage,
}: {
  card: BusinessCard;
  shareUrl: string;
  fullShareText: string;
  copied: boolean;
  onCopyUrl: () => void;
  onNativeShare: () => void;
  customMessage: string;
  setCustomMessage: (v: string) => void;
}) {
  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const socials: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    href: string;
    label: string;
  }[] = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#1da851] text-white',
      href: `https://wa.me/?text=${encodeURIComponent(fullShareText)}`,
      label: 'Compartir por WhatsApp',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#145dbd] text-white',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(customMessage.trim())}`,
      label: 'Compartir en Facebook',
    },
    {
      name: 'X',
      icon: X,
      color: 'bg-slate-900 hover:bg-slate-800 text-white',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}`,
      label: 'Compartir en X (Twitter)',
    },
    {
      name: 'LinkedIn',
      icon: Share2,
      color: 'bg-[#0A66C2] hover:bg-[#084d94] text-white',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      label: 'Compartir en LinkedIn',
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#0088cc] hover:bg-[#006da3] text-white',
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(customMessage.trim())}`,
      label: 'Compartir por Telegram',
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-slate-500 hover:bg-slate-600 text-white',
      href: `mailto:?subject=${encodeURIComponent(`Tarjeta digital: ${card.cardName}`)}&body=${encodeURIComponent(fullShareText)}`,
      label: 'Compartir por correo electrónico',
    },
  ];

  return (
    <div className="space-y-5">
      {/* URL display */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Link2 className="h-3.5 w-3.5 text-emerald-600" />
          Enlace público
        </label>
        <div className="flex items-stretch gap-2">
          <div className="flex h-10 flex-1 items-center rounded-md border border-emerald-200 bg-emerald-50/40 px-3">
            <span className="truncate font-mono text-xs text-slate-700 sm:text-sm">
              ftpdigitalplus.com/t/<span className="font-semibold text-emerald-700">{card.linkName}</span>
            </span>
          </div>
          <Button
            onClick={onCopyUrl}
            size="sm"
            className={cn(
              'h-10 shrink-0 px-3 transition-colors',
              copied
                ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            )}
          >
            {copied ? <><Check className="h-4 w-4" /> Copiado</> : <><Copy className="h-4 w-4" /> Copiar</>}
          </Button>
        </div>
      </div>

      {/* Custom message */}
      <div>
        <label htmlFor="share-message" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <MessageCircle className="h-3.5 w-3.5 text-amber-500" />
          Mensaje personalizado (opcional)
        </label>
        <Textarea
          id="share-message"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Ej. ¡Hola! Te comparto mi tarjeta de presentación digital."
          rows={2}
          className="resize-none text-sm focus-visible:ring-emerald-200"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Se añadirá automáticamente al mensaje de WhatsApp, X, Telegram y Email.
        </p>
      </div>

      {/* Native share */}
      {hasNativeShare && (
        <Button
          onClick={onNativeShare}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md hover:from-emerald-700 hover:to-emerald-800"
        >
          <Share2 className="h-4 w-4" /> Compartir…
        </Button>
      )}

      {/* Social grid */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Redes sociales
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="group flex flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-all group-hover:scale-105 group-active:scale-95',
                  s.color
                )}
              >
                <s.icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-medium text-slate-600">{s.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Download image */}
      <DownloadImageButton card={card} />
    </div>
  );
}

/* ============================== QR TAB ============================== */

function QrTabBody({ card, shareUrl }: { card: BusinessCard; shareUrl: string }) {
  const qrWrapRef = useRef<HTMLDivElement>(null);

  const handleDownloadQr = () => {
    const canvas = qrWrapRef.current?.querySelector('canvas');
    if (!canvas) {
      toast.error('No se pudo generar el QR');
      return;
    }
    try {
      const dataUrl = (canvas as HTMLCanvasElement).toDataURL('image/png');
      downloadDataUrl(dataUrl, `qr-${card.linkName}.png`);
      toast.success('Código QR descargado');
    } catch {
      toast.error('Ocurrió un error al descargar el QR');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      {/* QR visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative shrink-0 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-amber-50/30 p-4 shadow-sm"
      >
        <div ref={qrWrapRef} className="rounded-lg bg-white p-2 shadow-inner">
          <QRCodeCanvas
            value={shareUrl}
            size={180}
            level="H"
            fgColor={card.qrColor || '#059669'}
            bgColor={card.qrBgColor || '#ffffff'}
            includeMargin={false}
          />
        </div>
        <div className="mt-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            {card.cardName}
          </p>
          <p className="font-mono text-[9px] text-muted-foreground">/t/{card.linkName}</p>
        </div>
      </motion.div>

      {/* Info + actions */}
      <div className="flex-1 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Código QR de tu tarjeta</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Escanea este código con la cámara de cualquier celular para abrir directamente tu tarjeta digital.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200/70 bg-amber-50/50 p-3 text-xs text-amber-800">
          <p className="flex items-start gap-1.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">!</span>
            <span>
              Los códigos QR del <strong>Plan Gratis</strong> expiran a los 7 días.
              Mejora tu plan para obtener un QR permanente.
            </span>
          </p>
        </div>

        <Button
          onClick={handleDownloadQr}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Download className="h-4 w-4" /> Descargar QR (PNG)
        </Button>

        <p className="text-[11px] text-muted-foreground">
          Resolución: 180×180px · Ideal para impresión en pequeña escala.
        </p>
      </div>
    </div>
  );
}

/* ============================== EMBED TAB ============================== */

function EmbedTabBody({
  card, shareUrl, copiedEmbed, setCopiedEmbed,
}: {
  card: BusinessCard;
  shareUrl: string;
  copiedEmbed: boolean;
  setCopiedEmbed: (v: boolean) => void;
}) {
  const embedCode = `<iframe
  src="${shareUrl}"
  width="100%"
  height="500"
  style="border:0; border-radius: 12px; box-shadow: 0 4px 20px rgba(5,150,105,0.12);"
  loading="lazy"
  title="Tarjeta digital: ${card.cardName}"
  allow="fullscreen"
></iframe>`;

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      toast.success('Código embebido copiado');
      setTimeout(() => setCopiedEmbed(false), 1800);
    } catch {
      toast.error('No se pudo copiar el código');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <Code2 className="h-4 w-4 text-emerald-600" />
          Código iframe
        </h4>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pega este código en tu sitio web o blog para embeber tu tarjeta digital.
        </p>
      </div>

      {/* Code block */}
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-700/60 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 font-mono text-[10px] text-slate-400">HTML</span>
          </div>
          <Button
            onClick={handleCopyEmbed}
            size="sm"
            variant="ghost"
            className={cn(
              'h-7 px-2 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white',
              copiedEmbed && 'text-emerald-300 hover:bg-emerald-900/40 hover:text-emerald-200'
            )}
          >
            {copiedEmbed ? <><Check className="h-3 w-3" /> Copiado</> : <><Copy className="h-3 w-3" /> Copiar</>}
          </Button>
        </div>
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
          <code className="font-mono text-emerald-300">{embedCode}</code>
        </pre>
      </div>

      {/* Live preview */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Vista previa
        </p>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div
            className="mx-auto flex h-32 w-full items-center justify-center rounded-md bg-gradient-to-br from-emerald-50 to-amber-50/40 text-center"
          >
            <div className="space-y-1">
              <ImageIcon className="mx-auto h-6 w-6 text-emerald-500" />
              <p className="text-[11px] font-semibold text-slate-700">{card.cardName}</p>
              <p className="font-mono text-[9px] text-muted-foreground">ftpdigitalplus.com/t/{card.linkName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== DOWNLOAD IMAGE BUTTON ============================== */

function DownloadImageButton({ card }: { card: BusinessCard }) {
  const users = useAppStore(s => s.users);
  const [downloading, setDownloading] = useState(false);
  const hiddenQrRef = useRef<HTMLDivElement>(null);

  const userPlan = (users.find(u => u.id === card.userId)?.plan || 'gratis') as PlanType;

  const handleDownload = useCallback(async () => {
    const qrCanvas = hiddenQrRef.current?.querySelector('canvas');
    if (!qrCanvas) {
      toast.error('No se pudo generar la imagen');
      return;
    }
    setDownloading(true);
    try {
      const qrDataUrl = (qrCanvas as HTMLCanvasElement).toDataURL('image/png');
      const imageDataUrl = await generateCardImage(card, userPlan, qrDataUrl);
      downloadDataUrl(imageDataUrl, `tarjeta-${card.linkName}.png`);
      toast.success('Imagen de tarjeta descargada');
    } catch {
      toast.error('Ocurrió un error al generar la imagen');
    } finally {
      setDownloading(false);
    }
  }, [card, userPlan]);

  return (
    <>
      {/* Hidden QR canvas for image generation */}
      <div
        ref={hiddenQrRef}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}
      >
        <QRCodeCanvas value={getQrValue(card, userPlan)} size={256} level="H" />
      </div>

      <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-amber-50/20 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <ImageIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Descargar imagen de tarjeta</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Genera una imagen PNG lista para compartir en redes o imprimir.
            </p>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          disabled={downloading}
          variant="outline"
          className="mt-3 w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        >
          {downloading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
              Generando imagen…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Descargar imagen PNG
            </>
          )}
        </Button>
      </div>
    </>
  );
}
