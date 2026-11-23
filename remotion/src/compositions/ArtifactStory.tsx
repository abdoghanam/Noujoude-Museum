import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export function ArtifactStory() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Artifact reveal (0-90 frames)
  const revealProgress = interpolate(frame, [0, 90], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Image scale (spring)
  const imageScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // Metadata fade (90-150 frames)
  const metadataOpacity = interpolate(frame, [90, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Story text (150-210 frames)
  const storyOpacity = interpolate(frame, [150, 210], [0, 1], {
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
      {/* Exhibit lighting */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, rgba(198, 165, 107, ${revealProgress * 0.1}) 0%, transparent 60%)`,
          opacity: revealProgress,
        }}
      />

      {/* Artifact image frame */}
      <div
        style={{
          opacity: revealProgress,
          transform: `scale(${imageScale})`,
          border: "1px solid rgba(216, 217, 213, 0.1)",
          padding: "2rem",
          backgroundColor: "#0a090c",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "400px",
            height: "300px",
            backgroundColor: "#15101a",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#9d9184",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.875rem",
          }}
        >
          Artifact Image
        </div>
      </div>

      {/* Metadata */}
      <div
        style={{
          opacity: metadataOpacity,
          marginTop: "2rem",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <h2
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "2rem",
            fontWeight: 300,
            color: "#f3ebdd",
            margin: 0,
          }}
        >
          Object Title
        </h2>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.75rem",
            color: "#9d9184",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginTop: "0.5rem",
          }}
        >
          NDM-AST-001
        </p>
      </div>

      {/* Story text */}
      <p
        style={{
          opacity: storyOpacity,
          fontFamily: "Inter, sans-serif",
          fontSize: "1rem",
          color: "#9d9184",
          marginTop: "2rem",
          maxWidth: "60ch",
          textAlign: "center",
          lineHeight: 1.7,
          zIndex: 1,
        }}
      >
        Story content will appear here when artifact records are published.
      </p>
    </div>
  );
}