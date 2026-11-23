"use client";

import { useCurrentFrame, interpolate } from "remotion";

export function ClosingSequenceComposition() {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [60, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [150, 180], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ flex: 1, backgroundColor: "#0a090c", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden", width: "100%", height: "100%", opacity: fadeOut }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, rgba(198, 165, 107, ${fadeIn * 0.06}) 0%, #0a090c 70%)`, opacity: fadeIn }} />

      <p style={{ opacity: taglineOpacity, fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2.5rem", fontWeight: 300, color: "#f3ebdd", fontStyle: "italic", textAlign: "center", letterSpacing: "0.05em", zIndex: 1, maxWidth: "40ch" }}>
        More than a collection... it&apos;s a story.
      </p>

      <p style={{ opacity: taglineOpacity * 0.6, fontFamily: "Inter, sans-serif", fontSize: "0.875rem", color: "#9d9184", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "2rem", zIndex: 1 }}>
        Noujoude Digital Heritage Museum
      </p>
    </div>
  );
}