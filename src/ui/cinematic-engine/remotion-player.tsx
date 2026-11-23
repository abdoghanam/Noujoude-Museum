"use client";

import { Player } from "@remotion/player";
import { useState, useEffect } from "react";
import { getComposition } from "./composition-registry";
import type { CompositionId } from "./composition-registry";

export interface RemotionPlayerProps {
  readonly composition: CompositionId;
  readonly className?: string;
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly inputProps?: Record<string, unknown>;
}

export function RemotionPlayer({
  composition: compositionId,
  className,
  autoPlay = false,
  loop = false,
  inputProps,
}: RemotionPlayerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const def = getComposition(compositionId);

  if (!def) {
    return (
      <div className={className} style={{ minHeight: "300px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#0a090c", color: "#9d9184" }}>
        Composition &quot;{compositionId}&quot; not found.
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className={className} style={{ minHeight: "300px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#0a090c", color: "#9d9184" }}>
        Loading cinematic...
      </div>
    );
  }

  const Component = def.component;

  return (
    <div className={className}>
      <Player
        component={Component}
        durationInFrames={def.durationInFrames}
        fps={def.fps}
        compositionWidth={def.width}
        compositionHeight={def.height}
        inputProps={inputProps}
        style={{ width: "100%", height: "auto", aspectRatio: `${def.width}/${def.height}` }}
        autoPlay={autoPlay}
        loop={loop}
        controls
      />
    </div>
  );
}