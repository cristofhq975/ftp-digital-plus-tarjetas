# Task 7-c: Profile Page + Mobile Responsiveness

- **Task ID:** 7-c
- **Agent:** Subagent C (Profile & Mobile)
- **Task:** Página de Perfil/Ajustes de cuenta + mejoras de responsividad móvil

## Work Log

### 1. `src/lib/types.ts`
- Añadido `'profile'` al union type `ViewType` (después de `'refunds'`).

### 2. `src/lib/store.ts`
- Añadido `updateUser: (updates: Partial<User>) => void` al `AppState` interface.
- Implementado el action: actualiza `currentUser` y el item correspondiente en `users[]` (mantiene consistencia entre ambos).
- No se añadió a `partialize` porque `currentUser` y `users` ya se persisten, lo que cubre los cambios.

### 3. `src/components/sections/profile-page.tsx` (NUEVO, ~1100 líneas)
Componente `ProfilePage` con `'use client'`. Arquitectura:

**Layout principal:**
- Top bar sticky con FTPLogo, título "Mi Perfil", botón "Volver al panel" (sm+), ThemeToggle.
- Layout flex de 2 columnas en desktop (sidebar 72 + main), en móvil sidebar se vuelve Sheet.
- Footer sticky al fondo con `mt-auto`.

**Sidebar (`ProfileSidebar`):**
- Card con gradiente esmeralda + decoración: avatar 14x14 con iniciales, nombre, email, badge de plan con icono (Crown/Zap/Sparkles).
- Lista de 6 tabs con iconos, descripción y `min-h-[44px]` para touch targets.
- Botón "Volver al panel" al pie.
- Mobile: Sheet `w-[85vw] max-w-[320px]`.

**Tab 1 — Mi Perfil (`PerfilTab`):**
- Card con portada gradiente + avatar 24x24 grande con anillo blanco + botón cámara (FileReader base64, máx 5MB).
- Formulario: Nombre, Email, Teléfono (con icono), Biografía (Textarea maxLength 280 con contador).
- Botones "Cancelar" / "Guardar cambios" (h-11).
- "Guardar cambios" llama `updateUser({ name, email, avatar })` con validación.
- Grid 2x2 (sm): Card "Cuenta creada el" (fecha) + Card "Plan actual" con CTA "Mejorar" (si no es Pro).

**Tab 2 — Seguridad (`SeguridadTab`):**
- **Cambiar contraseña**: 3 campos (actual, nueva, confirmar) con toggle eye/eyeoff, medidor de fortaleza en vivo (`calcPasswordStrength`):
  - Score basado en longitud (8, 12), minúsculas, mayúsculas, números, símbolos.
  - Barra Progress + label ("Muy débil"→"Muy fuerte") + checklist visual de 6 requisitos.
  - Indicador visual check/X al confirmar (verde si coinciden, rosa si no).
- **2FA**: Switch con dialog multi-step (intro → QR pseudo-random 12x12 grid → verify 6 dígitos → done).
- **Sesiones activas**: 2 sesiones mock (Windows+Chrome actual, iPhone+Safari), botón "Cerrar todas", info de ubicación/IP/última actividad.
- **Historial de inicios de sesión**: Timeline vertical con 5 entries mock (success/failed), iconos, ubicación, IP, fecha.

**Tab 3 — Notificaciones (`NotificacionesTab`):**
- 3 secciones de toggles (Switch): Email (5 opciones), Push (3), SMS (2).
- Aviso ámbar "Verificación de teléfono requerida" en SMS con botón "Verificar teléfono".
- Cada toggle dispara toast de confirmación.
- **"No molestar"**: Switch + 2 inputs time (desde/hasta) con animación framer-motion al activar.

