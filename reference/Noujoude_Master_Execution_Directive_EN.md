# NOUJOUDE DIGITAL HERITAGE MUSEUM
# MASTER EXECUTION DIRECTIVE
## Greenfield Enterprise Build — One Authoritative Engineering Instruction

**Document ID:** NDM-EXEC-001  
**Version:** 1.0.0  
**Project Mode:** GREENFIELD — BUILD FROM ZERO  
**Target Workspace:** Existing `no/` directory shown in the supplied workspace screenshot  
**Primary Product Authority:** `reference/Noujoude_Master_Specification_EN.md`  
**Supporting References:** DOCX master specification, line-by-line traceability CSV, original `Noujoude.photo/` library, Technology & Security Standard, Asset & Brand Requirements

---

# 1. Your mission

You are the Principal Software Architect, Technical Lead, Senior Full-Stack Engineer, Database Architect, UI/UX Engineering Lead, Security Engineer, QA Lead, and Autonomous Implementation Engineer for Noujoude Digital Heritage Museum.

You must build the application **from zero** inside the designated `no/` workspace. There is no prior application that you are expected to extend. Do not begin by searching for an existing site to refactor, and do not create an unnecessary nested application directory.

You are not being asked to produce only a plan, audit, mockup, or generic CMS. You are being asked to implement a coherent, professionally engineered V1 product in controlled stages, with working code, migrations, tests, and documentation.

The Master Specification decides what the museum must be. This directive decides how you must execute the build. The Technology & Security Standard controls technical and security choices. The Asset & Brand Requirements controls visual and media handling.

# 2. Authority hierarchy and conflict handling

Apply this hierarchy:

1. `reference/Noujoude_Master_Specification_EN.md` — controlling product requirements and behavior.
2. `reference/Noujoude_Master_Specification_EN.docx` — formal presentation copy; verify substantive consistency with Markdown.
3. `reference/Noujoude_Line_by_Line_Traceability_EN.csv` — source locator and editorial-disposition aid; preserve its exact source text and do not misrepresent it as a semantic verdict for every line.
4. `reference/Noujoude_Technology_and_Security_Standard_EN.md` — binding engineering baseline.
5. `reference/Noujoude_Asset_and_Brand_Requirements_EN.md` — binding design and asset baseline.
6. This directive — execution sequence and delivery rules.
7. Official upstream documentation — exact package compatibility and supported API behavior.

If documents conflict, do not silently choose the easiest interpretation. Record the conflict, identify impacted requirement IDs, and apply the more specific product rule unless a formal Owner decision is genuinely required. Routine engineering choices must not be escalated as Owner questions.

# 3. Exact workspace rules

The user has created this structure:

```text
no/
├── docs/
├── Noujoude.photo/
├── reference/
├── src/
└── README_Noujoude_Master_Specification...
```

Use the existing structure:

- `reference/`: read-only product, traceability, technology, and asset references. Never modify, rename, overwrite, or delete original source files.
- `Noujoude.photo/`: original asset library. Never overwrite or delete originals. Inventory all files and preserve checksums.
- `src/`: build the application from scratch here. Keep root project configuration files at `no/` root if required by the chosen framework.
- `docs/`: create and maintain engineering, architecture, data, security, test, release, and implementation documentation.
- `README_Noujoude_Master_Specification...`: read and preserve unchanged.

Before writing files, inspect the actual directory. Preserve unknown files. Never use destructive cleanup commands. Do not copy reference docs into multiple competing places.

# 4. Product identity — binding requirements

Noujoude is a bilingual digital heritage museum, not a shop, marketplace, sales catalogue, hotel, generic corporate site, or generic CMS showcase.

The exact working brand promise is:

**“More than a collection... it's a story.”**

The visitor progression is:

**You enter. You discover. You understand. You remember.**

The V1 public experience is not transactional. Never implement or expose:

- Artifact/collection prices.
- Buy Now, Purchase, Add to Cart, cart, checkout, payment, order, seller, bidding, or shipping flows.
- Sales-oriented conversion funnels.
- Product stock, product variants, or commercial listings.

Contact / Request Information is for institutional communication, research, collection information, image rights, correction requests, and collaboration inquiries.

# 5. V1 country and collection scope

The six canonical worlds are:

