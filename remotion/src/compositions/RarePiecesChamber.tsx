import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export function RarePiecesChamber() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Golden light appears (0-60 frames)
  const lightOpacity = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Object reveal (30-90 frames)
  const objectScale = spring({
    frame: frame - 30,
    fps,
    config: { damping: 150 },
  });

  // Title (90-150 frames)
  const titleOpacity = interpolate(frame, [90, 150], [0, 1], {
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
      }}
    >
      {/* Golden spotlight */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          height: "50%",
          background: `radial-gradient(circle, rgba(198, 165, 107, ${lightOpacity * 0.15}) 0%, transparent 70%)`,
          opacity: lightOpacity,
        }}
      />

      {/* Pedestal */}
      <div
        style={{
          width: "200px",
          height: "200px",
          border: "1px solid rgba(198, 165, 107, 0.3)",
          backgroundColor: "#15101a",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${objectScale})`,
          boxShadow: "0 0 60px rgba(198, 165, 107, 0.1)",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            backgroundColor: "#0a090c",
            border: "1px solid rgba(216, 217, 213, 0.1)",
          }}
        />
      </div>

      {/* Title */}
      <h2
        style={{
          opacity: titleOpacity,
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: "2rem",
          fontWeight: 300,
          color: "#f3ebdd",
          marginTop: "3rem",
          letterSpacing: "0.1em",
          zIndex: 1,
        }}
      >
        Rare Piece
      </h2>
    </div>
  );
}