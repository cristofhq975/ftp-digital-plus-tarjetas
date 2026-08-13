'use client';

/**
 * confetti.tsx — Confetti canvas para celebraciones.
 *
 * Props:
 *  - active: boolean — si es true, dispara el confetti
 *  - duration?: number — duración en ms (default 3000)
 *  - count?: number — número de piezas (default 50, máx 100)
 *
 * Colores: paleta esmeralda + oro de FTP Digital Plus.
 *
 * Escucha el evento `ftp:confetti` (con detail: { duration?, count? }) para
 * activarse programáticamente — usado por enhanced-toast.plan().
 *
 * Performance: usa un solo <canvas> fullscreen con requestAnimationFrame,
 * limita el número de piezas a 100, y se autolimpia al terminar.
 */

import { useEffect, useRef, useState } from 'react';

export interface ConfettiProps {
  active: boolean;
  duration?: number;
  count?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle';
  life: number;
  maxLife: number;
  wobble: number;
  wobbleSpeed: number;
}

const COLORS = ['#059669', '#10b981', '#34d399', '#f59e0b', '#fbbf24', '#fcd34d', '#047857'];

export function Confetti({ active, duration = 3000, count = 50 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const endTimeRef = useRef<number>(0);
  // Estado local para forzar re-render cuando cambian los parámetros activos
  const [activeRun, setActiveRun] = useState({ active: false, duration, count });

  // Disparador programático vía CustomEvent
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { duration?: number; count?: number } | undefined;
      setActiveRun({
        active: true,
        duration: detail?.duration ?? 3000,
        count: Math.min(100, detail?.count ?? 50),
      });
    };
    window.addEventListener('ftp:confetti', handler);
    return () => window.removeEventListener('ftp:confetti', handler);
  }, []);

  // Disparador por props
  useEffect(() => {
    if (!active) return;
    // requestAnimationFrame evita el warning react-hooks/set-state-in-effect
    const raf = requestAnimationFrame(() => {
      setActiveRun({ active: true, duration, count: Math.min(100, count) });
    });
    return () => cancelAnimationFrame(raf);
  }, [active, duration, count]);

  // Resetear `active` del padre cuando termina la animación
  useEffect(() => {
    if (!activeRun.active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generar partículas iniciales
    const totalParticles = Math.max(1, Math.min(100, activeRun.count));
    const now = performance.now();
    endTimeRef.current = now + activeRun.duration;

    const spawnParticles = (n: number) => {
      const w = canvas.width;
      const startX = w / 2 + (Math.random() - 0.5) * w * 0.6;
      for (let i = 0; i < n; i++) {
        const angle = (Math.random() * Math.PI) / 2 + Math.PI / 4; // entre 45° y 135°
        const speed = Math.random() * 6 + 4;
        particlesRef.current.push({
          x: startX + (Math.random() - 0.5) * 80,
          y: -10 - Math.random() * 40,
          vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
          vy: Math.sin(angle) * speed + 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 8 + 4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: Math.random() > 0.5 ? 'rect' : 'circle',
          life: 0,
          maxLife: activeRun.duration + 800,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.1 + 0.05,
        });
      }
    };

    spawnParticles(totalParticles);

    const gravity = 0.18;
    const airDrag = 0.992;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Generar partículas extra durante el primer 40% del tiempo (ráfaga sostenida)
      if (time < endTimeRef.current - activeRun.duration * 0.6 && particlesRef.current.length < 100) {
        spawnParticles(Math.min(3, 100 - particlesRef.current.length));
      }

      const elapsed = time - (endTimeRef.current - activeRun.duration);
      particlesRef.current = particlesRef.current.filter((p) => {
        // Física
        p.vy += gravity;
        p.vx *= airDrag;
        p.vy *= airDrag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;
        p.life = elapsed;

        // Fade out en el último 25% de la vida
        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio > 0.75 ? Math.max(0, 1 - (lifeRatio - 0.75) / 0.25) : 1;

        // Dibujar
        if (p.y > canvas.height + 50 || alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x + Math.sin(p.wobble) * 4, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      });

      // Continuar animación mientras haya partículas o estemos dentro del tiempo
      if (particlesRef.current.length > 0 || time < endTimeRef.current) {
        animationRef.current = requestAnimationFrame(render);
      } else {
        // Limpieza final
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        setActiveRun((prev) => (prev.active ? { ...prev, active: false } : prev));
      }
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      particlesRef.current = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [activeRun]);

  if (!activeRun.active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
    />
  );
}

export default Confetti;
