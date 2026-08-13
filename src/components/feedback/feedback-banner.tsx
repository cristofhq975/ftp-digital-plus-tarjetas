'use client';

/**
 * feedback-banner.tsx — Banner flotante y desestimable para recabar feedback.
 *
 * Comportamiento:
 *  - Aparece después de 2 minutos (120s) en el sitio.
 *  - Pregunta "¿Qué tal tu experiencia?" con estrellas (1-5).
 *  - Permite añadir un comentario opcional.
 *  - Botón "Enviar": toast "Gracias por tu feedback" + cierra banner.
 *  - Botón "Ahora no": cierra banner sin enviar.
 *  - Recordar el descarte en localStorage por 30 días.
 *
 * Diseño:
 *  - Banner fijo en la esquina inferior izquierda (no interfiere con botones
 *    flotantes a la derecha).
 *  - Gradiente esmeralda con detalles en oro.
 *  - Animación de entrada con framer-motion.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquareText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { enhancedToast as toast } from '@/components/ui/enhanced-toast';

const STORAGE_KEY = 'ftp:feedback-dismissed-until';
const FEEDBACK_KEY = 'ftp:feedback-submitted';
const TRIGGER_DELAY_MS = 120_000; // 2 minutos
const DISMISS_DAYS = 30;

interface StarRowProps {
  value: number;
  onChange: (v: number) => void;
  hover: number;
  setHover: (v: number) => void;
}

function StarRow({ value, onChange, hover, setHover }: StarRowProps) {
  const current = hover || value;
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const filled = star <= current;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${star} de 5 estrellas`}
            className="rounded p-0.5 transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                filled ? 'fill-amber-300 text-amber-300' : 'fill-white/20 text-white/40',
              )}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}

export function FeedbackBanner() {
  const [visible, setVisible] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  // Verificar localStorage al montar y programar el trigger
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const submitted = window.localStorage.getItem(FEEDBACK_KEY);
      const now = Date.now();
      if (raw) {
        const until = parseInt(raw, 10);
        if (!Number.isNaN(until) && until > now) return; // aún dentro del periodo de descarte
      }
      // Si ya envió feedback previamente, no volver a mostrar
      if (submitted) return;
    } catch {
      // ignore
    }

    const timer = setTimeout(() => setVisible(true), TRIGGER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = (days: number) => {
    const until = Date.now() + days * 24 * 60 * 60 * 1000;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(until));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.warning('Selecciona una calificación', 'Elige al menos 1 estrella para enviar tu feedback.');
      return;
    }
    try {
      window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify({ rating, comment, at: Date.now() }));
    } catch {
      // ignore
    }
    toast.success('¡Gracias por tu feedback!', 'Tus comentarios nos ayudan a mejorar FTP Digital Plus.');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="fixed bottom-4 left-4 z-[60] w-[calc(100vw-2rem)] max-w-sm sm:bottom-6 sm:left-6"
          role="dialog"
          aria-labelledby="ftp-feedback-title"
          aria-describedby="ftp-feedback-desc"
        >
          <div className="overflow-hidden rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-2xl shadow-emerald-900/30">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200 backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  Tu opinión
                </div>
                <h3 id="ftp-feedback-title" className="mt-2 text-base font-bold leading-tight">
                  ¿Qué tal tu experiencia?
                </h3>
                <p id="ftp-feedback-desc" className="mt-1 text-xs text-emerald-50/90">
                  Califica FTP Digital Plus y cuéntanos qué piensas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(DISMISS_DAYS)}
                aria-label="Cerrar"
                className="shrink-0 rounded-full p-1.5 text-emerald-50 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3">
              <div className="flex items-center justify-between gap-3">
                <StarRow
                  value={rating}
                  onChange={setRating}
                  hover={hoverStar}
                  setHover={setHoverStar}
                />
                {rating > 0 && (
                  <span className="text-xs font-medium text-amber-100">
                    {['', 'Muy mala', 'Regular', 'Buena', 'Muy buena', 'Excelente'][rating]}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {showComment && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Cuéntanos qué mejorarías o qué te gustó (opcional)…"
                      maxLength={500}
                      className="mt-3 resize-none border-white/20 bg-white/10 text-white placeholder:text-emerald-100/60 focus-visible:border-amber-300 focus-visible:ring-amber-300/40"
                      rows={3}
                      aria-label="Comentario"
                    />
                    <p className="mt-1 text-right text-[10px] text-emerald-50/60">
                      {comment.length}/500
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="submit"
                  className="bg-amber-400 text-amber-950 hover:bg-amber-300"
                  size="sm"
                >
                  <Send className="mr-1 h-3.5 w-3.5" />
                  Enviar
                </Button>
                {!showComment && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComment(true)}
                    className="text-emerald-50 hover:bg-white/10 hover:text-white"
                  >
                    <MessageSquareText className="mr-1 h-3.5 w-3.5" />
                    Agregar comentario
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => dismiss(DISMISS_DAYS)}
                  className="ml-auto text-emerald-50 hover:bg-white/10 hover:text-white"
                >
                  Ahora no
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FeedbackBanner;
