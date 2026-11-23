"use client";

import { Player } from "@remotion/player";
import { useState, useEffect } from "react";
import { MuseumEntranceComposition } from "./compositions/MuseumEntranceComposition";

export interface RemotionPlayerProps {
  readonly composition: "MuseumEntrance" | "ArtifactStory" | "ClosingSequence";
  readonly className?: string;
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
}

export function RemotionPlayer({
  className,
  autoPlay = false,
  loop = false,
}: RemotionPlayerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={className}
        style={{
          minHeight: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a090c",
          color: "#9d9184",
        }}
      >
        Loading cinematic...
      </div>
    );
  }

  return (
    <div className={className}>
      <Player
        component={MuseumEntranceComposition}
        durationInFrames={300}
        fps={60}
        compositionWidth={1920}
        compositionHeight={1080}
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "16/9",
        }}
        autoPlay={autoPlay}
        loop={loop}
        controls
      />
    </div>
  );
}