"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export interface AccessibilityManagerProps {
  readonly children: ReactNode;
}

export interface AccessibilityContextValue {
  readonly announce: (message: string) => void;
  readonly focusTarget: (selector: string) => void;
  readonly isReducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility must be used within AccessibilityManager");
  }
  return ctx;
}

export function AccessibilityManager({ children }: AccessibilityManagerProps) {
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    // Create live region if not exists
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement("div");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.setAttribute("role", "status");
      liveRegion.className = "sr-only";
      liveRegion.style.position = "absolute";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.overflow = "hidden";
      liveRegion.style.clip = "rect(0, 0, 0, 0)";
      liveRegion.style.whiteSpace = "nowrap";
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      mediaQuery.removeEventListener("change", handler);
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, []);

  const announce = (message: string) => {
    if (liveRegionRef.current) {
      // Clear and set to trigger announcement
      liveRegionRef.current.textContent = "";
      // Use setTimeout to ensure screen readers pick up the change
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
        }
      }, 50);
    }
  };

  const focusTarget = (selector: string) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: isReducedMotion ? "auto" : "smooth", block: "start" });
    }
  };

  const value: AccessibilityContextValue = {
    announce,
    focusTarget,
    isReducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}