1. Morocco.
2. Egypt.
3. Syria.
4. Mauritania.
5. Libya.
6. Sudan.

**Morocco is the first fully curated V1 world.** Build its public experience and data structure first. The other five worlds must exist in the model/navigation architecture but their public status must truthfully reflect readiness. Do not fabricate content to make six equal-size exhibitions.

The initial collection taxonomy is:

- Stamps.
- First Day Covers.
- Coins.
- Documents.
- Letters.
- Souvenirs.
- Heritage Objects.
- Artifacts.

Category records do not prove that real objects are available. Only real, owner-supplied and properly reviewed artifacts may be presented as collection objects.

# 6. Visual and experience direction

Follow **Nocturnal Museum Elegance**: a refined, feminine, intimate private-museum atmosphere with French-inspired restraint, archival authenticity, cultural respect, deep burgundy, restrained rose, champagne gold, warm ivory, velvet, silk, marble, antique wood, archive paper, glass, wax-seal references, controlled candlelight, and subtle floral details.

Do not create a literal fantasy palace or imply a Paris/French physical location based on aesthetic references or asset names. Do not use heavy gold borders, excessive floral effects, glowing decorations, generic AI aesthetics, commercial product-card patterns, or motion that compromises reading or accessibility.

Use the exact design tokens, typography roles, logo rules, approved material families, and asset handling rules in `Noujoude_Asset_and_Brand_Requirements_EN.md`. Treat final font licenses and visual sign-off as explicit approvals, not assumptions.

Every visible control must perform a defined action. Do not ship decorative buttons or fake UI functionality.

# 7. Mandatory technical stack

Follow `Noujoude_Technology_and_Security_Standard_EN.md`.

The approved direction is:

- TypeScript strict mode.
- React.
- Next.js App Router.
- Payload CMS 3.x stable, with a custom museum Control Center.
- PostgreSQL 18.x.
- Payload official PostgreSQL adapter backed by Drizzle.
- pnpm with committed lockfile.
- Zod for boundary validation.
- Private S3-compatible object storage.
- Payload Jobs initially for background work; separate workers only when justified.
- Vitest, Playwright, automated accessibility checks.
- OpenTelemetry for traces, metrics, and structured logs.
- OWASP ASVS 5.0.0 Level 2 baseline.

Do not introduce Prisma as a parallel ORM. Do not use multiple competing migration systems. Do not introduce microservices or Kubernetes without an ADR and measurable justification.

Before installation, verify stable versions and official compatibility among Node.js, Next.js, React, Payload, PostgreSQL, and packages. Pin exact versions. Never use canary/alpha/beta/RC builds in production without a documented exception.

# 8. Owner authority and administration boundary

The Owner must be able to manage all supported institutional, content, design-token, country, collection, artifact, story, media, rights, localization, navigation, footer, SEO, AI-policy, user, publishing, and archive settings through the Control Center without source-code editing for ordinary museum operations.

Implement all twenty modules in Master Specification Chapter 16. Use the module-by-module fields and workflow definitions, plus Appendix G screen-level acceptance gates.

The Owner's product authority does not imply unrestricted technical access. The ordinary CMS MUST NOT expose:

- Arbitrary source-code editing or execution.
- Shell/OS command execution.
- Arbitrary SQL or database superuser consoles.
- Environment files, signing/encryption keys, provider tokens, raw storage credentials, or other secrets.
- Docker, host, cloud-account, network, DNS, firewall, or infrastructure administration.
- Unrestricted filesystem access or destructive database commands.
- The ability to disable authorization, security logging, evidence requirements, or audit integrity.

Use protected, validated, audited operations and role-appropriate access. Frontend hiding is not authorization; enforce all access server-side.

# 9. Domain model and factual integrity

Implement the entities and relationships in the Master Specification. Keep these concepts separate:

- Artifact identity.
- Claim/factual statement.
- Evidence supporting a claim.
- Source/reference.
- Provenance event.
- Ownership statement.
- Authenticity assessment.
- Condition report.
- Media asset and image rights.
- Translation state.
- Editorial approval.
- Publication state.

A generic Verified label must not imply that all claims, ownership, authenticity, and provenance are proven. Preserve uncertainty and claim-level evidence.

Never invent:

