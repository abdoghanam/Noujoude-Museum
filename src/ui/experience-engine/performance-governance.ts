// Performance Governance — Noujoude Experience Engine
// Implements route-level code splitting, scene-level lazy loading,
// and resource management.

export interface PerformanceProfile {
  readonly name: "high" | "balanced" | "low";
  readonly maxConcurrentLoads: number;
  readonly enable3D: boolean;
  readonly enableCinematic: boolean;
  readonly imageQuality: "full" | "medium" | "low";
  readonly animationComplexity: "full" | "reduced" | "none";
}

export const PERFORMANCE_PROFILES: Readonly<Record<string, PerformanceProfile>> = {
  high: {
    name: "high",
    maxConcurrentLoads: 4,
    enable3D: true,
    enableCinematic: true,
    imageQuality: "full",
    animationComplexity: "full",
  },
  balanced: {
    name: "balanced",
    maxConcurrentLoads: 2,
    enable3D: true,
    enableCinematic: true,
    imageQuality: "medium",
    animationComplexity: "full",
  },
  low: {
    name: "low",
    maxConcurrentLoads: 1,
    enable3D: false,
    enableCinematic: false,
    imageQuality: "low",
    animationComplexity: "reduced",
  },
};

export interface ResourceTracker {
  readonly loadedResources: Set<string>;
  readonly activeScenes: Set<string>;
  readonly pendingLoads: Map<string, Promise<void>>;
}

export function createResourceTracker(): ResourceTracker {
  return {
    loadedResources: new Set(),
    activeScenes: new Set(),
    pendingLoads: new Map(),
  };
}

export function shouldLoadResource(
  resourceId: string,
  tracker: ResourceTracker,
  profile: PerformanceProfile,
): boolean {
  // Don't load if already loaded
  if (tracker.loadedResources.has(resourceId)) return false;

  // Don't load if too many concurrent loads
  if (tracker.pendingLoads.size >= profile.maxConcurrentLoads) return false;

  return true;
}

export function markResourceLoaded(resourceId: string, tracker: ResourceTracker): void {
  tracker.loadedResources.add(resourceId);
  tracker.pendingLoads.delete(resourceId);
}

export function markResourceUnloaded(resourceId: string, tracker: ResourceTracker): void {
  tracker.loadedResources.delete(resourceId);
  tracker.activeScenes.delete(resourceId);
}

const getProfile = (name: "high" | "balanced" | "low"): PerformanceProfile => {
  const profile = PERFORMANCE_PROFILES[name];
  if (!profile) throw new Error(`Unknown profile: ${name}`);
  return profile;
};

export function detectPerformanceProfile(): PerformanceProfile {
  if (typeof window === "undefined") return getProfile("balanced");

  // Check reduced motion
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return getProfile("low");

  // Check device memory (if available)
  const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory;
  if (deviceMemory && deviceMemory < 4) return getProfile("low");
  if (deviceMemory && deviceMemory < 8) return getProfile("balanced");

  // Check hardware concurrency
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return getProfile("balanced");

  return getProfile("high");
}