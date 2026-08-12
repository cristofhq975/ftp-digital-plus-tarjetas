# Task 7-b — Share Modal + Command Palette (Cmd+K)

## Agent
Subagent (Share & Command Builder)

## Task
Construir un `ShareModal` reutilizable y un `CommandPalette` (Cmd+K) para FTP Digital Plus, e integrarlos en `layout.tsx`, `dashboard.tsx` y `public-card.tsx`. Paleta esmeralda + oro, 100% español, mobile-first.

## Work Log

### 1. `src/components/share-modal.tsx` (nuevo, ~570 líneas)
- `'use client'` + export `ShareModal({ open, onOpenChange, card })`.
- Diálogo `max-w-2xl` con header gradiente esmeralda → ámbar, título con icono Share2.
- **3 Tabs**: `Compartir`, `Código QR`, `Embebido`.
- **Tab Compartir**:
  - Input "Enlace público" `ftpdigitalplus.com/t/[linkName]` + botón Copiar (con feedback `Check` + toast sonner).
  - Textarea "Mensaje personalizado (opcional)" — se anexa automáticamente a WhatsApp/X/Telegram/Email.
  - Botón "Compartir…" (visible solo si `navigator.share` existe).
  - Grid 3-col → 6-col con 6 botones sociales: WhatsApp (verde #25D366), Facebook (#1877F2), X (slate-900), LinkedIn (#0A66C2), Telegram (#0088cc), Email (slate-500). Cada uno con `target="_blank"`, `aria-label`, icono lucide, hover scale.
  - Card de "Descargar imagen de tarjeta" — reutiliza `useCardDownload` + `generateCardImage` + `downloadDataUrl` (patrón de `public-card.tsx`), con QR canvas oculto fuera de pantalla.
- **Tab QR**:
  - `QRCodeCanvas` 180px con `level="H"`, `fgColor={card.qrColor}`, `bgColor={card.qrBgColor}` (personalizable por tarjeta).
  - Card esmeralda-ámbar gradiente alrededor con nombre de tarjeta + linkName.
  - Info badge ámbar sobre expiración de QR en plan gratis.
  - Botón "Descargar QR (PNG)" usando `canvas.toDataURL('image/png')`.
- **Tab Embebido**:
  - Bloque de código con header tipo "terminal" (3 dots rojo/ámbar/esmeralda + label HTML + botón Copiar).
  - `<pre><code>` con código iframe real: `<iframe src="..." width="100%" height="500" ...>`.
  - Vista previa mock con icono ImageIcon + nombre + URL.
- Animación framer-motion de entrada (opacity + y).
- Limpieza de estado al cerrar (copied, copiedEmbed, customMessage, activeTab) en `useEffect` con `eslint-disable` para `react-hooks/set-state-in-effect`.
- Import `useAppStore` para resolver plan del dueño de la tarjeta en `DownloadImageButton`.

### 2. `src/components/command-palette.tsx` (nuevo, ~480 líneas)
- `'use client'` + export `CommandPalette()`.
- **Listener global** en `useEffect`:
  - `Cmd+K` / `Ctrl+K` → toggle (con `e.preventDefault()`)
  - `/` (cuando no está en input/textarea/contenteditable/combobox) → abrir
  - Custom event `ftp:open-command-palette` → abre programáticamente (usado por botón "Buscar…" del dashboard).
- **Cmdk** envuelto en `Dialog` de shadcn/ui (radix) con `DialogTitle`/`DialogDescription` `sr-only` para a11y.
- **Header de búsqueda**: icono Search en cuadro esmeralda, `CommandInput` con autoFocus, kbd "ESC" a la derecha.
- **Filtro custom**: cada token de búsqueda debe ser substring del value (label + description + keywords + group). Sin distinción de mayúsculas.
- **Grupos de comandos**:
  - **Navegación**: Inicio, Planes, Iniciar Sesión, Dashboard (solo si logueado, con shortcut `⌘D`).
  - **Mis Tarjetas**: dinámico por `useCurrentUserCards()` — cada tarjeta con label=cardName, description=URL, icon=CardIcon, action=`selectCard + navigate('editor')`.
  - **Crear**: Nueva Tarjeta, Ver Plantillas, Ver Analítica.
  - **Ayuda**: Centro de Ayuda, Soporte, Términos, Privacidad.
  - **Acciones**: Cambiar tema (toggle claro/oscuro con `useTheme` de next-themes), Ver Notificaciones (toast con hint al icono de campana).
- **Recientes**: cuando el search está vacío y hay recientes, se muestra un grupo "Recientes" arriba con `AnimatePresence`. Se persisten los últimos 5 IDs en `localStorage` (`ftp-cmd-recent`).
- **Footer**: hints de teclado (↑↓ Navegar, ⏎ Seleccionar, ESC Cerrar) + brand "FTP Digital Plus".
- **Row component** (`CommandRow`): icono en cuadro esmeralda, label + description truncados, shortcut monospace.
- Animación framer-motion de entrada (opacity + y).

### 3. `src/app/layout.tsx` (modificación)
- Import `CommandPalette` y renderizado dentro de `<ThemeProvider>` (al lado de `{children}`, `<Toaster />`, `<SonnerToaster />`). Disponible globalmente en todas las rutas.

### 4. `src/components/sections/dashboard.tsx` (modificación)
- Import `ShareModal` y `Search` icon.
- Estado `shareCard: BusinessCard | null` + helper `openShare(card)`.
- `SidebarContent` recibe nueva prop `onShareCard`. Su `handleShare` ahora delega al modal en vez de usar `navigator.share` inline.
- `TableroSection` recibe nueva prop `onShareCard` y la pasa a cada `CardItem`.
- `CardItem` recibe nueva prop `onShare` y agrega un botón outline `size="icon"` con icono `Share2`, colores ámbar (`border-amber-200 text-amber-600 hover:bg-amber-50`), tooltip "Compartir tarjeta". Se inserta entre Ver y Copiar.
- Se renderiza `<ShareModal open={!!shareCard} onOpenChange={...} card={shareCard} />` al final del componente `Dashboard`.
- **Hint ⌘K** en el header de bienvenida del Tablero: botón `Buscar… ⌘K` con backdrop blur que dispara `window.dispatchEvent(new CustomEvent('ftp:open-command-palette'))`. Mantiene el badge del plan a su lado.
- Props pasadas tanto al sidebar desktop como al Sheet móvil.

### 5. `src/components/sections/public-card.tsx` (modificación)
- Import `ShareModal`.
- `PaidPlanView` ahora maneja estado local `shareOpen`.
- Se reemplaza la fila "Compartir: [Facebook] [Twitter]" por un botón full-width "Compartir tarjeta" (outline ámbar) que abre el `ShareModal`.
- Se renderiza `<ShareModal open={shareOpen} onOpenChange={setShareOpen} card={card} />` dentro del PaidPlanView.
- Se eliminan imports `Facebook` y `Twitter` (ya no usados).

### 6. Verificación
- `bun run lint` → **0 errores, 0 warnings** (después de fix `react-hooks/set-state-in-effect` con `eslint-disable-next-line`).
- Dev server (Turbopack, puerto 3000): `GET / 200` OK, compila limpio.
- Fix inicial: `EscalatorUp` no existe en lucide-react → reemplazado por texto plano "ESC" en `<kbd>`.
- Paleta 100% esmeralda + oro. Cero azul/índigo (excepto los colores de marca de redes sociales: Facebook, LinkedIn, Telegram — son intrínsecos a cada red).

## Stage Summary
- **ShareModal** reutilizable listo: 3 tabs (Compartir/QR/Embebido), 6 redes sociales + native share + descargar imagen + descargar QR + código iframe con copiar. Mensaje personalizado se propaga a WhatsApp/X/Telegram/Email.
- **CommandPalette** global: Cmd+K, Ctrl+K, `/` (fuera de inputs), y botón "Buscar… ⌘K" del dashboard. 5 grupos + recientes persistidos en localStorage. Filtro por tokens. Toggle de tema integrado con next-themes. Acceso a todas las vistas y a las tarjetas del usuario.
- **Dashboard** integrado: ShareModal aparece al hacer click en botón "Compartir" del sidebar (tarjeta primaria) o en el botón Share2 de cada CardItem. Hint ⌘K visible en header de bienvenida.
- **PublicCard** simplificado: la fila de botones sociales inline se reemplazó por un único botón "Compartir tarjeta" que abre el ShareModal completo con todas las opciones (QR, embed, redes, etc.).
- Cero regresiones: lint limpio, dev server OK, paleta preservada.
