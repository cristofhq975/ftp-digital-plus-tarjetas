# Task 6-c — Dashboard + Card Editor Styling Improvements + Favorites Widget

- **Task ID**: 6-c
- **Agent**: Subagent C (Dashboard & Card Editor Stylist)
- **Task**: Mejorar el styling del Dashboard y Card Editor + crear `favorites.tsx` (FavoritesWidget) + extender el store con favoritos.

## Work Log

### 1. Lectura de contexto previo
- Leído `/home/z/my-project/worklog.md` (Tasks 1, 3-a, 3-b, 3-c, 3-d, 5-a, 5-b, 5-c, 6-a) para entender el proyecto FTP Digital Plus.
- Leído `agent-ctx/5-b-notifications-onboarding.md` y `agent-ctx/5-c-template-gallery.md` para enterarse de los componentes ya creados (`NotificationsPanel`, `OnboardingWizard`, `TemplateGallery`) y las utilidades en `globals.css` (`.card-hover`, `.gradient-border`, `.mesh-gradient`, `.glass-card`, `.premium-badge`, `.animate-pulse-glow`, etc.).
- Revisados:
  - `src/lib/types.ts` (ViewType incluye `help` y `support` ya añadidos por Task 6-a; `BusinessCard`, `User` con `avatar?`, `ContactMessage`, `Appointment`).
  - `src/lib/plans.ts` (`PLANS`, `EDITOR_SECTIONS` 24, `DASHBOARD_SECTIONS`, `TEMPLATES`, `FONTS`, `COLOR_PRESETS`).
  - `src/lib/store.ts` (`useAppStore`, `useCurrentUserCards`, `useSelectedCard`, acciones existentes).
  - `src/lib/card-utils.ts` — confirmado que `buildWhatsappUrl` y `formatDateTime` están exportadas.
  - `src/components/card-preview.tsx` — firma `CardPreview({ card, userPlan, previewMode? })`.
  - `src/app/globals.css` — utilities disponibles: `.custom-scrollbar`, `.no-scrollbar`, `.scroll-snap-x`, `.scroll-snap-start`, `.animate-gradient`, `.animate-pulse-glow`, `.gradient-text`, `.mesh-gradient`, `.glass-card`, `.premium-badge`.
  - `src/components/ui/*` — todos los componentes shadcn/ui necesarios existen: `Card`, `Button`, `Badge`, `Dialog`, `Input`, `Label`, `Separator`, `Progress`, `Tabs`, `Avatar`, `Tooltip`, `Sheet`, `Switch`, `Slider`, `Select`, `ScrollArea`, `Checkbox`, `RadioGroup`, `Alert`, `Collapsible`.
- Verificadas dependencias en `package.json`: `recharts ^2.15`, `framer-motion ^12`, `lucide-react ^0.525`, `sonner ^2`, `qrcode ^1.5`, `qrcode.react ^4.2` — todas disponibles.

### 2. Actualización de `src/lib/store.ts`
- Añadido `favoriteCardIds: string[]` a la interfaz `AppState`.
- Añadido action `toggleFavorite: (cardId: string) => void` que agrega/quita el id del arreglo.
- Inicializado `favoriteCardIds: []` en el estado inicial del store.
- Añadido `favoriteCardIds` al `partialize` para que se persista en localStorage.

### 3. Creación de `src/components/sections/favorites.tsx`
Archivo nuevo con `'use client'`. Exporta `FavoritesWidget` (named + default).

**Arquitectura:**
- `FavoritesWidget({ compact, onViewAll, className })` — widget horizontal con:
  - Header (oculto si `compact`): CardTitle con icono Star en cuadro gradiente oro + Badge con conteo de favoritos + botón "Ver todas" (ChevronRight).
  - Estado vacío: ícono Star en círculo ámbar + mensaje "Marca tus tarjetas favoritas con la estrella" + texto secundario.
  - Lista horizontal scrollable (`.no-scrollbar .scroll-snap-x`): cada tarjeta mini es un `MiniFavoriteCard`.
  - Usa `useAppStore(s => s.favoriteCardIds)` y `toggleFavorite` para sincronizar con el store.
  - `handleView`/`handleEdit`/`handleToggleFav` con `selectCard` + `navigate('public-card' | 'editor')`.
  - AnimatePresence mode=popLayout + motion.div con layout para animar entrada/salida de favoritos.

