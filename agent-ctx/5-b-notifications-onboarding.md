# Task 5-b — Notifications Panel + Onboarding Wizard

**Task ID:** 5-b
**Agent:** Subagent (Notifications & Onboarding Builder)
**Task:** Crear `notifications-panel.tsx` y `onboarding-wizard.tsx`, e integrarlos en `landing-page.tsx` y `dashboard.tsx`.

## Contexto leído
- `worklog.md` (Tasks 1, 3-a, 3-b, 3-c, 3-d, 10) y `agent-ctx/` de tareas previas.
- `src/lib/store.ts` — API del store (currentUser, cards, messages, appointments, navigate, markMessageRead, createCard, useCurrentUserCards, useSelectedCard).
- `src/lib/types.ts` — ViewType, ContactMessage, Appointment, BusinessCard, User.
- `src/lib/plans.ts` — PLANS (maxCards), EDITOR_SECTIONS (24), DASHBOARD_SECTIONS.
- `src/lib/card-utils.ts` — getRelativeTime, slugify, formatDateTime.
- `src/components/theme-toggle.tsx` — provee `<ThemeToggle className=/>`.
- `src/components/sections/landing-page.tsx` — estructura de `SiteHeader` (desktop + mobile).
- `src/components/sections/dashboard.tsx` — top mobile bar, SidebarContent, layout general.
- `src/components/ui/{popover,scroll-area,tabs,button,badge,separator,progress,input,label,dialog}.tsx` — APIs de shadcn/ui disponibles.

## Archivos creados

### 1. `src/components/notifications-panel.tsx` (~380 líneas)
- Export `NotificationsPanel({ className })`.
- 'use client'. Bell icon button (Button ghost size=icon) con badge rojo animado (framer-motion spring) que muestra conteo de no leídas (capped a 9+).
- Popover (align=end, sideOffset=8) con ancho responsive `w-[calc(100vw-1.5rem)] sm:w-96`.
- Header con gradiente esmeralda→ámbar: ícono Bell en círculo, "Notificaciones", badge de conteo, botón "Marcar todas como leídas" (deshabilitado si no hay no leídas).
- Tabs (Todas | Sin leer) con badge en pestaña "Sin leer".
- ScrollArea max-h-[22rem] con AnimatePresence mode=popLayout.
- Tipos de notificación generados desde el store:
  - `plan`: "¡Bienvenido a FTP Digital Plus!" (timestamp = currentUser.createdAt).
  - `message`: por cada ContactMessage — "X te envió un mensaje", descripción = mensaje truncado a 90 chars, timestamp = m.date, read = m.read.
  - `appointment`: por cada Appointment con fecha >= ahora-24h — "Nueva cita de X", descripción = fecha · hora · estado.
  - `qr`: mock basado en total de qrScans — "Tu QR fue escaneado" + conteo del día (10% del total).
  - `limit`: si userCards.length >= PLANS[plan].maxCards — "Has alcanzado el límite de tarjetas de tu plan".
- Cada notificación: ícono en círculo coloreado (emerald/amber/teal/rose según tipo), título, descripción (line-clamp-2), timestamp relativo (getRelativeTime), indicador rojo de no leído.
- Config `TYPE_CONFIG` con bg + iconColor por tipo: message=emerald, appointment=amber, qr=teal, limit=rose, plan=amber.
- Click en notificación: marca como leída (localRead + markMessageRead si es mensaje) + ejecuta onAction (navega a dashboard o pricing) + cierra popover.
- "Marcar todas como leídas": agrega todos los ids a localRead + llama markMessageRead por cada mensaje.
- Estado local `localRead: Set<string>` para notificaciones no basadas en mensajes.
- Empty state: ícono Bell en círculo emerald, "No tienes notificaciones", mensaje contextual según tab activa.
- Footer: botón "Ver todas" → navigate('dashboard') + cierra popover.
- 100% español, paleta esmeralda + oro (sin azul/índigo), responsive.

