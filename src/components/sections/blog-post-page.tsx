'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Tag,
  Share2,
  Bookmark,
  Link2,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  ListOrdered,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  BLOG_POSTS,
  CATEGORY_GRADIENTS,
  CATEGORY_LABELS,
  getRelatedPosts,
  type BlogPost,
} from '@/lib/blog-data';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

interface TocItem {
  id: string;
  text: string;
  index: number;
}

interface ContentBlock {
  type: 'heading' | 'paragraph';
  text: string;
  id?: string;
  index: number;
}

function parseContent(content: string): { blocks: ContentBlock[]; toc: TocItem[] } {
  const rawBlocks = content.split(/\n\n+/).map(b => b.trim()).filter(Boolean);
  const blocks: ContentBlock[] = [];
  const toc: TocItem[] = [];
  let headingCounter = 0;

  rawBlocks.forEach((block, idx) => {
    if (block.startsWith('## ')) {
      const text = block.replace(/^##\s+/, '').trim();
      const id = `heading-${headingCounter}`;
      blocks.push({ type: 'heading', text, id, index: idx });
      toc.push({ id, text, index: headingCounter });
      headingCounter++;
    } else {
      // Inline markdown: **bold** and `code`
      blocks.push({ type: 'paragraph', text: block, index: idx });
    }
  });

  return { blocks, toc };
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Render **bold** and `code` inline.
  // Split on combined regex; we need to keep track of which token matched.
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={`b-${keyCounter}`} className="font-semibold text-slate-900 dark:text-slate-100">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={`c-${keyCounter}`}
          className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
    keyCounter++;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function PostHeader() {
  const navigate = useAppStore(s => s.navigate);
  const currentUser = useAppStore(s => s.currentUser);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100/60 bg-white/85 backdrop-blur-xl dark:border-emerald-900/40 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate('blog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="gap-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver al blog</span>
            <span className="sm:hidden">Volver</span>
          </Button>
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <button
            onClick={() => navigate('landing')}
            className="hidden transition-opacity hover:opacity-90 sm:block"
            aria-label="Ir al inicio"
          >
            <FTPLogo variant="full" className="h-8 w-auto" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400" />
          <Button
            size="sm"
            onClick={() => navigate(currentUser ? 'dashboard' : 'login')}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600"
          >
            {currentUser ? 'Mi Panel' : 'Crear Tarjeta'}
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Share buttons                                                      */
/* ------------------------------------------------------------------ */

function ShareBar({ post, size = 'md' }: { post: BlogPost; size?: 'sm' | 'md' }) {
  const [copied, setCopied] = useState(false);
  const buttonSize = size === 'sm' ? 'size-9' : 'size-11';
  const iconSize = size === 'sm' ? 'size-4' : 'size-5';

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?XTransformPort=3000#blog/${post.slug}`
      : `https://ftpdigitalplus.com/blog/${post.slug}`;

  const shareText = `${post.title} — por ${post.author.name} en FTP Digital Plus`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const handleBookmark = () => {
    toast.success('Artículo guardado en favoritos', {
      description: post.title,
    });
  };

  const shareButtons = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-[#25D366] hover:border-[#25D366] hover:text-white',
      onClick: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
          '_blank',
          'noopener,noreferrer',
        ),
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white',
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'noopener,noreferrer',
        ),
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-black hover:border-black hover:text-white',
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'noopener,noreferrer',
        ),
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white',
      onClick: () =>
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'noopener,noreferrer',
        ),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {shareButtons.map(({ name, icon: Icon, color, onClick }) => (
        <button
          key={name}
          onClick={onClick}
          aria-label={`Compartir en ${name}`}
          className={cn(
            'flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
            buttonSize,
            color,
          )}
        >
          <Icon className={iconSize} />
        </button>
      ))}
      <button
        onClick={handleCopyLink}
        aria-label="Copiar enlace"
        className={cn(
          'flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400',
          buttonSize,
        )}
      >
        {copied ? <Check className={iconSize} /> : <Link2 className={iconSize} />}
      </button>
      <button
        onClick={handleBookmark}
        aria-label="Guardar artículo"
        className={cn(
          'flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-400',
          buttonSize,
        )}
      >
        <Bookmark className={iconSize} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero / Featured image                                              */
/* ------------------------------------------------------------------ */

interface PostHeroProps {
  post: BlogPost;
  toc: TocItem[];
}

function PostHero({ post, toc }: PostHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/50 dark:from-slate-950 dark:to-emerald-950/30">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-5"
        >
          {/* Breadcrumb */}
          <nav
            aria-label="Migas de pan"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            <span>Blog</span>
            <ChevronRight className="size-3" />
            <span className="text-emerald-700 dark:text-emerald-400">
              {CATEGORY_LABELS[post.category]}
            </span>
          </nav>

          {/* Category badge */}
          <div>
            <Badge
              className={cn(
                'border-transparent bg-gradient-to-r text-white shadow-sm',
                post.image,
              )}
            >
              <Tag className="mr-1 size-3" />
              {CATEGORY_LABELS[post.category]}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-100">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-pretty text-base text-slate-600 sm:text-lg dark:text-slate-300">
            {post.excerpt}
          </p>

          {/* Author + meta */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarFallback
                  className={cn(
                    'bg-gradient-to-br text-sm font-bold text-white',
                    post.image,
                  )}
                >
                  {post.author.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {post.author.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {post.author.role}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-emerald-500" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-emerald-500" />
                {post.readTime} min de lectura
              </span>
            </div>
          </div>

          {/* Share row */}
          <div className="flex items-center gap-3 pt-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              <Share2 className="size-3.5" />
              Compartir
            </span>
            <ShareBar post={post} size="sm" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured image banner                                              */
/* ------------------------------------------------------------------ */

function FeaturedImageBanner({ post }: { post: BlogPost }) {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div
        className={cn(
          'relative flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br sm:h-64',
          post.image,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative flex flex-col items-center gap-3 text-center text-white">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Tag className="size-8" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
            {CATEGORY_LABELS[post.category]}
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Table of contents (sticky sidebar)                                */
/* ------------------------------------------------------------------ */

function TableOfContents({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (toc.length === 0) return;
    const headings = toc
      .map(t => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-100px 0px -65% 0px',
        threshold: [0, 1],
      },
    );
    headings.forEach(h => observerRef.current?.observe(h));

    return () => observerRef.current?.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update hash without jumping
      if (typeof history !== 'undefined') {
        history.replaceState(null, '', `#${id}`);
      }
    }
  };

  return (
    <nav
      aria-label="Tabla de contenidos"
      className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-center gap-2">
        <ListOrdered className="size-4 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Contenido
        </h2>
      </div>
      <ul className="flex flex-col gap-1.5 text-sm">
        {toc.map(item => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={e => handleClick(e, item.id)}
                className={cn(
                  'block rounded-md border-l-2 py-1 pl-3 transition-colors',
                  isActive
                    ? 'border-emerald-500 bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-700 dark:hover:bg-slate-800 dark:hover:text-emerald-400',
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Article content                                                    */
/* ------------------------------------------------------------------ */

function ArticleContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed dark:prose-headings:text-slate-100 dark:prose-p:text-slate-300">
      {blocks.map(block => {
        if (block.type === 'heading' && block.id) {
          return (
            <h2
              key={`h-${block.index}`}
              id={block.id}
              className="mt-10 scroll-mt-24 text-2xl font-bold text-slate-900 first:mt-0 sm:text-3xl dark:text-slate-100"
            >
              {block.text}
            </h2>
          );
        }
        return (
          <p
            key={`p-${block.index}`}
            className="mt-4 text-base leading-relaxed text-slate-700 first:mt-0 dark:text-slate-300"
          >
            {renderInlineMarkdown(block.text)}
          </p>
        );
      })}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Tags section                                                       */
/* ------------------------------------------------------------------ */

function TagsSection({ post }: { post: BlogPost }) {
  if (post.tags.length === 0) return null;
  return (
    <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <Tag className="size-4 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Etiquetas
        </h3>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {post.tags.map(tag => (
          <Badge
            key={tag}
            variant="outline"
            className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <Tag className="size-3" />
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Share section (after content)                                     */
/* ------------------------------------------------------------------ */

function ShareSection({ post }: { post: BlogPost }) {
  return (
    <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-md">
            <Share2 className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              ¿Te gustó este artículo?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Compártelo con tus contactos en tus redes favoritas.
            </p>
          </div>
        </div>
        <ShareBar post={post} size="md" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Author bio card                                                    */
/* ------------------------------------------------------------------ */

function AuthorBio({ post }: { post: BlogPost }) {
  return (
    <Card className="mt-8 overflow-hidden border-slate-200 dark:border-slate-800">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
        <Avatar className="size-16 shrink-0">
          <AvatarFallback
            className={cn(
              'bg-gradient-to-br text-lg font-bold text-white',
              post.image,
            )}
          >
            {post.author.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {post.author.name}
            </h3>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {post.author.role}
            </p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Experto del equipo FTP Digital Plus con experiencia práctica en
            tarjetas digitales, marketing y diseño. Comparte contenido útil y
            accionable para ayudarte a aprovechar al máximo tu presencia
            digital.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              onClick={() => toast.info('Más artículos de este autor próximamente')}
            >
              Ver más artículos
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Related posts                                                      */
/* ------------------------------------------------------------------ */

function RelatedPosts({ post }: { post: BlogPost }) {
  const navigate = useAppStore(s => s.navigate);
  const setSelectedBlogPost = useAppStore(s => s.setSelectedBlogPost);
  const related = useMemo(() => getRelatedPosts(post.id, 3), [post.id]);

  if (related.length === 0) return null;

  const openRelated = (id: string) => {
    setSelectedBlogPost(id);
    navigate('blog-post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <ChevronRight className="size-5 rotate-90 text-amber-500" />
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
          Artículos Relacionados
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {related.map((relatedPost, idx) => (
          <motion.div
            key={relatedPost.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
          >
            <Card
              role="button"
              tabIndex={0}
              onClick={() => openRelated(relatedPost.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openRelated(relatedPost.id);
                }
              }}
              className="group h-full cursor-pointer gap-0 overflow-hidden border-slate-200 py-0 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 dark:border-slate-800 dark:hover:border-emerald-700"
            >
              <div
                className={cn(
                  'relative flex h-24 items-center justify-center bg-gradient-to-br',
                  relatedPost.image,
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-black/10" />
                <div className="absolute left-3 top-3">
                  <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-md">
                    {CATEGORY_LABELS[relatedPost.category]}
                  </Badge>
                </div>
                <Tag className="relative size-6 text-white opacity-80" />
              </div>
              <CardContent className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                  {relatedPost.title}
                </h3>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate font-medium">
                    {relatedPost.author.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {relatedPost.readTime}m
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Newsletter CTA                                                     */
/* ------------------------------------------------------------------ */

function NewsletterCTA() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }
    toast.success('¡Gracias por suscribirte! Recibirás más contenido pronto.', {
      description: email,
    });
    setEmail('');
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 p-8 text-white shadow-2xl shadow-emerald-900/20 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-emerald-400/30 blur-3xl" />

        <div className="relative flex flex-col items-start gap-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-400 text-amber-950 shadow-lg">
              <Mail className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Suscríbete para más contenido
              </h2>
              <p className="mt-1 text-sm text-emerald-50/90">
                Recibe nuevos artículos cada semana. Sin spam, solo contenido
                útil.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-2 sm:flex-row sm:max-w-lg"
          >
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              aria-label="Correo electrónico para suscripción"
              className="h-12 border-transparent bg-white/95 text-base text-slate-800 placeholder:text-slate-400 focus-visible:ring-amber-400"
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/25 hover:bg-amber-300"
            >
              Suscribirme
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function PostFooter() {
  const navigate = useAppStore(s => s.navigate);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <FTPLogo variant="icon" className="h-7 w-7" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              © {year} FTP Digital Plus · Blog y Recursos
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <button
              onClick={() => navigate('blog')}
              className="text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              Blog
            </button>
            <button
              onClick={() => navigate('landing')}
              className="text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              Inicio
            </button>
            <button
              onClick={() => navigate('pricing')}
              className="text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              Planes
            </button>
            <button
              onClick={() => navigate('support')}
              className="text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              Soporte
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Main article layout                                                */
/* ------------------------------------------------------------------ */

function PostBody({ post }: { post: BlogPost }) {
  const { blocks, toc } = useMemo(() => parseContent(post.content), [post.content]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:gap-12">
        {/* Main article */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="min-w-0 max-w-3xl"
        >
          <ArticleContent blocks={blocks} />
          <TagsSection post={post} />
          <ShareSection post={post} />
          <AuthorBio post={post} />
        </motion.div>

        {/* Sticky sidebar (TOC) — desktop only */}
        <aside className="hidden lg:block">
          <TableOfContents toc={toc} />
        </aside>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Not found fallback                                                 */
/* ------------------------------------------------------------------ */

function PostNotFound() {
  const navigate = useAppStore(s => s.navigate);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Tag className="size-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Artículo no encontrado
      </h1>
      <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
        El artículo que buscas no existe o fue removido. Explora todos nuestros
        artículos en el blog.
      </p>
      <Button
        onClick={() => navigate('blog')}
        className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
      >
        <ArrowLeft className="mr-1 size-4" />
        Volver al blog
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function BlogPostPage() {
  const selectedBlogPost = useAppStore(s => s.selectedBlogPost);

  // If no post is selected, fall back to the first published post (defensive)
  const post = useMemo(() => {
    if (selectedBlogPost) {
      return BLOG_POSTS.find(p => p.id === selectedBlogPost && p.published) || null;
    }
    return BLOG_POSTS.find(p => p.published) || null;
  }, [selectedBlogPost]);

  // Scroll to top on mount / post change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [post?.id]);

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
        <PostHeader />
        <PostNotFound />
        <PostFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <PostHeader />
      <main className="flex-1">
        <PostHero post={post} toc={parseContent(post.content).toc} />
        <FeaturedImageBanner post={post} />
        <PostBody post={post} />
        <RelatedPosts post={post} />
        <NewsletterCTA />
      </main>
      <PostFooter />
    </div>
  );
}