- `MiniFavoriteCard({ card, isFavorite, onToggleFav, onView, onEdit })`:
  - Card con barra superior de color (gradiente primary→secondary).
  - Header mini con avatar circular (gradiente o profilePhoto) + badge "FTP+" overlay + botón estrella flotante (clic para quitar/agregar favorito, color ámbar cuando es favorito).
  - Info: nombre + enlace `ftpdigitalplus.com/t/{linkName}` + stats inline (Eye visitas + QrIcon escaneos).
  - Actions: botones "Ver" (Eye) y "Editar" (Pencil) en flex.

### 4. Mejoras a `src/components/sections/dashboard.tsx`

**Imports nuevos:** `useEffect`, `useRef`, iconos `HelpCircle, ImageIcon, Images, Activity, Camera, Smartphone, Upload`; `Area, AreaChart, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip` de recharts; `FavoritesWidget` de `@/components/sections/favorites`.

**a) Sidebar improvements (`SidebarContent`):**
- Avatar del usuario con indicador online: dot esmeralda con `animate-ping` overlay en esquina inferior-derecha.
- Anillo de progreso SVG circular (64x64, stroke 6, gradiente esmeralda→oro) mostrando el % de uso de tarjetas (cardsCount/maxCards * 100) + texto del porcentaje en el centro + caption "Uso del plan" + 2 líneas con iconos CreditCard y Database mostrando tarjetas X/Y y storage X% de Y MB.
- En el nav: si `section.id === 'tablero'` y `favoriteIds.length > 0` y no está activa, muestra icono Star dorado relleno al final del botón.
- ScrollArea con `.custom-scrollbar` para el nav.
- Footer "Acciones Rápidas": grid de 3 botones outline con iconos y texto pequeño:
  - "Mi Tarjeta"/"Ver" (ExternalLink): abre la tarjeta pública del usuario en la vista `public-card`.
  - "Compartir" (Share2): usa `navigator.share` si está disponible, si no copia el enlace al clipboard.
  - "Ayuda" (HelpCircle): toast info con email de soporte.
- Cada botón envuelto en TooltipProvider+Tooltip con descripción.
- Botón "Cerrar Sesión" preservado.
- Handler `handlePublicCard`/`handleShare`/`handleHelp` con fallbacks a toast.info cuando no hay tarjetas.

**b) Tablero improvements (`TableroSection`):**
- Constante `DAILY_TIPS` con array de 5 tips en español: Personaliza tu QR, Activa el horario, Agrega testimonios, Comparte en redes, Revisa tus estadísticas.
- Constante `MOCK_ACTIVITIES` con 5 actividades (card_created, message_received, qr_scanned, view, appointment) con iconos Lucide y timestamps relativos.
- Helper `getRelativeTime(iso)` → "hace X min/h", "ayer", "hace X días".
- Componente `Sparkline({ data, color })` — mini AreaChart de recharts (h-10, sin axes, gradient fill con `linearGradient` único por color).
- Welcome header con `animate-gradient` (utilidad de globals.css) + overlay sutil esmeralda→ámbar.
- Consejo del día rotatorio: `useState` con lazy initializer `Math.floor(Math.random() * DAILY_TIPS.length)` + `useEffect` con `setInterval(12000ms)` que cicla los tips. AnimatePresence mode=wait con transición vertical de 8px. Muestra badge "Consejo del día X/5" + título + descripción.
- Stat cards: cada una incluye sparkline mini (12 puntos generados con `Math.sin(i * 0.7 + n)` para variación) con color correspondiente (esmeralda/ámbar/teal/rosa). El gradiente fill del sparkline usa el color del stat con opacidad 0.35→0.
- Grid de 2 columnas (xl:grid-cols-2):
  - `FavoritesWidget` (incrustado, con `onViewAll` que dispara `onCreateOpen`).
  - Card "Actividad Reciente" con timeline vertical: cada actividad es `motion.li` con icono en círculo coloreado (emerald/amber/teal/rose) + línea vertical conectora (excepto la última) + título + descripción + timestamp relativo con icono Clock.

