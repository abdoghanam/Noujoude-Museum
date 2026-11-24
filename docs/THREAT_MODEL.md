# NOUJOUDE DIGITAL HERITAGE MUSEUM — THREAT MODEL

**Document ID:** NDM-THR-001
**Date:** 2026-11-24
**Status:** Active — aligned with current architecture
**Governing inputs:** `docs/MASTER_SPECIFICATION.md` §19.3-19.5, `docs/ARCHITECTURE_DECISIONS.md`

---

## 1. Trust Boundaries

### 1.1 Public Boundary
- **Actors:** Anonymous visitors, search engines, AI service principal
- **Trust level:** Untrusted
- **Access:** Published public content only
- **Data flow:** HTTP requests → Next.js App Router → Server Components → Media serving API

### 1.2 Authenticated Boundary
- **Actors:** Control Center users (Owner, Admin, Editor, Viewer)
- **Trust level:** Authenticated but scoped
- **Access:** Role-based, server-side enforced
- **Data flow:** HTTPS → Payload CMS → PostgreSQL → Audit log

### 1.3 System Boundary
- **Actors:** Server processes, database, media storage, AI gateway
- **Trust level:** Trusted (internal)
- **Access:** Full system access within role constraints
- **Data flow:** Internal network, no external exposure

### 1.4 AI Boundary
- **Actors:** AI Curator service principal
- **Trust level:** Read-only, scoped
- **Access:** Published claims and sources only
- **Data flow:** AI gateway → eligible knowledge sources → response

---

## 2. Threat Surfaces

### 2.1 Public Application
| Threat | Surface | Mitigation |
|---|---|---|
| XSS | User-generated content, metadata, rich text | Output encoding, CSP headers, sanitization |
| CSRF | Form submissions, state-changing requests | CSRF tokens, SameSite cookies |
| SQL Injection | Search queries, filters, API parameters | Parameterized queries, ORM |
| SSRF | Media URLs, external links | URL validation, allowlisting |
| IDOR | Media asset IDs, artifact slugs | Rights-gated serving, server-side authorization |

### 2.2 Control Center
| Threat | Surface | Mitigation |
|---|---|---|
| Unauthorized access | `/control-center/*` routes | Server-side auth, MFA for Owner |
| Privilege escalation | Role assignment, permission changes | Server-side enforcement, audit logging |
| Data exfiltration | Export, bulk operations | Permission scoping, audit trail |
| Account takeover | Login, password reset | MFA, rate limiting, secure sessions |

### 2.3 AI Curator
| Threat | Surface | Mitigation |
|---|---|---|
| Prompt injection | User prompts, retrieved content | Input sanitization, instruction isolation |
| Data disclosure | Private records, restricted sources | Permission enforcement before retrieval |
| Fabrication | Historical claims, provenance | Grounded responses, citation requirements |

### 2.4 Media Pipeline
| Threat | Surface | Mitigation |
|---|---|---|
| Unauthorized access | `/api/media/[assetId]` | Rights-gated serving, re-validation per request |
| File upload abuse | Media library uploads | Type/size validation, content scanning |
| Path traversal | Storage keys, derivative paths | Path validation, sandboxed storage |

### 2.5 Experience Engine
| Threat | Surface | Mitigation |
|---|---|---|
| 3D engine crash | WebGL context loss | Capability detection, fallback, disposal |
| Memory leak | Scene transitions, asset loading | Cleanup callbacks, resource disposal |
| Motion engine failure | Animation errors | Graceful degradation, reduced motion |
| Remotion player failure | Video playback | Poster fallback, error boundary |

---

## 3. Engine Isolation Assumptions

### 3.1 Failure Isolation
- Each engine (Remotion, Three.js, Web Motion, Exhibition) is independently initializable
- Engine failure does not crash the public application
- Text content and navigation remain functional when any engine fails
- Fallback states are provided for every engine

### 3.2 Resource Isolation
- 3D scenes only load when entered
- Remotion player only loads on Museum page
- Media assets load per-slot, not globally
- Cleanup callbacks release resources on scene disposal

### 3.3 Data Isolation
- Rendering engines do not access database directly
- All data flows through Server Components and typed interfaces
- Rights governance is enforced at the serving layer, not the rendering layer

---

## 4. Mitigations Summary

| Category | Mitigation | Status |
|---|---|---|
| Authentication | Strong auth, MFA for Owner | Implemented (Payload) |
| Authorization | Server-side RBAC, object-level | Implemented (Payload) |
| Input validation | Zod schemas, context-aware encoding | Implemented |
| Output encoding | React auto-escaping, CSP | Implemented |
| SQL injection | Parameterized queries (Payload ORM) | Implemented |
| XSS | React auto-escaping, no dangerouslySetInnerHTML | Implemented |
| CSRF | SameSite cookies, CSRF tokens | Implemented (Payload) |
| File upload | Type/size/content validation | Implemented |
| Secrets | Environment variables, masked in admin | Implemented |
| Audit logging | AuditEvent collection | Implemented |
| Rate limiting | Request limit guard on media API | Implemented |
| Backup/recovery | pg_dump, restore test | Verified |
| AI safety | Eligibility filter, sanitization, red-team tests | Implemented |
| Rights enforcement | Rights-gated media serving | Implemented |

---

## 5. Residual Risks

| Risk | Severity | Status | Mitigation Plan |
|---|---|---|---|
| No production database configured | High | External-blocked | Owner must create Supabase project |
| No monitoring configured | Medium | External-blocked | Owner must configure |
| Font licenses unresolved | Low | Owner-gated | Owner must approve |
| No threat model review by security professional | Medium | Open | Schedule professional review |
| WebGL context loss not tested in production | Low | Open | Add context-loss recovery test |

---

## 6. Alignment with Master Specification

This threat model aligns with:
- Master Spec §19.3 (Security baseline)
- Master Spec §19.4 (ASVS 5.0.0 Level 2 target)
- Master Spec §19.5 (Threat model priorities)
- ADR-034 (Rate limiting without Redis)
- ADR-007 (No vector column)
- ADR-012 (Join relation for rights)