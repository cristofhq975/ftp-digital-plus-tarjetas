# Task 14-b — Card Preview Polish + Landing Improvements

## Agent
Subagent (Z.ai Code)

## Task
- Pulir 5 plantillas nuevas en `src/components/card-preview.tsx` (corporativo, creativo, oscuro, vintage, tech) con más detalle visual.
- Enriquecer `src/components/sections/landing-page.tsx`: Hero rotativo, Features con hover expandible, nueva sección InteractiveDemo, Pricing con toggle mensual/anual + FAQ, Stats con iconos.
- Append CSS en `src/app/globals.css`.

## Work Log

### card-preview.tsx (1109 → 1376 líneas)
- Imports: `Download`, `Terminal`, `ScanLine`.
- **CorporativoCard**: clase `brand-bar-top` + variable `--brand-color`; sidebar gradiente navy vertical; horario compacto Lun-Vie; botón formal "Descargar PDF" con `.btn-pdf-formal` (window.print); header con "Est. 2024".
- **CreativoCard**: 3 blobs `.template-creativo-blob` con morphing 8s; 6 elementos decorativos `.float-decor` (Sparkles + dots + diamonds); gradiente 3 paradas (primary → secondary → `#fbbf24`); foto perfil orgánica `rounded-[30%_70%_70%_30%/30%_30%_70%_70%]`; servicios con alternating organic shapes.
- **OscuroCard**: clase `grid-overlay-dark`; 3 blobs aurora con `glow-emerald-soft`; 3 stats glass-dark (Visitas/QR/Estado) con iconos Eye/QrIcon/Shield; secciones en `glass-dark-strong`; horario en grid 3 cols; NUEVO `QrBlockDark` con QR invertido (puntos blancos sobre `#0f172a`).
- **VintageCard**: clase `ornamental-corner` con flourishes L-shape; doble borde ornamental (border-double + border); header "Establecido 2024" con ✦; perfil 28x28 con sepia filter 0.4 + contrast 0.95; dividers `.vintage-divider` con Diamond; servicios con foto mini circular sepia; horario estilo "Atención" en cursiva; QR con marco doble ornamental; footer "Est. MMXXIV".
- **TechCard**: clases `scanline-overlay` + `grid-animated`; background más oscuro `#020617`; header tipo terminal `> [card-linkName] $` con Terminal icon + dots rojo/ámbar/esmeralda; avatar con `neon-border neon-glow`; productos array estilo código `[00, nombre, $precio]`; NUEVO `QrBlockTech` con `neon-glow-strong` y boxShadow custom; horario estilo `crontab -l`.

### landing-page.tsx (1908 → 2330 líneas)
- Imports: `useMemo`, `COLOR_PRESETS`, `BusinessCard`, `CardPreview`, iconos `Eye`/`Layers`/`Palette`/`Play`/`HelpCircle`/`Plus`/`Minus`.
- **Hero FloatingCardPreview reescrito**: `buildMockCard()` factory completa; `HERO_ROTATING_TEMPLATES` con las 10 plantillas; ciclo cada 3s con pausa en hover; transición `AnimatePresence` con rotateY 90°/0°/-90°; dots clickeables para navegación manual; badge "Demo en vivo" con ping animado.
- **Features**: clases `feature-card-expand` + `gradient-border-hover` en ambos grupos; link "Saber más →" con opacity en hover.
- **NUEVA InteractiveDemo** (entre CasesPreview y PricingPreview): 5 toggles plantilla (`.template-toggle-btn`), 6 swatches circulares (`DEMO_COLOR_SWATCHES.slice(0,6)`), stats (10/20/24+), CTA "Crea la tuya", preview sticky con `CardPreview` + AnimatePresence fade.
- **PricingPreview**: toggle Mensual/Anual con slider animado; badge "−20%" con `.savings-badge` pulse; `computePrice()` para anual (×12×0.8); label "MXN / año"; mensaje "Ahorras $X MXN"; `.popular-badge` bounce; FAQ snippet con 3 preguntas expandibles (Plus/Minus + AnimatePresence).
- **Stats**: cada stat con icono (LayoutTemplate/QrCode/Zap/Shield) en chip glassmorphism `bg-white/10 backdrop-blur ring-1 ring-white/15`.

### globals.css (789 → 1040 líneas, ~250 nuevas)
Nuevas utilidades y animaciones:
- `.template-creativo-blob` + `@keyframes blob-morph`
- `.float-decor` + `@keyframes float-decor`
- `.scanline-overlay::after` + `@keyframes scanline`
- `.neon-glow`, `.neon-glow-strong`
- `.ornamental-border` (con ✦ pseudo-elementos)
- `.ornamental-corner` (flourishes L-shape)
- `.vintage-divider` (líneas gradiente)
- `.glass-dark`, `.glass-dark-strong`
- `.grid-animated` + `@keyframes grid-move`
- `.grid-overlay-dark`
- `.glow-emerald-soft`
- `.brand-bar-top::before` (con `--brand-color`)
- `.btn-pdf-formal`
- `.feature-card-expand`, `.gradient-border-hover`
- `.popular-badge` + `@keyframes popular-bounce`
- `.savings-badge` + `@keyframes savings-pulse`
- `.template-toggle-btn[data-active]`, `.color-swatch[data-active]`
- `.badge-float-in` + `@keyframes badge-float-in`
- `.qr-container-compact.inverted`
- `.hover-lift`

## Quality Checks
- `bun run lint`: 0 errores, 0 warnings (1 error preexistente en keyboard-shortcuts-overlay.tsx, fuera de scope).
- `npx tsc --noEmit`: 0 errores en src/ (errores solo en examples/ y skills/ preexistentes).
- Dev server: HTTP 200 en `/` con compilación limpia.

## Stage Summary
- 5 plantillas premium pulidas con detalle visual + componentes QR específicos (QrBlockDark, QrBlockTech).
- Landing con Hero rotativo de 10 plantillas + Interactive Demo + Pricing con toggle + FAQ + Stats con iconos.
- ~250 líneas de CSS nuevo reutilizable.
- Paleta esmeralda + oro consistente en UI chrome.
- 100% español, responsive, accesible.
