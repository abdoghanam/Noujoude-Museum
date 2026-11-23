// Spatial Contract — Noujoude Experience Engine
// Defines the contract for the Three.js Spatial Engine.

export interface SpatialSceneConfig {
  readonly id: string;
  readonly camera: {
    readonly position: readonly [number, number, number];
    readonly fov: number;
    readonly near: number;
    readonly far: number;
  };
  readonly lighting: {
    readonly ambientIntensity: number;
    readonly spotLights: readonly {
      readonly position: readonly [number, number, number];
      readonly intensity: number;
      readonly color: string;
    }[];
  };
  readonly controls: {
    readonly enableZoom: boolean;
    readonly enablePan: boolean;
    readonly autoRotate: boolean;
    readonly autoRotateSpeed: number;
  };
  readonly quality: "high" | "balanced" | "low";
}

export interface SpatialEngine {
  initialize(config: SpatialSceneConfig): Promise<void>;
  loadScene(sceneId: string): Promise<void>;
  unloadScene(sceneId: string): Promise<void>;
  dispose(): Promise<void>;
  isWebGLAvailable(): boolean;
  getQualityProfile(): "high" | "balanced" | "low";
  setQualityProfile(profile: "high" | "balanced" | "low"): void;
}

export interface SpatialCapabilities {
  readonly webgl: boolean;
  readonly webgl2: boolean;
  readonly maxTextureSize: number;
  readonly maxAnisotropy: number;
}