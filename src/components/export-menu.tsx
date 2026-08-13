'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Download, FileText, FileSpreadsheet, CreditCard, Package,
  Image as ImageIcon, ChevronDown,
} from 'lucide-react';

import { BusinessCard } from '@/lib/types';
import {
  exportCardAsJSON,
  exportCardStatsAsCSV,
  exportCardAsVCard,
  exportCardReportAsPDF,
} from '@/lib/export-utils';
import { generateCardImage, downloadDataUrl } from '@/lib/card-image';
import { useAppStore } from '@/lib/store';
import { PLANS } from '@/lib/plans';
import { buildWhatsappUrl, isQrExpired } from '@/lib/card-utils';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ExportMenuProps {
  card: BusinessCard | null;
  className?: string;
  /** Texto del botón. Por defecto: "Exportar". */
  label?: string;
  /** Variante del botón trigger. */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Tamaño del botón trigger. */
  size?: 'default' | 'sm' | 'icon';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Devuelve la URL que representará el QR de la tarjeta, considerando expiración
 * y configuración de WhatsApp.
 */
function getQrValue(card: BusinessCard): string {
  const user = useAppStore.getState().users.find(u => u.id === card.userId);
  const plan = user ? PLANS[user.plan] : PLANS.gratis;
  const expired = plan.qrExpires && card.qrExpiresAt ? isQrExpired(card) : false;
  if (expired) return 'https://ftpdigitalplus.com/qr-expirado';
  if (card.whatsappNumber) {
    return buildWhatsappUrl(
      card.whatsappNumber,
      card.whatsappMessage || 'Hola, vi tu tarjeta digital'
    );
  }
  return `https://ftpdigitalplus.com/t/${card.linkName}`;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Menú desplegable con opciones de exportación para una tarjeta digital.
 * Soporta PDF, CSV, vCard (.vcf), JSON y PNG.
 *
 * Si `card` es `null`, el menú se deshabilita.
 */
export function ExportMenu({
  card,
  className,
  label = 'Exportar',
  variant = 'outline',
  size = 'default',
}: ExportMenuProps) {
  const [generatingPng, setGeneratingPng] = useState(false);
  const hiddenQrRef = useRef<HTMLDivElement>(null);

  const disabled = !card;

  /**
   * Renderiza el QR canvas oculto solo cuando se va a exportar PNG.
   * Esto evita tener el canvas siempre en el DOM.
   */
  const ensureQrCanvas = useCallback(async (targetCard: BusinessCard): Promise<string | null> => {
    if (!hiddenQrRef.current) return null;
    // Esperar un frame para asegurar que el canvas esté renderizado
    await new Promise(r => requestAnimationFrame(r));
    const canvas = hiddenQrRef.current.querySelector('canvas');
    if (!canvas) return null;
    return (canvas as HTMLCanvasElement).toDataURL('image/png');
  }, []);

  const handlePdf = useCallback(() => {
    if (!card) {
      toast.info('Selecciona una tarjeta primero');
      return;
    }
    try {
      exportCardReportAsPDF(card);
      toast.success('Abriendo reporte PDF…', {
        description: 'Usa "Guardar como PDF" en el diálogo de impresión.',
      });
    } catch {
      toast.error('No se pudo generar el reporte PDF');
    }
  }, [card]);

  const handleCsv = useCallback(() => {
    if (!card) {
      toast.info('Selecciona una tarjeta primero');
      return;
    }
    try {
      exportCardStatsAsCSV(card);
      toast.success('Estadísticas CSV descargadas', {
        description: 'Abre el archivo en Excel o Google Sheets.',
      });
    } catch {
      toast.error('No se pudo generar el CSV');
    }
  }, [card]);

  const handleVCard = useCallback(() => {
    if (!card) {
      toast.info('Selecciona una tarjeta primero');
      return;
    }
    try {
      exportCardAsVCard(card);
      toast.success('vCard (.vcf) descargada', {
        description: 'Impórtala en tus contactos de teléfono o email.',
      });
    } catch {
      toast.error('No se pudo generar la vCard');
    }
  }, [card]);

  const handleJson = useCallback(() => {
    if (!card) {
      toast.info('Selecciona una tarjeta primero');
      return;
    }
    try {
      exportCardAsJSON(card);
      toast.success('Datos JSON descargados', {
        description: 'Respaldo completo de la tarjeta.',
      });
    } catch {
      toast.error('No se pudo exportar el JSON');
    }
  }, [card]);

  const handlePng = useCallback(async () => {
    if (!card) {
      toast.info('Selecciona una tarjeta primero');
      return;
    }
    setGeneratingPng(true);
    try {
      const qrDataUrl = await ensureQrCanvas(card);
      if (!qrDataUrl) {
        toast.error('No se pudo generar el código QR para la imagen');
        return;
      }
      const userPlan = useAppStore.getState().users.find(u => u.id === card.userId)?.plan || 'gratis';
      const imageDataUrl = await generateCardImage(card, userPlan, qrDataUrl);
      downloadDataUrl(imageDataUrl, `tarjeta-${card.linkName}.png`);
      toast.success('Imagen PNG descargada', {
        description: 'Lista para compartir en redes o imprimir.',
      });
    } catch (err) {
      console.error('PNG export error', err);
      toast.error('No se pudo generar la imagen PNG');
    } finally {
      setGeneratingPng(false);
    }
  }, [card, ensureQrCanvas]);

  return (
    <>
      {/* Canvas QR oculto, necesario para generar el PNG */}
      {card && (
        <div
          ref={hiddenQrRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <PngQrGenerator value={getQrValue(card)} size={256} />
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled || generatingPng}
            className={cn(
              'gap-1.5',
              variant === 'outline' && 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800',
              size === 'icon' && 'px-0',
              className
            )}
            aria-label={label}
          >
            {generatingPng ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {size !== 'icon' && (
              <>
                <span>{generatingPng ? 'Generando…' : label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            Opciones de exportación
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* PDF */}
          <DropdownMenuItem
            onClick={handlePdf}
            className="cursor-pointer gap-3 px-3 py-2.5 focus:bg-emerald-50 focus:text-emerald-800"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <FileText className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Exportar como PDF</p>
              <p className="text-[11px] text-muted-foreground">Reporte completo imprimible</p>
            </div>
          </DropdownMenuItem>

          {/* CSV */}
          <DropdownMenuItem
            onClick={handleCsv}
            className="cursor-pointer gap-3 px-3 py-2.5 focus:bg-emerald-50 focus:text-emerald-800"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Exportar estadísticas (CSV)</p>
              <p className="text-[11px] text-muted-foreground">Métricas y datos tabulares</p>
            </div>
          </DropdownMenuItem>

          {/* vCard */}
          <DropdownMenuItem
            onClick={handleVCard}
            className="cursor-pointer gap-3 px-3 py-2.5 focus:bg-emerald-50 focus:text-emerald-800"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <CreditCard className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Descargar vCard (.vcf)</p>
              <p className="text-[11px] text-muted-foreground">Para tu app de contactos</p>
            </div>
          </DropdownMenuItem>

          {/* JSON */}
          <DropdownMenuItem
            onClick={handleJson}
            className="cursor-pointer gap-3 px-3 py-2.5 focus:bg-emerald-50 focus:text-emerald-800"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Package className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Exportar datos (JSON)</p>
              <p className="text-[11px] text-muted-foreground">Respaldo de la tarjeta</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* PNG */}
          <DropdownMenuItem
            onClick={handlePng}
            disabled={generatingPng}
            className="cursor-pointer gap-3 px-3 py-2.5 focus:bg-emerald-50 focus:text-emerald-800"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-amber-500 text-white">
              {generatingPng
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                : <ImageIcon className="h-4 w-4" />}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">{generatingPng ? 'Generando…' : 'Descargar imagen (PNG)'}</p>
              <p className="text-[11px] text-muted-foreground">1080×1350 lista para compartir</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// ---------------------------------------------------------------------------
// Generador de QR para PNG (sin dependencias circulares con share-modal)
// ---------------------------------------------------------------------------

/**
 * Renderiza un QR canvas usando la librería qrcode.react para alimentar la
 * generación de imagen PNG. Se mantiene oculto visualmente.
 */
import { QRCodeCanvas } from 'qrcode.react';

function PngQrGenerator({ value, size }: { value: string; size: number }) {
  return <QRCodeCanvas value={value} size={size} level="H" includeMargin />;
}

export default ExportMenu;
