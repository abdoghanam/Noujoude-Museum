// Engine Registry — Noujoude Experience Engine
// Central registry for all rendering engines.

import type { ExperienceEngine, EngineRegistry, EngineCapabilities } from "../contracts/engine-contract";

const engines = new Map<string, ExperienceEngine>();

export function createEngineRegistry(): EngineRegistry {
  return {
    register(engine: ExperienceEngine) {
      if (engines.has(engine.id)) {
        console.warn(`Engine "${engine.id}" is already registered. Overwriting.`);
      }
      engines.set(engine.id, engine);
    },
    unregister(engineId: string) {
      engines.delete(engineId);
    },
    get(engineId: string) {
      return engines.get(engineId);
    },
    getAll() {
      return engines;
    },
    async initializeAll(capabilities: EngineCapabilities) {
      const initPromises = Array.from(engines.values()).map(async (engine) => {
        try {
          await engine.initialize(capabilities);
        } catch (error) {
          console.error(`Failed to initialize engine "${engine.id}":`, error);
        }
      });
      await Promise.allSettled(initPromises);
    },
    async disposeAll() {
      const disposePromises = Array.from(engines.values()).map(async (engine) => {
        try {
          await engine.dispose();
        } catch (error) {
          console.error(`Failed to dispose engine "${engine.id}":`, error);
        }
      });
      await Promise.allSettled(disposePromises);
    },
  };
}

export const engineRegistry = createEngineRegistry();