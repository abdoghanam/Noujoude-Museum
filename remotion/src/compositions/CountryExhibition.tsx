import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export function CountryExhibition() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Country title reveal (0-90 frames)
  const titleOpacity = interpolate(frame, [0, 90], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Architectural reveal (30-120 frames)
  const archProgress = interpolate(frame, [30, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exhibition content (120-240 frames)
  const contentOpacity = interpolate(frame, [120, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Closing (240-360 frames)
  const closingOpacity = interpolate(frame, [240, 360], [0, 1], {
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
      {/* Architectural background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, rgba(42, 16, 24, ${archProgress * 0.3}) 0%, #0a090c 100%)`,
          opacity: archProgress,
        }}
      />

      {/* Country title */}
      <div style={{ opacity: titleOpacity, zIndex: 1, textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "5rem",
            fontWeight: 300,
            color: "#f3ebdd",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
            textShadow: "0 0 60px rgba(198, 165, 107, 0.2)",
          }}
        >
          Morocco
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.875rem",
            color: "#9d9184",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginTop: "1rem",
          }}
        >
          A Cultural World
        </p>
      </div>

      {/* Exhibition content placeholder */}
      <div
        style={{
          opacity: contentOpacity,
          marginTop: "4rem",
          display: "flex",
          gap: "2rem",
          zIndex: 1,
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: "200px",
              height: "150px",
              backgroundColor: "#15101a",
              border: "1px solid rgba(216, 217, 213, 0.1)",
            }}
          />
        ))}
      </div>

      {/* Closing text */}
      <p
        style={{
          opacity: closingOpacity,
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: "1.25rem",
          color: "#9d9184",
          fontStyle: "italic",
          marginTop: "4rem",
          zIndex: 1,
        }}
      >
        More than a collection... it&apos;s a story.
      </p>
    </div>
  );
}
