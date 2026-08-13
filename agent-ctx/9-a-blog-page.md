# Task 9-a — Blog & Resources Page

**Task ID:** 9-a
**Agent:** Subagent (Blog Builder)
**Task:** Create Blog/Resources page (`BlogPage`) and individual blog post page (`BlogPostPage`) for FTP Digital Plus, plus supporting data and store integration.

## Work Log

### 1. Type system (`src/lib/types.ts`)
- Added `'blog'` and `'blog-post'` to the `ViewType` union type (after `'profile'`). Surgical edit, no other changes.

### 2. Store (`src/lib/store.ts`)
- Added `selectedBlogPost: string | null` to the `AppState` interface (marked as session-only, not persisted).
- Added `setSelectedBlogPost: (postId: string | null) => void` to the action signatures.
- Initialized `selectedBlogPost: null` in the store state.
- Implemented `setSelectedBlogPost: (postId) => set({ selectedBlogPost: postId })`.
- Verified NOT included in `partialize` → session-only (not persisted to localStorage), as requested.

### 3. Blog data (`src/lib/blog-data.ts`) — NEW
- Created `BlogCategory` type (`'marketing' | 'tecnologia' | 'diseno' | 'negocios' | 'tutoriales'`) and extended `BlogPost` interface with all required fields (id, slug, title, excerpt, content, category, tags, author, date, readTime, image, featured, published).
- Exported `CATEGORY_GRADIENTS` and `CATEGORY_LABELS` maps for use in UI.
- Created 12 full Spanish blog posts with substantial content (each 3-5+ paragraphs of real, helpful content):
  1. "10 razones para usar tarjetas de presentación digitales en 2024" (marketing, featured)
  2. "Cómo crear una tarjeta NFC: Guía completa" (tutoriales, featured)
  3. "Diseño de tarjetas: errores comunes a evitar" (diseno)
  4. "Marketing digital para pequeños negocios" (marketing)
  5. "QR vs NFC: ¿Cuál es mejor para tu negocio?" (tecnologia, featured)
  6. "Cómo optimizar tu tarjeta para SEO local" (marketing)
  7. "Tendencias en diseño de tarjetas 2024" (diseno)
  8. "Automatiza tu negocio con tarjetas digitales" (negocios)
  9. "Guía: Configurar WhatsApp Business con tu tarjeta" (tutoriales)
  10. "El futuro de las tarjetas de presentación" (tecnologia)
  11. "Cómo medir el ROI de tus tarjetas digitales" (negocios)
  12. "Plantillas de tarjetas: Cómo elegir la correcta" (diseno)
- Each post has markdown-like content with `## Heading` lines and `\n\n` paragraph separators, plus inline `**bold**` and `` `code` `` markdown for richer rendering.
- Added helper exports: `getRelatedPosts(postId, count)`, `getPostBySlug(slug)`, `getPostById(id)`.
- Category gradients:
  - marketing → esmeralda (emerald-500→700)
  - tecnologia → cyan→teal→emerald
  - diseno → rose→pink
  - negocios → amber→orange (gold)
  - tutoriales → violet→purple→fuchsia
  - UI chrome uses only esmeralda + gold (emerald/amber) for headers, footers, hero, search bar, newsletter CTA.

### 4. BlogPage (`src/components/sections/blog-page.tsx`) — NEW (~750 lines, 'use client')
- `BlogHeader`: sticky header with back button, FTPLogo, ThemeToggle, CTA buttons (responsive mobile/desktop).
- `BlogHero`: gradient hero (esmeralda 700→600→800) with decorative blobs, dotted overlay, badge "Recursos FTP Digital Plus", large gradient title "Blog y Recursos", subtitle, large search bar (with Search icon), and stats row (Artículos, Categorías, Actualización).
- `FeaturedPosts`: 3 featured posts (filter `featured && published`) in a 3-col responsive grid. Each card has:
  - Gradient banner (category color) with Sparkles icon + dotted overlay.
  - Category badge top-left.
  - Title (line-clamp-2), excerpt (line-clamp-3).
  - Tags (top 3) with Tag icon.
  - Author avatar (gradient fallback with initials), name, date.
  - Read time with Clock icon.
  - Hover animation (translate-y + shadow + border color).
  - Click/Enter handler → `setSelectedBlogPost(post.id)` + `navigate('blog-post')`.
- `PostsSection`: Filter bar with category Tabs (Todos/Marketing/Tecnología/Diseño/Negocios/Tutoriales) + sort Tabs (Recientes/Populares/A-Z), result count with TrendingUp icon. Grid (1/2/3 cols) of all posts with AnimatePresence + layout animations on filter change. Empty state with "Limpiar filtros" CTA when no results.
- `NewsletterCTA`: gradient esmeralda card with email input + "Suscribirme" button. Validates email regex, shows sonner toast on success/error.
- `BlogFooter`: sticky footer with FTPLogo, brand text, quick nav links (Inicio/Planes/Plantillas/Ayuda/Soporte), copyright + "Actualizado semanalmente" indicator. Uses `mt-auto` for sticky-bottom behavior.
- Search functionality filters by title, excerpt, and tags (case-insensitive).
- Sort options: recent (by date desc), popular (featured first then by readTime), A-Z (locale es-MX).

