// Lifecycle Manager — Noujoude Experience Engine
// Manages scene lifecycle states with proper cleanup.

import type {
  SceneLifecycleState,
  SceneLifecycleManager,
  MuseumSceneDefinition,
} from "../contracts/scene-contract";
import { getScene } from "./scene-registry";

export interface SceneCleanupCallback {
  (): void | Promise<void>;
}

const cleanupCallbacks = new Map<string, Set<SceneCleanupCallback>>();

export function createLifecycleManager(): SceneLifecycleManager & {
  registerCleanup(sceneId: string, callback: SceneCleanupCallback): () => void;
} {
  const states = new Map<string, SceneLifecycleState>();
  const loadingPromises = new Map<string, Promise<void>>();

  return {
    register(scene: MuseumSceneDefinition) {
      states.set(scene.id, { id: scene.id, status: "unloaded" });
      cleanupCallbacks.set(scene.id, new Set());
    },
    unregister(sceneId: string) {
      states.delete(sceneId);
      cleanupCallbacks.delete(sceneId);
    },
    async load(sceneId: string) {
      const scene = getScene(sceneId);
      if (!scene) throw new Error(`Scene "${sceneId}" not registered.`);

      const currentState = states.get(sceneId);
      if (
        currentState?.status === "loaded" ||
        currentState?.status === "active"
      )
        return;

      // Deduplicate concurrent loads
      const existingPromise = loadingPromises.get(sceneId);
      if (existingPromise) return existingPromise;

      const loadPromise = (async () => {
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
        } finally {
          loadingPromises.delete(sceneId);
        }
      })();

      loadingPromises.set(sceneId, loadPromise);
      return loadPromise;
    },
    async activate(sceneId: string) {
      const state = states.get(sceneId);
      if (!state || state.status !== "loaded") {
        await this.load(sceneId);
      }

      const updatedState: SceneLifecycleState = {
        id: sceneId,
        status: "active",
        activatedAt: Date.now(),
      };
      const current = states.get(sceneId);
      if (current?.loadedAt !== undefined) {
        (updatedState as { loadedAt?: number }).loadedAt = current.loadedAt;
      }
      states.set(sceneId, updatedState);
    },
    async deactivate(sceneId: string) {
      const state = states.get(sceneId);
      if (!state || state.status !== "active") return;

      states.set(sceneId, { ...state, status: "deactivating" });

      // Run cleanup callbacks
      const callbacks = cleanupCallbacks.get(sceneId);
      if (callbacks) {
        await Promise.allSettled(Array.from(callbacks).map((cb) => cb()));
      }

      const updatedState: SceneLifecycleState = {
        id: sceneId,
        status: "loaded",
      };
      if (state.loadedAt !== undefined) {
        (updatedState as { loadedAt?: number }).loadedAt = state.loadedAt;
      }
      states.set(sceneId, updatedState);
    },
    async dispose(sceneId: string) {
      const state = states.get(sceneId);
      if (!state) return;

      // Run cleanup callbacks
      const callbacks = cleanupCallbacks.get(sceneId);
      if (callbacks) {
        await Promise.allSettled(Array.from(callbacks).map((cb) => cb()));
        callbacks.clear();
      }

      states.set(sceneId, {
        id: sceneId,
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
    registerCleanup(sceneId: string, callback: SceneCleanupCallback) {
      if (!cleanupCallbacks.has(sceneId)) {
        cleanupCallbacks.set(sceneId, new Set());
      }
      let callbacks = cleanupCallbacks.get(sceneId);
      if (!callbacks) {
        callbacks = new Set();
        cleanupCallbacks.set(sceneId, callbacks);
      }
      callbacks.add(callback);
      return () => {
        callbacks.delete(callback);
      };
    },
  };
}

export const lifecycleManager = createLifecycleManager();
