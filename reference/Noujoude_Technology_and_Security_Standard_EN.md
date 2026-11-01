# NOUJOUDE DIGITAL HERITAGE MUSEUM
# TECHNOLOGY & SECURITY STANDARD

**Document ID:** NDM-TECH-STD-001  
**Version:** 1.0.0  
**Status:** Binding Engineering Baseline — Provider-Specific Configuration Pending  
**Applies to:** Greenfield V1 application, development, CI/CD, staging, production, and administrative operations  
**Last verified against official references:** 30 October 2026

---

## 1. Purpose and authority

This standard defines the approved technical direction, security baseline, compatibility rules, quality tooling, and operational engineering controls for Noujoude. It implements the product requirements in `Noujoude_Master_Specification_EN.md`; it does not redefine product behavior.

The application is a **greenfield build** inside the supplied `no` workspace. The engineering team must not assume an existing application architecture. It must preserve the user's supplied reference files and original asset library.

## 2. Approved architecture

### 2.1 Architecture pattern

Use a **modular monolith** for V1. Keep the deployment topology simple while preserving strong domain boundaries. Do not introduce microservices, Kubernetes, multiple ORMs, or multiple competing CMS/database systems without an Architecture Decision Record (ADR) demonstrating a concrete need.

Required logical boundaries:

1. Public presentation and visitor experience.
2. CMS and administration.
3. Museum domain services.
4. Authentication and authorization.
5. Persistence and database access.
6. Media storage and processing.
7. Search and discovery.
8. AI Curator and retrieval governance.
9. Background jobs.
10. Observability and audit.
11. External integrations.

### 2.2 Primary technology stack

| Layer | Approved direction | Constraints |
|---|---|---|
| Language | TypeScript | `strict: true`; avoid `any`; type public boundaries and domain contracts |
| UI framework | React | Select the version compatible with the chosen Next.js and Payload release |
| Full-stack framework | Next.js App Router | Use a stable release supported by the selected Payload version |
| CMS / Admin | Payload CMS 3.x stable | Customize the admin UI and workflows; do not ship a generic unmodified CMS |
| Runtime | Node.js 24 LTS, latest supported patch | Current Payload installation requirements accept `^22.23.4 || >=24.22.1`; use Node 24 LTS as the conservative V1 baseline unless a documented compatibility test justifies Node 26 LTS |
| Package manager | pnpm | Commit `pnpm-lock.yaml`; use reproducible installs |
| Database | PostgreSQL 18.x, latest supported minor | Use stable releases only; as verified 30 Oct 2026, official versioning lists 18.6 as current minor |
| Payload database adapter | Official `@payloadcms/db-postgres` | It uses Drizzle ORM and `node-postgres` |
| ORM/schema layer | Drizzle through Payload adapter | Do not add Prisma as a parallel ORM; use Payload's migration workflow and adapter-supported extensions |
| Validation | Zod plus server-side domain validation | Client validation is usability only; server validation is authoritative |
| Rich text | Payload-supported Lexical integration where appropriate | Sanitize/render safely; no arbitrary executable HTML/script |
| Image processing | `sharp` where compatible | Preserve originals; produce traceable derivatives |
| Object storage | Private S3-compatible object storage | Vendor-neutral interface; versioning and protected deletion required |
| Background jobs | Payload Jobs initially | Add a separate queue/worker only with measured need and an ADR |
| Unit/integration tests | Vitest | Test domain rules, services, validators, permissions, and workflows |
| Browser/E2E | Playwright | Test public and admin critical journeys in English and Arabic |
| Accessibility automation | axe-core or equivalent | Automation supplements, not replaces, manual review |
| Telemetry | OpenTelemetry | Traces, metrics, structured logs, OTLP-compatible export |
| Source control | Git | Coherent milestone commits; no destructive history rewrites |
| Local infrastructure | Docker Compose where useful | Non-production local dependencies only; secure configuration |

### 2.3 Version-selection gate

Do not blindly install `latest`, canary, beta, experimental, or release-candidate packages.

Before scaffolding:

1. Check official Payload installation requirements.
2. Check supported Next.js versions.
3. Check React peer dependency ranges.
4. Check Node.js engine ranges for every core package.
5. Check PostgreSQL adapter and Drizzle migration compatibility.
6. Check image-processing and deployment adapter compatibility.
7. Select one stable compatible set and pin exact resolved versions in the lockfile.
8. Save package versions and official documentation references in `docs/ARCHITECTURE_DECISIONS.md`.
9. Run a clean install, typecheck, test, and production build before proceeding.