**c) Card items improvements (`CardItem`):**
- Props añadidas: `isFavorite: boolean`, `onToggleFav: () => void`.
- Botón estrella flotante top-right: backdrop-blur, hover:scale-110, color ámbar cuando es favorito (fill-amber-400), texto-amber-500.
- Thumbnail preview: avatar 14x14 con gradiente primary→secondary + foto de perfil si existe + mini badge "FTP+" en esquina inferior-derecha con backdrop-blur.
- Descripción line-clamp-1 añadida debajo del enlace.
- Stats grid de 3 columnas (antes 2): Visitas (Eye esmeralda), QR (QrCode ámbar), Servicios (Briefcase teal) con labels más compactos (text-[10px]).
- Eliminado `menuOpen` state no usado.

**d) Storage improvements (`StorageSection`):**
- Items ahora tienen campo `category: 'photos' | 'gallery' | 'products' | 'other'` para agrupar.
- Constante `freeSpaceTips` con 4 tips (eliminar duplicados, comprimir fotos, revisar fotos de servicios, optimizar logo SVG).
- Botón "Liberar espacio" (Sparkles icon, outline emerald) que toggles un panel animado (AnimatePresence height: 0 → auto) con grid 2-col de 4 tips, cada uno con icono en cuadro esmeralda.
- Botón "Mejorar plan" (Crown icon, ghost amber) con toast.info.
- Card "Desglose de almacenamiento": grid 2-col con:
  - Donut chart (PieChart de recharts, h-52 w-52, innerRadius 62, outerRadius 88, paddingAngle 2) con 4 categorías (Fotos de perfil esmeralda, Galería ámbar, Productos teal, Otros slate). Center label "X.X MB usados". Tooltip con formatter que muestra "{value} MB".
  - Leyenda: 4 filas con dot de color + nombre + "% del total" + valor MB.
- ScrollArea con `.custom-scrollbar` para lista de archivos.

