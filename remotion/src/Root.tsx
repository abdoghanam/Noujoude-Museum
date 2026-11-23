import { Composition } from "remotion";
import { MuseumEntrance } from "./compositions/MuseumEntrance";
import { ArtifactStory } from "./compositions/ArtifactStory";
import { CountryExhibition } from "./compositions/CountryExhibition";
import { RarePiecesChamber } from "./compositions/RarePiecesChamber";
import { ClosingSequence } from "./compositions/ClosingSequence";

export function RemotionRoot() {
  return (
    <>
      {/* Museum Entrance — 16:9, 60fps, 1080p */}
      <Composition
        id="MuseumEntrance"
        component={MuseumEntrance}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Museum Entrance — Vertical 9:16 */}
      <Composition
        id="MuseumEntranceVertical"
        component={MuseumEntrance}
        durationInFrames={300}
        fps={60}
        width={1080}
        height={1920}
      />

      {/* Artifact Story — 16:9 */}
      <Composition
        id="ArtifactStory"
        component={ArtifactStory}
        durationInFrames={240}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Country Exhibition — 16:9 */}
      <Composition
        id="CountryExhibition"
        component={CountryExhibition}
        durationInFrames={360}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Rare Pieces Chamber — 16:9 */}
      <Composition
        id="RarePiecesChamber"
        component={RarePiecesChamber}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Closing Sequence — 16:9 */}
      <Composition
        id="ClosingSequence"
        component={ClosingSequence}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 4K variants */}
      <Composition
        id="MuseumEntrance4K"
        component={MuseumEntrance}
        durationInFrames={300}
        fps={60}
        width={3840}
        height={2160}
      />
    </>
  );
}
