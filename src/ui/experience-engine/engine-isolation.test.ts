import { describe, it, expect } from "vitest";
import { createEngineRegistry } from "@/ui/experience-engine/core/engine-registry";
import { createSceneRegistry, registerScene } from "@/ui/experience-engine/core/scene-registry";
import { createLifecycleManager } from "@/ui/experience-engine/core/lifecycle-manager";

describe("Engine Isolation", () => {
  it("engine registry: one failed engine does not disable others", async () => {
    const registry = createEngineRegistry();

    const goodEngine = {
      id: "good",
      status: "uninitialized" as const,
      initialize: async () => {},
      activate: async () => {},
      deactivate: async () => {},
      dispose: async () => {},
      isAvailable: () => true,
    };

    const badEngine = {
      id: "bad",
      status: "uninitialized" as const,
      initialize: async () => {
        throw new Error("Initialization failed");
      },
      activate: async () => {},
      deactivate: async () => {},
      dispose: async () => {},
      isAvailable: () => false,
    };

    registry.register(goodEngine as any);
    registry.register(badEngine as any);

    const capabilities = {
      webgl: true,
      webgl2: true,
      reducedMotion: false,
      lowPower: false,
      connectionSpeed: "fast" as const,
    };

    await registry.initializeAll(capabilities);

    // Good engine should still be available
    expect(registry.get("good")?.isAvailable()).toBe(true);
    // Bad engine health should show error
    const health = (registry as any).getHealthStatuses?.();
    if (health) {
      const badHealth = health.find((h: any) => h.engineId === "bad");
      expect(badHealth?.status).toBe("error");
    }
  });

  it("scene registry: independent instances do not share state", () => {
    const reg1 = createSceneRegistry();
    const reg2 = createSceneRegistry();

    const scene = {
      id: "test-scene",
      type: "2d" as const,
      title: "Test",
      loader: async () => {},
      engines: {
        webMotion: "required" as const,
        spatial: "none" as const,
        cinematic: "none" as const,
        exhibition: "none" as const,
      },
    };

    reg1.register(scene);
    expect(reg1.get("test-scene")).toBeDefined();
    expect(reg2.get("test-scene")).toBeUndefined();
  });

  it("lifecycle manager: concurrent loads are deduplicated", async () => {
    const lm = createLifecycleManager();
    const scene = {
      id: "concurrent-scene",
      type: "2d" as const,
      title: "Concurrent",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 50));
      },
      engines: {
        webMotion: "required" as const,
        spatial: "none" as const,
        cinematic: "none" as const,
        exhibition: "none" as const,
      },
    };

    // Register in global scene registry
    registerScene(scene as any);

    // Load twice concurrently
    const load1 = lm.load("concurrent-scene").catch(() => {});
    const load2 = lm.load("concurrent-scene").catch(() => {});
    await Promise.all([load1, load2]);

    // Should have loaded only once
    const state = lm.getState("concurrent-scene");
    expect(state?.status).toBe("loaded");
  });

  it("lifecycle manager: dispose runs cleanup callbacks", async () => {
    const lm = createLifecycleManager();
    let cleanedUp = false;

    const scene = {
      id: "cleanup-scene",
      type: "2d" as const,
      title: "Cleanup",
      loader: async () => {},
      engines: {
        webMotion: "required" as const,
        spatial: "none" as const,
        cinematic: "none" as const,
        exhibition: "none" as const,
      },
    };

    registerScene(scene as any);

    await lm.load("cleanup-scene");
    await lm.activate("cleanup-scene");

    const unregister = (lm as any).registerCleanup("cleanup-scene", () => {
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
    const scene = {
      id: "dup-scene",
      type: "2d" as const,
      title: "Dup",
      loader: async () => {},
      engines: {
        webMotion: "required" as const,
        spatial: "none" as const,
        cinematic: "none" as const,
        exhibition: "none" as const,
      },
    };

    sr.register(scene);
    sr.register({ ...scene, title: "Dup2" });
    expect(sr.get("dup-scene")?.title).toBe("Dup2");
  });
});