**e) Settings improvements (`SettingsSection`):**
- Estado nuevo: `pushNotif` (bool), `profilePhoto` (string base64), `deleteOpen` (bool), `deleteConfirm` (string), `fileInputRef`.
- Import de `useAppStore` actions `navigate` y `logout` para el flujo de eliminación.
- Tab "General" ampliado:
  - Card "Foto de perfil" (icon Camera): Avatar 20x20 con foto o fallback con iniciales, botón "Subir foto" (Upload) que dispara input file oculto, botón "Eliminar" (Trash2) cuando hay foto. Validación: image/* + max 5MB. FileReader para convertir a base64. Hint de formatos y tamaño recomendado.
  - Card "Preferencias de notificaciones" (icon Bell): 4 toggles con iconos:
    - Correo (Mail) - activado por defecto.
    - Push (Smartphone) - activado por defecto (NUEVO).
    - SMS (Phone) - desactivado.
    - Autenticación en dos pasos (ShieldCheck) - desactivado.
    Cada toggle muestra toast.info al cambiar.
  - Card "Cuenta" preservada.
  - Card "Zona de peligro" (border-rose-300/60): header con icono AlertCircle en cuadro rose + título "Zona de peligro" + descripción. Contenido: botón "Eliminar cuenta" (Trash2, destructive bg-rose-600).
- Dialog de confirmación "Eliminar cuenta": warning text + campo para escribir "ELIMINAR" + botón "Eliminar definitivamente" deshabilitado hasta que se escriba la palabra exacta. Al confirmar: `logout()` + `navigate('landing')` + toast success.

### 5. Mejoras a `src/components/sections/card-editor.tsx`

**Imports nuevos:** `useMemo`, `useEffect` de react; `motion`, `AnimatePresence` de framer-motion; iconos `Search, ChevronDown, ChevronRight, Clock, Maximize2, Minimize2, Grip, Link2, AlertCircle`; `QRCodeCanvas` de `qrcode.react`; `Progress` de shadcn/ui; `Collapsible, CollapsibleContent, CollapsibleTrigger` de shadcn/ui; `buildWhatsappUrl` de `card-utils`.

**a) Detalles Básicos (`DetallesSection`):**
- Hook `useMemo` que calcula `completitud` (0-100) con 8 campos ponderados: cardName (15), linkName>=3 (10), description>=20 (20), profilePhoto (15), coverPhoto (10), logo (10), whatsappNumber (15), services>0 (5).
- `completitudLabel` dinámico: "¡Excelente!" / "Buen progreso" / "Recién empezando" / "Completa los campos".
- Card de completitud (border-emerald-200/60, gradiente smeralda→amber sutil): icono Sparkles en cuadro gradient (esmeralda si >=80, ámbar si >=50, slate si menor) + título + label + número grande + Progress bar.
- Campo "Nombre del enlace (URL)": Label con icono Link2, hint actualizado "Mínimo 3 caracteres".
- **Live URL preview**: cuadro emerald-50 con icono ExternalLink + label uppercase "Vista previa del enlace público" + URL monoespaciada `ftpdigitalplus.com/t/{linkName || 'mi-enlace'}` con linkName destacado en ámbar + Badge "Disponible" (esmeralda con Check) si linkName.length >= 3, si no Badge "Muy corto" (ámbar con AlertTriangle).
- Campo "Nombre en la tarjeta": maxLength=60 + contador "X/60 caracteres" alineado a la derecha.
- Campo "Descripción": maxLength=300 + contador dual: a la izquierda mensaje contextual ámbar ("Te faltan X caracteres para un mínimo recomendado") o esmeralda ("Longitud adecuada"), a la derecha "X/300".

**b) QR section (`QrSection`):**
- `qrCanvasRef` (ref al div contenedor del QR canvas) para poder descargar el PNG.
- `whatsappUrl` construido con `buildWhatsappUrl(card.whatsappNumber, card.whatsappMessage)`.
- `qrValue` = `qrExpired ? 'https://ftpdigitalplus.com/qr-expirado' : whatsappUrl || 'https://ftpdigitalplus.com/t/{linkName}'`.
- `handleDownloadQr`: querySelector('canvas') dentro del ref, `canvas.toDataURL('image/png')`, crea `<a>` temporal con download=`qr-{linkName}.png`, click programático, toast success.
- `handleTestQr`: validaciones (sin número → toast error, expirado → toast error), si OK `window.open(whatsappUrl, '_blank', 'noopener,noreferrer')` + toast success.
- Card "Vista previa en vivo" (reemplaza la antigua "Vista previa"):
  - Header actualizado a "Vista previa en vivo".
  - `<QRCodeCanvas>` real (size=180, fgColor=qrColor, bgColor=qrBgColor, level=M, marginSize=1) con `imageSettings` condicional si `card.qrLogo` (height/width=36, excavate=true).
  - Badge "EN VIVO" en esquina superior-derecha con dot animado (`animate-pulse`) esmeralda.
  - Contenedor con border-color y background dinámicos (qrColor y qrBgColor).
  - Botones reorganizados en grid:
    - Botón principal "Generar QR" / "Regenerar QR" (RefreshCw, full width, esmeralda).
    - Grid 2-col: "Descargar PNG" (Download, outline emerald) + "Probar QR" (ExternalLink, outline amber).
  - Hint condicional ámbar con AlertTriangle si no hay whatsappNumber: "Configura tu número de WhatsApp para activar el QR."
  - Fecha de generación preservada al final.

**c) Sidebar improvements (en `CardEditor`):**
- Constante `EDITOR_CATEGORIES` con 4 categorías:
  - Básico: detalles, plantillas, dinamica, horario, whatsapp.
  - Contenido: servicios, productos, instagram, galeria, blog, testimonios, muros, equipo, sociales, bandera.
  - Diseño: qr, fuentes.
  - Avanzado: avanzado, motores, privacidad, terminos, secciones, fondos, pagos.
- Hook `useCardCompletitud(card)` — useMemo con 13 campos ponderados (cardName, linkName, description, profilePhoto, coverPhoto, logo, whatsappNumber, services, products, gallery, testimonials, socialLinks, qrGeneratedAt) → % 0-100.
- Estado nuevo: `searchQuery` (string), `collapsedCats` (Record<string, boolean>).
- `filteredSections` — filtra sectionList por nombre o descripción que incluya searchQuery (case-insensitive).
- `categorizedSections` — mapea EDITOR_CATEGORIES con sus items correspondientes de sectionList.
- `renderSectionButton(s)` — helper que renderiza un botón de sección con icono DynamicIcon + nombre + Lock si restricted. Activo en esmeralda.
- Contenido del sidebar:
  - Botón "Volver al Panel" preservado.
  - **Indicador de completitud**: card gradiente esmeralda→amber con anillo SVG circular (40x40, stroke 4, gradiente esmeralda→oro) mostrando el % + caption "Completitud" + sublabel dinámico.
  - **Search/filter input**: Input con icono Search a la izquierda + botón X a la derecha (visible solo cuando hay texto) para limpiar.
  - Si hay búsqueda: lista plana de `filteredSections` o mensaje "Sin coincidencias para X".
  - Si no hay búsqueda: 4 `Collapsible` (uno por categoría) con trigger que muestra ChevronDown/ChevronRight + nombre + Badge con conteo de items. CollapsibleContent con la lista de botones.
  - **Indicador de guardado**: fila con dot esmeralda animado + "Guardado automático" + Clock icon + hora actual (HH:MM).
  - Botón "Ver Vista Previa" preservado (xl:hidden).

**d) Floating Vista previa panel (`FloatingPreviewPanel`):**
- Componente nuevo, solo visible en pantallas < xl (envuelto en `<div className="xl:hidden">`).
- Estado: `minimized` (bool), `expanded` (bool), `visible` (bool), `savedTime` (useMemo que se recalcula cuando `card` cambia).
- Si `!visible`: renderiza un botón flotante circular esmeralda (12x12, bottom-6 right-6, z-40) con icon Eye + animación de entrada (scale 0.8→1) que al click vuelve a mostrar el panel.
- Si visible: `motion.div` con `drag` (framer-motion), `dragMomentum={false}`, `dragElastic={0.12}`. Clases de tamaño dinámicas:
  - width: `w-[420px]` si expanded, `w-72` si minimized, `w-80` normal.
  - height: `h-12` si minimized, `h-[600px]` si expanded, `h-[420px]` normal.
  - `maxWidth: calc(100vw - 3rem)` para evitar overflow en móvil.
- Header (drag handle): gradiente esmeralda con `cursor-grab`/`active:cursor-grabbing`, icon Grip + Eye + título "Vista Previa en Vivo" + badge "LIVE" con dot animado + 3 botones:
  - Minimize (Minimize2/Maximize2 según estado).
  - Expand (solo si no minimized, Maximize2/Minimize2 según expanded).
  - Close (X) → setVisible(false).
- Contenido (si !minimized): ScrollArea con CardPreview + footer con dot esmeralda animado + "Guardado automáticamente" + Clock + savedTime.
- Animación de entrada: initial opacity 0 + scale 0.95 → animate opacity 1 + scale 1 (duración 0.25s).

### 6. Verificación
- `bun run lint` → **0 errores, 0 warnings** después de corregir:
  - `setState in effect` en `tipIndex` (cambiado a lazy initializer en useState).
  - `setState in effect` en `savedTime` del FloatingPreviewPanel (cambiado a useMemo).
  - `'Upload' is not defined` (añadido a imports de dashboard).
  - `'LifeBuoy' is not defined` (añadido a imports — era usado por Soporte button pre-existente del Task 6-a).
  - Unused eslint-disable directive en `<img>` (removido el comentario).
- `npx tsc --noEmit --skipLibCheck` → 0 errores en archivos del proyecto (errores pre-existentes solo en `examples/` y `skills/` no relacionados).
- Dev server: `bun run dev` corre en puerto 3000, compilación exitosa, 200 OK responses. Verificado en `dev.log`:
  - `✓ Compiled in 422ms`, `✓ Compiled in 292ms`, `✓ Compiled in 940ms` después de los cambios.
  - `GET / 200` en todos los requests.

## Stage Summary
- **Store extendido**: `favoriteCardIds: string[]` + `toggleFavorite(cardId)` persistidos en localStorage.
- **`favorites.tsx` creado**: `FavoritesWidget` con header, empty state "Marca tus tarjetas favoritas con la estrella", lista horizontal scrollable con mini cards (avatar gradiente, botón estrella, stats inline, acciones Ver/Editar).
- **Dashboard mejorado**:
  - Sidebar: anillo SVG de progreso del plan + indicador online (dot esmeralda con ping) + 3 botones de acciones rápidas (Mi Tarjeta, Compartir, Ayuda) con tooltips.
  - Tablero: banner con `animate-gradient` + consejo del día rotatorio (5 tips, random inicial, ciclo 12s), stat cards con sparklines recharts, grid 2-col con FavoritesWidget + timeline de actividad reciente (5 actividades mock con iconos y timestamps relativos), card items con thumbnail preview + botón estrella favorito + stats de 3 columnas con iconos.
  - Storage: botón "Liberar espacio" con panel de 4 tips animado, donut chart PieChart de recharts con 4 categorías (Fotos, Galería, Productos, Otros) + leyenda + lista de archivos con custom scrollbar.
  - Settings: foto de perfil con upload (FileReader base64), 4 toggles de notificaciones (correo, push, SMS, 2FA), zona de peligro con botón "Eliminar cuenta" + dialog de confirmación que requiere escribir "ELIMINAR".
- **Card Editor mejorado**:
  - Sidebar: anillo SVG de completitud (13 campos ponderados), input de búsqueda/filtro, 4 categorías colapsables (Básico, Contenido, Diseño, Avanzado) con conteos, indicador de guardado automático con hora.
  - Detalles Básicos: card de completitud con progress bar, live URL preview con badge Disponible/Muy corto, contadores de caracteres para nombre (60) y descripción (300) con feedback de longitud mínima.
  - QR: vista previa en vivo con `<QRCodeCanvas>` real (180px, colores dinámicos, logo central opcional), badge "EN VIVO", botones "Descargar PNG" (canvas.toDataURL) y "Probar QR" (window.open WhatsApp).
  - Panel flotante "Vista Previa": draggable con framer-motion (dragMomentum=false), minimizable, expandible, closable, con header gradiente esmeralda + grip handle + 3 controles, footer con indicador de guardado. Visible en pantallas < xl (debajo del aside fijo).
- **Paleta**: 100% esmeralda (#059669) + oro (#f59e0b). Cero azul/índigo.
- **Idioma**: 100% español (México).
- **Responsive**: mobile-first. Sidebar desktop oculto en mobile (Sheet), floating panel solo < xl, grid 1→2→3→4 columnas según breakpoint, max-w con viewport units.
- **Accesibilidad**: aria-labels en botones de estrella, drag handle, close/minimize/expand; tooltips en acciones rápidas; estructura semántica (header, main, nav, aside, footer); tamaños mínimos táctiles (h-8/h-9+).
- **Lint**: 0 errores, 0 warnings. TypeScript: 0 errores en archivos del proyecto.
