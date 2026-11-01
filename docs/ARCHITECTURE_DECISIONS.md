# Noujoude Digital Heritage Museum — Architecture Decisions & Version Compatibility Matrix

**Document ID:** NDM-ARCH-ADR-001
**Phase:** 1 (Architecture & Foundations)
**Status:** Decisions recorded; dependency installation NOT yet performed
**Date of version verification:** 31 October 2026
**Prepared by:** Principal Software Architect (autonomous engineering decisions per Directive §17)

Governing inputs: `reference/Noujoude_Technology_and_Security_Standard_EN.md` (binding engineering baseline),
`reference/Noujoude_Master_Specification_EN.md` (binding product requirements),
`reference/Noujoude_Master_Execution_Directive_EN.md` (execution sequence).

---

## 1. Verification method

Every version claim below was resolved on 31 October 2026 by direct query of the named official source, not
carried over from the Technology Standard's 30 October 2026 verification pass. Methods used:

| Evidence type | Source queried | How |
|---|---|---|
| Package latest stable, `engines`, `peerDependencies`, dist-tags | `https://registry.npmjs.org/<pkg>` | Direct registry fetch, `dist-tags.latest` + that version's manifest |
| **Exact dependencies declared by a pinned artifact** | `https://registry.npmjs.org/@payloadcms%2Fdb-postgres/3.92.1` and `…/payload/3.92.1` | Direct fetch of the *version-specific* document, HTTP 200, `dependencies` / `peerDependencies` / `engines` read verbatim. This is a different measurement from `dist-tags.latest` and must not be confused with it (§3 lead-in). |
| **Package list at a pinned git tag** | `gh api 'repos/payloadcms/payload/contents/packages?ref=v3.92.1'` | rc=0, 44 names; diffed against the default branch's 45 (ADR-025) |
| **Contents of the published artifact** | `payload-3.92.1.tgz` | downloaded and enumerated: 2831 entries (ADR-025) |
| Runtime support statement | `https://payloadcms.com/docs/getting-started/installation` | Fetched and quoted |
| **Database support statement** | `/docs/installation`, `/docs/databases/overview`, `/docs/databases/postgres`, `/docs/getting-started/installation` | All four fetched on 31 Oct 2026; three returned **HTTP 404**, the fourth states Node and Next ranges and **no database range**. Recorded as §3.2 A-C1 rather than as support. |
| Per-locale draft/publish capability | `https://payloadcms.com/docs/configuration/localization` | Fetched and quoted |
| Database release currency | `https://www.postgresql.org/support/versioning/` | Fetched and quoted |
| Node.js release currency | `https://nodejs.org/dist/index.json` | Fetched, LTS field read |
| Host toolchain | Local machine | `node -v`, `pnpm -v`, `git --version`, `docker --version` |
| **Container-engine liveness** | Local machine | `wsl -l -v`; then `docker context ls`, `docker compose version` (client-only) versus `docker version`, `docker info`, `docker ps -a`, `docker images` (daemon-requiring), each bounded by `timeout` with its exit code captured **before** any pipe so no `head`/`tee` status can mask a failure (§7.2.1) |

Every *version* in §3 is a measurement, not an assumption. Where a compatibility claim could not be measured it
is labelled **UNVERIFIED** or **ASSUMPTION** and is collected in **§3.2** rather than being folded silently into
the matrix. An earlier revision of this sentence read "No version in this document is an assumption"; that was
true of §3 and misleading of the document as a whole, and it is corrected here.

---

## 2. Host environment baseline — one hard blocker, one blocker that cleared, and one deliberate absence

This heading was once "one hard blocker". The second one arrived during Phase 1 rather than being inherited:
the container engine that answered at the start of the day stopped answering later (B-09, §7.2). Both are
measured, neither is assumed, and the `.env` absence is a third state that is *intentional* — the agreed scope
forbids this build from creating credentials.
**Measured 1 November 2026, the count is back to one hard blocker.** B-09 cleared itself by observation — the
daemon answers `docker info` with rc=0 (server 29.9.2), the mandated image is in the cache, and the harness that
B-09 blocked completed with exit 0 — while `wsl -l -v`, the probe that had been cited as proof of the outage,
still reports the distribution as Stopped (§7.2.1, and `docs/TEST_AND_RELEASE_REPORT.md` §0 for the same
comparison). B-01 remains, and the deliberate absence of `.env` is now the binding blocker on `pnpm db:up`.

| Tool | Installed | Required by decision | Verdict |
|---|---|---|---|
| Node.js | **v24.19.0** | `^22.23.4 \|\| >=24.22.1` (Payload 3.92.1 `engines`) | ❌ **FAILS** |
| pnpm | 11.21.0 | pnpm (Standard §2.2) | ✅ |
| npm | 11.17.0 | — | present, unused (pnpm is the authority) |
| Git | 2.56.0.windows.2 | Git (Standard §2.2) | ✅ |
| Docker CLI | 29.7.2 | Docker Compose for local deps | ✅ installed — client-side only; `docker --version` and `docker compose version` answer even with a dead daemon, which is why the daemon has its own row |
| Docker daemon | **Docker Desktop STOPPED** — `wsl -l -v` (exit 0) reports `docker-desktop Stopped`; every daemon-requiring command hangs to timeout (`docker version`, `docker info`, `docker ps -a`, `docker images` → **rc=124, 0 bytes**), while client-only commands answer (`docker context ls` → exit 0; `docker compose version` → exit 0, `v5.3.1`). Measured 31 Oct 2026, later than every other row in this table. | must be reachable at install time | ❌ **B-09 — see §7.2.1.** *Stopped* is not the same as *running but unhealthy*: no connection could be opened at all, so there is no daemon state to inspect. A registered pipe name is not a live daemon. |
| `postgres:18.6-alpine` | **PRESENT — measured 1 November 2026**: `docker images` (exit 0) lists `postgres:18.6-alpine 433MB`. Recorded as **UNKNOWN** while the daemon was stopped (B-09); the earlier note that the image was "not in the local image cache" stays withdrawn as unmeasurable. | ADR-004 mandates it | ✅ no pull needed for the evidence run; `scripts/db/run-privilege-tests.sh` used this image and reported server 18.6 (`docs/A5_PRIVILEGE_EVIDENCE.txt`) |
| `psql` client | absent | not required (container provides it) | ✅ acceptable |

**Blocker B-01 — Node.js is too old to install Payload.**
`payload@3.92.1` and `@payloadcms/next@3.92.1` declare `engines.node: "^22.23.4 || >=24.22.1"`. The host runs
v24.19.0, which is inside neither branch (24.19.0 < 24.22.1). Payload's own installation documentation states
the identical range, quoted in the block below.

Resolution: upgrade to **Node 24.22.2** (current newest 24.x, LTS codename *Krypton*), which satisfies
`>=24.22.1` and keeps the Standard's "Node 24 LTS conservative baseline" requirement (§2.2). This is an
environment action requiring the user; it is not performed silently. **No `pnpm install` can succeed against
the pinned set below until this is done.** Re-measured 31 October in §7.3: there is exactly one Node binary on
this host, no version manager is installed, and the only installer present (`winget`) is a machine-level
change this build is not authorized to make.

Payload's installation documentation, quoted verbatim on 31 October 2026:

> "Payload requires Node.js `^22.23.4 || >=24.22.1`. Supported Next.js versions are `15.2.9 - 15.2.x`,
> `15.3.9 - 15.3.x`, `15.4.11 - 15.4.x`, or `16.2.6+`."


---

## 3. Verified compatibility matrix

Two different evidence classes appear in this table and must not be confused. The **first** is a
`dist-tags.latest` measurement — what the registry offers today, used for packages this repository pins
directly. The **second** is a *declared dependency of the pinned artifact* — what
`@payloadcms/db-postgres@3.92.1`'s own manifest says it will pull, which is the only number that matters for
the transitive rows and which is **not** the same as those packages' latest releases.

An earlier revision of this table recorded `drizzle-orm 0.45.4` and `pg 8.23.1` in the transitive rows. Those
were `dist-tags.latest` values, i.e. the wrong measurement for a row that describes what the adapter pulls;
`drizzle-kit` was omitted entirely. Corrected on 31 October 2026 by reading the adapter's own registry
document (finding **I-1** of the Engineering Readiness Review). Nothing in `package.json` was ever wrong — the
repository declares no transitive package — so this was a documentation defect, not a dependency defect.

