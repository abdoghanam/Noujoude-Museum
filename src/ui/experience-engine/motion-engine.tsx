"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

export interface MotionEngineProps {
  readonly children: ReactNode;
  readonly sceneId: string;
  readonly className?: string;
}

/**
 * Motion Engine — unified motion language for the museum.
 *
 * Wraps children in a motion context that applies the correct
 * animation class based on the scene ID. Supports reduced motion.
 */
export function MotionEngine({ children, sceneId, className }: MotionEngineProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    // Apply scene-specific motion class
    el.classList.add(sceneId);

    return () => {
      el.classList.remove(sceneId);
    };
  }, [sceneId]);

  return (
    <div ref={ref} className={`motion-engine ${className ?? ""}`}>
      {children}
    </div>
  );
}