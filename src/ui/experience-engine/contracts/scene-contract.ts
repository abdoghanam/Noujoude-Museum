// Scene Contract — Noujoude Experience Engine
// Defines the contract for museum scenes and their engine requirements.

export type SceneType = "2d" | "3d" | "cinematic" | "hybrid";

export type EngineRequirement = "required" | "optional" | "none";

export type ScenePriority = "critical" | "normal" | "deferred";

export interface MuseumSceneDefinition {
  readonly id: string;
  readonly type: SceneType;
  readonly title: string;
  readonly loader: () => Promise<unknown>;
  readonly fallback?: string;
  readonly requiresWebGL?: boolean;
  readonly priority?: ScenePriority;
  readonly engines: {
    readonly webMotion: EngineRequirement;
    readonly spatial: EngineRequirement;
    readonly cinematic: EngineRequirement;
    readonly exhibition: EngineRequirement;
  };
  readonly assets?: readonly string[];
  readonly reducedMotionAlternative?: string;
}

export interface SceneLifecycleState {
  readonly id: string;
  readonly status:
    "unloaded" | "loading" | "loaded" | "active" | "deactivating" | "disposed";
  readonly loadedAt?: number;
  readonly activatedAt?: number;
  readonly disposedAt?: number;
  readonly error?: Error;
}

export interface SceneLifecycleManager {
  register(scene: MuseumSceneDefinition): void;
  unregister(sceneId: string): void;
  load(sceneId: string): Promise<void>;
  activate(sceneId: string): Promise<void>;
  deactivate(sceneId: string): Promise<void>;
  dispose(sceneId: string): Promise<void>;
  getState(sceneId: string): SceneLifecycleState | undefined;
  getAllStates(): ReadonlyMap<string, SceneLifecycleState>;
}