**Current compatibility evidence at the document verification date:**

- Payload installation documentation lists Node.js `^22.23.4 || >=24.22.1` and supported Next.js ranges including `16.2.6+`, with specific supported 15.x patches.
- Node.js 24 and 26 are listed as LTS branches on the official release schedule. Node 24 is chosen here as the conservative V1 baseline because ecosystem compatibility is more mature; Node 26 may be adopted after the exact dependency matrix passes.
- Next.js 16.2 is a stable release and the official Next.js policy lists 16.x as Active LTS.
- PostgreSQL 18 is supported; the official versioning page lists 18.6 as the current minor on the verification date.
- Payload's official PostgreSQL adapter explicitly uses Drizzle and `node-postgres`.

The project must refresh this compatibility check whenever initial dependency installation or a major upgrade occurs.

## 3. Database engineering rules

### 3.1 One schema authority

Payload's PostgreSQL adapter and its Drizzle-backed migration system are the schema authority for Payload-managed collections and globals. Do not also install Prisma or another ORM to independently manage the same schema.

Custom domain tables may be added using the documented Payload/Drizzle extension and migration mechanisms. Name ownership, foreign keys, indexes, and migration order must be explicit.

### 3.2 Database roles

Use separate database roles for:

- Schema migration/DDL operations.
- Runtime application operations.
- Read-only reporting or analytics access where required.
- Backup/restore operations, controlled outside the CMS.

The runtime role must not be a database superuser and must not have unnecessary DDL privileges. Migration credentials must not be present in browser bundles or the CMS settings UI. Backup credentials must be isolated from normal application credentials.

### 3.3 Integrity and performance

- Primary keys must be stable and never derived from localized labels.
- Foreign keys and deletion behavior must preserve referential integrity.
- Index fields used by approved filters, joins, full-text search, and routes.
- Use transactions for multi-record workflows that must commit atomically.
- Prevent concurrent editors from silently overwriting consequential content.
- Do not delete historical claims, evidence, rights, audit events, or revisions through cascading deletes without an approved retention rule.
- Use PostgreSQL full-text search and appropriate trigram indexes for V1 where sufficient. Add a dedicated search engine only after requirements and measured load justify it.
- Use `pgvector` only when an approved embedding/retrieval model and operational use case are selected. Do not hard-code a vector dimension before selecting and testing the embedding model.

### 3.4 Migration discipline

- Every schema change must be a committed migration.
- Production migrations must be reviewed and run through controlled deployment steps.
- Never use development schema-push behavior against production.
- Test fresh database creation and upgrade from the immediately preceding schema.
- Provide rollback or forward-recovery instructions for risky changes.
- Back up before destructive or data-transforming migrations.

## 4. Identity, authentication, and authorization

### 4.1 Authentication

Use Payload's supported authentication capabilities or a maintained OIDC-compatible provider where the chosen deployment requires managed identity. Do not write custom cryptographic authentication mechanisms.

Administrative users must use strong authentication. MFA is mandatory for Owner and privileged administrative accounts. If the selected identity mechanism does not natively provide suitable MFA, integrate a reputable maintained provider or implementation and record the decision.

When local passwords are used:

- Use a modern password hashing algorithm such as Argon2id with reviewed parameters.
- Never store plaintext or reversibly encrypted passwords.
- Use secure password reset and account recovery flows.
- Rate-limit login, reset, and verification attempts.

### 4.2 Authorization

Implement both Payload access control and application/domain authorization. Apply least privilege at the route, operation, collection, field, and record level as applicable.

- Deny by default.
- Check authorization on the server for every protected operation.
- Do not trust client-supplied role, owner, state, locale, or record identifiers.
- Protect against IDOR and privilege escalation.
- Enforce separation of duties for evidence review and publication where roles are distinct.
- Protect Owner authority from ordinary administrators.
- Test positive and negative access cases for all twenty Control Center modules.

Row-Level Security may be used as defense in depth when compatible with Payload's connection and migration model. It must be tested with the actual runtime database role; never assume an RLS policy is effective if the runtime role bypasses it.

### 4.3 Session and high-risk operation controls

