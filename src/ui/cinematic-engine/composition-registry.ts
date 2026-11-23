// Composition Registry — Noujoude Cinematic Engine
// Authoritative source for all Remotion composition definitions.

import type { ComponentType } from "react";
import { MuseumEntranceComposition } from "./compositions/MuseumEntranceComposition";
import { ArtifactStoryComposition } from "./compositions/ArtifactStoryComposition";
import { CountryExhibitionComposition } from "./compositions/CountryExhibitionComposition";
import { RarePiecesChamberComposition } from "./compositions/RarePiecesChamberComposition";
import { ClosingSequenceComposition } from "./compositions/ClosingSequenceComposition";

export type CompositionId =
  | "MuseumEntrance"
  | "ArtifactStory"
  | "CountryExhibition"
  | "RarePiecesChamber"
  | "ClosingSequence";

export interface CompositionDefinition {
  readonly id: CompositionId;
  readonly component: ComponentType<Record<string, unknown>>;
  readonly durationInFrames: number;
  readonly fps: number;
  readonly width: number;
  readonly height: number;
  readonly defaultProps?: Record<string, unknown>;
}

const registry = new Map<CompositionId, CompositionDefinition>();

export function registerComposition(def: CompositionDefinition): void {
  if (registry.has(def.id)) {
    console.warn(`Composition "${def.id}" already registered. Overwriting.`);
  }
  registry.set(def.id, def);
}

export function getComposition(
  id: CompositionId,
): CompositionDefinition | undefined {
  return registry.get(id);
}

export function getAllCompositions(): ReadonlyMap<
  CompositionId,
  CompositionDefinition
> {
  return registry;
}

// Register all compositions
registerComposition({
  id: "MuseumEntrance",
  component: MuseumEntranceComposition,
  durationInFrames: 300,
  fps: 60,
  width: 1920,
  height: 1080,
});

registerComposition({
  id: "ArtifactStory",
  component: ArtifactStoryComposition,
  durationInFrames: 240,
  fps: 60,
  width: 1920,
  height: 1080,
});

registerComposition({
  id: "CountryExhibition",
  component: CountryExhibitionComposition,
  durationInFrames: 360,
  fps: 60,
  width: 1920,
  height: 1080,
});

registerComposition({
  id: "RarePiecesChamber",
  component: RarePiecesChamberComposition,
  durationInFrames: 180,
  fps: 60,
  width: 1920,
  height: 1080,
});

registerComposition({
  id: "ClosingSequence",
  component: ClosingSequenceComposition,
  durationInFrames: 180,
  fps: 60,
  width: 1920,
  height: 1080,
});