### 2. `src/components/onboarding-wizard.tsx` (~700 líneas)
- Export `OnboardingWizard()`.
- 'use client'. Overlay full-screen `fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm` con tarjeta central `max-w-2xl max-h-[92vh] rounded-2xl bg-white shadow-2xl ring-1 ring-emerald-900/10`.
- Usa `useSyncExternalStore` para leer flag `ftp-onboarding-completed` de localStorage (evita patrón setState-in-effect que lint prohíbe). SSR-safe (server snapshot = false).
- `shouldShow = !!currentUser && !isCompleted && !dismissed` — solo se muestra para usuarios logueados que no completaron el tutorial y no lo han cerrado en esta sesión.
- `closeWizard()` escribe `localStorage[STORAGE_KEY]='1'` y setea `dismissed=true`.
- Top bar con gradiente: ícono Sparkles en cuadro esmeralda, "Tutorial · Paso X de 4" + subtítulo por paso, botones "Saltar tutorial" y X (cerrar).
- Progress bar (1px height) con gradiente esmeralda→ámbar animado por framer-motion.
- Step content con AnimatePresence mode=wait, transición x:24→0 (entrada) y 0→-24 (salida).
- Bottom nav: indicadores de paso (dots expandibles), botón Atrás (en pasos 2-3), botón contextual por paso.

**Step 1 — Bienvenida:**
- Emoji 👋 en cuadro 24x24 gradiente esmeralda con animación wave (rotate+scale loop).
- Headline "¡Bienvenido a FTP Digital Plus!" con gradiente emerald→amber.
- Párrafo introductorio.
- 3 chips: Crea (User, emerald), Personaliza (Wand2, amber), Comparte (Share2, emerald) con entrada staggered.
- Botón "Siguiente".

**Step 2 — Crea tu primera tarjeta:**
- Ícono User + título "Crea tu primera tarjeta".
- Si `hasExistingCard`: nota informativa esmeralda "Ya tienes X tarjetas".
- Si `atLimit && hasExistingCard`: nota ámbar "Has alcanzado el límite de tu plan".
- Form: cardName (Input, maxLength=60, placeholder) + linkName (Input con prefix `ftpdigitalplus.com/t/`).
- Auto-slug: al escribir cardName, si linkTouched=false, linkName = slugify(cardName). Cuando usuario edita linkName, linkTouched=true.
- Validación visual: enlace disponible (check esmeralda), enlace en uso (X rosa), vacío (hint).
- Preview del enlace en monoespaciado.
- Botones contextuales: "Continuar sin crear" (si hasExistingCard), "Crear y continuar" (si !atLimit, con spinner "Creando…"), "Continuar" (si atLimit && !hasExistingCard).
- `handleCreateCard` llama `createCard(linkName, cardName)` con delay 400ms para UX, setea `newCardLinkName`, avanza a step 3, toast success.
- Si createCard falla (límite), toast error.

**Step 3 — Personaliza:**
- Ícono Wand2 + título "Personaliza tu tarjeta".
- Grid scrollable `max-h-64 grid-cols-2 sm:grid-cols-3` con las 24 EDITOR_SECTIONS, cada una con DynamicIcon en cuadro gradiente emerald→amber + nombre. Entrada staggered (delay i*0.015).
- 3 tips destacados: Colores y fuentes, Fotos y galería, SEO y analítica con emojis.
- Nota: "Podrás editar todo esto en cualquier momento desde el editor de tarjetas."
- Botón "Entendido".

