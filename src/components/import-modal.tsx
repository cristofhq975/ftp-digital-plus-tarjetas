'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Upload, FileJson, Check, AlertCircle, Download, X,
  Package, Briefcase, MessageCircle, FileText,
} from 'lucide-react';

import { BusinessCard } from '@/lib/types';
import { downloadCardTemplate } from '@/lib/export-utils';
import { cn } from '@/lib/utils';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (card: BusinessCard) => void;
}

type Status = 'idle' | 'parsing' | 'valid' | 'invalid';

interface ParsedPreview {
  cardName: string;
  description: string;
  linkName: string;
  servicesCount: number;
  productsCount: number;
  hasPhoto: boolean;
  hasWhatsapp: boolean;
  template: string;
}

// ---------------------------------------------------------------------------
// Helpers de validación
// ---------------------------------------------------------------------------

const REQUIRED_FIELDS: Array<keyof BusinessCard> = [
  'id', 'userId', 'linkName', 'cardName',
];

/**
 * Valida que un objeto parsed tiene la estructura mínima de BusinessCard.
 * Devuelve la lista de campos faltantes (vacía si es válido).
 */
function validateCardStructure(parsed: unknown): { valid: boolean; missing: string[] } {
  if (typeof parsed !== 'object' || parsed === null) {
    return { valid: false, missing: ['objeto raíz'] };
  }
  const obj = parsed as Record<string, unknown>;
  const missing: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
      missing.push(String(field));
    }
  }
  // Validar tipos básicos de campos clave
  if (typeof obj.cardName !== 'string' || obj.cardName.trim() === '') {
    missing.push('cardName (string no vacío)');
  }
  if (typeof obj.linkName !== 'string' || obj.linkName.trim() === '') {
    missing.push('linkName (string no vacío)');
  }
  return { valid: missing.length === 0, missing };
}

/**
 * Construye un BusinessCard saneado a partir del objeto parsed. Asegura
 * que todos los campos requeridos existan con valores por defecto razonables
 * para no romper el render.
 */
