'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  ArrowLeft,
  ArrowRight,
  Tag,
  Sparkles,
  TrendingUp,
  Mail,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  BLOG_POSTS,
  CATEGORY_GRADIENTS,
  CATEGORY_LABELS,
  type BlogCategory,
  type BlogPost,
} from '@/lib/blog-data';
import { FTPLogo } from '@/components/ftp-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

type CategoryKey = 'all' | BlogCategory;

const CATEGORY_TABS: { value: CategoryKey; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'diseno', label: 'Diseño' },
  { value: 'negocios', label: 'Negocios' },
  { value: 'tutoriales', label: 'Tutoriales' },
];

type SortKey = 'recent' | 'popular' | 'az';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: 'Recientes' },
  { value: 'popular', label: 'Populares' },
  { value: 'az', label: 'A-Z' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function openPost(post: BlogPost, setSelectedBlogPost: (id: string | null) => void, navigate: (v: 'blog-post') => void) {
  setSelectedBlogPost(post.id);
  navigate('blog-post');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function BlogHeader() {
  const navigate = useAppStore(s => s.navigate);
  const currentUser = useAppStore(s => s.currentUser);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100/60 bg-white/85 backdrop-blur-xl dark:border-emerald-900/40 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigate(currentUser ? 'dashboard' : 'landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
            aria-label="Volver"
          >
            <ArrowLeft className="size-5" />
            <span className="hidden text-sm font-medium sm:inline">Volver</span>
          </button>
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <button
            onClick={() => {
              navigate('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center transition-opacity hover:opacity-90"
            aria-label="Ir al inicio"
          >
            <FTPLogo variant="full" className="h-8 w-auto" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(currentUser ? 'dashboard' : 'login')}
            className="hidden border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 sm:inline-flex dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          >
            {currentUser ? 'Mi Panel' : 'Iniciar Sesión'}
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(currentUser ? 'dashboard' : 'login')}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600"
          >
            {currentUser ? 'Panel' : 'Crear Tarjeta'}
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

interface HeroProps {
  search: string;
  setSearch: (s: string) => void;
}

function BlogHero({ search, setSearch }: HeroProps) {
  const stats = useMemo(
    () => [
      { label: 'Artículos', value: `${BLOG_POSTS.length}` },
      { label: 'Categorías', value: '5' },
      { label: 'Actualización', value: 'Semanal' },
    ],
    [],
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 size-[28rem] rounded-full bg-emerald-400/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-5"
        >
          <Badge className="border-amber-300/40 bg-amber-400/15 text-amber-100 backdrop-blur-sm">
            <BookOpen className="mr-1 size-3.5" />
            Recursos FTP Digital Plus
          </Badge>

          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Blog y{' '}
            <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
              Recursos
            </span>
          </h1>

          <p className="max-w-2xl text-pretty text-base text-emerald-50/90 sm:text-lg">
            Consejos, guías y tendencias sobre tarjetas digitales y marketing.
            Aprende a crear, optimizar y aprovechar al máximo tu tarjeta de
            presentación digital.
          </p>

          {/* Search bar */}
          <div className="relative mt-2 w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar artículos, temas, etiquetas..."
              aria-label="Buscar artículos del blog"
              className="h-12 border-transparent bg-white/95 pl-12 pr-4 text-base text-slate-800 shadow-lg shadow-emerald-900/20 placeholder:text-slate-400 focus-visible:ring-amber-400 dark:bg-slate-900/95 dark:text-slate-100"
            />
          </div>

          {/* Stats row */}
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            {stats.map(stat => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-2xl font-bold text-amber-300 sm:text-3xl">
                  {stat.value}
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-emerald-100/80">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="relative">
        <svg
          viewBox="0 0 1440 80"
          className="block h-12 w-full sm:h-16"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,32 C360,80 1080,80 1440,32 L1440,80 L0,80 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured Posts Section                                             */
/* ------------------------------------------------------------------ */

function FeaturedPosts() {
  const navigate = useAppStore(s => s.navigate);
  const setSelectedBlogPost = useAppStore(s => s.setSelectedBlogPost);

  const featured = BLOG_POSTS.filter(p => p.featured && p.published).slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
              Artículos Destacados
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Lo más leído y relevante para tu negocio digital.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {featured.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card
              role="button"
              tabIndex={0}
              onClick={() => openPost(post, setSelectedBlogPost, navigate)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPost(post, setSelectedBlogPost, navigate);
                }
              }}
              className="group h-full cursor-pointer gap-0 overflow-hidden border-slate-200 py-0 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 dark:border-slate-800 dark:hover:border-emerald-700"
            >
              {/* Gradient header */}
              <div
                className={cn(
                  'relative flex h-44 items-center justify-center bg-gradient-to-br',
                  post.image,
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-black/10" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.15]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                  }}
                />
                <div className="relative flex flex-col items-center gap-2 text-center text-white">
                  <Sparkles className="size-8 opacity-90" />
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                    {CATEGORY_LABELS[post.category]}
                  </span>
                </div>
                {/* Category badge */}
                <div className="absolute left-4 top-4">
                  <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-md">
                    {CATEGORY_LABELS[post.category]}
                  </Badge>
                </div>
              </div>

              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                  {post.title}
                </h3>
                <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {post.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    >
                      <Tag className="size-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <Separator className="my-1" />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback
                        className={cn(
                          'bg-gradient-to-br text-[10px] font-bold text-white',
                          post.image,
                        )}
                      >
                        {post.author.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {post.author.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {formatDate(post.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="size-3" />
                    {post.readTime} min
                  </div>
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
/*  Post Card (regular grid)                                          */
/* ------------------------------------------------------------------ */

interface PostCardProps {
  post: BlogPost;
  index: number;
}

function PostCard({ post, index }: PostCardProps) {
  const navigate = useAppStore(s => s.navigate);
  const setSelectedBlogPost = useAppStore(s => s.setSelectedBlogPost);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={() => openPost(post, setSelectedBlogPost, navigate)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPost(post, setSelectedBlogPost, navigate);
          }
        }}
        className="group h-full cursor-pointer gap-0 overflow-hidden border-slate-200 py-0 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 dark:border-slate-800 dark:hover:border-emerald-700"
      >
        {/* Gradient header */}
        <div
          className={cn(
            'relative flex h-32 items-center justify-center bg-gradient-to-br',
            post.image,
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-black/10" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="absolute left-3 top-3">
            <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-md">
              {CATEGORY_LABELS[post.category]}
            </Badge>
          </div>
          <Sparkles className="relative size-7 text-white opacity-80" />
        </div>

        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
            {post.title}
          </h3>
          <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback
                  className={cn(
                    'bg-gradient-to-br text-[9px] font-bold text-white',
                    post.image,
                  )}
                >
                  {post.author.avatar}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                {post.author.name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="size-3" />
              {post.readTime}m
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter Bar + Posts Grid                                            */
/* ------------------------------------------------------------------ */

interface FilterBarProps {
  category: CategoryKey;
  setCategory: (c: CategoryKey) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  resultCount: number;
}

function FilterBar({ category, setCategory, sort, setSort, resultCount }: FilterBarProps) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category tabs */}
        <div className="overflow-x-auto">
          <Tabs
            value={category}
            onValueChange={v => setCategory(v as CategoryKey)}
          >
            <TabsList className="h-auto flex-wrap gap-1 bg-slate-100 p-1 dark:bg-slate-800">
              {CATEGORY_TABS.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-emerald-400"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-slate-500 sm:inline dark:text-slate-400">
            Ordenar por:
          </span>
          <Tabs value={sort} onValueChange={v => setSort(v as SortKey)}>
            <TabsList className="h-auto gap-1 bg-slate-100 p-1 dark:bg-slate-800">
              {SORT_OPTIONS.map(opt => (
                <TabsTrigger
                  key={opt.value}
                  value={opt.value}
                  className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-emerald-400"
                >
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <TrendingUp className="size-4 text-emerald-500" />
        <span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {resultCount}
          </span>{' '}
          {resultCount === 1 ? 'artículo encontrado' : 'artículos encontrados'}
        </span>
      </div>
    </div>
  );
}

function PostsSection({ search }: { search: string }) {
  const [category, setCategory] = useState<CategoryKey>('all');
  const [sort, setSort] = useState<SortKey>('recent');

  const filteredPosts = useMemo(() => {
    let list = BLOG_POSTS.filter(p => p.published);

    // Filter by category
    if (category !== 'all') {
      list = list.filter(p => p.category === category);
    }

    // Filter by search (title, excerpt, tags)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q)),
      );
    }

    // Sort
    list = [...list];
    if (sort === 'recent') {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sort === 'az') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'es-MX'));
    } else if (sort === 'popular') {
      // Heuristic: featured first, then by readTime (longer = "more substantial")
      list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.readTime - a.readTime;
      });
    }
    return list;
  }, [category, sort, search]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <FilterBar
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        resultCount={filteredPosts.length}
      />

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Search className="size-7 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              No encontramos artículos
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Intenta con otra palabra o cambia de categoría.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setCategory('all');
              setSort('recent');
            }}
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, idx) => (
              <PostCard key={post.id} post={post} index={idx} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
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
    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }
    toast.success('¡Gracias por suscribirte al blog! Te enviaremos novedades pronto.', {
      description: email,
    });
    setEmail('');
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 p-8 text-white shadow-2xl shadow-emerald-900/20 sm:p-12">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-emerald-400/30 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:max-w-xl">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-400 text-amber-950 shadow-lg">
                <Mail className="size-5" />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Suscríbete al blog
              </h2>
            </div>
            <p className="text-emerald-50/90">
              Recibe cada semana nuevos artículos, guías prácticas y tendencias
              sobre tarjetas digitales, marketing y tecnología. Sin spam, solo
              contenido útil.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:max-w-md"
          >
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              aria-label="Correo electrónico para suscripción"
              className="h-12 border-transparent bg-white/95 text-base text-slate-800 placeholder:text-slate-400 focus-visible:ring-amber-400 lg:w-72"
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

function BlogFooter() {
  const navigate = useAppStore(s => s.navigate);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <FTPLogo variant="full" className="h-9 w-auto" />
            <p className="max-w-xs text-center text-sm text-slate-600 sm:text-left dark:text-slate-400">
              Plataforma #1 en tarjetas de presentación digitales en México.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
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
              onClick={() => navigate('template-gallery')}
              className="text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              Plantillas
            </button>
            <button
              onClick={() => navigate('help')}
              className="text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              Ayuda
            </button>
            <button
              onClick={() => navigate('support')}
              className="text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              Soporte
            </button>
          </nav>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center justify-between gap-2 text-center text-xs text-slate-500 sm:flex-row sm:text-left dark:text-slate-400">
          <p>
            © {year} FTP Digital Plus · Blog y Recursos.
          </p>
          <div className="flex items-center gap-2">
            <Calendar className="size-3 text-emerald-500" />
            <span>Actualizado semanalmente</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function BlogPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <BlogHeader />
      <main className="flex-1">
        <BlogHero search={search} setSearch={setSearch} />
        <FeaturedPosts />
        <PostsSection search={search} />
        <NewsletterCTA />
      </main>
      <BlogFooter />
    </div>
  );
}
