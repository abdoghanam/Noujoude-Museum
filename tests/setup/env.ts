// Vitest global setup.
// Purpose: guarantee that no test can accidentally read real credentials or
// reach a real provider, and that server-only env reads are still allowed in
// node-environment tests.
import { vi } from "vitest";

const INERT_ENV: Record<string, string> = {
  NODE_ENV: "test",
  PAYLOAD_SECRET: "test-only-secret-not-a-real-key-0000000000",
  DATABASE_URI: "postgresql://ndm_runtime@127.0.0.1:5432/noujoude_test",
  AI_CURATOR_ENABLED: "false",
  OTEL_EXPORTER_OTLP_ENDPOINT: "",
  S3_ACCESS_KEY_ID: "",
  S3_SECRET_ACCESS_KEY: "",
  // `src/lib/server/media/request-limits.ts` reads this and refuses to run in-process limiting under a
  // deployment that declares Redis (register SR-04). Vitest loads no dotenv file, so without this line the
  // suite inherits whatever the shell that started it happens to export — and a machine that carries a real
  // deployment value would turn every rate-limit test red for a reason that has nothing to do with the code
  // under test. Empty means "unset" to the parser, which is the state `.env.example` ships in.
  RATE_LIMIT_REDIS_URL: "",
};

for (const [k, v] of Object.entries(INERT_ENV)) process.env[k] = v;

// Integration tests must opt in explicitly and must target `noujoude_test`,
// never the development database. A missing opt-in fails loudly instead of
// writing to real data.
//
// The call sits at the top level because vitest hoists `vi.mock` above the imports and above any
// condition wrapped around it — measured on vitest 4.1.12, which prints
// "Although it appears nested, it will be hoisted and executed before any tests run" for the nested
// form. A guarded `if (!process.env.NDM_ALLOW_INTEGRATION) { vi.mock(…) }` is therefore a guard that
// does not guard: the mock registers either way. The opt-in test belongs inside the factory, which
// vitest calls lazily, only when something actually imports the aliased module.
//
// `@/lib/db` has no file behind it yet — measured: `src/lib/` holds `media` and `server` only. So both
// branches refuse, and they refuse for different reasons, because a run that opted in and got a fake
// database would be a run reporting evidence about nothing.
vi.mock("@/lib/db", () => {
  if (process.env.NDM_ALLOW_INTEGRATION) {
    throw new Error(
      "NDM_ALLOW_INTEGRATION is set, but @/lib/db has no implementation yet — the database layer is " +
        "Phase 2 work (docs/IMPLEMENTATION_PLAN.md line B4). An integration suite cannot be written " +
        "against a module that does not exist.",
    );
  }
  throw new Error(
    "Integration tests require NDM_ALLOW_INTEGRATION=1 and a noujoude_test database. " +
      "Refusing to touch the development database (Technology Standard §3.4).",
  );
});
