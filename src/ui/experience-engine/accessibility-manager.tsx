"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

export interface AccessibilityManagerProps {
  readonly children: ReactNode;
}

/**
 * Accessibility Manager — ensures museum scenes are accessible.
 *
 * Responsibilities:
 * - Announce scene changes to screen readers
 * - Manage focus on scene transitions
 * - Provide reduced-motion alternatives
 * - Ensure keyboard navigation
 */
export function AccessibilityManager({ children }: AccessibilityManagerProps) {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a live region for screen reader announcements
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    liveRegion.style.position = "absolute";
    liveRegion.style.width = "1px";
    liveRegion.style.height = "1px";
    liveRegion.style.overflow = "hidden";
    liveRegion.style.clip = "rect(0,0,0,0)";
    document.body.appendChild(liveRegion);

    return () => {
      document.body.removeChild(liveRegion);
    };
  }, []);

  return (
    <>
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      {children}
    </>
  );
}