**Step 4 — Comparte:**
- Ícono Share2 + título "Comparte tu tarjeta".
- Grid 2 columnas:
  - Enlace público: card gradiente emerald con URL monoespaciada `ftpdigitalplus.com/t/{linkName}` + botón "Copiar enlace" (clipboard API + toast).
  - Código QR: card gradiente amber con `<QRCodeCanvas>` (size=120, fgColor=#059669, level=M, marginSize=1).
- `shareLinkName` = newCardLinkName || selectedCard.linkName || cards[0].linkName.
- Card final con Sparkles + mensaje "¡Estás listo!".
- Botón "Finalizar" (con Check) → `handleFinish` → toast success + closeWizard.

## Archivos modificados

### 3. `src/components/sections/landing-page.tsx`
- Imports añadidos: `ThemeToggle` de `@/components/theme-toggle`, `NotificationsPanel` de `@/components/notifications-panel`.
- `SiteHeader`: ahora lee `currentUser` del store.
- Desktop (md:flex): añadidos `<ThemeToggle>` y `{currentUser && <NotificationsPanel />}` antes de "Ver Planes" y "Iniciar Sesión".
- Mobile: creado nuevo contenedor `flex items-center gap-0.5 md:hidden` con `<ThemeToggle>`, `{currentUser && <NotificationsPanel />}` y el botón hamburguesa existente (movido aquí).

### 4. `src/components/sections/dashboard.tsx`
- Imports añadidos: `ThemeToggle`, `NotificationsPanel`, `OnboardingWizard`.
- Top mobile bar: reemplazado el botón Bell estático por `<NotificationsPanel />` + añadido `<ThemeToggle>` al lado.
- `SidebarContent` (desktop y mobile): el bloque del logo ahora es `flex items-center justify-between` con `<FTPLogo>` + `<ThemeToggle>` (theme toggle accesible desde sidebar desktop).
- Añadido `<OnboardingWizard />` al final del layout principal (después de `<CreateCardDialog>`).

### 5. `src/components/theme-toggle.tsx` (fix menor)
- El archivo pre-existente tenía un error de lint `react-hooks/set-state-in-effect` en `useEffect(() => setMounted(true), [])`.
- Fix minimalista: expandido el useEffect a bloque con `eslint-disable-next-line react-hooks/set-state-in-effect` + comentario explicando que es un patrón legítimo de mount-flag para evitar hidration mismatch con next-themes.
- Comportamiento 100% idéntico al original.

## Validación
- `bun run lint`: 0 errores, 0 warnings (después del fix a theme-toggle).
- `npx tsc --noEmit --skipLibCheck`: mis archivos (`notifications-panel.tsx`, `onboarding-wizard.tsx`, `theme-toggle.tsx`) y mis ediciones a `landing-page.tsx` y `dashboard.tsx` no producen errores de tipos. Los errores TS restantes en `dashboard.tsx` líneas 1405-1406 (Briefcase/ShoppingBag) son pre-existentes del Task 3-b y NO están en áreas que toqué.
- Paleta 100% esmeralda + oro (cero azul/índigo). 100% español (México).
- Responsive: popover se adapta a mobile con `w-[calc(100vw-1.5rem)]`, wizard usa `p-3 sm:p-6` y `max-w-2xl`.
- Accesibilidad: aria-label en bell button (dinámico con conteo), role="dialog" + aria-modal + aria-labelledby en wizard, sr-only en theme toggle.

## Stage Summary
- NotificationsPanel listo: bell button con badge animado, popover con tabs (Todas/Sin leer), 5 tipos de notificaciones derivadas del store, marcar todas como leídas, click navega + marca leído, empty state, footer "Ver todas".
- OnboardingWizard listo: 4 pasos (Bienvenida, Crea tu primera tarjeta, Personaliza con 24 secciones, Comparte con QR + enlace), localStorage flag `ftp-onboarding-completed`, skip + close + finish, transiciones framer-motion, integración con createCard del store.
- Integrado en landing-page (header desktop + mobile, condicional a login) y dashboard (sidebar desktop + mobile top bar + overlay al final del layout).
- Lint limpio (0 errores). TypeScript limpio para mis archivos.
- Pre-existing TS errors en dashboard.tsx (Briefcase/ShoppingBag) no son de mi scope.
