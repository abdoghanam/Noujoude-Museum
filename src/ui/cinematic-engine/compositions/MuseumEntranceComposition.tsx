"use client";

import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export function MuseumEntranceComposition() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const candleOpacity = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  const logoOpacity = interpolate(frame, [90, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoScale = spring({
    frame: frame - 90,
    fps,
    config: { damping: 200 },
  });

  const taglineOpacity = interpolate(frame, [150, 210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#0a090c",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          height: "40%",
          background: `radial-gradient(ellipse, rgba(198, 165, 107, ${candleOpacity * 0.15}) 0%, transparent 70%)`,
          opacity: candleOpacity,
        }}
      />

      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "6rem",
            fontWeight: 300,
            color: "#f3ebdd",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
            textShadow: "0 0 80px rgba(198, 165, 107, 0.3)",
          }}
        >
          Noujoude
        </h1>
      </div>

      <p
        style={{
          opacity: taglineOpacity,
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: "1.5rem",
          color: "#9d9184",
          fontStyle: "italic",
          marginTop: "2rem",
          letterSpacing: "0.05em",
          zIndex: 1,
        }}
      >
        More than a collection... it&apos;s a story.
      </p>
    </div>
  );
}