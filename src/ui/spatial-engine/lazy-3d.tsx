"use client";

import { lazy, Suspense } from "react";

const RarePiecesChamber3D = lazy(() =>
  import("./rare-pieces-chamber-3d").then((m) => ({
    default: m.RarePiecesChamber3D,
  })),
);

export interface Lazy3DProps {
  readonly scene: "rare-pieces" | "coin-gallery" | "stamp-archive";
  readonly className?: string;
}

export function Lazy3DScene({ scene, className }: Lazy3DProps) {
  return (
    <Suspense
      fallback={
        <div
          className={className}
          style={{
            minHeight: "400px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0a090c",
            color: "#9d9184",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.875rem",
          }}
        >
          Loading 3D scene...
        </div>
      }
    >
      {scene === "rare-pieces" && <RarePiecesChamber3D className={className ?? ""} />}
    </Suspense>
  );
}