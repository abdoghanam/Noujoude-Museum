// Scene Registry — Noujoude Experience Engine
// Central registry for all museum scenes.
// Instance-level storage for proper isolation.

import type { MuseumSceneDefinition } from "../contracts/scene-contract";

export function createSceneRegistry() {
  const scenes = new Map<string, MuseumSceneDefinition>();

  return {
    register(scene: MuseumSceneDefinition) {
      if (scenes.has(scene.id)) {
        console.warn(`Scene "${scene.id}" is already registered. Overwriting.`);
      }
      scenes.set(scene.id, scene);
    },
    unregister(sceneId: string) {
      scenes.delete(sceneId);
    },
    get(sceneId: string) {
      return scenes.get(sceneId);
    },
    getAll() {
      return scenes;
    },
    getByPriority(priority: "critical" | "normal" | "deferred") {
      return Array.from(scenes.values()).filter((s) => s.priority === priority);
    },
    getByType(type: "2d" | "3d" | "cinematic" | "hybrid") {
      return Array.from(scenes.values()).filter((s) => s.type === type);
    },
    get size() {
      return scenes.size;
    },
  };
}

// Default instance (backward compatible)
export const sceneRegistry = createSceneRegistry();

// Backward-compatible function exports
export function registerScene(scene: MuseumSceneDefinition): void {
  sceneRegistry.register(scene);
}

export function unregisterScene(sceneId: string): void {
  sceneRegistry.unregister(sceneId);
}

export function getScene(sceneId: string) {
  return sceneRegistry.get(sceneId);
}

export function getAllScenes() {
  return sceneRegistry.getAll();
}

export function getScenesByPriority(priority: "critical" | "normal" | "deferred") {
  return sceneRegistry.getByPriority(priority);
}

export function getScenesByType(type: "2d" | "3d" | "cinematic" | "hybrid") {
  return sceneRegistry.getByType(type);
}