**Tab 4 — Facturación (`FacturacionTab`):**
- Card de plan actual con header gradiente por color de plan, icono, precio grande + period.
- Grid 2-col: detalles (tarjetas, almacenamiento, renovación) + funciones principales (primeras 4 features).
- CTA "Mejorar plan" si no es Pro.
- **Métodos de pago**: 1 tarjeta mock (VISA •••• 4242), botón "Agregar".
- **Historial de facturación**: Tabla desktop (fecha, descripción, monto, estado, acción) + cards móviles; 3 invoices mock; botones "Descargar factura" con toast.

**Tab 5 — Preferencias (`PreferenciasTab`):**
- **Idioma y región**: Select idioma (4 opciones con bandera), zona horaria (10 zonas América/Europa), moneda (MXN/USD/EUR).
- **Tema**: RadioGroup horizontal con 3 opciones (Claro/Oscuro/Sistema), cards visuales con icono Sun/Moon/Laptop.
- **Formato de fecha**: RadioGroup vertical con 2 opciones (DD/MM/YYYY, MM/DD/YYYY) + preview de fecha actual.

**Tab 6 — Datos y Privacidad (`PrivacidadTab`):**
- **Exportar datos**: Card con gradiente esmeralda→amber mostrando conteo de datos a exportar (tarjetas, mensajes, citas), botón genera JSON Blob con `user`, `cards`, `messages`, `appointments` y dispara download `<a>`.
- **Eliminar actividad**: 2 botones (Limpiar mensajes, Limpiar historial) con toast.
- **Zona de peligro**: Card con borde rosa, botón rojo "Eliminar cuenta" → Dialog que requiere escribir "ELIMINAR" literal para habilitar el botón destructivo.

**Transiciones:**
- `AnimatePresence mode="wait"` con `motion.div` por cada tab (fade + slide y).

### 4. `src/app/page.tsx`
- Importado `ProfilePage` de `@/components/sections/profile-page`.
- Añadido `case 'profile': return <ProfilePage />;` en el switch de `currentView`.

### 5. `src/components/sections/dashboard.tsx` — Navegación a Perfil
- Añadido botón "Mi Perfil" (icono `CircleUser`) en el footer del sidebar, arriba de "Soporte" y "Cerrar Sesión".
- `onClick` llama `useAppStore.getState().navigate('profile')`.

### 6. Mobile Responsiveness — `landing-page.tsx`
- **Hero**: H1 cambiado de `text-4xl` a `text-3xl` en mobile (sm:text-4xl lg:text-6xl), `sm:leading-tight` añadido.
- **Hero párrafo**: `text-base` mobile, `sm:text-lg`.
- **Hero botones**: Añadido `min-h-[48px]` para touch targets.
- **Features grid**: Cambiado de `grid gap-6 sm:grid-cols-2 lg:grid-cols-3` a `grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3` (full-width en mobile).
- **Additional features grid**: Mismo cambio.
- **Comparison mobile**: Reemplazados cards apilados por carrusel horizontal scrollable (`overflow-x-auto` con clase custom `.ftp-comparison-scroll`):
  - Hint visual "Desliza horizontalmente para comparar todas las opciones" con icono ArrowRight.
  - Cards de 256px width con `shrink-0`, distribuidas en flex row con `gap-3`.
- **Footer columns**: Cambiada grid de `lg:grid-cols-12` a `grid gap-8 sm:gap-10 lg:grid-cols-12`:
  - Brand + social: `sm:col-span-2 lg:col-span-4` (full width mobile, 2-col sm, 4-col lg).
  - Producto / Legal: `sm:col-span-1 lg:col-span-2`, listas con `gap-3 sm:gap-2.5`.
  - Newsletter: `sm:col-span-2 lg:col-span-4`, form `flex-col sm:flex-row`, inputs `min-h-[44px]`, botón siempre muestra "Suscribirme" (no hidden).
- **Social icons**: Tamaño bump de `size-9` a `size-11` (44px touch target), iconos `size-5`.
- **Mobile menu**: Links `min-h-[48px] py-3`, botones `min-h-[48px]`.
- **Hamburger button**: `size-10` → `size-11` (44px touch target).
- **LiveDemoButton**: Reposicionado en mobile a `bottom-20 right-4` (sube para no cubrir contenido), `sm:bottom-6 sm:right-6` en pantallas grandes.

