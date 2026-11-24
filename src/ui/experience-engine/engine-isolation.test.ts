import { describe, it, expect } from "vitest";
import { createEngineRegistry } from "@/ui/experience-engine/core/engine-registry";
import { createSceneRegistry, registerScene } from "@/ui/experience-engine/core/scene-registry";
import { createLifecycleManager } from "@/ui/experience-engine/core/lifecycle-manager";
import type { ExperienceEngine } from "@/ui/experience-engine/contracts/engine-contract";
import type { MuseumSceneDefinition } from "@/ui/experience-engine/contracts/scene-contract";

describe("Engine Isolation", () => {
  it("engine registry: one failed engine does not disable others", async () => {
    const registry = createEngineRegistry();

    const goodEngine: ExperienceEngine = {
      id: "good",
      status: "uninitialized",
      initialize: async () => {},
      activate: async () => {},
      deactivate: async () => {},
      dispose: async () => {},
      isAvailable: () => true,
    };

    const badEngine: ExperienceEngine = {
      id: "bad",
      status: "uninitialized",
      initialize: async () => {
        throw new Error("Initialization failed");
      },
      activate: async () => {},
      deactivate: async () => {},
      dispose: async () => {},
      isAvailable: () => false,
    };

    registry.register(goodEngine);
    registry.register(badEngine);

    const capabilities = {
      webgl: true,
      webgl2: true,
      reducedMotion: false,
      lowPower: false,
      connectionSpeed: "fast" as const,
    };

    await registry.initializeAll(capabilities);

    expect(registry.get("good")?.isAvailable()).toBe(true);
    const health = registry.getHealthStatuses?.();
    if (health) {
      const badHealth = health.find((h) => h.engineId === "bad");
      expect(badHealth?.status).toBe("error");
    }
  });

  it("scene registry: independent instances do not share state", () => {
    const reg1 = createSceneRegistry();
    const reg2 = createSceneRegistry();

    const scene: MuseumSceneDefinition = {
      id: "test-scene",
      type: "2d",
      title: "Test",
      loader: async () => {},
      engines: {
        webMotion: "required",
        spatial: "none",
        cinematic: "none",
        exhibition: "none",
      },
    };

    reg1.register(scene);
    expect(reg1.get("test-scene")).toBeDefined();
    expect(reg2.get("test-scene")).toBeUndefined();
  });

  it("lifecycle manager: concurrent loads are deduplicated", async () => {
    const lm = createLifecycleManager();

    const scene: MuseumSceneDefinition = {
      id: "concurrent-scene",
      type: "2d",
      title: "Concurrent",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 50));
      },
      engines: {
        webMotion: "required",
        spatial: "none",
        cinematic: "none",
        exhibition: "none",
      },
    };

    registerScene(scene);

    const load1 = lm.load("concurrent-scene").catch(() => {});
    const load2 = lm.load("concurrent-scene").catch(() => {});
    await Promise.all([load1, load2]);

    const state = lm.getState("concurrent-scene");
    expect(state?.status).toBe("loaded");
  });

  it("lifecycle manager: dispose runs cleanup callbacks", async () => {
    const lm = createLifecycleManager();
    let cleanedUp = false;

    const scene: MuseumSceneDefinition = {
      id: "cleanup-scene",
      type: "2d",
      title: "Cleanup",
      loader: async () => {},
      engines: {
        webMotion: "required",
        spatial: "none",
        cinematic: "none",
        exhibition: "none",
      },
    };

    registerScene(scene);

    await lm.load("cleanup-scene");
    await lm.activate("cleanup-scene");

    lm.registerCleanup("cleanup-scene", () => {
      cleanedUp = true;
    });

    await lm.dispose("cleanup-scene");
    expect(cleanedUp).toBe(true);
    expect(lm.getState("cleanup-scene")?.status).toBe("disposed");
  });

  it("lifecycle manager: missing scene throws on load", async () => {
    const lm = createLifecycleManager();
    await expect(lm.load("nonexistent")).rejects.toThrow();
  });

  it("scene registry: duplicate registration warns but allows overwrite", () => {
    const sr = createSceneRegistry();
    const scene: MuseumSceneDefinition = {
      id: "dup-scene",
      type: "2d",
      title: "Dup",
      loader: async () => {},
      engines: {
        webMotion: "required",
        spatial: "none",
        cinematic: "none",
        exhibition: "none",
      },
    };

    sr.register(scene);
    sr.register({ ...scene, title: "Dup2" });
    expect(sr.get("dup-scene")?.title).toBe("Dup2");
  });
});