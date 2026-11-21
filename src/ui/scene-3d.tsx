// Noujoude — Bounded 3D visual element (Phase 5, scope extension).
//
// ADR: CSS 3D transforms are sufficient for a contained visual element.
// No Three.js, React Three Fiber, WebGL, or Spline — evaluated and rejected
// for V1 (zero-cost, bundle size, mobile performance, accessibility).
//
// This component renders a CSS 3D perspective scene with a museum artifact
// display. It respects prefers-reduced-motion (falls back to static).

import type { ReactNode } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./scene-3d.module.css";

export interface Scene3DProps {
  readonly children?: ReactNode;
  readonly className?: string;
}

export function Scene3D({ children, className }: Scene3DProps) {
  return (
    <div className={`${styles.scene} ${className ?? ""}`}>
      <div className={styles.perspective}>
        <div className={styles.card3d}>
          {children ?? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderText}>Museum Scene</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}