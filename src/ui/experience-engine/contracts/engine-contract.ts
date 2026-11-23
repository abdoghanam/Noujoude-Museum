// Engine Contract — Noujoude Experience Engine
// Defines the contract for all rendering engines.

export type EngineStatus =
  "uninitialized" | "initializing" | "ready" | "error" | "disposed";

export interface EngineCapabilities {
  readonly webgl: boolean;
  readonly webgl2: boolean;
  readonly reducedMotion: boolean;
  readonly lowPower: boolean;
  readonly connectionSpeed: "slow" | "medium" | "fast";
}

export interface ExperienceEngine {
  readonly id: string;
  readonly status: EngineStatus;
  initialize(capabilities: EngineCapabilities): Promise<void>;
  activate(sceneId: string): Promise<void>;
  deactivate(sceneId: string): Promise<void>;
  dispose(): Promise<void>;
  isAvailable(): boolean;
}

export interface EngineRegistry {
  register(engine: ExperienceEngine): void;
  unregister(engineId: string): void;
  get(engineId: string): ExperienceEngine | undefined;
  getAll(): ReadonlyMap<string, ExperienceEngine>;
  initializeAll(capabilities: EngineCapabilities): Promise<void>;
  disposeAll(): Promise<void>;
}

export interface EngineHealthCheck {
  readonly engineId: string;
  readonly status: EngineStatus;
  readonly lastError?: Error;
  readonly uptime: number;
}