| Package | Version recorded | Constraint that binds us | Satisfying choice | Evidence |
|---|---|---|---|---|
| `payload` | **3.92.1** | Directive §7 line 127 / Standard §2.2 line 45 require "Payload CMS 3.x stable" | 3.92.1 | registry `dist-tags.latest`; prior stable line 3.90.1→3.92.1 |
| `@payloadcms/db-postgres` | **3.92.1** | must equal payload version | 3.92.1 | registry peer: `payload: "3.92.1"` (exact) |
| `@payloadcms/next` | **3.92.1** | must equal payload version | 3.92.1 | registry peer: `payload: "3.92.1"` (exact) |
| `@payloadcms/richtext-lexical` | **3.92.1** | must equal payload version | 3.92.1 | registry peer: `payload: "3.92.1"` (exact) |
| `next` | **16.4.3** | `@payloadcms/next@3.92.1` peer: `>=15.2.9 <15.3.0 \|\| >=15.3.9 <15.4.0 \|\| >=15.4.11 <15.5.0 \|\| >=16.3.3 <17.0.0` | **16.4.3** ✅ | registry peer string, read directly |
| `react` / `react-dom` | **19.3.1** | richtext-lexical peer: `^19.0.1 \|\| ^19.1.2 \|\| ^19.2.1` → `>=19.0.1 <20.0.0` | **19.3.1** ✅ | semver: caret on major ≥1 permits minor+patch |
| `drizzle-orm` | **0.45.2** | declared as an *exact* dependency by `@payloadcms/db-postgres@3.92.1`; `1.0.0-beta.22` / `1.0.0-rc.5` exist upstream and are **prohibited** | whatever the adapter declares — do not add a second Drizzle, do not pin it here | registry document for `@payloadcms/db-postgres@3.92.1`, `dependencies["drizzle-orm"] = "0.45.2"` |
| `drizzle-kit` | **0.31.7** | declared as an *exact* dependency by `@payloadcms/db-postgres@3.92.1`; it is the migration generator behind `pnpm migrate:create` | transitive, exact | same registry document, `dependencies["drizzle-kit"] = "0.31.7"` |
| `pg` (node-postgres) | **8.20.0** | declared as an *exact* dependency by `@payloadcms/db-postgres@3.92.1` | transitive, exact | same registry document, `dependencies["pg"] = "8.20.0"` |
| `@payloadcms/drizzle` | **3.92.1** | declared as an *exact* dependency by `@payloadcms/db-postgres@3.92.1`; it is the fifth lockstep member (ADR-002) | transitive, exact | same registry document, `dependencies["@payloadcms/drizzle"] = "3.92.1"` |
| `zod` | **4.6.7** | Standard §2.2 "Zod"; no version stated | 4.6.7 (verify Payload's own peer before pinning) | registry |
| `sharp` | **0.35.5** (`engines.node >=20.9.0`) | Standard §2.2 line 53 "`sharp` where compatible" | 0.35.5 | registry |
| `@payloadcms/plugin-cloud-storage` | **3.92.1** | private S3-compatible storage (Standard §2.2) | 3.92.1 | registry peer: `payload: "3.92.1"` |
| `graphql` | — | `payload` peer requires `^16.8.1` | 16.x | registry peer |
| PostgreSQL | **18.6** current minor for major 18 | Standard §2.2 line 48 "PostgreSQL 18.x, latest supported minor" | 18.6 — **compatibility with the pinned adapter UNVERIFIED, see §3.2** | postgresql.org versioning page: major 18 first release 25 Sep 2025, final release (EOL) 14 Nov 2030. This row evidences the *release's* currency, not the adapter's support for it. |
| Node.js | newest 24.x = **24.22.2** (LTS *Krypton*); newest 22.x = 22.23.4 (LTS *Jod*) | `^22.23.4 \|\| >=24.22.1` | **24.22.2** | nodejs.org dist index |

### 3.1 Versions explicitly rejected

| Rejected | Why |
|---|---|
| `payload@4.0.0-beta.6` | Beta. Standard §15 line 329: *"No canary/alpha/beta/RC dependencies in production without written exception."* Directive §7 repeats it. Payload 3.x stable is the mandated line. |
| `@payloadcms/*` `internal` / `internal-debug` tags | Internal builds, not releases. |
| `drizzle-orm@1.0.0-beta.22` / `1.0.0-rc.5` | Beta/RC. Also a major version change with no ADR. |
| `react@19.0.0-rc.1`, `next@16.0.0-beta.0`, `next@16.3.0-preview.10` | Pre-release. |
| `node@27.0.0-alpha.0` | Alpha, non-LTS. |
| Node 22.23.4 as the baseline | Satisfies engines, but the Standard explicitly chose Node 24 LTS as the V1 baseline (§2.2). Recorded for fallback only. |

### 3.2 Open compatibility assumptions (unresolved, and not to be described as verified)

§3 lists what is *measured*. This section lists what is *assumed* and still needs a real check. An assumption
inherited from the Standard is not evidence; per Directive §2 the Standard is a project document, not an
upstream support statement.

**A-C1 — `@payloadcms/db-postgres@3.92.1` against PostgreSQL 18.6: UNVERIFIED ASSUMPTION.**

The project intends to run PostgreSQL 18.6 (ADR-004, Standard §2.2 line 48). No upstream source found on
31 October 2026 states that this adapter supports PostgreSQL 18. What was tried, with the actual result:

| Probe | Result |
|---|---|
| `https://payloadcms.com/docs/installation` | HTTP 404 — page does not exist |
| `https://payloadcms.com/docs/databases/overview` | HTTP 404 — page does not exist |
| `https://payloadcms.com/docs/databases/postgres` | HTTP 404 — page does not exist |
| `https://payloadcms.com/docs/getting-started/installation` | HTTP 200 — states the Node range (`^22.23.4 \|\| >=24.22.1`) and the Next.js ranges. **No database version range is stated on that page.** |
| registry document for `@payloadcms/db-postgres@3.92.1` | HTTP 200 — `engines` field **absent**; `peerDependencies` = `{ "payload": "3.92.1" }`; `dependencies` = `pg 8.20.0`, `@types/pg 8.20.0`, `drizzle-orm 0.45.2`, `drizzle-kit 0.31.7`, `@payloadcms/drizzle 3.92.1`, `uuid 13.0.2`, `prompts 2.4.2`, `to-snake-case 1.0.0`, `console-table-printer 2.12.1`. **No PostgreSQL server-version constraint is declared anywhere in the manifest.** |

The absence of a declared constraint is *not* a support statement — `pg` is a wire-protocol client that does not
advertise server-major support in its manifest, and Drizzle's dialect layer is silent on it too.

Therefore: **do not claim official or demonstrated PostgreSQL 18.6 support.** The only available closure is
empirical — `pnpm db:up` (pull and start `postgres:18.6-alpine`), then `pnpm migrate`, then
`pnpm db:verify-privileges` and the A.5 behavioural matrix — and that sequence is gated behind **B-03** (no
`.env`, so `pnpm db:up` cannot start: `docker compose config` exits 1 on seven unset secrets, measured
1 November 2026) and **B-01** (Node 24.19.0 cannot install the pinned set). **B-09 no longer gates the matrix
half of it**: `IMAGE=postgres:18.6-alpine sh scripts/db/run-privilege-tests.sh` completed with exit 0 on
1 November 2026, so the grant design ran on 18.6 itself (`SHOW server_version` → 18.6). What that does *not*
close is this ADR's actual question — adapter compatibility — because the harness applies representative DDL,
not a Payload-generated migration. Until `pnpm migrate` runs against 18.6, **A-C1 stays an assumption**.
If the empirical run fails, the fallback is an ADR-supervised change to ADR-004 selecting the newest PostgreSQL
minor the adapter is demonstrated against, reported to the Owner because it changes a written baseline.
**Do not silently change pinned versions to make compatibility appear solved.**

**A-C2 — `zod 4.6.7` against the Payload tree: partially discharged.**
`package.json` pins `zod 4.6.7` directly. Measured on 31 October 2026: `payload@3.92.1`'s registry document
(HTTP 200) declares **no `zod` dependency and no `zod` peer** — its only peer is `graphql: "^16.8.1"`, and it
carries 32 dependencies. So the core package imposes no conflicting Zod constraint. What remains open is
whether any *other* member of the installed tree (`@payloadcms/ui`, `@payloadcms/next`, `@payloadcms/drizzle`)
declares a narrower Zod range; that can only be settled by an actual `pnpm install`, i.e. after B-01 clears.
The §3 row for `zod` should be read with this caveat.

**A-C3 — `graphql` resolution.** §3 and §5 both record `graphql ^16.8.1`, matching `payload@3.92.1`'s only
declared peer (measured above). The concrete 16.x patch that `pnpm install` resolves is unknown and unknowable
before B-01. Not a risk, but not a verified fact either.

---

## 4. Documented discrepancies between the Technology Standard and official sources

These are logged rather than silently resolved. Per Directive §2 line 34, official upstream documentation is rank 7
and governs *"exact package compatibility and supported API behavior"*, so the machine-readable ranges win;
each item must still be reported to the Owner because it changes a written baseline.

**D-01 — The Next.js supported floor is misstated in the Standard.**
Standard §2.3 says Payload lists supported Next.js ranges *"including `16.2.6+`"*. The actual
`@payloadcms/next@3.92.1` peer range for the 16 line is **`>=16.3.3 <17.0.0`**. A project pinned at Next 16.2.6
following the Standard's wording would fail the adapter's peer requirement. The Payload *docs page* does use
the `16.2.6+` phrasing, so the discrepancy originates upstream between prose and the published peer range.
Decision: pin to the peer range (Next 16.4.3), not the prose.

**D-02 — Per-locale publication state is only natively available behind an experimental flag.**
Master Specification §10 (line 1453) states *"Each content entity must have a separate editorial and
publication state for each locale"*, and §11 requires eight independent state dimensions (line 1524) with
the explicit prohibition *"No single 'status' field may be used"*. Payload's native mechanism for
locale-independent publish status is reported by its own localization documentation as **experimental**: it
requires `experimental.localizeStatus` in the config plus `versions.drafts.localizeStatus: true` per
collection, storing status as an object keyed by locale.
Standard §2.3 line 65 forbids installing *"canary, beta, experimental, or release-candidate packages"* and §15
prohibits pre-release dependencies in production. Therefore an experimental flag cannot carry a mandatory,
non-negotiable product requirement.
Decision: see **ADR-008** — model per-locale publication state explicitly on the `PublicationRecord` entity
that the specification already defines (§8.16, line 1352), and keep localized field content on Payload's
stable `localized: true` mechanism.

**D-03 — Docker daemon reachability (was RESOLVED same day; SUPERSEDED — see the postscript).**
An initial `docker info` call exceeded a 120 s shell timeout while also inspecting a not-yet-pulled image,
which was not evidence of a dead daemon. `scripts/preflight.mjs` re-tested with a bounded 20 s probe and the
daemon answered: server reachable, Compose 5.3.1. ADR-004's delivery path was therefore recorded as viable on
this host. The remaining unverified item then, as now, is the `postgres:18.6-alpine` image pull itself — which
is **moot rather than unverified**: the tag entered the local cache and `docker images` lists it at 433 MB
(1 November 2026), so no pull has been performed *by this project* and none is needed for an evidence run.

> **Postscript, 31 October 2026 (later the same day) — the paragraph above is a HISTORICAL MEASUREMENT, not the
> current state.** A re-probe found the `docker-desktop` WSL distribution **Stopped** and no Docker named pipe
> present, so every daemon command timed out (rc=124) rather than answering. This is **B-09**, and it is now the
> live blocker. The distinction matters and is recorded deliberately:
>
> - **Stopped** = the Docker Desktop application is not running; the named pipe `\\.\pipe\dockerDesktopLinuxEngine`
>   does not exist; the CLI client cannot even open a connection. This is the measured state.
> - **Running but unhealthy** = the daemon answers the connection and then errors or reports degraded
>   components. `docker info` would return output containing an error. **This is NOT the measured state.**
> - **Running and reachable** = what D-03 originally observed and what §7.2's first transcript recorded.
>   **This is no longer the measured state either.**
>
> The full current probe table, with commands and exit codes, is in §7.2. Nothing downstream of this document
> may quote D-03's "server reachable, Compose 5.3.1" as present-tense evidence; that claim is closed and dated.

> **Second postscript, 1 November 2026 — the state has changed again, and the third bullet above is the current
> one.** `docker info` exits 0 and answers with server `29.9.2`; `docker compose version` is `v5.6.1`; `docker
> images` exits 0 and lists `postgres:18.6-alpine` at 433 MB — the three readings the §7.2 probe table recorded
> as rc=124/0 bytes now carry exit codes of 0. So "Running and reachable" *is* the measured state again, and the
> present-tense ban in the paragraph above now applies to *this* reading too: engine reachability has flipped
> three times in two days and is re-probed, never inherited. One correction to the postscript above:
> its evidence was `wsl -l -v` reporting the distribution **Stopped**, and that listing was re-run on 1 November
> giving the **same** answer while the daemon answered — the distribution state is therefore not a daemon test,
> and `docker info` is. Nothing has been created by this project against the engine; the only container that ran
> was the harness's own throwaway, which it removed (`docs/A5_PRIVILEGE_EVIDENCE.txt`).

**D-04 — Standard §2.3 cites a compatibility evidence date one day stale.**
It is dated 30 October 2026 and itself instructs *"The project must refresh this compatibility check whenever
initial dependency installation or a major upgrade occurs."* This document is that refresh (31 October 2026).
No claim in §3 was inherited from the 30 October pass.

---

## 5. Candidate pinned set (awaiting a clean install)

Recorded as the intended resolution, **not** as an installed state. `pnpm-lock.yaml` becomes the authority
only after `pnpm install` succeeds on Node ≥ 24.22.1; the exact resolved tree is then written into
`docs/ARCHITECTURE_DECISIONS.md` §5.1 and this table marked superseded.

```
node                       24.22.2        (environment, not a package)
payload                    3.92.1
@payloadcms/db-postgres    3.92.1
@payloadcms/next           3.92.1
@payloadcms/richtext-lexical 3.92.1
@payloadcms/plugin-cloud-storage 3.92.1
next                       16.4.3
react                      19.3.1
react-dom                  19.3.1
graphql                    ^16.8.1        (resolve to latest stable 16.x at install)
sharp                      0.35.5
zod                        4.6.7          (no zod peer/dep in payload@3.92.1 — see §3.2 A-C2)
typescript                 latest stable at install, strict mode
vitest                     latest stable at install
@playwright/test           latest stable at install
axe-core                   latest stable at install
@opentelemetry/api + sdk   latest stable at install
postgres (container)       18.6-alpine    (compatibility UNVERIFIED — see §3.2 A-C1)
```

Expected transitive set, read from the pinned artifact's own manifest on 31 October 2026 (§3 rows, §3.2 A-C1).
These are **not** declared in `package.json` and must not be added there — they are recorded so that the
post-install `pnpm-lock.yaml` can be checked against a prediction rather than accepted blindly:

```
pg                         8.20.0         exact, via @payloadcms/db-postgres
@types/pg                  8.20.0         exact, via @payloadcms/db-postgres
drizzle-orm                0.45.2         exact, via @payloadcms/db-postgres
drizzle-kit                0.31.7         exact, via @payloadcms/db-postgres
@payloadcms/drizzle        3.92.1         exact, via @payloadcms/db-postgres  (fifth lockstep member)
uuid                       13.0.2         exact, via @payloadcms/db-postgres
prompts                    2.4.2          exact, via @payloadcms/db-postgres
to-snake-case              1.0.0          exact, via @payloadcms/db-postgres
console-table-printer      2.12.1         exact, via @payloadcms/db-postgres
jose                       5.10.0         exact, via payload (JOSE/JWT primitive — see ADR-025)
```

Constraint that must not be broken: the four `@payloadcms/*` packages and `payload` itself must stay on the
**identical** version — their peer ranges are exact (`"payload": "3.92.1"`), not ranges. Any upgrade is a
synchronized set bump, recorded as a new ADR. `@payloadcms/drizzle` is a transitive fifth member pinned exact by
the adapter, so it follows the same version automatically; it is *not* declared in `package.json` and must not be.

Enforcement: the lockstep assertion lives in `.github/workflows/ci.yml`, job `quality`, step *"Verify the Payload
lockstep constraint held"*. That step reads the five installed `package.json` files out of `node_modules` and
fails the build if any of them is not on `3.92.1`. It does not rely on a CLI flag form that could not be
exercised at authoring time. **The step is authored; it has never executed** — the workflow file is marked
`STATUS: AUTHORED. NEVER EXECUTED.` and the claim stays that way until a real run transcript is recorded in
`docs/TEST_AND_RELEASE_REPORT.md`.

---

## 6. Architecture Decision Records

### ADR-001 — Modular monolith for V1
**Status:** Accepted (inherited from Standard §2.1, confirmed as still correct).
**Decision:** One deployable application with eleven logical boundaries (Standard §2.1). No microservices, no
Kubernetes.
**Consequence:** Deployment topology stays simple; boundaries are enforced by directory and import discipline,
not by network, so a boundary violation is a code-review defect rather than a runtime failure.

### ADR-002 — Single schema authority: Payload's Drizzle-backed PostgreSQL adapter
**Status:** Accepted.
**Decision:** `@payloadcms/db-postgres` owns all Payload-managed collections and globals and runs the
migrations. Custom domain tables are added only through the adapter's documented Drizzle extension, in the
same migration stream.
**Rejected:** Prisma as a parallel ORM (Standard §15, unconditional prohibition); two migration systems.
**Consequence:** One migration order to reason about; team must work inside Payload's migration CLI even for
pure domain tables.

### ADR-003 — Node 24 is a prerequisite, not an install step
**Status:** Accepted and **satisfied on the host — executed 1 November 2026 under OD-1**.
**Decision:** Target `>=24.22.1`; install 24.22.2 (LTS *Krypton*). Declare `"engines": { "node": ">=24.22.1 <25" }`
and `"packageManager"` pinned in `package.json` so a wrong runtime fails fast instead of installing half a tree.
**Consequence:** Until the host is upgraded, Phase 1 cannot complete and Phase 2 cannot begin. This is the
single highest-priority external dependency of the build.

**What was actually executed, and a correction to this ADR's own text.** The Owner authorized a compatible Node 24
release inside the constraint and no major-version move; `winget install OpenJS.NodeJS.LTS --version 24.22.1
--exact --scope machine` was run, and `node -v` → `v24.22.1`, npm `11.19.1`, verified by reading the active binary
rather than the installer's exit code. **The version named in the Decision line above — 24.22.2 — is what the nodejs.org
dist index reported as newest 24.x when this ADR was written, not what is installed; the constraint it was chosen to
satisfy is `>=24.22.1 <25`, and 24.22.1 satisfies it.** The register at `docs/OWNER_INPUT_REGISTER.md` §5 carried the
same drift in its environment-actions list and is corrected there too. Nothing about the decision changes: the
requirement was always the range, and the range is met. **Phase 2's entry condition B-01 is therefore closed, and
this ADR's *blocked on host action* clause is spent.**

### ADR-004 — PostgreSQL 18.6 delivered via Docker Compose for local development
**Status:** Accepted as the *decision*. Its **delivery path was blocked by B-03 until 1 November 2026, and is now
blocked by nothing except the work that has not been done**: the Owner's OD-3 created `.env`, `docker compose config
--quiet` exits **0** against it (verified without ever rendering a secret value), the daemon answers (1 November 2026
— `docker info` rc=0, server 29.9.2, Compose 5.6.1) and the mandated image is in the local cache. **The clause this
status carried for a day — that `docker compose config` exits 1 on the seven unset `.env` secrets, so `pnpm db:up`
cannot start — is spent, and it is corrected rather than deleted because the same seven guards are still the project's
security contract; only their *state* changed.** What remains true is the next sentence: no instance of *this project*
has ever existed. `docker ps -a` lists three stopped containers belonging to a different project and **no**
`ndm-postgres`; this batch did not start one, because the authorization it worked under covered verifying the render,
not creating a persistent database. Accepting the ADR is not the same as having demonstrated it, and the
demonstration still owes a migrated database. **One further measurement belongs to this row:** the engine's
reachability is latency-dependent on this host — inside the same window, `timeout 60 docker info` returned rc=124
and `timeout 120 docker info` returned rc=0 after idle, and preflight printed both `2 WARN, 8 PASS` and
`1 WARN, 9 PASS` minutes apart. Never inherit a PASS here; re-probe.
**Decision:** `postgres:18.6-alpine` with a named volume, healthcheck, and non-superuser application role.
Port bound to `127.0.0.1:5432` only, never `0.0.0.0`. Never a production claim.
**Consequence:** Reproducible local database; `scripts/db/init-roles.sh` creates the four roles of ADR-005 on
first start; migrations gate on the container healthcheck. Image pull itself is still unattempted, and the
local image cache cannot even be enumerated while B-09 stands (§2 table).
**Open assumption carried by this ADR:** that `@payloadcms/db-postgres@3.92.1` works against PostgreSQL 18.6.
No upstream support statement exists (§3.2 A-C1); it is an assumption inherited from Standard §2.2 line 48 and
must be closed empirically — `pnpm db:up` → `pnpm migrate` → `pnpm db:verify-privileges` — after B-09 and B-01
clear. Until then this ADR must not be cited as evidence of demonstrated 18.6 compatibility.

### ADR-005 — Separate database roles for migration, runtime, reporting, backup
**Status:** Accepted (Standard §3.2).
**Decision:** Four roles created by an initial bootstrap migration. Runtime role: DML only, no DDL, not
superuser. Migration and backup credentials never reach a browser bundle or the Control Center UI.
**Consequence:** Row-Level Security, if later adopted, must be tested *as the runtime role* — Standard §4.2
warns an RLS policy silently fails against a bypassing role.

### ADR-006 — Search uses PostgreSQL full-text + trigram indexes in V1
**Status:** Accepted (Standard §3.3).
**Decision:** `pg_trgm` plus native FTS. No Elasticsearch/Meilisearch in V1.
**Consequence:** Master Spec §9.1–9.3 (lines 1406–1426) defines search *eligibility and filter dimensions* but
**no index entity or field names** — that gap is an architect decision, made in Phase 2, and is logged as such.

### ADR-007 — No `pgvector` column in Phase 1 or Phase 2
**Status:** Accepted.
**Decision:** Deferred until an embedding model and retrieval use case are approved. Do not create a vector
column, and specifically do **not** adopt the `VECTOR(768)` figure that appears in the source material.
**Why:** Master Spec §8.19 (line 1398) rules it *"not a public artifact field or a fixed product requirement"*
and requires the dimension to match a selected and tested model; §9.4 (line 1430) places advanced semantic
retrieval in Future Scope; Standard §3.3 says *"Do not hard-code a vector dimension before selecting and
testing the embedding model."* Three independent sources agree.
**Consequence:** AI Curator retrieval in V1 is keyword/FTS + permission-filtered, not vector, until re-decided.

### ADR-008 — Per-locale publication state is an explicit `PublicationRecord`, not an experimental CMS flag
**Status:** Accepted. Resolves discrepancy D-02.
**Decision:** Localized *content* uses Payload's stable field-level `localized: true`. Locale-independent
*publication state* lives in the `PublicationRecord` entity named by Master Spec §8.16 (line 1352), keyed by
(entity, locale), carrying state, timestamps, publisher, scheduled time, and route/slug version. `Published`
for a page is derived from the relevant `PublicationRecord`, never from one global field.
**Rejected:** `experimental.localizeStatus` + `versions.drafts.localizeStatus` — a mandatory requirement
(§10 line 1453) cannot rest on a flag the Standard §2.3/§15 forbids in production.
**Consequence:** Publication is an application-layer concern with its own tests; publish/unpublish becomes an
explicit audited operation rather than a CMS checkbox. It also resolves the duplicated-state ambiguity the
specification carries (`publication_state` on entities at lines 1134/1170/1218 *and* `PublicationRecord` at
1352, with no stated authority) by naming `PublicationRecord` as authoritative.

### ADR-009 — Eight state dimensions are separate namespaced columns
**Status:** Accepted (Master Spec §11.1, line 1524: *"No single 'status' field may be used"*).
**Decision:** Editorial, claim-verification, translation, publication, media-processing, rights,
exhibition-availability and AI-knowledge-eligibility are distinct fields with distinct vocabularies. Because
`Draft`, `In Review` and `Approved` recur inside three different machines (lines 1543, 1555, 1266), each is
namespaced: `editorialState`, `claimReviewState`, `translationState`, and so on.
**Consequence:** Control Center Module 01 and every list filter must address a named dimension. Admin
state-chip UIs that would collapse these into one badge are a defect against STT-001.

### ADR-010 — Country exhibition state is six values, not five
**Status:** Accepted. Resolves a spec conflict.
**Decision:** `Planned/Coming Soon`, `In Preparation`, `Open Exhibition`, `Temporarily Unavailable`,
`Closed/Archived` (§11.9, lines 1613–1617) **plus** `Hidden/Not Public` (Appendix G.4, line 3723).
**Why:** §6.3 (lines 624–628) lists only four public labels; §11.9 lists five; Appendix G.4 adds a sixth with
an explicit behavioural rule — do not expose the route through navigation, search, sitemap, or AI retrieval.
G.4 is the most specific and most recent statement and Directive §2 requires the more specific product rule.
**Consequence:** Recorded as a formal conflict in `docs/MASTER_SPECIFICATION.md`; the four-label §6.3 list is
treated as the *visitor-facing subset*, not the full enum.

### ADR-011 — Ownership and Authenticity become first-class entities
**Status:** Accepted. Resolves a spec gap.
**Decision:** Add `OwnershipStatement` and `AuthenticityAssessment` records with their own evidence links,
reviewer, approval state and disclosure rule. `condition_record` becomes a structured `ConditionReport`.
**Why:** Master Spec §8.1 (lines 1019–1020) *mandates* separating "Ownership statements" and "Authenticity
assessments", and §8.13 (1291–1295) requires each to carry its own evidence and approval — but §8.2's entity
list (1030–1051) and the Artifact table (1147–1174) define no such entity or fields. §16.6 (line 2449+) and
Appendix G.8 (line 3809) both require ownership/authenticity screens. The requirement is real; only the model
is missing.
**Consequence:** This is a specification completion, not an extension, and is logged as such. Without it the
"Verified" prohibition (§6.7 line 723, `COL-005`) cannot be enforced, because there would be nowhere to store
a separately approved authenticity conclusion.

### ADR-012 — Media↔Rights is a join relation, and typed country relations get their own table
**Status:** Accepted. Resolves two cardinality conflicts.
**Decision:** `MediaAsset` links to `RightsRecord` through a join (not the singular `rights_record_id` at
line 1315), because §8.17 (line 1373) states one-to-many **or many-to-many** where rights differ by use.
Country↔Artifact gets an explicit `ArtifactCountryRelationship` table carrying the controlled type from
§8.17 line 1376 (*Issued In, Produced In, Originated In, Found In, Associated With, Used In*), because the
Artifact field table (1147–1172) has no country field at all while §8.17 mandates a typed many-to-many.
**Consequence:** "A primary display country is a presentation choice; it does not erase other documented
relationships" (line 1376) becomes implementable as data rather than as a convention.

### ADR-013 — Asset ID scheme `NDM-AST-###`
**Status:** Accepted (engineering default per Standard §13; no Owner input needed).
**Decision:** Master Spec Appendix A.10 (line 3463) *requires* an "Asset ID" on every asset record but assigns
no values anywhere in the specification. IDs are therefore issued deterministically by this project, in
Appendix A catalog order, `NDM-AST-001` … `NDM-AST-082`, and are stable: they are never re-used or renumbered
if an asset is later rejected or archived.
**Consequence:** Traceability across `docs/ASSET_INVENTORY_AUDIT.csv`, future `MediaAsset` rows and rights
records shares one key. The numbering is a project convention and is identified as such wherever it appears.

### ADR-014 — Repository layout and the new `scripts/` directory
**Status:** Accepted. Declares a deviation from the literal workspace list.
**Decision:** Application source in `src/`, framework-required root configuration at `no/` root (Directive §3),
engineering documentation in `docs/`, and **`scripts/` at root for repository tooling**. `scripts/` is a new
top-level directory not present in the structure quoted by Directive §3.
**Why:** Directive §10 requires a *re-runnable, evidence-producing* asset audit with checksums; a one-off
transcript is not repeatable evidence, and embedding the tool in `src/` would entangle repository tooling
with application source. `scripts/` contains no application code.
**Consequence:** Declared openly rather than left as an unexplained addition. `reference/` and
`Noujoude.photo/` remain read-only to all tooling; `scripts/audit-assets.mjs` writes only into `docs/`.

### ADR-015 — Background jobs on Payload Jobs; queue/worker deferred
**Status:** Accepted (Standard §2.2). Revisit only with a measured need and a new ADR.

### ADR-016 — Rich text is Lexical, sanitized, never arbitrary HTML
**Status:** Accepted (Standard §2.2). Directly supports §16.16/G.7 prohibitions on arbitrary code injection.

### ADR-017 — AI Curator retrieval is permission-gated before the model, not after
**Status:** Accepted (Standard §7, Master Spec §14 line 1982+).
**Consequence:** Retrieval sits behind an explicit access check keyed to the ADR-008 publication records and
the AI-knowledge-eligibility dimension of ADR-009. Drafts, restricted artifacts, inquiries, PII and internal
notes are excluded at query construction. Red-team and "Unauthorized Disclosure" tests are release-blocking
(§14.13 line 2095).

### ADR-018 — The Markdown master is the implementation authority, verified against the DOCX
**Status:** Accepted, on measured evidence rather than assumption.
**Decision:** `reference/Noujoude_Master_Specification_EN.md` (SHA-256 `5b30b21e…47ecd5`,
3,941 lines) is the line-addressable authority the build cites, traces against, and copies
into `docs/MASTER_SPECIFICATION.md`. The supplied `Noujoude_Master_Specification_EN.docx`
(SHA-256 `69ccb03e…f71283`, 142,645 bytes) is treated as the same baseline in another
container, not as a competing version — because **verification showed it carries no content
the Markdown lacks.**
**Evidence:** `scripts/check-docx-alignment.mjs`, dependency-free (ZIP local headers parsed
directly, `word/document.xml` inflated with `node:zlib`, hyperlink targets read from the
relationship table). Result in `docs/DOCX_MD_ALIGNMENT.json`: 337 of 337 Markdown headings
located in the DOCX; **0** DOCX word types absent from the Markdown; 0 Markdown word types
absent from the DOCX; 3 non-contiguous paragraphs, all reference blocks whose URLs the DOCX
stores as hyperlink targets instead of visible text; 0 substantive misses. The only
excluded items are the Word-generated "Table of Contents" label and the YAML front matter,
both recorded in the report so a reviewer can disagree with the classification.
**Why a decision was needed:** two masters were supplied with no stated precedence, and the
traceability CSV, the Appendix A "Source line" values, and every citation in this document
address the **Markdown**. Implementing against whichever file was open would risk building
to two requirement sets. GAP-17 also warns the line locator "was not a per-line semantic
judgement", so line-count agreement was not accepted as proof of content agreement.
**Rejected:** choosing the DOCX because it looks like the authored original (it is not
line-addressable, so all existing citations would break); assuming equivalence from equal
titles (the byte sizes differ by 100 KB, which an assumption cannot explain).
**Consequence:** the working copy in `docs/MASTER_SPECIFICATION.md` is safe to cite, and its
header restamps both checksums on regeneration, so a future swap of either file is detected
instead of silently inherited. If the Owner ever supersedes the Markdown, the alignment tool
must be re-run before any citation is trusted again.

### ADR-019 — Audit immutability is enforced by database grants, not by the application layer
**Status:** Accepted; implementation delivered, behavioural evidence **pending a working
container engine** (see "Evidence status" below — the requirement is not claimed satisfied).
**Supersedes nothing; refines:** ADR-005 ("runtime role: DML only") — ADR-005 is correct about
DDL and wrong about DML breadth, and this ADR closes the difference.
**Closes:** `docs/SECURITY_AND_PERMISSIONS.md` §2.4 finding 2 (recorded there as "This conflict
is not in S-01…S-14 or D-01…D-04").

**Requirements that made the old grant unacceptable.** Three statements bind the *storage* layer,
not the UI:

| Source | Statement |
|---|---|
| Master Spec §8.16 line 1356 | "Audit records are protected from ordinary editing." |
| Master Spec §16.19 line 2664 | "Ordinary users must not be able to silently edit or erase audit history." |
| Master Spec G.8 row 19 line 3822 | "Audit records are append-only to ordinary application roles." |
| Standard §3.3 line 115 | "Do not delete historical claims, evidence, rights, audit events, or revisions through cascading deletes without an approved retention rule." |
| Standard §4.2 line 145 | "Apply least privilege at the route, operation, collection, field, and record level as applicable." |

The delivered `scripts/db/init-roles.sh` granted `ndm_runtime` `SELECT, INSERT, UPDATE, DELETE ON
ALL TABLES` *and* the same set as `ALTER DEFAULT PRIVILEGES`. A single `DELETE FROM audit_event`
issued by the running application was therefore legal at the database level, and the app layer was
the only thing standing between a bug, a compromised runtime credential, or an SQL injection and
erased audit history. That is the definition of "silently edit or erase" (line 2664).

**Decision.** Three layers, in descending breadth of who they bind:

1. **Grant.** `ndm_runtime` keeps `SELECT, INSERT, UPDATE, DELETE` on ordinary relations and loses
   `UPDATE`, `DELETE`, and `TRUNCATE` on the declared append-only relations
   (`NDM_APPEND_ONLY_TABLES`, default `audit_event`). `INSERT` and `SELECT` stay, because the
   application must write audit events and Module 19 must read and export them.
2. **Trigger.** A `BEFORE UPDATE OR DELETE` guard calls `ndm_guard.deny(text)`, owned by the
   bootstrap superuser in a schema the application identities do not own, so the attempt fails
   loudly with an `insufficient_privilege` SQLSTATE instead of silently affecting zero rows.
3. **Row-level security.** `FOR UPDATE` / `FOR DELETE` deny policies plus `FORCE ROW LEVEL
   SECURITY`, so the table owner is subject to them too. Without FORCE, the owner of a table
   bypasses its policies, and `ndm_migration` owns every table (ADR-005 schema ownership).

`init-roles.sh` additionally refuses to leave `BYPASSRLS` on an application identity, because
Standard §4.2's least-privilege rule is decorative against a bypassing role — ADR-005 already
recorded that hazard for RLS, and this makes it a checked condition instead of a warning.

**Why the enforcement is a separate post-migration step.** `ALTER DEFAULT PRIVILEGES` cannot name
a table — it applies to *all* future relations in a schema — so a per-table exception cannot be
declared at bootstrap time. `scripts/db/harden-append-only.sh` applies it once each append-only
relation exists, idempotently, and is wired as `pnpm db:harden`; `scripts/db/verify-privileges.sh`
(`pnpm db:verify-privileges`) re-asserts the state and exits non-zero, so a widened grant cannot
survive a deploy unnoticed. Both run inside the container as the bootstrap superuser, mounted
read-only at `/opt/ndm-db` (`docker-compose.yml`).

**Alternatives considered and rejected.**
- *Application-layer-only protection* (the status quo ante): rejected — line 3822 is addressed to
  "ordinary application roles", which is a database concept; and it fails the moment the runtime
  credential is compromised.
- *A dedicated `audit` schema with narrowed default privileges*: rejected for now. It removes the
  maintenance of a table list, but it requires every append-only collection to be created in a
  non-default schema, and Payload's per-collection schema handling has never been exercised in
  this project (dependencies are not installed). Building a security boundary on an unverified
  third-party capability is the error pattern the Directive warns about. Recorded as the migration
  path if per-collection schemas are proven in Phase 2.
- *A separate audit-writing service identity*: rejected for V1. It adds a second connection path
  and a second credential to the exact class of secret the Standard §5 and Master Spec G.7 line
  3790 forbid exposing, for a guarantee the grant already gives.
- *Making `payload_revisions` append-only too*: **deliberately not done.** CMS revision tables are a
  candidate — line 1354 defines revisions as history — but Payload's own version-retention behaviour
  (deleting superseded revisions when a retain limit is configured) has never been observed here,
  and revoking `DELETE` from an unverified behaviour breaks the application rather than protecting
  the audit trail. Registered as a Phase 2 decision to be taken *after* the behaviour is measured.

**Boundary that is an Owner input, not an engineering choice.** With no `DELETE` grant anywhere,
expired audit rows cannot be purged by the application. That is intentional: line 115 makes
deletion conditional on "an approved retention rule", and the retention policy itself is pending
Owner approval (Master Spec line 2045; LO-005 and LO-006 at lines 3227–3228 are both recorded
`Pending … Approval`). When the Owner approves a rule, the purge identity must be a *new*, separately
credentialled role created for that purpose and logged as its own ADR — not a re-widening of
`ndm_runtime`.

**Evidence status — CLOSED for the grant design on 1 November 2026; still open for this project's own
database.** `scripts/db/run-privilege-tests.sh` (`pnpm db:privilege-evidence`) is the harness that
produces the required proof: it starts a throwaway container, runs the real
bootstrap, creates a representative `artifact` + `audit_event` pair as `ndm_migration`, applies the
harden step, and then attempts 14 mutations **as the role that would perform them**, expecting
`ok`/`denied` per row, including positive controls (the runtime role must still be able to write
ordinary relations, or the denials prove nothing). When this ADR was first written no behavioural
claim was made, because the harness had never run to completion. It now has: with the engine answering
again, `IMAGE=postgres:18.6-alpine sh scripts/db/run-privilege-tests.sh` **exited 0** on 1 November
2026 — 34 grant-state assertions PASS, all 14 cases A–N matched expectation for an authorization
reason, the residual-risk probe printed `VULNERABLE` and the verifier `DETECTED` the removed guard
before it was `RESTORED`, and the run removed its own container and volume. Raw transcript:
`docs/A5_PRIVILEGE_EVIDENCE.txt`. What remains *not* claimed is the different proposition: this
project's real database does not exist yet (§3 row 9 of the release report is still `Not run`, behind
`.env`/B-03), so nothing here certifies a production privilege boundary — only that the designed one
behaves as specified.

*What the harness actually requires (finding F-B, established by reading it, not by running it).* It is
pure POSIX shell driving the `docker` CLI, `timeout` and `od`; every SQL statement is executed by `psql`
**inside** the container, so no host PostgreSQL client is needed. It reads no `package.json`, resolves no
Node module, and never invokes `pnpm` or `node`. Therefore **A.5 does not require the Node upgrade (B-01) and
does not require `pnpm install` (B-02)**. Its only hard prerequisite is a reachable container engine (B-09).
No Node or dependency-installation prerequisite may be added to this test unless new evidence establishes one.

*Why it has not run — two distinct same-day measurements, both recorded, neither preserved as current.*
1. Earlier on 31 October 2026: the engine answered but failed — `500 Internal Server Error` on
   `/containers/create` and `/_ping`, then hangs; `scripts/preflight.mjs` independently recorded
   "daemon did not answer within 20 s". That is a **running-but-unhealthy** signature.
2. Later on 31 October 2026 (the current state): `wsl -l -v` reports `docker-desktop **Stopped**`, and
   `docker version` / `docker info` / `docker ps -a` / `docker images` all return **rc=124** (timeout) with zero
   bytes of output, while client-only commands (`docker context ls`, `docker compose version`) answer normally.
   That is a **stopped-engine** signature — no connection to the engine could be opened at all. Full table in
   §7.2.1.

These are different failures and must not be conflated or averaged. Only the second is current. The harness was
not retried after that probe, per instruction not to wait repeatedly on commands that time out.

What *is* verified about these scripts: the shell syntax of all four (`sh -n`, exit 0), and the fact that the
previous version of `init-roles.sh` had never been executed either — the privilege conflict was visible only by
reading it, which is why it is registered as a finding and not as a passing control.

**Residual risk, restated so it cannot be lost.** The design's own threat model says the table owner
(`ndm_migration`) *can* drop the guard trigger; the harness is built to print `VULNERABLE` when that is true
rather than to hide it. Audit immutability is therefore **not** behaviourally verified, and the compensating
control is a CI assertion — not a sentence in this ADR. That assertion now exists as code:
`.github/workflows/ci.yml`, job `db-privileges`, steps *"Apply the append-only hardening"* (`pnpm db:harden`)
and *"Assert the privilege state — FAILS THE BUILD ON ANY VIOLATION"* (`pnpm db:verify-privileges`), plus an
unconditional behavioural-matrix run whose transcript is uploaded as a build artefact. **That workflow has
never executed** (`STATUS: AUTHORED. NEVER EXECUTED.` at the top of the file). Until a real run exists, the
compensating control is authored, not enforced, and the residual risk stands open.

**Consequence.** `docs/SECURITY_AND_PERMISSIONS.md` §2.4 finding 2 becomes "decision taken,
implementation delivered, evidence pending"; the role table and the Standard §3.2 compliance row
point here; `docs/DATA_MODEL.md` §3.7's enforcement design is now the shipped design; Phase 2's
exit criteria in `docs/IMPLEMENTATION_PLAN.md` gain the harden-and-assert step; and a deploy is not
complete until `db:verify-privileges` passes.

### ADR-020 — Implied reviewer/auditor competences are scoped permission grants, not extra roles
**Status:** Accepted. **Closes:** `docs/SECURITY_AND_PERMISSIONS.md` §2.4 finding 1 (R12, R13, R14) and
`docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` RB-10.
**Problem.** §17.2 defines exactly eleven roles, A–K (line 2686 heading; role K at line 2734), yet other
parts of the specification act through an actor that list never names: a "qualified rights reviewer"
(line 2724), a reviewer who "may classify outputs" (§14.13 line 2083) inside the AI knowledge module
(§16.9 line 2536), and a reader of audit history whose access is restricted (§16.19 line 2664). The
permission engine cannot be built on an undefined actor, and inventing three new roles would widen the
canonical role set that §21.6 line 3240 declares baseline ("the role boundaries").
**Decision.** The three competences are expressed as **permission grants on the existing eleven roles**,
using §17.3's own action vocabulary — the spec already provides the mechanism and demands the scoping:
"Every permission must be scoped by module, record type, record, locale, and action where relevant.
A role must not acquire permissions solely because it can open a module." (line 2762).

| Implied actor | Grant that expresses it | Canonical basis |
|---|---|---|
| R12 rights reviewer | `Approve` (line 2749) scoped to the rights module and the specific use record | §17.4 row "Approve rights status" = `Yes / delegated` for Owner, `Assigned` for Director, `Evidence input` for Curator, `Record administration` for Media Manager (line 2780); line 2724 |
| R13 AI knowledge reviewer | `Review` (line 2747) scoped to the AI knowledge module, plus `Verify Claims` (line 2748) where the review changes eligibility | §17.4 row "Manage AI knowledge policy" (line 2782); §14.13 line 2083; §16.9 line 2536 |
| R14 read-only auditor | `View Audit Records` (line 2759) granted with **no** `Create`/`Edit`/`Delete` grant in the same assignment | §17.4 row "View audit records" (line 2785); §16.19 line 2664 restricts sensitive detail, so field-level scope applies |

Delegation is a recorded act, not an inferred one: "Yes / delegated" (line 2780) means the Owner may
appoint an approver, so a grant row must carry grantor, grantee, scope, and timestamp. That is the same
discipline §17.2 A applies to the top of the authority chain, where even the Owner's reassignment
"requires a protected recovery/transfer procedure and explicit audit record" (§17.2 line 2694).
At the database layer R14's read-only posture is already provided by `ndm_reporting`
(ADR-005, ADR-019), so an external auditor needs no CMS role at all.
**Rejected:** adding R12/R13/R14 to the canonical eleven (contradicts line 3240's baseline and every
downstream count of "eleven roles"); a free-form "competence" flag on the user record (no scoping, and
§17.4 line 2766 makes the matrix the default policy: "Owner may grant narrower scopes where appropriate;
privileges must not be broadened implicitly"); leaving the gap open until Phase 2 (it blocks the Module 14
role screens, so deciding is the cheaper act — and deciding *is* the architect's mandate under
Directive §17).
**Consequence.** The matrix in `docs/SECURITY_AND_PERMISSIONS.md` §2.3 can now be completed for R12–R14
as grant profiles rather than roles; the rights-approval workflow in `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md`
references a grant instead of a phantom role; RB-10 moves to "decision taken". **The identity of any
delegated approver remains an Owner input** (`OWNER_INPUT_REGISTER.md` OID rows) — this ADR decides how
the authority is represented, not who holds it.

### ADR-021 — `Era ↔ Artifact` is many-to-many through `ArtifactEra`; the singular `era_id` becomes a derived display field
**Status:** Accepted. **Closes:** F-01 (`REQUIREMENTS_TRACEABILITY.md` §27; `DATA_MODEL.md` §8 item 3).
**Conflict.** §8.7 line 1155 declares `era_id` as a singular optional relationship; §8.17's canonical
cardinality table, line 1366, states Era ↔ Artifact is "Many-to-one or many-to-many according to
documented periods" with the rule "Do not force a precise era if the date is uncertain". A single
nullable column cannot carry the many-to-many branch the canonical table permits.
**Decision.** The authoritative relation is a join table `ArtifactEra` (`artifact_id`, `era_id`,
`basis`, `confidence`, `note`) — one row per documented period — and `era_id` on the artifact is kept
as written in §8.7 but reclassified as a **denormalized primary-era for display and sort**, always
derived from `ArtifactEra` inside the same transaction and never independently editable. This mirrors
the pattern already accepted for typed country relationships and Media↔Rights (ADR-012), so the model
gains one more join relation rather than a new kind of mechanism. Line 1366's prohibition survives
intact: the join rows carry the basis and confidence, so an uncertain date produces no asserted precise
era, and the field stays Optional.
**Rejected:** deleting `era_id` (the field table at line 1155 specifies it, and the public artifact field
list depends on it); a JSON array of era ids (no referential integrity, no per-link basis/confidence, and
it would silently contradict the typed-relationship discipline of §8.17); deferring to the Owner (§21.6
line 3240 names "the core collection model" as baseline product behaviour, so this is an architect
decision, not an institutional fact).
**Consequence:** `docs/DATA_MODEL.md` §8 item 3 moves from "unresolved" to decided; Phase 2's migration
creates the join table with the composite unique key and both FK indexes; the era facet in search (ADR-006)
reads `ArtifactEra`, not `era_id`, so an artifact documented in two periods is found under both.

### ADR-022 — `Page` is a first-class entity, derived from §16.2, and the §8.2 omission is logged as a model amendment
**Status:** Accepted. **Closes:** F-02 (`REQUIREMENTS_TRACEABILITY.md` §27 and REQ-CC-002's blocker note;
`DATA_MODEL.md` §8 item 6).
**Conflict.** §8.17 line 1372 names `Page` as one of the MediaAsset usage targets, and §16.2 (lines
2285–2341) specifies a page directory, thirteen section block types, section controls and shared-template
impact — but §8.2's entity list (lines 1032–1051) contains no `Page` and §8 gives it no field table. The
specification therefore describes an object it never declares.
**Decision.** `Page` is modelled as a versioned collection with: locale-scoped content, per-locale
publication state through `PublicationRecord` (ADR-008, so no `publication_state` field is added to the
page — the ADR-008 rule holds), a `PageSection` child ordered by position with the thirteen block types of
§16.2 as a **controlled union** (no free-form block payloads), a `Template` relation whose change impact is
disclosed before saving (§16.2's shared-template rule), and a MediaAsset usage relation per line 1372.
Deleting a section must keep referenced data recoverable, so no cascade to media or artifacts (§18.8 line
2844). The §8.2 omission is recorded as an amendment to the logical model rather than a silent invention:
every field above traces to a §16.2 line, and the register keeps a pointer here.
**Rejected:** modelling pages as Payload globals or singletons (one document per page type, which cannot
express per-locale publication, revision history, or the directory §16.2 requires); storing sections as an
opaque JSON blob (destroys the "section removal keeps referenced data" and template-impact rules, and makes
MediaAsset usage relations unqueryable); marking REQ-CC-002 "Not Implemented" forever on the ground that
the entity list is incomplete (that is a documentation omission, and §21.6 line 3240 puts "the purpose of
the pages" in the baseline the architect is expected to implement without asking).
**Consequence:** REQ-CC-002's structural blocker is cleared at the *design* level; implementation still
needs Phase 3 routes and Phase 2 migrations, so the row stays "Not Implemented" until code and a test
exist. `docs/DATA_MODEL.md` gains the `Page`/`PageSection`/`Template` section with the §16.2 line
references.

### ADR-023 — `VerificationReview` is the single source of truth for a review decision; claim-level review fields are derived projections
**Status:** Accepted. **Closes:** F-03 (`REQUIREMENTS_TRACEABILITY.md` §27; `DATA_MODEL.md` §8 item 4).
**Conflict.** §8.11 lines 1259 and 1261 require each `ArtifactClaim` to store "Current review status" and
"Reviewer and review timestamp"; §8.2 line 1041 defines `VerificationReview` as "a review decision on a
claim or defined set of claims". Two writers, one fact, no stated precedence — the same shape S-02 had for
publication state, which this project resolved with ADR-008.
**Decision.** `VerificationReview` holds the decision: actor, timestamp, outcome, scope (one claim or a
defined set), and reason, and is append-only in effect (a superseding review is a new row, never an edit —
consistent with §11.x revision/audit behaviour and with ADR-019's treatment of consequential records).
`ArtifactClaim`'s two fields are **projections of the latest applicable review**, written in the same
transaction, rejected by validation if supplied independently through the CMS. Rationale: only a separate
entity can express one review covering a *set* of claims (line 1041's own wording), and a projection keeps
line 1259/1261 satisfied without creating a second authority.
**Rejected:** letting both sides be writable (two truths; the drift is undetectable and untestable);
dropping the claim fields (they are specified); moving review state into the claim only (line 1041's
multi-claim scope becomes unrepresentable, and the reviewer audit trail loses the set boundary).
**Consequence:** Module 04/05 review screens read the projection and write a `VerificationReview`; the
Phase 2 constraint test asserts that a direct field write to the projection is refused. `DATA_MODEL.md`
§8 item 4 is decided, and the S-02 precedent is named so a reviewer can compare the two resolutions.

### ADR-024 — `ProvenanceEvent ↔ Source` is many-to-many through `ProvenanceSourceLink`, and the canonical table gets an explicit row
**Status:** Accepted. **Closes:** F-04 (`REQUIREMENTS_TRACEABILITY.md` §27; `DATA_MODEL.md` §8 item 5).
**Conflict.** §8.12 line 1282 requires each provenance event to carry "Supporting source/evidence links",
while §8.17's canonical table routes Artifact ↔ Source exclusively through `ArtifactClaim`/`ClaimEvidence`
(line 1370, "Sources support claims, not merely the artifact in the abstract") and contains no row for
`ProvenanceEvent ↔ Source`. A required link with no canonical cardinality is a gap, not a licence to guess.
**Decision.** Add `ProvenanceSourceLink` (`provenance_event_id`, `source_id`, `role`, `note`) as a
many-to-many relation, and record the row in the project's own canonical-rule table so the addition is
visible next to §8.17 rather than smuggled into a migration. Scope is deliberately separated from line
1370: the new relation supports **the event** (a custody, transfer, discovery, or attribution statement
with a date), it does not substitute for claim-level evidence. Where a provenance event *asserts* a
historical claim about the artifact, the claim must still exist as an `ArtifactClaim` with
`ClaimEvidence`, so line 1370's routing rule is preserved, not bypassed. `role` is a controlled list
(`Cites`, `Documents`, `Contradicts`, `Contextualises`) so the semantics survive export and AI retrieval.
**Rejected:** reusing `ClaimEvidence` for provenance events (it is keyed to claims; the reuse would either
force synthetic claims or lose the event link); a singular `source_id` on the event (line 1282's plural,
and real custody histories cite several documents for one event); leaving it undecided (Phase 2 cannot
create the field table without a cardinality, and "deferred" would leave §8.12 unimplementable).
**Consequence:** `docs/DATA_MODEL.md` §8 item 5 is decided; the AI Curator's provenance answers must cite
these links (ADR-017's permission-gated retrieval applies to them unchanged); the register's F-04 row moves
to resolved-with-ADR. The added cardinality is recorded **in this project's own model documentation**, not
as a quotation of §8.17 — the canonical table in `reference/` stays exactly as the Owner wrote it, and the
amendment is labelled as an architect addition wherever it appears.

---

### ADR-025 — The second factor is delegated to a maintained OIDC-compatible identity provider; no cryptographic authentication is implemented in this repository
**Status:** Accepted for the **mechanism**. The provider *instance* (which IdP, hosted where, at what cost)
remains Owner input under OID-19. **Closes:** coverage hole H-3 (`docs/IMPLEMENTATION_PLAN.md` §8).

**The requirement, verbatim.** Standard §4.1 line 134: *"Administrative users must use strong authentication.
MFA is mandatory for Owner and privileged administrative accounts. If the selected identity mechanism does not
natively provide suitable MFA, integrate a reputable maintained provider or implementation and record the
decision."* The conditional in that sentence is not hypothetical: it has fired, which is why this ADR exists.
Standard §4.1 line 132 constrains how it may be satisfied: *"Use Payload's supported authentication
capabilities or a maintained OIDC-compatible provider where the chosen deployment requires managed identity.
Do not write custom cryptographic authentication mechanisms."* The product side repeats the mandate at Master
Spec line 2889 — *"Multi-factor authentication for Owner and privileged accounts."* — with session and
re-authentication obligations at line 2890 and §4.3 line 159, and SEC-001 (line 3104) makes it an
administrative acceptance condition: *"Administrative accounts are protected; privileged users use MFA."*

**Measured capability of the selected framework (official documentation and the upstream repository, both read
31 October 2026).** Payload's authentication overview lists the strategies it provides as HTTP-Only Cookies,
JSON Web Tokens (JWT) and API Keys, plus Custom Strategies as the documented extension point on an auth-enabled
collection (`auth.strategies`); the page carries no mention of MFA, 2FA, TOTP, WebAuthn or a `multiFactor`
option. The plugins overview names Form Builder, MCP, Multi-Tenant, Nested Docs, Redirects, Search, Sentry, SEO,
Stripe, Import/Export and Ecommerce, and directs the reader to the monorepo's package directory for the complete
list. That directory was then enumerated directly through the GitHub contents API rather than through a summary,
in **two** passes, because the first pass measured the wrong thing.

*Pass 1 — the repository default branch (historical; superseded by pass 2 for this project's purposes).*
`payloadcms/payload` → `packages/` holds **45** directories, of which the plugin-prefixed ones are exactly
`plugin-cloud-storage`, `plugin-ecommerce`, `plugin-form-builder`, `plugin-import-export`, `plugin-mcp`,
`plugin-multi-tenant`, `plugin-nested-docs`, `plugin-redirects`, `plugin-search`, `plugin-sentry`, `plugin-seo`,
`plugin-stripe`; a case-insensitive search of all 45 names for `auth`, `mfa`, `otp`, `2fa`, `token`, `factor` or
`identity` returns nothing. The limit that made this insufficient: the API reflects the repository's default
branch at query time, **not** the pinned `payload@3.92.1`.

*Pass 2 — the pinned tag `v3.92.1` (the measurement this project is allowed to rely on).* Re-run and confirmed
during the gap-closure batch, exit code 0 on every call:

```
gh api 'repos/payloadcms/payload/contents/packages?ref=v3.92.1' --jq '.[].name'    → 44 names, rc=0
  grep -Eic 'auth|mfa|otp|2fa|two.?factor|webauthn|token|factor|identity|sso|oidc|passkey'  → 0 hits
  grep -c '^plugin-'                                                                  → 12
gh api 'repos/payloadcms/payload/contents/packages' --jq '.[].name'                 → 45 names, rc=0
  added since the tag : codemod, oxlint-config, oxlint-plugin, tanstack-start, transformer-sharp  (5)
  gone  since the tag : eslint-config, eslint-plugin, richtext-slate, storage-uploadthing          (4)
  44 + 5 − 4 = 45 ✓ — the arithmetic closes, so neither listing is truncated
```

At the exact tag this project pins, the monorepo publishes **44** packages and **none** of them is an identity,
MFA, OTP, WebAuthn, SSO or passkey package. The 5-added/4-removed churn between the tag and the default branch
is itself the justification for having done pass 2: a default-branch measurement is materially different from
the pinned release, and the difference is real rather than theoretical.

*Corroborating measurement on the shipped artifact.* The published `payload-3.92.1.tgz` was enumerated:
**2831** entries, of which **302** are under `/auth/`. The authentication strategies actually shipped are
`dist/auth/strategies/local/*`, `dist/auth/strategies/jwt.js`, `dist/auth/strategies/apiKey.js` and
`dist/auth/executeAuthStrategies.js` — exactly the three the documentation names, plus the local
(username/password) strategy. A case-insensitive scan of all 2831 paths for
`mfa|otp|totp|2fa|two.?factor|webauthn` returned 12 hits, and **all 12 are `forgotPassword` files** — the
substring `otP` inside `forg`**`otP`**`assword`. They are recorded here as a known false positive so that
nobody re-runs the scan, sees "12", and concludes the opposite of the truth. Zero genuine second-factor modules
ship in the artifact.

*One limitation that could not be closed, stated rather than papered over.* The npm registry search API
(`https://registry.npmjs.org/-/v1/search?text=scope:payloadcms`) returned `total: 0` both URL-encoded and
unencoded, so a **registry-wide** enumeration of published `@payloadcms/*` packages was not obtainable on
31 October 2026. The absence of an MFA package is therefore established for (a) the monorepo at the pinned tag
and (b) the shipped `payload` artifact — it is **not** generalized to every package that might exist under the
`@payloadcms` npm scope. If a first-party MFA capability is later claimed, it must be re-established against
that scope with a working query.

Two limits stay on the record regardless: this remains a measurement on a date, not a property of the software,
so §8's re-verification trigger still governs; and the decision below is written so that it does not depend on
which way any of those answers moves.

Two facts found on that pass are recorded here because they could otherwise be misread as licence. First, an
official `@payloadcms/plugin-stripe` and `@payloadcms/plugin-ecommerce` **do exist** — and neither may be
installed for V1: Master Spec §G.3 line 3702 states *"No commerce framework, payment provider, cart schema,
order schema, or sales analytics is to be installed for V1."* Their official status changes nothing about that
prohibition (see `docs/IMPLEMENTATION_PLAN.md` §9, out of scope). Second, an official `kv-redis` package exists,
which is a candidate input to coverage hole H-1 (the rate-limit store) — noted as evidence, **not decided**,
because the plan assigns H-1 to Phase 2 and this window is Phase 0 + Phase 1.

**Decision.**

1. **Control Center identity is issued by a maintained OIDC-compatible provider, and MFA is enforced at that
   provider**, per role, as the provider's own policy — not as logic inside this repository. Payload consumes
   the assertion through `auth.strategies` on the `users` collection, so the existing authorization model is
   unchanged: ADR-020's scoped competences, the per-record access rules and ADR-019's audit layer all continue
   to operate on a Payload user record, with the identity provider supplying *who* that record is and *that*
   a second factor was satisfied.
2. **The factor's form is configuration owned by the Owner** (authenticator app TOTP or passkey/WebAuthn, per
   the provider's capabilities). SMS is not treated as a suitable factor for privileged accounts, consistent
   with the OWASP ASVS 5.0.0 Level 2 baseline the Standard sets at line 163; the specific control mapping is a
   Phase 8 ASVS review task, not a claim made here.
3. **Local password authentication for staff is disabled by default.** Where a local password does exist —
   exactly one break-glass Owner account — Standard §4.1 lines 136–140 apply to it verbatim (Argon2id-class
   hashing with reviewed parameters, no plaintext or reversibly encrypted storage, secure reset and recovery
   flows), and its credential lives in the deployment secret store: never in the repository, never in a
   browser-visible variable, never editable in the Control Center (Master Spec line 2696).
4. **The break-glass account is disabled unless actively recovered.** Its enablement *is* the
   protected recovery/transfer procedure Master Spec line 2694 demands — *"Reassignment or removal of the
   highest-level Owner identity requires a protected recovery/transfer procedure and explicit audit record."*
   Concretely: two-person authorisation (Owner + designated administrator), an `AuditEvent` naming both, a
   bounded time window, and credential rotation immediately after use — matching §4.3 line 159's requirement
   that Owner changes and recovery actions carry confirmation and audit.
5. **No dependency and no environment variable is added by this decision.** Declaring `OIDC_*` keys in
   `.env.example` before the strategy that reads them exists would repeat the declared-but-absent pattern
   registered as hole H-1 for rate limiting. The variables and the implementation land in the same Phase 2
   change, reviewed together.

**Rejected.**

- *"Payload already does this."* Measured false today, and a decision cannot be built on a framework feature
  that the framework's own documentation does not claim.
- **A community TOTP plugin wrapped around Payload's login.** Its maintenance status is unvetted, and it
  inserts a *second* authentication mechanism inside the CMS — the thing line 132 and the Standard's own
  prohibition at line 330 (*"No plaintext passwords or homemade crypto."*) are aimed at. A maintained
  first-party or third-party OTP *provider* would be different. The plugins page names none, and the monorepo
  enumeration in the measurement above finds no identity or OTP package among the **44** `packages/` directories
  published at tag `v3.92.1` (nor among the 45 on the default branch), and the shipped `payload-3.92.1.tgz`
  contains no second-factor module —
  so there is no first-party route to vet. A community plugin's maintenance status would still have to be
  reviewed in Phase 2; that review is a Phase 2 task, not a claim made here.
- **Implementing TOTP in `src/lib/server/auth*`.** Prohibited outright by line 132. This repository is not in
  the business of writing cryptographic authentication.
- **Ship V1 password-only and defer MFA.** Line 134 is a mandate, not a target; SEC-001 (line 3104) is an
  administrative acceptance condition; and Standard §12's seventh required check pairs ASVS mapping with
  negative authorization tests, so "MFA not enforced" would surface as a red-team finding rather than a
  documented trade-off. Deferral was the cheapest option and is still refused.
- **Naming a specific SaaS identity vendor here.** The mechanism is an engineering default; the vendor is a
  cost and a data-residency commitment. Self-hosted Keycloak is recorded as the zero-cost candidate that
  satisfies the same mechanism; nothing is committed to it.

**Consequences.**

- Module 14's acceptance tests now have authentication preconditions, and the negative cases are the point:
  a staff login that satisfies the first factor and not the second must yield **no session**; a session whose
  assertion lacks the authentication-method claim must be refused on every privileged route; an IdP-side
  revocation must not survive inside Payload's cookie/JWT window (line 2890's re-authentication rule); an
  MFA-bypass attempt must write an `AuditEvent`; and break-glass enablement must be auditable with both
  approvers named.
- **Availability cost, stated plainly:** if the identity provider is unreachable, staff cannot administer the
  museum. That is chosen deliberately over a silent weaker-authentication fallback. The recovery time
  objective for the identity path therefore joins OID-20's provider-dependent figures rather than inheriting
  the database ones.
- H-3 moves from a hole with no owner, artefact or command to mechanism-decided with an ADR; OID-19 gains one
  more provider question (the IdP instance); and `docs/SECURITY_AND_PERMISSIONS.md` gains the structures this
  decision depends on — invariant **A-10** in §2.5 (a role grant means nothing until the identity layer has
  authenticated its holder; authorization is not evaluated for a session whose second factor is unproven), the
  §7 Authentication row rewritten to separate *mechanism decided* from *instance not selected*, and a §8 bullet
  for the cross-system revocation path. A-10 is labelled in that document as an architect addition sourced from
  Standard §4.1 lines 132 and 134, not as a quotation of §4.2's list.
- **Evidence status: authored.** Nothing is implemented or installed; `payload` and its strategies have never
  run here (B-01, B-02); no identity provider exists for this project (B-05); no test of any kind above has
  been executed. This ADR decides *how* MFA will be satisfied and *what must be proven*; it proves nothing
  itself.

---

## 7. Phase 1 exit criteria

| # | Criterion | State |
|---|---|---|
| 1 | ADRs recorded with rationale and rejected alternatives | ✅ this document — **25 ADRs** (ADR-001 … ADR-025). Measurement method: `grep -c '^### ADR-' docs/ARCHITECTURE_DECISIONS.md` → `25`, and the ID list printed by `grep -o '^### ADR-[0-9]*'` is contiguous with no gaps and no duplicates. Re-measured 31 October 2026 after this batch. |
| 2 | Compatibility matrix verified against official sources, not inherited | ⚠️ §3 is verified for every package row, but §3.2 records **three open compatibility assumptions** (A-C1 PostgreSQL 18.6 ↔ the pinned adapter; A-C2 Zod against the rest of the installed tree; A-C3 the concrete `graphql` 16.x patch). A-C1 is the one that touches a written baseline, and it cannot be closed without B-09 + B-01. Counted by `grep -c '^\*\*A-C[0-9]'` → `3`. |
| 3 | Version-selection gate of Standard §2.3 executed | ✅ with **four** documented discrepancies (D-01 … D-04 in §4; counted by `grep -c '^\*\*D-0'` → `4`). D-03 was itself corrected in this batch: its original "resolved" verdict was a stale measurement, now superseded by §7.2. |
| 4 | Application initialized in `src/` | ⚠️ **dependency half done, scaffold not done.** Re-measured 1 November 2026: `pnpm install` executed under OD-2, so B-01/B-02 no longer stand in this row's way — `src/` still holds `README.md` only because initializing the application was outside the authorized scope of that batch |
| 5 | Scripts, types, linting, tests, environment examples | ⚠️ **authored, and now partly executed.** `.env` was created under OD-3 on 1 November 2026 (38 assignments, 6 locally generated secrets, 14 Owner-supplied values deliberately left empty); `format:check` and `lint` have executed and both fail with measured exit codes (1 and 2), `typecheck` exits 0 over 19 JavaScript files with no `checkJs`, and `test` exits 1 with `No test files found`. The CI workflow file remains authored and unexecuted (B-08) |
| 6 | Coherent Git checkpoint | ✅ **met 1 November 2026 under OD-4.** `git init` ran on a tree with no repository in `E:\no` or any parent — no existing history was found, so none was overwritten — and commit `aedeee0` on branch `main` records 150 files / 49,699 insertions. `git remote -v` is empty: no remote was created and nothing was pushed |
| 7 | Clean install → typecheck → test → production build (Standard §2.3 step 9) | ⚠️ **the install and the three later legs have now executed; only the first leg is green, and hollowly.** 1 November 2026: `pnpm install` exit 0; `pnpm typecheck` exit 0 but over `scripts/**/*.mjs` only (0 `.ts` files exist); `pnpm test` exit 1; `pnpm build` exit 1 with `Couldn't find any pages or app directory`. The chain is not satisfied, and the reason is now the absent application rather than the absent toolchain |

Items 4–5 are delivered as reviewable files so the dependency install becomes a single, deliberate next
action. They are explicitly *not* evidence of a working application; per Directive §15, a config file is not
a completed feature.

Nothing above the line changes the status of ADR-019: the append-only grant set is criterion-5 configuration
("scripts"), and its **proof** is not a Phase 1 exit criterion in the Directive's own list — it is a Phase 2
obligation that Phase 1 has now made expressible. §7.2 recorded why it could not be executed in the 31 October
window. **It was executed on 1 November 2026** (engine answering, `IMAGE=postgres:18.6-alpine`, exit 0, 34
grant-state assertions and the 14 cases A–N all matching — `docs/A5_PRIVILEGE_EVIDENCE.txt`), which changes the
ADR's evidence status and does **not** change its Phase: the proof now exists, and the obligation to build the
database it will protect is still Phase 2 work.

### 7.1 Preflight gate — actual run, 31 October 2026 (re-run and confirmed during this batch)

`node scripts/preflight.mjs` executed against the live workspace. This was the **current** result at the close of
the gap-closure batch, reproduced byte-for-byte; the process **exit code was 1** (the gate fails on Node, as
designed). An earlier pass the same day reported "1 FAIL, 1 WARN, 5 PASS" with the Docker daemon answering —
that transcript is superseded by the one below, and the difference is itself the finding (§7.2). **This
transcript is in turn superseded as the current reading by the 1 November re-run recorded in
`docs/TEST_AND_RELEASE_REPORT.md` §1.1**, where Docker is `PASS | server reachable; compose: 5.6.1`, the second
WARN is the new H-7 register-versus-directory reconciliation row, and the tally is coincidentally still
"1 FAIL, 2 WARN, 4 PASS" — the same three digits for three different reasons, which is exactly why these records
keep rows rather than counts.

```
FAIL | Node.js 24.19.0
     | VIOLATES engines.node ">=24.22.1 <25" — install Node 24.22.1 or later in range. Payload 3.92.1 refuses this version.
WARN | Docker
     | daemon did not answer within 20 s — required for postgres:18.6-alpine (ADR-004)
WARN | .env
     | missing — copy .env.example to .env before install. Do not commit it.
PASS | pnpm 11.21.0
     | packageManager declares pnpm@11.21.0
PASS | reference/ integrity
     | 7 files match baseline checksums
PASS | Noujoude.photo/ integrity
     | all 82 audited assets match their recorded SHA-256
PASS | src/
     | contains README.md

7 checks: 1 FAIL, 2 WARN, 4 PASS
```

Two claims that would otherwise have been assertions are now evidence:
the read-only originals under `Noujoude.photo/` are provably **unmodified** (82/82 checksums match), and every
file under `reference/` is fingerprinted so any future edit to an original is detected rather than assumed
away. The single FAIL is B-01 (§7.3). It is not, however, the only gate: on the 31 October run the two WARNs were
B-09 (§7.2) and the deliberately absent `.env`, and a successful `pnpm install` clears neither of them. **Re-run
1 November 2026: Docker moved to `PASS | server reachable; compose: 5.6.1`, so the two WARNs are now the absent
`.env` and the new H-7 register-versus-directory reconciliation row — and the tally is coincidentally identical,
"1 FAIL, 2 WARN, 4 PASS", which is precisely why these records keep rows and not counts.**

### 7.2 B-09 — the container engine is stopped (measured twice, two different signatures)

B-09 has been measured on two occasions on 31 October 2026. Both tables are kept, because they describe
**different** failures and collapsing them into one would lose information. Only Observation 2 is current.

#### 7.2.1 Observation 2 — CURRENT STATE (later measurement, supersedes 7.2.2)

Distinguishing *stopped* from *running but unhealthy* is the whole point of this table, so the commands are
split by whether they need a daemon at all. Every probe was bounded with `timeout` and its exit code was
captured **before** any pipe, so no `head`/`tee` status is masquerading as the command's status.

| Command | Needs the daemon? | Exit code | Output |
|---|---|---|---|
| `wsl -l -v` | no | **0** | `docker-desktop` **Stopped**; `Ubuntu` **Stopped** |
| `docker context ls` | no | **0** | lists `default` and `desktop-linux *` → `npipe:////./pipe/dockerDesktopLinuxEngine` |
| `docker compose version` | **no** | **0** | `Docker Compose version v5.3.1` (30 bytes) |
| `docker version` | yes | **124** (timeout) | **0 bytes** — the client hung without printing even its Client section |
| `docker info` | yes | **124** | **0 bytes** |
| `docker ps -a` | yes | **124** | **0 bytes** |
| `docker images` | yes | **124** | **0 bytes** |
| test for `//./pipe/dockerDesktopLinuxEngine` | no | 0 | reports **present** |

**Reading of the evidence.** The Docker Desktop WSL distribution is **Stopped**. Client-side commands that only
read local configuration answer normally and instantly. Every command that must talk to the engine hangs until
the timeout and produces no output at all — a hang, not an error response. Two traps are recorded explicitly so
no future reader falls into them:

- `docker compose version` returning `v5.3.1` with exit 0 is **not** evidence of a working engine. It is the
  Compose CLI reporting its own version. The earlier claim "Compose 5.3.1 verified reachable" (§4 D-03) was
  therefore weaker than it sounded, and is now corrected.
- The named pipe path testing as *present* is **not** evidence of a live daemon either; the endpoint is
  registered in the client's context configuration. Nothing answers on it. Pipe presence ≠ engine liveness.

Consequences recorded elsewhere from this observation: the `postgres:18.6-alpine` cache row in §2 is **UNKNOWN**
rather than "absent", because `docker images` cannot be run; A.5 (the ADR-019 behavioural matrix) is **blocked**;
`docs/TEST_AND_RELEASE_REPORT.md` §0 carries this same table. **All three of those consequences were properties
of that window, not of the project, and on 1 November 2026 they were re-measured and overturned:** `docker info`
exits 0 (server 29.9.2, 3 containers, 0 running), `docker images` lists `postgres:18.6-alpine` at 433 MB, and the
harness ran to completion with exit 0 (ADR-019 "Evidence status", and `docs/A5_PRIVILEGE_EVIDENCE.txt`). B-09 is
therefore recorded as **cleared in this environment by observation**, not as a closed Owner decision — nobody
established why the engine came back, and it can stop answering again.

**Not attempted, deliberately.** Starting Docker Desktop, `wsl -d docker-desktop`, `wsl --shutdown`, or any
service restart is host administration. It changes the state of the machine outside this workspace and is not
within the authorization for this batch. It is Owner action 1 below.

#### 7.2.2 Observation 1 — HISTORICAL (earlier the same day; a running-but-unhealthy engine)

The Docker daemon answered at the start of this window (`docker version` → server 29.7.2;
`docker images` listed `postgres:16-alpine`; `docker ps -a` listed three `Exited (137)`
containers named `noujoude-postgres`, `-postgres2`, `-postgres3`), and then stopped answering. The
sequence actually observed, in order:

| Probe | Result |
|---|---|
| `docker run -d … postgres:16-alpine` (throwaway, ADR-019 evidence harness) | `500 Internal Server Error` on `…/containers/create?name=ndm-privtest-…` |
| `docker ps -a` | `500 Internal Server Error` on `…/containers/json?all=1` |
| `docker ps -a` (later, with `timeout 15`) | killed by timeout, exit 124 |
| `docker version` / `docker info` (with `timeout 12`/`15`) | killed by timeout, exit 124 |
| `scripts/preflight.mjs` Docker check | `WARN … daemon did not answer within 20 s` |
| `wsl -l -v` | `docker-desktop` **Running**, `Ubuntu` **Stopped**; `wsl -d Ubuntu` commands hang (exit 124) with "Failed to start the systemd user session" |
| alternative engines (`podman`, `nerdctl`, `containerd`, host `psql`/`initdb`) | not present on this machine |

The failed `docker run` created nothing: the API rejected the create request, so no
`ndm-privtest-*` container or volume exists to clean up. The three pre-existing
`noujoude-postgres*` containers were **not** started, restarted, removed, or inspected beyond
`docker ps -a` metadata.

The two observations differ in kind: in Observation 1 the engine was **up and returning HTTP 500s** — a
running-but-unhealthy daemon; in Observation 2 the engine's WSL distribution is **Stopped** and nothing
answers at all. A reader who sees only "Docker broken" will reach for the wrong remedy.

**Owner actions (cannot be taken silently, and are host administration rather than code):**

1. Start Docker Desktop and wait for the engine to report healthy (`docker info` exiting 0). If the engine
   still hangs once the distribution is Running, restart the WSL VM it runs on. This is B-09.
   **Taken care of itself, not by this workspace:** on 1 November 2026 `docker info` exits 0 with server 29.9.2.
   No Docker Desktop, WSL or service command was started, stopped or restarted here — that is host administration,
   and the observation is recorded only because the prerequisite it removed is what A.5 was waiting on.
2. Decide whether to pull `postgres:18.6-alpine` (ADR-004's mandated image; its presence in the local cache is
   currently **UNKNOWN** because `docker images` cannot run — **superseded: measured PRESENT, 433 MB, on 1 November
   2026**). Observation 1 did see `postgres:16-alpine`
   locally, whose behaviour differs in exactly the areas ADR-019 relies on (`ALTER DEFAULT PRIVILEGES` and
   `information_schema` visibility changed across that range), so an evidence run on 16 is **labelled as 16
   semantics** and does not discharge ADR-004. The run recorded in `docs/A5_PRIVILEGE_EVIDENCE.txt` used 18.6 and
   reported `18.6` from `SHOW server_version`, with the tag's major compared against the server's own answer.
3. Create `.env` from `.env.example` with locally generated values. Not done here: the agreed
   scope forbids creating credentials, and the empty-password variables are deliberately empty. Note that the
   A.5 harness does **not** need `.env` — it generates throwaway credentials per run and never writes them to a
   file — so action 3 is not a prerequisite for A.5.

After action 1 (and action 2 for an 18.6-labelled run), `pnpm db:privilege-evidence` produces the ADR-019
behavioural transcript in one command. It needs no Node upgrade and no `pnpm install` (ADR-019, finding F-B).
**Both conditions are now satisfied and the command has been run** — exit 0, transcript in
`docs/A5_PRIVILEGE_EVIDENCE.txt`, with the host still on Node 24.19.0 and no `node_modules` present, which is
F-B demonstrated rather than F-B read.

### 7.3 B-01 re-measured — the Node gap cannot be closed from inside this workspace

| Probe (all read-only) | Measured result |
|---|---|
| `node -v` | `v24.19.0` |
| `where.exe node` | `C:\Program Files\nodejs\node.exe` (the one real binary), plus `C:\Windows\System32\node` |
| `C:\Windows\System32\node` | a **4-byte file containing two CRLF pairs** — not an executable and not a second runtime; `PATH` noise a future reader must not mistake for an alternative Node |
| `nvm`, `fnm`, `volta`, `asdf` | absent |
| `winget.exe` | present at `C:\Users\NaDa\AppData\Local\Microsoft\WindowsApps\winget.exe` |

The host therefore has exactly one Node, and it is the version Payload 3.92.1 refuses. `winget` being present
is the mechanism, not the resolution: installing a runtime changes the machine, which the agreed scope (no
dependency installation) places with the Owner rather than with this build. What the workspace does instead is
keep the gate honest — `scripts/preflight.mjs` fails loudly on the version, `package.json` declares the range,
and `docs/IMPLEMENTATION_PLAN.md` §3 makes the install the first action after B-01 clears rather than
something to be worked around.

---

## 8. Re-verification triggers

Re-run §3 against official sources before: first `pnpm install`; any `@payloadcms/*` version bump (the four
sibling packages must move together, ADR-002 constraint); any Next.js major; adopting `pgvector` (ADR-007);
and whenever `payload@4.x` leaves beta, since D-02 may then be resolvable natively instead of by ADR-008.

Re-run `scripts/check-docx-alignment.mjs` and then `scripts/copy-master-spec.mjs` whenever either master
file in `reference/` is replaced (ADR-018): every line citation in `docs/` is addressed to the Markdown, so
a re-issued Markdown changes the meaning of every citation in this repository, including the ones above.
`preflight.mjs` verifies the checksums but does not re-establish content alignment.

Re-run `pnpm db:harden` then `pnpm db:verify-privileges` after **every** migration, not only after the first
one: `ALTER DEFAULT PRIVILEGES` grants the wide DML set to `ndm_runtime` at table-creation time, so a new
relation in the append-only list is unprotected until the harden step names it (ADR-019). Re-run
`pnpm db:privilege-evidence` whenever `scripts/db/*.sh` changes, whenever the server image version changes,
and whenever `NDM_APPEND_ONLY_TABLES` is edited — the behavioural matrix, not the script text, is the evidence.

Re-read the Payload authentication and plugins documentation before any Phase 2 change that touches `users`,
`auth.strategies` or a login screen, and again on every `@payloadcms/*` bump. ADR-025's premise is a **dated
measurement** — on 31 October 2026 the authentication overview listed HTTP-Only Cookies, JWT and API Keys with no
mention of MFA, 2FA, TOTP, WebAuthn or a `multiFactor` option, the plugins overview named no OTP/MFA plugin, and
the `payloadcms/payload` monorepo's `packages/` directory held **44** packages at tag `v3.92.1` (45 on the default
branch) with no identity or OTP package among them, and the shipped `payload-3.92.1.tgz` contained no
second-factor module — not a property of the software.

One limit that survived the first pass **has now been closed**: the package enumeration originally read the
default branch while this project pins `payload@3.92.1`, so the absence had to be re-established against the
pinned release. That re-establishment was performed at tag `v3.92.1` and against the published tarball, and the
result did not change (ADR-025, "Measured capability", pass 2). What still survives, and is the reason this
trigger exists:

- the measurement is dated, so any later `@payloadcms/*` bump or Phase 2 auth change re-opens the question;
- the `@payloadcms` **npm scope** could not be enumerated as a whole (the registry search route returned
  `total: 0`), so the finding covers the monorepo at the pinned tag and the `payload` artifact, not every
  published package under that scope;
- the 5-added/4-removed churn between tag and default branch shows the package list is actively moving, so a
  stale enumeration is a realistic failure mode rather than a hypothetical one.

If a first-party MFA capability later
ships, the decision does not reopen: only decision 1's implementation route changes, and the OIDC-provider form
stays recommended because decision 4's break-glass design depends on provider-side policy rather than on the
absence of a plugin.

Re-establish assumption **A-C1** (§3.2) the moment both B-09 and B-01 clear, and before any document calls
PostgreSQL 18.6 "supported": `pnpm db:up` → `pnpm migrate` → `pnpm db:verify-privileges` → the A.5 behavioural
matrix. Until that transcript exists, 18.6 is an assumption inherited from the Standard, and a green
`postgres:16-alpine` run does **not** close it (different `ALTER DEFAULT PRIVILEGES` and `information_schema`
semantics across that range — §7.2.2, Owner action 2).

Re-validate `.github/workflows/ci.yml` the first time a real repository exists (B-04). It is **authored, never
executed**, and no YAML parser was available on this host to machine-check it (python 3.13 has no `yaml` module,
`node -e "require('yaml')"` fails, `jq` is absent; installing one is outside this batch's authorization). Its
indentation and block-scalar structure were verified by reading only. First real run must be treated as the
point at which the file becomes evidence, and the transcript recorded in `docs/TEST_AND_RELEASE_REPORT.md`.

Re-check `.prettierignore` whenever a new read-only input directory, a new generated evidence artefact, or a new
tool-output path appears. `package.json` ships `"format": "prettier --write ."`; that command is only safe
because the ignore file keeps Prettier off `reference/` and `Noujoude.photo/`. An unlisted read-only path is a
one-command integrity breach waiting to happen (risk **R-14**, `docs/IMPLEMENTATION_PLAN.md` §7).
