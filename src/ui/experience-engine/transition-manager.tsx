"use client";

import type { ReactNode } from "react";
import { useSceneManager } from "./scene-manager";

export interface TransitionManagerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function TransitionManager({
  children,
  className,
}: TransitionManagerProps) {
  const { state } = useSceneManager();

  const transitionClass = state.isTransitioning
    ? state.direction === "forward"
      ? "scene-reveal"
      : "scene-fade-out"
    : "";

  return (
    <div
      className={`transition-manager ${transitionClass} ${className ?? ""}`}
      data-scene={state.current}
      data-transitioning={state.isTransitioning}
      data-direction={state.direction ?? undefined}
    >
      {children}
    </div>
  );
}
