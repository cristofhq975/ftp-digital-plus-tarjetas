'use client';

/**
 * messages-preview.tsx — Widget de vista previa de mensajes recientes.
 *
 * Muestra una lista compacta de los mensajes más recientes recibidos desde
 * el formulario de contacto de las tarjetas. Diseñado para el dashboard.
 *
 * - Paleta esmeralda + oro (FTP Digital Plus).
 * - 100% español.
 * - Animaciones con framer-motion.
 * - Click en un mensaje: lo marca como leído y dispara el evento
 *   `ftp:open-messages` para que el dashboard cambie a la sección de mensajes.
 */

import { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Clock, ArrowRight, Inbox,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { ContactMessage } from '@/lib/types';
import { getRelativeTime } from '@/lib/card-utils';
import { cn } from '@/lib/utils';

export interface MessagesPreviewWidgetProps {
  className?: string;
  /** Número máximo de mensajes a mostrar (default 4). */
  maxItems?: number;
}

// Gradientes para los avatares según inicial del nombre.
const AVATAR_GRADIENTS = [
  'from-emerald-500 to-emerald-700',
  'from-amber-400 to-amber-600',
  'from-teal-500 to-emerald-600',
  'from-emerald-600 to-teal-700',
  'from-amber-500 to-orange-600',
];

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function pickGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

export function MessagesPreviewWidget({
  className,
  maxItems = 4,
}: MessagesPreviewWidgetProps) {
  const messages = useAppStore(s => s.messages);
  const markMessageRead = useAppStore(s => s.markMessageRead);

  // Mensajes ordenados por fecha descendente.
  const sortedMessages = useMemo(() => {
    return [...messages]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxItems);
  }, [messages, maxItems]);

  const unreadCount = useMemo(
    () => messages.filter(m => !m.read).length,
    [messages],
  );

  const handleOpenMessages = useCallback(() => {
    window.dispatchEvent(new CustomEvent('ftp:open-messages'));
  }, []);

  const handleMessageClick = useCallback(
    (msg: ContactMessage) => {
      if (!msg.read) {
        markMessageRead(msg.id);
      }
      window.dispatchEvent(new CustomEvent('ftp:open-messages'));
    },
    [markMessageRead],
  );

  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden border-slate-200/70 bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 shadow-sm',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
            <Mail className="h-3.5 w-3.5" />
          </div>
          Mensajes Recientes
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-700 ring-1 ring-amber-200"
            >
              {unreadCount} sin leer
            </Badge>
          )}
        </CardTitle>
        <button
          type="button"
          onClick={handleOpenMessages}
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition hover:text-emerald-800"
        >
          Ver todas
          <ArrowRight className="h-3 w-3" />
        </button>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        {sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-700">Sin mensajes</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Los mensajes recibidos desde tus tarjetas aparecerán aquí.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[360px] pr-3">
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {sortedMessages.map((msg, i) => {
                  const initials = getInitials(msg.name);
                  const gradient = pickGradient(msg.name || msg.email);
                  const isUnread = !msg.read;
                  return (
                    <motion.li
                      key={msg.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.2) }}
                    >
                      <button
                        type="button"
                        onClick={() => handleMessageClick(msg)}
                        aria-label={`Mensaje de ${msg.name}${isUnread ? ' (sin leer)' : ''}`}
                        className={cn(
                          'group relative flex w-full items-start gap-3 rounded-lg border border-slate-200/70 bg-white p-3 text-left transition-all hover:border-emerald-300 hover:shadow-sm',
                          isUnread && 'border-l-[3px] border-l-emerald-500 pl-[10px]',
                        )}
                      >
                        {/* Avatar con iniciales */}
                        <Avatar className="h-9 w-9 shrink-0 ring-1 ring-slate-200">
                          <AvatarFallback
                            className={cn(
                              'bg-gradient-to-br text-xs font-bold text-white',
                              gradient,
                            )}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Cuerpo del mensaje */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={cn(
                                'truncate text-sm',
                                isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700',
                              )}
                            >
                              {msg.name || 'Anónimo'}
                            </p>
                            <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-2.5 w-2.5" />
                              {getRelativeTime(msg.date)}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'mt-0.5 line-clamp-2 text-xs',
                              isUnread ? 'text-slate-600' : 'text-muted-foreground',
                            )}
                          >
                            {msg.message}
                          </p>
                        </div>

                        {/* Indicador de no leído */}
                        {isUnread && (
                          <span
                            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"
                            aria-label="Sin leer"
                          />
                        )}
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default MessagesPreviewWidget;
