// Vitest global setup.
// Purpose: guarantee that no test can accidentally read real credentials or
// reach a real provider, and that server-only env reads are still allowed in
// node-environment tests.
import { vi } from 'vitest';

const INERT_ENV: Record<string, string> = {
  NODE_ENV: 'test',
  PAYLOAD_SECRET: 'test-only-secret-not-a-real-key-0000000000',
  DATABASE_URI: 'postgresql://ndm_runtime@127.0.0.1:5432/noujoude_test',
  AI_CURATOR_ENABLED: 'false',
  OTEL_EXPORTER_OTLP_ENDPOINT: '',
  S3_ACCESS_KEY_ID: '',
  S3_SECRET_ACCESS_KEY: '',
};

for (const [k, v] of Object.entries(INERT_ENV)) process.env[k] = v;

// Integration tests must opt in explicitly and must target `noujoude_test`,
// never the development database. A missing opt-in fails loudly instead of
// writing to real data.
if (!process.env.NDM_ALLOW_INTEGRATION) {
  vi.mock('@/lib/db', () => {
    throw new Error(
      'Integration tests require NDM_ALLOW_INTEGRATION=1 and a noujoude_test database. ' +
        'Refusing to touch the development database (Technology Standard §3.4).',
    );
  });
}