### 7. Mobile Responsiveness — `dashboard.tsx`
- **Sidebar Sheet**: Cambiado de `w-72` a `w-[85vw] max-w-[320px]` (spec compliance).
- **Pull-to-refresh hint**: Añadido indicador visual "Desliza hacia abajo para actualizar" con icono RefreshCw, solo visible en mobile (`md:hidden`), al inicio del main content.
- **Recent Activity timeline**: Añadido `max-h-80 overflow-y-auto pr-1 custom-scrollbar md:max-h-none md:overflow-visible` para que sea scrollable en mobile pero completo en desktop.
- **CardItem touch targets**: Bump de `h-8 w-8` a `h-9 w-9` en todos los icon buttons (Editar, Ver, Compartir, Copiar, Eliminar) — ahora ≥36px (mejor toque).
- Stat cards grid ya era `grid-cols-2 ... lg:grid-cols-4` (2x2 mobile), no se requirió cambio.
- Añadido import `RefreshCw` desde lucide-react.

### 8. Mobile Responsiveness — `card-editor.tsx`
- **Sidebar Sheet**: Cambiado de `w-72` a `w-[85vw] max-w-[320px]`.
- **Mobile topbar**: Añadido `gap-2` y `min-h-[40px]` en los 2 botones (Secciones, Preview).
- **SectionHeader**: 
  - Margin bottom aumentado a `mb-6 sm:mb-8` (más espacio entre secciones en mobile).
  - Título `text-lg sm:text-xl` (más pequeño en mobile).
  - Añadido `min-w-0 flex-1` al div del título para prevenir overflow.
- **Main content padding**: Añadido `lg:py-8` para más espacio vertical en desktop.
- **FloatingPreviewPanel**:
  - Botón flotante "mostrar": `bottom-20 right-4 sm:bottom-6 sm:right-6` (sube en mobile).
  - **Full-screen en mobile**: Añadidas clases `inset-0 sm:inset-auto sm:bottom-6 sm:right-6` y `w-full sm:w-auto ... sm:w-[420px]/sm:w-72/sm:w-80`, `h-full sm:h-auto ... sm:h-12/sm:h-[600px]/sm:h-[420px]`.
  - Drag deshabilitado en mobile (`drag={!isMobile}`) — fullscreen no necesita drag.
  - `isMobile` se calcula con `window.innerWidth < 640`.
  - `maxWidth` dinámico: `100vw` mobile vs `calc(100vw - 3rem)` desktop.
  - Esquinas redondeadas y borde solo en sm+ (`sm:rounded-xl sm:border`).
- Las grids de inputs ya eran responsivas (`grid-cols-1 sm:grid-cols-2` o single col) — no se requirió cambio.

### 9. `src/app/globals.css`
- Añadido bloque `.ftp-comparison-scroll` con scrollbar horizontal estilizado (4px height, color esmeralda oklch, hover state, Firefox `scrollbar-width: thin`).

## Stage Summary
- Página de Perfil completa con 6 tabs funcionales: Perfil, Seguridad, Notificaciones, Facturación, Preferencias, Datos y Privacidad.
- Store extendido con `updateUser` action (actualiza user + users[]).
- ViewType ampliado con `'profile'`.
- Dashboard sidebar incluye botón "Mi Perfil" que navega a la nueva página.
- Mobile responsiveness mejorado en landing (hero, features, comparison scrollable, footer stacked, touch targets), dashboard (Sheet width, pull-to-refresh hint, scrollable timeline, icon button touch targets) y card-editor (Sheet width, full-screen floating preview panel en mobile, SectionHeader spacing).
- Paleta 100% esmeralda + oro (zero azul/índigo).
- 100% español.
- ESLint: 0 errores en archivos modificados. Dev server compila correctamente y responde 200.
- Pre-existing issue no relacionado: `EscalatorUp` no encontrado en `command-palette.tsx` (no fue introducido por esta tarea).
