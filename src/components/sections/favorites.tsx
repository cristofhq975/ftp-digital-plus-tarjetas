'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, Eye, Pencil, QrCode as QrIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore, useCurrentUserCards } from '@/lib/store';
import { BusinessCard } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FavoritesWidgetProps {
  /** Si true, oculta el título y se usa como embedding compacto. */
  compact?: boolean;
  /** Callback opcional cuando se hace click en "Ver todas". */
  onViewAll?: () => void;
  className?: string;
}

/**
 * Widget horizontal de tarjetas favoritas.
 * Se incrusta en el Tablero del dashboard.
 */
export function FavoritesWidget({ compact = false, onViewAll, className }: FavoritesWidgetProps) {
  const favoriteIds = useAppStore(s => s.favoriteCardIds);
  const toggleFavorite = useAppStore(s => s.toggleFavorite);
  const selectCard = useAppStore(s => s.selectCard);
  const navigate = useAppStore(s => s.navigate);
  const cards = useCurrentUserCards();

  const favoriteCards = cards.filter(c => favoriteIds.includes(c.id));

  const handleView = (card: BusinessCard) => {
    selectCard(card.id);
    navigate('public-card');
  };

  const handleEdit = (card: BusinessCard) => {
    selectCard(card.id);
    navigate('editor');
  };

  const handleToggleFav = (card: BusinessCard, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(card.id);
    const isFav = favoriteIds.includes(card.id);
    toast.success(
      isFav ? 'Tarjeta quitada de favoritos' : 'Tarjeta agregada a favoritos',
      { description: card.cardName }
    );
  };

  return (
    <Card className={cn('overflow-hidden border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 shadow-sm', className)}>
      {!compact && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm">
              <Star className="h-4 w-4 fill-white" />
            </div>
            Tarjetas Favoritas
            {favoriteCards.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {favoriteCards.length}
              </Badge>
            )}
          </CardTitle>
          {favoriteCards.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewAll?.()}
              className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              Ver todas
              <ChevronRight className="ml-0.5 h-4 w-4" />
            </Button>
          )}
        </CardHeader>
      )}
      <CardContent className={compact ? 'p-3' : 'p-4 pt-0'}>
        {favoriteCards.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-500">
              <Star className="h-7 w-7" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">
              Marca tus tarjetas favoritas con la estrella
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Tus tarjetas favoritas aparecerán aquí para acceso rápido.
            </p>
          </div>
        ) : (
          /* Horizontal scroll of mini cards */
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-snap-x">
            <AnimatePresence mode="popLayout">
              {favoriteCards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="scroll-snap-start shrink-0"
                >
                  <MiniFavoriteCard
                    card={card}
                    isFavorite
                    onToggleFav={(e) => handleToggleFav(card, e)}
                    onView={() => handleView(card)}
                    onEdit={() => handleEdit(card)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniFavoriteCard({
  card, isFavorite, onToggleFav, onView, onEdit,
}: {
  card: BusinessCard;
  isFavorite: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
  onView: () => void;
  onEdit: () => void;
}) {
  const initials = card.cardName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div
      className="group relative w-44 overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm transition-all hover:shadow-md"
    >
      {/* Top color bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${card.primaryColor}, ${card.secondaryColor})` }} />

      {/* Mini preview header */}
      <div
        className="relative flex h-24 items-center justify-center p-3"
        style={{ background: `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})` }}
      >
        {/* Decorative blob */}
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/15 blur-xl" />
        {/* Avatar */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/25 backdrop-blur text-base font-bold text-white shadow-md ring-2 ring-white/30">
          {card.profilePhoto ? (
            <img src={card.profilePhoto} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {/* Favorite star button */}
        <button
          type="button"
          onClick={onToggleFav}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 shadow-sm transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={cn(
              'h-3.5 w-3.5',
              isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
            )}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-slate-800">{card.cardName}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          ftpdigitalplus.com/t/<span className="font-medium text-emerald-700">{card.linkName}</span>
        </p>

        {/* Stats inline */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-slate-400" />
            {card.views.toLocaleString('es-MX')}
          </span>
          <span className="flex items-center gap-1">
            <QrIcon className="h-3 w-3 text-slate-400" />
            {card.qrScans.toLocaleString('es-MX')}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-2 flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={onView}
            className="h-7 flex-1 border-slate-200 px-2 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3 w-3" /> Ver
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="h-7 flex-1 border-emerald-200 px-2 text-[11px] text-emerald-700 hover:bg-emerald-50"
          >
            <Pencil className="h-3 w-3" /> Editar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FavoritesWidget;
