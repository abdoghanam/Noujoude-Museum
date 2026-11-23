"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";

export type SceneID =
  | "entrance"
  | "lobby"
  | "gallery"
  | "corridor"
  | "archive"
  | "chamber"
  | "closing";

export interface SceneState {
  readonly current: SceneID;
  readonly previous: SceneID | null;
  readonly isTransitioning: boolean;
  readonly direction: "forward" | "backward" | null;
}

export interface SceneManagerContextValue {
  readonly state: SceneState;
  readonly navigateTo: (scene: SceneID, direction?: "forward" | "backward") => void;
  readonly canGoBack: boolean;
  readonly goBack: () => void;
}

const SceneManagerContext = createContext<SceneManagerContextValue | null>(null);

export function useSceneManager(): SceneManagerContextValue {
  const ctx = useContext(SceneManagerContext);
  if (!ctx) {
    throw new Error("useSceneManager must be used within a SceneManagerProvider");
  }
  return ctx;
}

interface SceneManagerProviderProps {
  readonly children: ReactNode;
  readonly initialScene?: SceneID;
}

export function SceneManagerProvider({
  children,
  initialScene = "entrance",
}: SceneManagerProviderProps) {
  const [state, setState] = useState<SceneState>({
    current: initialScene,
    previous: null,
    isTransitioning: false,
    direction: null,
  });

  const navigateTo = useCallback(
    (scene: SceneID, direction: "forward" | "backward" = "forward") => {
      setState((prev) => {
        if (prev.current === scene) return prev;
        return {
          current: scene,
          previous: prev.current,
          isTransitioning: true,
          direction,
        };
      });

      // Reset transition flag after animation duration
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isTransitioning: false,
        }));
      }, 1200);
    },
    [],
  );

  const goBack = useCallback(() => {
    setState((prev) => {
      if (!prev.previous) return prev;
      return {
        current: prev.previous,
        previous: null,
        isTransitioning: true,
        direction: "backward",
      };
    });

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isTransitioning: false,
      }));
    }, 1200);
  }, []);

  const value: SceneManagerContextValue = {
    state,
    navigateTo,
    canGoBack: state.previous !== null,
    goBack,
  };

  return (
    <SceneManagerContext.Provider value={value}>
      {children}
    </SceneManagerContext.Provider>
  );
}