Use secure, HttpOnly, SameSite cookies and HTTPS-only settings in production. Establish session expiration, revocation, re-authentication for sensitive actions, and safe account recovery. Protect role changes, Owner changes, rights approval, publication, destructive operations, export, and recovery actions with appropriate confirmation and audit.

## 5. Application and API security

The implementation must be reviewed against OWASP ASVS 5.0.0, targeting Level 2 by default and adding risk-based controls for privileged and high-impact functions.

Minimum controls include:

- Context-sensitive output encoding and safe rich-text rendering.
- Input validation on every untrusted boundary.
- Parameterized database operations.
- CSRF protection where cookie-authenticated state changes are exposed.
- Strict Content Security Policy and security headers configured for production.
- HSTS once HTTPS and subdomain policy are confirmed.
- Protection against XSS, SQL injection, command injection, SSRF, open redirects, path traversal, insecure deserialization, and unsafe file processing as applicable.
- Rate limits on authentication, contact forms, search, AI, upload, and public expensive routes.
- Request size, body size, timeout, and pagination limits.
- Safe error responses without stack traces, secrets, or internal implementation details.
- CORS allowlists; never use permissive wildcards with credentialed access.
- Dependency audit and vulnerability response process.
- Secure cookies and session handling.
- No secrets or privileged values in `NEXT_PUBLIC_*` variables, source maps, HTML, logs, screenshots, or client-side bundles.

## 6. Media and object-storage security

- Keep original collection photography and documentary files private by default until rights and publication approval are recorded.
- Use separate logical policies for public derivative assets and restricted originals.
- Use short-lived signed URLs for private assets.
- Validate MIME type, magic bytes, extension, file size, dimensions, and allowed formats.
- Scan uploaded files for malware where the selected infrastructure supports it.
- Re-encode web-display derivatives; never treat an extension change as sanitization.
- Prevent SVG/script payloads and unsafe document previews from executing in the application origin.
- Keep object storage credentials server-side.
- Enable versioning and protected deletion for original assets.
- Record original/derivative lineage, checksums, rights, and usage links.

## 7. AI Curator security

- Enforce source-level permissions before retrieval, not after generation.
- Public AI may retrieve only eligible published, rights-cleared, public knowledge records.
- Exclude inquiries, personal data, credentials, private notes, drafts, restricted artifacts, and internal control data.
- Treat retrieved documents as untrusted data, never as executable instructions.
- Defend against prompt injection and data-exfiltration attempts.
- Require source references for factual answers where supported.
- Do not state unverified claims with certainty.
- Maintain red-team tests for restricted-source disclosure, malicious documents, prompt injection, citation mismatch, and hallucination.
- Keep provider credentials masked and replaceable through a server-side adapter.
- Record AI configuration and policy revisions; do not permit the AI to self-approve content.

## 8. Accessibility and experience quality

Target WCAG 2.2 Level AA for public and administrative experiences.

Test semantic structure, keyboard access, focus visibility, form labels, error announcements, contrast, target sizes, modal behavior, image viewer controls, reduced motion, screen-reader navigation, and RTL/LTR behavior. Automated axe checks are required in CI for key pages, followed by manual testing of key visitor and admin flows.

## 9. Performance baseline

At the 75th percentile, target:

- LCP ≤ 2.5 seconds.
- INP ≤ 200 milliseconds.
- CLS ≤ 0.1.

Include at minimum Home, The Museum, Country World, Collection, Artifact Detail, Story, Search, and Control Center critical routes in performance test coverage.

Use responsive images, dimensions, controlled preloading of the primary hero, lazy loading below the fold, caching with clear invalidation, and no unnecessary client-side JavaScript. Preserve documentary image details.

## 10. OpenTelemetry and operational monitoring

Implement OpenTelemetry traces, metrics, and structured logs with OTLP-compatible export. Instrument request paths, database operations, Payload hooks, background jobs, media, search, AI calls, and external integrations.

Minimum service indicators:

- Request throughput, latency percentiles, and error rate.
- Database availability, query latency, pool saturation, and connection failures.
- Background job queue depth, retries, and failed jobs.
- Search latency and error rate.
- Media upload/delivery failures.
- AI latency, failure rate, token/cost usage where available, and safety denials.
- Authentication failures and suspicious access patterns.
- Backup success and restore-test status.

