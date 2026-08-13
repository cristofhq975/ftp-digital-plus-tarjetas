import { cn } from '@/lib/utils';

interface PageSkeletonProps {
  /** Variante de skeleton según la página a imitar. */
  variant?: 'dashboard' | 'editor' | 'landing';
  /** Clase opcional para el contenedor. */
  className?: string;
}

/**
 * PageSkeleton — Placeholder de carga que imita el layout de cada página
 * principal (landing, dashboard, editor). Usa la clase `.skeleton` con
 * animación shimmer definida en globals.css.
 */
export function PageSkeleton({ variant = 'landing', className }: PageSkeletonProps) {
  if (variant === 'dashboard') return <DashboardSkeleton className={className} />;
  if (variant === 'editor') return <EditorSkeleton className={className} />;
  return <LandingSkeleton className={className} />;
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-md', className)} />;
}

/* ----------------------------- Landing ----------------------------- */
function LandingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-white', className)}>
      <div className="h-16 border-b border-slate-100">
        <SkeletonBox className="m-4 h-8 w-40" />
      </div>
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <SkeletonBox className="h-7 w-48 bg-white/20" />
          <SkeletonBox className="mt-4 h-14 w-3/4 max-w-2xl bg-white/20" />
          <SkeletonBox className="mt-4 h-24 w-2/3 max-w-xl bg-white/10" />
          <div className="mt-6 flex gap-3">
            <SkeletonBox className="h-12 w-48 bg-white/20" />
            <SkeletonBox className="h-12 w-32 bg-white/10" />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 py-20">
        <SkeletonBox className="mx-auto h-10 w-64" />
        <SkeletonBox className="mx-auto mt-4 h-6 w-96 max-w-full" />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBox key={i} className="h-44" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Dashboard ----------------------------- */
function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-h-screen bg-muted/30', className)}>
      <aside className="hidden w-64 border-r border-slate-200 p-4 lg:block">
        <SkeletonBox className="h-9 w-32" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBox key={i} className="h-9 w-full" />
          ))}
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6">
        <SkeletonBox className="h-32 w-full" />
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} className="h-32" />
          ))}
        </div>
        <SkeletonBox className="mt-6 h-80 w-full" />
        <SkeletonBox className="mt-6 h-64 w-full" />
      </main>
    </div>
  );
}

/* ----------------------------- Editor ----------------------------- */
function EditorSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-h-screen bg-muted/30', className)}>
      <aside className="hidden w-64 border-r border-slate-200 p-4 lg:block">
        <SkeletonBox className="h-9 w-32" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonBox key={i} className="h-9 w-full" />
          ))}
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6">
        <SkeletonBox className="h-8 w-48" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBox key={i} className="h-12 w-full" />
          ))}
        </div>
      </main>
      <aside className="hidden w-80 border-l border-slate-200 p-4 xl:block">
        <SkeletonBox className="h-96 w-full" />
      </aside>
    </div>
  );
}
