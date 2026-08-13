'use client';

import {
  useRef,
  useState,
  useSyncExternalStore,
  type ButtonHTMLAttributes,
} from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  /** Intensidad del efecto magnético (0 = desactivado, 1 = sigue 1:1). Por defecto: 0.3. */
  strength?: number;
}

/* --- Detección de dispositivo táctil vía useSyncExternalStore --- */
function subscribePointerCoarse(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(pointer: coarse)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getEnabledSnapshot() {
  return (
    typeof window !== 'undefined' &&
    !window.matchMedia('(pointer: coarse)').matches
  );
}

function getServerSnapshot() {
  // En el servidor asumimos que el efecto está desactivado para evitar
  // advertencias de hidratación; el cliente corregirá al montar.
  return false;
}

/**
 * MagneticButton — Botón que sigue sutilmente al cursor (efecto magnético)
 * usando framer-motion con una transición tipo spring.
 *
 * - Se desactiva automáticamente en dispositivos táctiles (`pointer: coarse`).
 * - El efecto es sutil por defecto (strength = 0.3) para no distraer.
 * - Acepta todas las props nativas de <button>.
 *
 * @example
 *   <MagneticButton strength={0.4} className="..." onClick={...}>Clic</MagneticButton>
 */
export function MagneticButton({
  children,
  strength = 0.3,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const enabled = useSyncExternalStore(
    subscribePointerCoarse,
    getEnabledSnapshot,
    getServerSnapshot,
  );

  // Sin efecto secundario que dispare renders: la única fuente de setState
  // aquí son los manejadores de eventos (onMouseMove / onMouseLeave), que
  // ocurren fuera del cuerpo del efecto. La detección de dispositivo táctil
  // se maneja vía useSyncExternalStore (sin setState en effect).

  return (
    <motion.div
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.1 }}
      style={{ display: 'inline-block' }}
    >
      <button
        ref={ref}
        className={className}
        onMouseMove={e => {
          if (!enabled || !ref.current) return;
          const rect = ref.current.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          setPos({ x: x * strength, y: y * strength });
        }}
        onMouseLeave={() => setPos({ x: 0, y: 0 })}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  );
}
