import { describe, it, expect } from "vitest";
import {
  getComposition,
  getAllCompositions,
  registerComposition,
} from "@/ui/cinematic-engine/composition-registry";

describe("Remotion Composition Registry", () => {
  it("all 5 compositions are registered", () => {
    const all = getAllCompositions();
    expect(all.size).toBe(5);
  });

  it("MuseumEntrance composition has correct properties", () => {
    const comp = getComposition("MuseumEntrance");
    expect(comp).toBeDefined();
    expect(comp?.id).toBe("MuseumEntrance");
    expect(comp?.durationInFrames).toBe(300);
    expect(comp?.fps).toBe(60);
    expect(comp?.width).toBe(1920);
    expect(comp?.height).toBe(1080);
    expect(comp?.component).toBeDefined();
  });

  it("ArtifactStory composition has correct properties", () => {
    const comp = getComposition("ArtifactStory");
    expect(comp).toBeDefined();
    expect(comp?.durationInFrames).toBe(240);
    expect(comp?.fps).toBe(60);
  });

  it("CountryExhibition composition has correct properties", () => {
    const comp = getComposition("CountryExhibition");
    expect(comp).toBeDefined();
    expect(comp?.durationInFrames).toBe(360);
  });

  it("RarePiecesChamber composition has correct properties", () => {
    const comp = getComposition("RarePiecesChamber");
    expect(comp).toBeDefined();
    expect(comp?.durationInFrames).toBe(180);
  });

  it("ClosingSequence composition has correct properties", () => {
    const comp = getComposition("ClosingSequence");
    expect(comp).toBeDefined();
    expect(comp?.durationInFrames).toBe(180);
  });

  it("unknown composition returns undefined", () => {
    const comp = getComposition("NonExistent" as any);
    expect(comp).toBeUndefined();
  });

  it("composition components are valid React components", () => {
    const comp = getComposition("MuseumEntrance");
    expect(typeof comp?.component).toBe("function");
  });
});