function sanitizeCard(parsed: unknown): BusinessCard | null {
  if (typeof parsed !== 'object' || parsed === null) return null;
  const obj = parsed as Partial<BusinessCard> & Record<string, unknown>;

  const safeArray = <T,>(v: unknown, def: T[]): T[] =>
    Array.isArray(v) ? (v as T[]) : def;

  const safeSchedule = (s: unknown) => {
    if (typeof s !== 'object' || s === null) return undefined;
    return s;
  };
  const scheduleVal = safeSchedule(obj.schedule);

  const safeSocial = (s: unknown) => {
    if (typeof s !== 'object' || s === null) return undefined;
    return s;
  };
  const socialVal = safeSocial(obj.socialLinks);

  const card: BusinessCard = {
    id: typeof obj.id === 'string' ? obj.id : '',
    userId: typeof obj.userId === 'string' ? obj.userId : '',
    linkName: String(obj.linkName || '').trim(),
    cardName: String(obj.cardName || '').trim(),
    description: typeof obj.description === 'string' ? obj.description : '',
    logo: typeof obj.logo === 'string' ? obj.logo : '',
    coverPhoto: typeof obj.coverPhoto === 'string' ? obj.coverPhoto : '',
    profilePhoto: typeof obj.profilePhoto === 'string' ? obj.profilePhoto : '',
    template: (obj.template as BusinessCard['template']) || 'moderno',
    primaryColor: typeof obj.primaryColor === 'string' ? obj.primaryColor : '#059669',
    secondaryColor: typeof obj.secondaryColor === 'string' ? obj.secondaryColor : '#10b981',
    backgroundColor: typeof obj.backgroundColor === 'string' ? obj.backgroundColor : '#ffffff',
    textColor: typeof obj.textColor === 'string' ? obj.textColor : '#0f172a',
    fontFamily: typeof obj.fontFamily === 'string' ? obj.fontFamily : 'poppins',
    fontSize: typeof obj.fontSize === 'number' ? obj.fontSize : 16,
    customCSS: typeof obj.customCSS === 'string' ? obj.customCSS : '',
    customJS: typeof obj.customJS === 'string' ? obj.customJS : '',
    qrStyle: (obj.qrStyle as BusinessCard['qrStyle']) || 'cuadrado',
    qrColor: typeof obj.qrColor === 'string' ? obj.qrColor : '#059669',
    qrBgColor: typeof obj.qrBgColor === 'string' ? obj.qrBgColor : '#ffffff',
    qrLogo: typeof obj.qrLogo === 'string' ? obj.qrLogo : '',
    qrGeneratedAt: typeof obj.qrGeneratedAt === 'string' ? obj.qrGeneratedAt : null,
    qrExpiresAt: typeof obj.qrExpiresAt === 'string' ? obj.qrExpiresAt : null,
    whatsappNumber: typeof obj.whatsappNumber === 'string' ? obj.whatsappNumber : '',
    whatsappVerified: typeof obj.whatsappVerified === 'boolean' ? obj.whatsappVerified : false,
    whatsappMessage: typeof obj.whatsappMessage === 'string' ? obj.whatsappMessage : '',
    schedule: (scheduleVal as BusinessCard['schedule']) || {
      monday:    { open: true,  start: '09:00', end: '18:00' },
      tuesday:   { open: true,  start: '09:00', end: '18:00' },
      wednesday: { open: true,  start: '09:00', end: '18:00' },
      thursday:  { open: true,  start: '09:00', end: '18:00' },
      friday:    { open: true,  start: '09:00', end: '18:00' },
      saturday:  { open: true,  start: '10:00', end: '14:00' },
      sunday:    { open: false, start: '00:00', end: '00:00' },
    },
    services: safeArray(obj.services, []),
    products: safeArray(obj.products, []),
    gallery: safeArray(obj.gallery, []),
    blog: safeArray(obj.blog, []),
    testimonials: safeArray(obj.testimonials, []),
    team: safeArray(obj.team, []),
    socialLinks: (socialVal as BusinessCard['socialLinks']) || {
      facebook: '', instagram: '', twitter: '', linkedin: '',
      youtube: '', tiktok: '', whatsapp: '', telegram: '',
    },
    instagramEmbed: typeof obj.instagramEmbed === 'string' ? obj.instagramEmbed : '',
    floatingFrames: safeArray(obj.floatingFrames, []),
    banner: (obj.banner as BusinessCard['banner']) || {
      enabled: false, title: '', text: '', imageUrl: '', linkUrl: '',
    },
    seoTitle: typeof obj.seoTitle === 'string' ? obj.seoTitle : '',
    seoDescription: typeof obj.seoDescription === 'string' ? obj.seoDescription : '',
    seoKeywords: typeof obj.seoKeywords === 'string' ? obj.seoKeywords : '',
    privacyPolicy: typeof obj.privacyPolicy === 'string' ? obj.privacyPolicy : '',
    terms: typeof obj.terms === 'string' ? obj.terms : '',
    activeSections: safeArray(obj.activeSections, ['detalles', 'qr', 'horario']),
    hideBrand: typeof obj.hideBrand === 'boolean' ? obj.hideBrand : false,
    passwordProtected: typeof obj.passwordProtected === 'boolean' ? obj.passwordProtected : false,
    cardPassword: typeof obj.cardPassword === 'string' ? obj.cardPassword : '',
    views: typeof obj.views === 'number' ? obj.views : 0,
    qrScans: typeof obj.qrScans === 'number' ? obj.qrScans : 0,
    isActive: typeof obj.isActive === 'boolean' ? obj.isActive : true,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    affiliateCode: typeof obj.affiliateCode === 'string' ? obj.affiliateCode : '',
    affiliateClicks: typeof obj.affiliateClicks === 'number' ? obj.affiliateClicks : 0,
  };

  return card;
}

