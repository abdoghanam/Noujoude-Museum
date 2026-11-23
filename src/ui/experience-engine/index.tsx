// Experience Engine — unified export
// Noujoude Digital Heritage Museum

export { SceneManagerProvider, useSceneManager } from "./scene-manager";
export type {
  SceneID,
  SceneState,
  SceneManagerContextValue,
} from "./scene-manager";

export { TransitionManager } from "./transition-manager";
export type { TransitionManagerProps } from "./transition-manager";

export { MotionEngine } from "./motion-engine";
export type { MotionEngineProps } from "./motion-engine";

export {
  PerformanceManager,
  lazyLoad,
  preloadComponent,
} from "./performance-manager";
export type { PerformanceManagerProps } from "./performance-manager";

export { AccessibilityManager } from "./accessibility-manager";
export type { AccessibilityManagerProps } from "./accessibility-manager";

// Core Engine
export * from "./core";
export * from "./contracts";

// Re-export new engines
export { RemotionPlayer } from "@/ui/cinematic-engine";
export type { RemotionPlayerProps } from "@/ui/cinematic-engine";

export { Lazy3DScene } from "@/ui/spatial-engine";
export type { Lazy3DProps } from "@/ui/spatial-engine";