### 5. BlogPostPage (`src/components/sections/blog-post-page.tsx`) — NEW (~700 lines, 'use client')
- `PostHeader`: sticky header with "Volver al blog" button, FTPLogo, ThemeToggle, CTA button.
- `PostHero`: breadcrumb (Blog > Category), category gradient badge, large title (3xl→5xl), excerpt, author info (avatar+name+role), date + read time meta. Share row with ShareBar (sm size).
- `FeaturedImageBanner`: large gradient banner (h-48→h-64) with category gradient, dotted overlay, category icon, category label.
- `TableOfContents` (sticky desktop sidebar, hidden on mobile):
  - Parses `## Heading` lines from content into TOC items.
  - Uses IntersectionObserver with rootMargin `-100px 0px -65% 0px` to track active heading.
  - Active heading highlighted with emerald border-left + bg.
  - Click → smooth scroll + URL hash update.
  - Sticky `top-24` with `max-h-[calc(100vh-7rem)]` + overflow-y-auto.
- `ArticleContent`: parses content into blocks (headings + paragraphs). Headings render as `<h2 id="...">` with scroll-mt-24. Paragraphs render with inline markdown support: `**bold**` and `` `code` `` (regex-based renderer).
- `TagsSection`: displays all tags as badges (emerald outline) with Tag icon.
- `ShareSection`: post-content share card with WhatsApp/Facebook/Twitter/LinkedIn + Copy link + Bookmark buttons. WhatsApp/Facebook/Twitter/LinkedIn open share intents in new tab via `window.open`. Copy link uses navigator.clipboard with fallback. Bookmark shows toast.
- `ShareBar` component: reusable share buttons (sm/md size variants). Each social button has branded hover color (WhatsApp green, Facebook blue, Twitter black, LinkedIn blue). Copy link shows Check icon for 2s after copy.
- `AuthorBio`: card with large avatar, name, role, bio description, "Ver más artículos" button (shows toast).
- `RelatedPosts`: 3 related posts (same category, excluding current) in responsive grid. Each card has gradient banner, category badge, title, author, read time. Click → set selectedBlogPost + navigate.
- `NewsletterCTA`: "Suscríbete para más contenido" CTA with email input + button.
- `PostFooter`: sticky footer with FTPLogo icon, copyright, nav links.
- `PostNotFound`: fallback when no post selected/found.
- Auto scroll-to-top on post change via useEffect with `'instant'` behavior (cast to ScrollBehavior).
- Falls back to first published post if no `selectedBlogPost` set (defensive).

### 6. App router (`src/app/page.tsx`)
- Added imports for `BlogPage` and `BlogPostPage`.
- Added cases `'blog' → <BlogPage />` and `'blog-post' → <BlogPostPage />` to the `CurrentView` switch.

### 7. Landing page (`src/components/sections/landing-page.tsx`)
- Desktop nav: added "Blog" button (with FileText icon in amber) after NAV_LINKS, calls `navigate('blog')` + scroll top.
- Mobile menu: added "Blog y Recursos" button (with FileText icon) after NAV_LINKS, calls `setOpen(false)` + `navigate('blog')` + scroll top.
- Footer "Producto" section: added "Blog y Recursos" link between "Plantillas" and "Iniciar Sesión", calls `navigate('blog')` + scroll top.

### 8. Quality checks
- `bun run lint` (ESLint): 0 errors in all 7 modified/new files. The only project-wide error is pre-existing in `global-search.tsx` (untouched, not my code).
- `npx tsc --noEmit`: 0 errors in `src/`. Remaining errors are only in unrelated `examples/websocket/*` and `skills/*` (pre-existing, not part of task).
- Verified dev.log shows last compile was successful (200 OK). Dev server appears intermittently unreachable in sandbox — known environment issue per worklog.

## Design decisions
- **UI chrome**: 100% esmeralda (#059669) + gold (#f59e0b) — header, hero, newsletter CTAs, footer all use emerald gradients with amber accents.
- **Category-specific colors**: only on blog card gradient banners + avatar fallbacks (marketing=emerald, tecnologia=cyan, diseno=rose, negocios=amber, tutoriales=violet) as requested.
- **Sticky footers**: both pages use `flex min-h-screen flex-col` + `mt-auto` on footer.
- **Accessibility**: 
  - All cards are `role="button" tabIndex={0}` with keyboard handlers (Enter + Space).
  - ARIA labels on all interactive elements (search input, share buttons, back button).
  - Semantic HTML: `<main>`, `<header>`, `<footer>`, `<nav>`, `<article>`, `<aside>`.
  - Breadcrumb navigation with `aria-label="Migas de pan"`.
  - TOC nav with `aria-label="Tabla de contenidos"`.
- **Responsive**: mobile-first with sm:/lg: breakpoints. Grid scales 1→2→3 cols. TOC hidden on mobile (lg:block only).
- **Animations**: framer-motion for card hover/stagger, AnimatePresence + layout on filtered posts grid, fadeUp on hero.
- **Toasts**: sonner for newsletter signup success/error and share actions (copy link, bookmark).

## Stage Summary
- 7 files created/modified: types.ts, store.ts, blog-data.ts (new), blog-page.tsx (new), blog-post-page.tsx (new), page.tsx, landing-page.tsx.
- 12 Spanish blog posts with substantial real content (marketing/tutoriales/diseno/negocios/tecnologia categories).
- BlogPage: hero with search, 3 featured posts, filter+sort bar, responsive grid, newsletter CTA, sticky footer.
- BlogPostPage: hero with author meta, gradient featured image, sticky TOC sidebar (desktop), full article with inline markdown rendering, tags, share section (5 platforms + copy + bookmark), author bio, 3 related posts, newsletter CTA, sticky footer.
- Store integration: `selectedBlogPost` (session-only) + `setSelectedBlogPost` action.
- Navigation: landing page header (desktop+mobile) and footer both link to blog.
- 100% Spanish, emerald+gold chrome, category-specific colors only on blog cards.
- Lint: 0 errors in modified files. TypeScript: 0 errors in src/.
