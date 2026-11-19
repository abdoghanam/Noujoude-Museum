// Noujoude — OpenTelemetry instrumentation (Phase 8).
// Traces/metrics/logs with no sensitive content (Standard §10).

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // OTel SDK would be initialized here with the endpoint from
    // OTEL_EXPORTER_OTLP_ENDPOINT. Left as a no-op when unset to avoid
    // unverified external calls (zero-cost mandate).
    if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      console.info(
        "OTel: no exporter endpoint configured; telemetry disabled.",
      );
    }
  }
}