/**
 * Lee un File como texto usando FileReader.
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsText(file);
  });
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Modal para importar una tarjeta digital desde un archivo JSON.
 * Incluye área de drag & drop, vista previa, validación y descarga de plantilla.
 */
export function ImportModal({ open, onOpenChange, onImport }: ImportModalProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedCard, setParsedCard] = useState<BusinessCard | null>(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage('');
    setParsedCard(null);
    setFileName('');
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    // Validar extensión
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setStatus('invalid');
      setErrorMessage('El archivo debe tener extensión .json');
      setParsedCard(null);
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatus('invalid');
      setErrorMessage('El archivo supera los 5 MB. Verifica que sea el correcto.');
      setParsedCard(null);
      return;
    }

    setFileName(file.name);
    setStatus('parsing');
    setErrorMessage('');

    try {
      const text = await readFileAsText(file);
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        setStatus('invalid');
        setErrorMessage('El JSON no es válido. Revisa la sintaxis (comas, llaves, comillas).');
        setParsedCard(null);
        return;
      }

      // Si el JSON trae un wrapper { cards: [...] } o { card: {...} }, extraer
      let cardCandidate: unknown = parsed;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const obj = parsed as Record<string, unknown>;
        if (obj.card && typeof obj.card === 'object') {
          cardCandidate = obj.card;
        } else if (obj.cards && Array.isArray(obj.cards) && obj.cards.length > 0) {
          cardCandidate = obj.cards[0];
        } else if ('exportedAt' in obj && Array.isArray(obj.cards)) {
          // Caso de respaldo completo
          cardCandidate = obj.cards[0];
        }
      }

      // Validar estructura
      const validation = validateCardStructure(cardCandidate);
      if (!validation.valid) {
        setStatus('invalid');
        setErrorMessage(
          `Estructura inválida. Faltan campos: ${validation.missing.join(', ')}. ` +
          `Descarga la plantilla para ver el formato esperado.`
        );
        setParsedCard(null);
        return;
      }

      // Saneamiento
      const sanitized = sanitizeCard(cardCandidate);
      if (!sanitized) {
        setStatus('invalid');
        setErrorMessage('No se pudo procesar el archivo. Verifica el formato.');
        setParsedCard(null);
        return;
      }

      setParsedCard(sanitized);
      setStatus('valid');
      toast.success('Archivo JSON válido', {
        description: `${sanitized.cardName} · ${sanitized.services.length} servicios`,
      });
    } catch (err) {
      console.error('Import error', err);
      setStatus('invalid');
      setErrorMessage(err instanceof Error ? err.message : 'Error desconocido al procesar el archivo.');
      setParsedCard(null);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDownloadTemplate = useCallback(() => {
    try {
      downloadCardTemplate();
      toast.success('Plantilla descargada', {
        description: 'ftp-digital-plus-datos-plantilla.json — edítala y vuelve a importarla.',
      });
    } catch {
      toast.error('No se pudo descargar la plantilla');
    }
  }, []);

  const handleImport = useCallback(() => {
    if (!parsedCard || status !== 'valid') return;
    onImport(parsedCard);
    toast.success('¡Tarjeta importada!', {
      description: parsedCard.cardName,
    });
    reset();
    onOpenChange(false);
  }, [parsedCard, status, onImport, onOpenChange, reset]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        // Reset al cerrar
        setTimeout(reset, 200);
      }
      onOpenChange(next);
    },
    [onOpenChange, reset]
  );

  const preview = useMemo<ParsedPreview | null>(() => {
    if (!parsedCard) return null;
    return {
      cardName: parsedCard.cardName,
      description: parsedCard.description || 'Sin descripción',
      linkName: parsedCard.linkName,
      servicesCount: parsedCard.services.length,
      productsCount: parsedCard.products.length,
      hasPhoto: !!parsedCard.profilePhoto,
      hasWhatsapp: !!parsedCard.whatsappNumber,
      template: parsedCard.template,
    };
  }, [parsedCard]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Upload className="h-4 w-4" />
            </span>
            Importar Tarjeta
          </DialogTitle>
          <DialogDescription>
            Carga un archivo JSON previamente exportado para restaurar o migrar una tarjeta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag & drop area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
              isDragging
                ? 'border-emerald-400 bg-emerald-50'
                : status === 'invalid'
                  ? 'border-rose-300 bg-rose-50/40'
                  : status === 'valid'
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-300 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50/30'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleInputChange}
              className="hidden"
              id="import-file-input"
            />
            <span
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full',
                isDragging
                  ? 'bg-emerald-500 text-white'
                  : status === 'valid'
                    ? 'bg-emerald-100 text-emerald-600'
                    : status === 'invalid'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-slate-100 text-slate-500'
              )}
            >
              {status === 'valid' ? (
                <Check className="h-5 w-5" />
              ) : status === 'invalid' ? (
                <AlertCircle className="h-5 w-5" />
              ) : status === 'parsing' ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
              ) : (
                <FileJson className="h-5 w-5" />
              )}
            </span>

            {fileName ? (
              <div className="mt-1">
                <p className="text-sm font-semibold text-slate-800">
                  {fileName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {status === 'valid'
                    ? 'Archivo cargado correctamente'
                    : status === 'invalid'
                      ? 'Archivo con errores'
                      : status === 'parsing'
                        ? 'Procesando…'
                        : 'Listo para importar'}
                </p>
              </div>
            ) : (
              <div className="mt-1">
                <p className="text-sm font-semibold text-slate-700">
                  Arrastra tu archivo JSON aquí
                </p>
                <p className="text-[11px] text-muted-foreground">
                  o haz clic para seleccionar desde tu dispositivo
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <Upload className="h-3.5 w-3.5" /> Seleccionar archivo
            </Button>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {status === 'invalid' && errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="flex-1">{errorMessage}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setErrorMessage('');
                      setFileName('');
                      setParsedCard(null);
                    }}
                    aria-label="Cerrar error"
                    className="rounded p-0.5 hover:bg-rose-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preview */}
          <AnimatePresence>
            {status === 'valid' && preview && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-amber-50/30 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Vista previa
                    </p>
                    <p className="text-sm font-bold text-slate-800">{preview.cardName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-600">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <p className="line-clamp-2 flex-1">{preview.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-mono text-[10px] text-emerald-700">
                      /{preview.linkName}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] capitalize text-slate-600">
                      Plantilla: {preview.template}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <PreviewStat
                      icon={Briefcase}
                      label="Servicios"
                      value={preview.servicesCount}
                      color="emerald"
                    />
                    <PreviewStat
                      icon={Package}
                      label="Productos"
                      value={preview.productsCount}
                      color="amber"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {preview.hasPhoto && (
                      <Badge icon={Check} text="Foto de perfil" color="emerald" />
                    )}
                    {preview.hasWhatsapp && (
                      <Badge icon={MessageCircle} text="WhatsApp" color="emerald" />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Download template */}
          <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/60">
            <div className="min-w-0">
              <Label className="text-xs font-semibold text-slate-700">
                ¿No tienes un archivo?
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Descarga la plantilla base para empezar.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDownloadTemplate}
              className="shrink-0 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <Download className="h-3.5 w-3.5" /> Plantilla
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={status !== 'valid' || !parsedCard}
            className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300"
          >
            <Upload className="h-4 w-4" /> Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function PreviewStat({
  icon: Icon, label, value, color,
}: {
  icon: typeof Briefcase;
  label: string;
  value: number;
  color: 'emerald' | 'amber';
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5 ring-1 ring-slate-200/50">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
          color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        )}
      >
        <Icon className="h-3 w-3" />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Badge({
  icon: Icon, text, color,
}: {
  icon: typeof Check;
  text: string;
  color: 'emerald' | 'amber';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        color === 'emerald'
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-amber-100 text-amber-700'
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {text}
    </span>
  );
}

export default ImportModal;
