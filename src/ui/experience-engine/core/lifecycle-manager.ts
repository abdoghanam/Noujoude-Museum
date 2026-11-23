// Lifecycle Manager — Noujoude Experience Engine
// Manages scene lifecycle states.

import type { SceneLifecycleState, SceneLifecycleManager, MuseumSceneDefinition } from "../contracts/scene-contract";
import { getScene } from "./scene-registry";

const states = new Map<string, SceneLifecycleState>();

export function createLifecycleManager(): SceneLifecycleManager {
  return {
    register(scene: MuseumSceneDefinition) {
      states.set(scene.id, {
        id: scene.id,
        status: "unloaded",
      });
    },
    unregister(sceneId: string) {
      states.delete(sceneId);
    },
    async load(sceneId: string) {
      const scene = getScene(sceneId);
      if (!scene) {
        throw new Error(`Scene "${sceneId}" not registered.`);
      }

      const currentState = states.get(sceneId);
      if (currentState?.status === "loaded" || currentState?.status === "active") {
        return;
      }

      states.set(sceneId, {
        id: sceneId,
        status: "loading",
        loadedAt: Date.now(),
      });

      try {
        await scene.loader();
        states.set(sceneId, {
          id: sceneId,
          status: "loaded",
          loadedAt: Date.now(),
        });
      } catch (error) {
        states.set(sceneId, {
          id: sceneId,
          status: "unloaded",
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
      }
    },
    async activate(sceneId: string) {
      const state = states.get(sceneId);
      if (!state || state.status !== "loaded") {
        await this.load(sceneId);
      }

      const currentState = states.get(sceneId);
      if (!currentState) return;
      states.set(sceneId, {
        ...currentState,
        status: "active",
        activatedAt: Date.now(),
      });
    },
    async deactivate(sceneId: string) {
      const state = states.get(sceneId);
      if (!state || state.status !== "active") return;

      states.set(sceneId, {
        ...state,
        status: "deactivating",
      });

      // Allow deactivation animation to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      const updatedState: SceneLifecycleState = {
        id: state.id,
        status: "loaded",
      };
      if (state.loadedAt !== undefined) {
        (updatedState as { loadedAt?: number }).loadedAt = state.loadedAt;
      }
      if (state.activatedAt !== undefined) {
        (updatedState as { activatedAt?: number }).activatedAt = state.activatedAt;
      }
      states.set(sceneId, updatedState);
    },
    async dispose(sceneId: string) {
      const state = states.get(sceneId);
      if (!state) return;

      states.set(sceneId, {
        ...state,
        status: "disposed",
        disposedAt: Date.now(),
      });
    },
    getState(sceneId: string) {
      return states.get(sceneId);
    },
    getAllStates() {
      return states;
    },
  };
}

export const lifecycleManager = createLifecycleManager();