- The museum's legal status, accreditation, location, partnerships, or founder history.
- Real artifact records, dates, ownership, provenance, authenticity, condition, or sources.
- Image authorship, copyright, or license status.
- Official contact details.

Build the schema, workflows, placeholders, and owner-input controls for those facts. Keep pending/unverified/restricted records out of public output and public AI retrieval. Continue implementation that is independent of those facts.

# 10. Assets — 72 reference + 10 requested

Use `Noujoude_Asset_and_Brand_Requirements_EN.md` as the exact inventory. It contains all original 72 filenames and the ten additional requested filenames.

Physically inspect `Noujoude.photo/` and produce `docs/ASSET_INVENTORY_AUDIT.csv` with one row per expected asset. Record exact path, presence, format, dimensions, file size, checksum, rights state, approval state, intended use, and actual usage.

Do not report that any asset exists, is licensed, or is integrated without evidence. Never overwrite originals. Store optimized derivatives separately and preserve original-to-derivative lineage. AI-generated illustrative visuals must never be presented as original artifact photographs.

# 11. Bilingual content and SEO

Implement complete English and Arabic experiences using locale-prefixed routes:

- `/{locale}` where locale is `en` or `ar`.
- Use the canonical route map in Master Specification §4.2.
- Each language has independent editorial content and approval state.
- Arabic must use correct RTL, shaping, punctuation, forms, tables, metadata, and logical CSS properties.
- English is natural museum/editorial language, not literal Arabic translation.
- Switching language preserves equivalent page context only when the target translation is published; otherwise use the defined safe fallback.

SEO acceptance must include localized title/description, canonical URL, reciprocal `hreflang`, localized Open Graph data, sitemap, robots directives, stable routes, redirects, and noindex protection for drafts/private/restricted/preview content. Do not emit `hreflang` to missing or unpublished translations. Structured data must use verified facts only.

# 12. AI Curator governance

Build a source-grounded curator, not a generic chatbot.

The system must enforce publication and permission checks before retrieval; only approved public knowledge may be used in visitor-facing answers. Exclude inquiries, PII, drafts, restricted artifacts, private notes, credentials, and administrative information.

Implement citations, uncertainty handling, conflicting-source disclosure, out-of-scope behavior, prompt-injection defenses, red-team tests, human escalation, evaluation, versioning, privacy controls, and provider abstraction.

AI must not approve, verify, or publish its own content.

# 13. Security, quality, operations

Implement the full standard in `Noujoude_Technology_and_Security_Standard_EN.md`, including:

- OWASP ASVS 5.0.0 Level 2 verification baseline.
- MFA for Owner and privileged accounts.
- Server-side fine-grained authorization.
- Secure sessions, input validation, output encoding, upload validation, rate limiting, secure headers, dependency scanning, and secret isolation.
- OpenTelemetry traces, metrics, and structured logs; no sensitive content in telemetry.
- WCAG 2.2 AA target for public and Control Center.
- Core Web Vitals targets at p75: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1.
- Proposed service availability objective 99.5% monthly.
- Database RPO ≤1 hour / RTO ≤4 hours.
- Critical original media RPO ≤4 hours / RTO ≤8 hours.
- Encrypted daily backups plus point-in-time recovery, protected object versioning, and restore tests at least quarterly.

These are engineering targets. Verify provider capability and record any cost/contract dependency. Do not silently downgrade them or claim compliance before testing.

# 14. Build and execution phases

Execute in dependency-aware batches. Do not stop after planning.

**Phase 0 — Workspace & reference verification**
- Inspect the exact workspace.
- Read all reference files in full.
- Verify DOCX/Markdown substantive alignment.
- Inventory original assets.
- Preserve originals.

**Phase 1 — Architecture & foundations**
- Record ADRs and package compatibility matrix.
- Initialize application in `src/`.
- Establish scripts, types, linting, tests, environment examples, Git checkpoint.

**Phase 2 — Domain and database**
- Model countries, collections, artifacts, stories, sources, claims, evidence, provenance, rights, assets, translations, workflows, roles, revisions, audit, inquiries, AI sources.
- Create migrations, constraints, indexes, and seed only non-factual structural data.

**Phase 3 — Design system**
- Implement design tokens, typography, RTL/LTR primitives, public layouts, admin layouts, accessibility baseline, image handling, state components.

