// Engine Registry — Noujoude Experience Engine
// Central registry for all rendering engines.
// Instance-level storage (not module-level) for proper isolation.

import type {
  ExperienceEngine,
  EngineRegistry,
  EngineCapabilities,
  EngineStatus,
} from "../contracts/engine-contract";

export interface EngineHealthStatus {
  readonly engineId: string;
  readonly status: EngineStatus;
  readonly lastError?: Error;
  readonly initializedAt?: number;
}

export function createEngineRegistry(): EngineRegistry & {
  getHealthStatuses(): EngineHealthStatus[];
} {
  // Instance-level storage (not module-level)
  const engines = new Map<string, ExperienceEngine>();
  const healthStatuses = new Map<string, EngineHealthStatus>();

  return {
    register(engine: ExperienceEngine) {
      const existing = engines.get(engine.id);
      if (existing) {
        if (existing.status === "ready" || existing.status === "initializing") {
          console.warn(
            `Engine "${engine.id}" is already active (status: ${existing.status}). Registration rejected.`,
          );
          return;
        }
        console.warn(
          `Engine "${engine.id}" was in state "${existing.status}". Replacing.`,
        );
      }
      engines.set(engine.id, engine);
      healthStatuses.set(engine.id, {
        engineId: engine.id,
        status: engine.status,
      });
    },
    unregister(engineId: string) {
      const engine = engines.get(engineId);
      if (
        engine &&
        (engine.status === "ready" || engine.status === "initializing")
      ) {
        console.warn(
          `Cannot unregister active engine "${engineId}" (status: ${engine.status}). Dispose first.`,
        );
        return;
      }
      engines.delete(engineId);
      healthStatuses.delete(engineId);
    },
    get(engineId: string) {
      return engines.get(engineId);
    },
    getAll() {
      return engines;
    },
    async initializeAll(capabilities: EngineCapabilities) {
      const results = await Promise.allSettled(
        Array.from(engines.values()).map(async (engine) => {
          try {
            await engine.initialize(capabilities);
            healthStatuses.set(engine.id, {
              engineId: engine.id,
              status: engine.status,
              initializedAt: Date.now(),
            });
          } catch (error) {
            healthStatuses.set(engine.id, {
              engineId: engine.id,
              status: "error",
              lastError:
                error instanceof Error ? error : new Error(String(error)),
            });
            throw error;
          }
        }),
      );

      // Report failures
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const engineId = Array.from(engines.keys())[index];
          console.error(
            `Engine "${engineId}" failed to initialize:`,
            result.reason,
          );
        }
      });
    },
    async disposeAll() {
      const results = await Promise.allSettled(
        Array.from(engines.values()).map(async (engine) => {
          try {
            await engine.dispose();
            healthStatuses.set(engine.id, {
              engineId: engine.id,
              status: "disposed",
            });
          } catch (error) {
            healthStatuses.set(engine.id, {
              engineId: engine.id,
              status: "error",
              lastError:
                error instanceof Error ? error : new Error(String(error)),
            });
            throw error;
          }
        }),
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const engineId = Array.from(engines.keys())[index];
          console.error(
            `Engine "${engineId}" failed to dispose:`,
            result.reason,
          );
        }
      });
    },
    getHealthStatuses() {
      return Array.from(healthStatuses.values());
    },
  };
}

// Default instance (backward compatible)
export const engineRegistry = createEngineRegistry();
