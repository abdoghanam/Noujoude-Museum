"use client";

import type { ComponentType, ReactNode } from "react";
import { Suspense, lazy } from "react";

export interface PerformanceManagerProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

/**
 * Performance Manager — handles lazy loading, code splitting, and
 * Suspense boundaries for heavy museum components.
 */
export function PerformanceManager({
  children,
  fallback = <div className="loading-state">Loading...</div>,
}: PerformanceManagerProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

/**
 * Lazy load a component with a named export.
 * Uses React.lazy for code splitting.
 */
export function lazyLoad(
  importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>,
): ComponentType<Record<string, unknown>> {
  return lazy(importFn);
}

/**
 * Preload a component for anticipated navigation.
 * Call this on hover/focus to warm the cache.
 */
export function preloadComponent(importFn: () => Promise<unknown>): void {
  importFn().catch(() => {
    // Silently fail — preload is best-effort
  });
}
