// Scene Registry — Noujoude Experience Engine
// Central registry for all museum scenes.

import type { MuseumSceneDefinition } from "../contracts/scene-contract";

const scenes = new Map<string, MuseumSceneDefinition>();

export function registerScene(scene: MuseumSceneDefinition): void {
  if (scenes.has(scene.id)) {
    console.warn(`Scene "${scene.id}" is already registered. Overwriting.`);
  }
  scenes.set(scene.id, scene);
}

export function unregisterScene(sceneId: string): void {
  scenes.delete(sceneId);
}

export function getScene(sceneId: string): MuseumSceneDefinition | undefined {
  return scenes.get(sceneId);
}

export function getAllScenes(): ReadonlyMap<string, MuseumSceneDefinition> {
  return scenes;
}

export function getScenesByPriority(
  priority: "critical" | "normal" | "deferred",
): MuseumSceneDefinition[] {
  return Array.from(scenes.values()).filter((s) => s.priority === priority);
}

export function getScenesByType(
  type: "2d" | "3d" | "cinematic" | "hybrid",
): MuseumSceneDefinition[] {
  return Array.from(scenes.values()).filter((s) => s.type === type);
}