Telemetry must avoid personal/inquiry content, credentials, tokens, and unnecessary sensitive identifiers. Define retention, access, and alert routing before production. Vendor selection is independent of the OpenTelemetry instrumentation standard.

## 11. Backup, recovery, and production service objectives

These are proposed engineering targets, not a claim that a hosting vendor already meets them:

| Service/data class | Target RPO | Target RTO |
|---|---:|---:|
| PostgreSQL primary data | ≤ 1 hour | ≤ 4 hours |
| Original media and critical object storage | ≤ 4 hours | ≤ 8 hours |
| Application config and deployment artifacts | ≤ 24 hours | ≤ 4 hours |

Baseline backup policy:

- Daily encrypted database backup plus WAL/PITR or equivalent to meet the database RPO.
- Retain 35 daily, 12 weekly, and 12 monthly recovery points unless legal, cost, or provider constraints require a documented Owner decision.
- Enable object versioning and protected deletion; keep independent recoverable copies of critical originals.
- Use isolated backup identities and credentials.
- Test restores quarterly and before major database/storage migrations.
- Record measured recovery times, recovery points, integrity checks, and remediation actions.

Target monthly availability objective for V1 is 99.5%, subject to the actual provider/support plan and formal Owner acceptance. Do not publish an SLA based solely on this internal objective.

## 12. Testing, CI, and release controls

Required checks:

1. Formatting and lint.
2. Strict TypeScript typecheck.
3. Unit tests for domain and validation logic.
4. Integration tests for database, CMS hooks, access control, jobs, and storage adapters.
5. Playwright end-to-end tests for key public/admin routes in both locales.
6. Accessibility automated checks plus manual audit records.
7. Security checks mapped to ASVS controls and negative authorization tests.
8. Dependency and secret scanning.
9. Production build.
10. Database migration verification and restore test.
11. SEO route and metadata checks.
12. Performance measurements and regression checks.

Do not deploy production without explicit Owner authorization. Do not use mock functionality as release evidence. Commit only coherent working milestones.

## 13. Approved defaults versus Owner inputs

Engineering defaults that Qwen must decide and document without asking the Owner:

- Component boundaries and naming.
- Database indexes and safe constraints.
- Form validation and error presentation.
- Responsive breakpoints within the design system.
- Test organization and fixtures.
- Telemetry instrumentation approach.
- Cache implementation within the invalidation rules.
- Standard accessible interactions.

Owner inputs that must not be fabricated:

- Institutional legal identity and jurisdiction.
- Actual founder story and attributions.
- Real artifact inventory and factual data.
- Ownership, provenance, authenticity evidence.
- Image/document rights and licenses.
- Official contact details.
- Approval of operational costs, providers, and formal service commitments.

Implement the required workflows and placeholders; keep unapproved facts out of public output.

## 14. Compatibility and official references

The following official references were checked on 30 October 2026. Recheck them when choosing or upgrading the exact package versions:

- Payload installation requirements: https://payloadcms.com/docs/getting-started/installation
- Payload PostgreSQL adapter / Drizzle: https://payloadcms.com/docs/database/postgres
- Payload access control: https://payloadcms.com/docs/access-control/overview
- Payload localization: https://payloadcms.com/docs/configuration/localization
- Payload versions and drafts: https://payloadcms.com/docs/versions/overview
- Next.js support policy: https://nextjs.org/support-policy
- Node.js release schedule: https://nodejs.org/en/about/previous-releases
- PostgreSQL versioning: https://www.postgresql.org/support/versioning/
- OWASP ASVS: https://asvs.owasp.org/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Core Web Vitals thresholds: https://web.dev/articles/defining-core-web-vitals-thresholds
- OpenTelemetry specification: https://opentelemetry.io/docs/specs/otel/

## 15. Non-negotiable technical prohibitions

- No Prisma alongside Payload's Drizzle-backed PostgreSQL adapter.
- No dual competing migration systems.
- No canary/alpha/beta/RC dependencies in production without written exception.
- No plaintext passwords or homemade crypto.
- No frontend-only authorization.
- No public access to private originals or restricted artifacts.
- No raw SQL, shell, secret, or infrastructure controls through ordinary CMS UI.
- No invented metrics, security compliance, or backup success claims.
- No deployment to production without Owner authorization.
- No silent downgrade of RPO/RTO, accessibility, performance, or security requirements.