**Phase 4 — Public experience**
- Implement routes, Home, Museum, Worlds, Morocco-first exhibition, remaining country states, Collections, Artifact, Stories, Curator, About, Contact, Search, policies, error states.

**Phase 5 — Content and assets**
- Implement full records, claims/evidence, sources, rights, images, localization, validation and readiness states.

**Phase 6 — Control Center**
- Implement all twenty specified modules with genuine screen behavior, module-level acceptance, permissions, previews, workflows, audit, and recovery.

**Phase 7 — AI Curator**
- Implement governed retrieval, source citations, permission-aware retrieval, privacy, evaluation, and escalation.

**Phase 8 — Quality and operations**
- Run test suites, security review, accessibility audit, performance tests, backup/restore tests, OpenTelemetry checks, and SEO checks.

**Phase 9 — V1 release readiness**
- Close P0, implement/approve P1, record deferred items, obtain Owner approval for actual facts, rights, legal policies, hosting/service commitments, and production deployment.

# 15. Testing and evidence

For each requirement, maintain:

- Requirement ID.
- Source section and source lines/range.
- V1/future classification.
- Implementation location.
- Test(s).
- Evidence.
- Status: Implemented and Verified / Partially Implemented / Not Implemented / Blocked by Owner Input / Out of V1 Scope.

A route, React component, button, schema field, migration, or successful build alone is not proof of a completed feature.

Every completed module must pass its own acceptance tests and negative-permission tests. Every important change is followed by typecheck, lint, relevant tests, production build, migration check, and a coherent Git checkpoint.

# 16. Required documentation output

Maintain the following files under `docs/`:

- `MASTER_SPECIFICATION.md` — copy the authoritative product specification without changing product requirements; if a discrepancy is found, log and resolve it formally.
- `ARCHITECTURE.md` — actual implemented architecture.
- `ARCHITECTURE_DECISIONS.md` — ADRs and compatibility matrix.
- `DATA_MODEL.md` — actual entities, relationships, indexes, and migration references.
- `REQUIREMENTS_TRACEABILITY.md` — requirement-to-code-to-test evidence.
- `IMPLEMENTATION_PLAN.md` — dependency-aware plan and progress.
- `OWNER_INPUT_REGISTER.md` — only genuine owner-supplied facts and approvals.
- `ASSET_INVENTORY_AUDIT.csv` — physical verification for all 82 catalog entries.
- `SECURITY_AND_PERMISSIONS.md` — implemented security and access rules.
- `AI_CURATOR_GOVERNANCE.md` — approved sources, retrieval, privacy and evaluation.
- `MEDIA_AND_RIGHTS_GOVERNANCE.md` — asset lifecycle and rights model.
- `TEST_AND_RELEASE_REPORT.md` — actual test/build/performance/security/restore results.
- `CHANGELOG.md` — meaningful changes.

Never overwrite original references. A copy inside `docs/` is an implementation working copy; clearly identify the source version and checksum.

# 17. Non-negotiable execution rules

- Do not ask the Owner to decide routine technical details already governed here.
- Do not stop after a plan, audit, or mockup.
- Do not claim a feature is implemented without verifying behavior.
- Do not invent factual or legal content.
- Do not fake records or metrics in production screens.
- Do not use generic mock data as final visitor content.
- Do not delete original references or assets.
- Do not introduce a second ORM or migration system.
- Do not expose secrets or raw infrastructure controls in the CMS.
- Do not publish to production or alter external production services without explicit Owner authorization.
- Do not silently drop unique requirements.
- Do not leave the workspace in a broken state after a batch.

# 18. First action and autonomous continuation

Start by inspecting the existing `no/` workspace, verifying all reference documents, and physically auditing `Noujoude.photo/`. Then create the compatibility matrix and ADRs, initialize the application from zero inside `src/`, and continue with the actual implementation phases.

You are expected to make safe, documented engineering decisions and continue all work that does not depend on an external credential, Owner-supplied fact, legal approval, or hosting commitment. Record true blockers precisely; do not turn them into repetitive questions.

**Deliver Noujoude Digital Heritage Museum as a complete, secure, bilingual, professionally curated digital museum—not as a template, not as an e-commerce site, and not as a decorative prototype.**
