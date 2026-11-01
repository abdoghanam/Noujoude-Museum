---
title: "NOUJOUDE DIGITAL HERITAGE MUSEUM"
subtitle: "Master Product Requirements, Experience, Content, Governance & Administration Specification"
date: "30 October 2026"
---

**Document ID:** NDM-MASTER-001  
**Version:** 1.1.0 — Closed Requirements Baseline  
**Document Status:** Consolidated Requirements Baseline — Formal Owner Approval Pending  
**Prepared:** 30 October 2026  
**Closure Addendum:** Appendix G — Final Closure of Previously Identified Requirements  
**Authoritative Language:** English  
**Public Experience Languages:** English and Arabic  
**Product:** Noujoude Digital Heritage Museum  
**Brand Promise:** *More than a collection... it's a story.*

---

# Document Control

## 0.1 Purpose of this document

This document is intended to become the single authoritative product and experience specification for the Noujoude Digital Heritage Museum once formally approved by the authorized Owner. It defines what the product is, what visitors can experience, how the public museum is organized, how content and collection records are structured, how the private Control Center operates, how institutional authority is applied, and how the product is validated.

It consolidates the unique requirements contained in the supplied source document and its successive addenda. Repeated introductions, duplicate page descriptions, competing navigation lists, repeated visual specifications, and overlapping administrative definitions have been normalized into one canonical structure. Unique requirements have been retained in their relevant canonical sections or explicitly recorded in the traceability and decision registers.

This is a product and system-behavior specification. It is not a claim that any described feature, asset, database field, security control, policy, or page is already implemented. Implementation status must be verified separately against the actual source code, database, deployed environment, and asset files.

## 0.2 Authority and precedence

The following precedence rules apply:

1. This approved Master Specification is the governing product baseline once formally approved by the authorized Owner.
2. The controlled decision register records explicit decisions that refine or change this baseline.
3. Detailed design files may elaborate visual composition and interaction but must not contradict this specification.
4. Technical architecture and implementation documents define how requirements are delivered; they must preserve the product behavior and safeguards defined here.
5. Content records, source documents, rights records, and collection evidence determine factual statements. Design intent and AI output are not evidence.
6. Superseded drafts and source addenda remain archival references, not competing authorities.

No implementation team member may silently resolve a material product contradiction by selecting whichever wording is easiest to build. The approved decision must be recorded in the decision log.

## 0.3 Normative language

The terms **MUST**, **MUST NOT**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are used in their conventional requirements sense:

- **MUST / SHALL:** mandatory acceptance requirement.
- **MUST NOT / SHALL NOT:** prohibited behavior.
- **SHOULD:** strongly recommended unless a documented reason justifies an alternative.
- **MAY:** permitted option, not a mandatory V1 capability.

## 0.4 Status vocabulary

| Status | Meaning | Permitted use |
|---|---|---|
| Baseline Requirement | A requirement established by the consolidated product brief | Build and test against it |
| Approved Decision | A decision explicitly accepted by the authorized Owner | Treat as fixed until formally changed |
| Proposed Standard | A professional default established in this specification but awaiting formal visual, legal, or technical approval where indicated | Use as the working baseline; do not misrepresent as formally approved |
| Owner Input Required | A factual or institutional value that only the Owner or authorized representative can provide | Use a controlled placeholder; never invent |
| Verification Required | A claim or asset whose evidence has not yet been checked | Do not present as verified or cleared |
| Future Scope | A capability intentionally outside V1 | Do not implement as a V1 dependency |
| Rejected / Prohibited | A behavior explicitly outside the product identity or safety boundary | Do not implement |

## 0.5 Requirement priority

| Priority | Definition |
|---|---|
| P0 — Release Critical | Required for a trustworthy, coherent V1 or for privacy, rights, security, and content integrity |
| P1 — Core Experience | Required for the intended complete museum experience; may be staged only through an approved release plan |
| P2 — Enhancement | Valuable capability that does not block the initial coherent release |
| F1 — Future | Explicitly deferred beyond V1 |

A requirement may be P0 even when the related feature is visually small. For example, correct rights enforcement and role authorization are release-critical.

## 0.6 Separation of specification and implementation truth

The Master Specification describes the intended product. A separate Implementation Verification Register must record, for each requirement:

- Requirement ID.
- Implementation status: Not Started, In Progress, Implemented, Verified, Deferred, or Not Applicable.
- Evidence: source path, database migration, test result, deployment URL, commit, or asset path as appropriate.
- Verification date.
- Verifier.
- Known limitation.

A code reference alone does not prove correct behavior. A successful build alone does not prove functional, visual, security, or content acceptance.

## 0.7 Change control

Every material change to navigation, product scope, data relationships, publication rules, AI knowledge access, Owner authority, design tokens, or legal/rights behavior must be recorded with:

- Change ID.
- Requestor and date.
- Reason and affected requirement IDs.
- Impact on user experience, content, data, permissions, security, and V1 scope.
- Decision and approver.
- Updated acceptance tests.

Repeatedly adding appendices is not an acceptable substitute for updating this canonical document.

---

# 1. Product Definition, Identity & Institutional Principles

## 1.1 Product definition

Noujoude is a bilingual digital heritage museum designed to preserve, interpret, curate, and present cultural objects, collections, documentary material, and related stories through a refined, museum-grade digital experience.

The product combines:

- Curated cultural and historical presentation.
- A restrained luxury visual identity.
- Country-based exhibition worlds.
- Collections organized by object type and curatorial meaning.
- Individual artifact records with transparent supporting information.
- Editorial and contextual storytelling.
- A bounded AI Curator that guides discovery using approved knowledge.
- A private institutional Control Center for content, collection, asset, rights, publishing, and access governance.

Noujoude is a museum experience, not a conventional website template or a technology showcase.

## 1.2 Product category and non-identity

Noujoude MUST NOT be presented or implemented as:

- An e-commerce platform.
- A marketplace.
- A product catalogue with commercial purchase intent.
- A generic blog or social-media feed.
- A gaming interface or reward-driven experience.
- A generic SaaS dashboard presented as the museum.
- A technology demo whose effects take precedence over cultural content.

The public product MUST NOT introduce product prices, buy buttons, shopping carts, checkout, payment flows, seller accounts, or sales-oriented calls to action.

The Contact experience is an institutional information and inquiry route, not a sales funnel.

## 1.3 Brand promise

**More than a collection... it's a story.**

The intended visitor progression is:

**You enter. You discover. You understand. You remember.**

The visitor should feel that they are entering a curated cultural environment, discovering a meaningful object, understanding its available context, and being guided through related material. Every page, image, label, motion treatment, and interaction must support this experience.

## 1.4 Brand essence and voice

The brand is defined by:

- Heritage.
- Elegance.
- Quiet sophistication.
- Emotional depth.
- Archival authenticity.
- Cultural respect.
- Curated rarity.
- Institutional restraint.

Public copy MUST sound warm, refined, knowledgeable, direct, and considered. It MAY be poetic where the subject warrants it, but MUST remain factually precise.

Public copy MUST NOT use aggressive marketing language, exaggerated claims, slang, sales language, empty luxury clichés, sensationalism, or unsupported institutional assertions.

The editorial voice should resemble a carefully written museum label or an invitation into a considered private collection—not a commercial advertisement.

## 1.5 Institutional facts versus brand language

The brand name and tagline may be used as working identity elements. The following facts remain Owner Input Required until documented and approved:

- Official legal or institutional name in English.
- Official Arabic institutional name.
- Approved Arabic transliteration or rendering of “Noujoude”.
- Legal nature and operating status of the collection or institution.
- Actual founding history and dates.
- Founder, Owner, collector, or institutional representative attribution.
- Official physical location, if intended for publication.
- Official contact details.
- Partnerships, affiliations, certifications, and accreditations.
- Any claim that the museum is officially recognized or accredited.

The website MUST NOT imply a legal museum designation, public institution status, accreditation, certification, partnership, ownership, or recognition without evidence and approval.

## 1.6 Institutional mission, vision, and values

The mission and vision statements must be based on the Owner-approved institutional story. Until that story is supplied, the product-level purpose is to preserve and present cultural heritage through responsibly curated objects, documentation, interpretation, and storytelling.

The following values are fixed product principles:

1. **Historical integrity:** no invented date, origin, creator, provenance, ownership, or event.
2. **Cultural respect:** country worlds must be represented with contextual specificity, not generic visual stereotypes.
3. **Curatorial responsibility:** every object and story must reflect the evidence available for it.
4. **Visual integrity:** luxury comes from restraint, composition, material quality, and consistency—not excessive decoration.
5. **Visitor dignity:** visitors are welcomed and guided, never pressured or manipulated.
6. **Institutional honesty:** existing, planned, incomplete, restricted, illustrative, and verified material must remain distinguishable.
7. **Information transparency:** unavailable information remains explicitly unavailable.
8. **Collection respect:** each object is presented with dignity and appropriate context.
9. **Privacy and rights:** visitor data, collection records, private notes, and media rights are protected.
10. **Identity protection:** trends and decorative effects must not dilute the central Noujoude identity.

## 1.7 Two product environments

Noujoude consists of two distinct but related environments:

### A. Public Museum

The visitor-facing environment communicates heritage, culture, discovery, storytelling, and curated presentation. It is atmospheric, editorial, accessible, and content-led.

### B. Private Master Control Center

The restricted administrative environment supports preservation, accuracy, content governance, media and rights management, institutional control, and accountable publishing. It must be operationally clear and information-dense while retaining the Noujoude design language.

The Control Center MUST NOT be publicly navigable or treated as a public museum destination.

---

# 2. Product Scope, Release Boundaries & Non-Goals

## 2.1 V1 objective

V1 must establish a credible, complete, and coherent digital museum experience centered on one fully curated first exhibition: **Morocco**. V1 includes the core museum infrastructure needed to present that exhibition responsibly and to support the wider six-world structure without pretending that every country exhibition is complete.

V1 must feel intentionally curated within its scope. A smaller, trustworthy exhibition is preferable to six superficially populated or empty exhibitions.

## 2.2 V1 public scope

V1 includes:

- Homepage / museum entrance.
- The Museum orientation page.
- The Worlds directory.
- A fully curated Morocco country world, subject to actual content readiness.
- Country pages or exhibition states for the remaining countries where approved introductory material exists.
- Collections directory and collection detail pages.
- Core collection categories.
- Artifact detail pages for approved public objects.
- Curated stories and story detail pages.
- AI Curator entry and bounded guidance grounded in approved museum knowledge.
- Museum-wide search across published content.
- About page using approved institutional facts.
- Contact / Request Information page.
- English and Arabic user interface and core navigation.
- Responsive layouts and accessible interactions.
- Public empty, loading, error, unavailable, restricted, and not-found states.
- Private Control Center for the essential content, asset, source, rights, publishing, and access workflows.

## 2.3 Country worlds

The six defined country worlds are:

1. Morocco.
2. Egypt.
3. Syria.
4. Mauritania.
5. Libya.
6. Sudan.

Morocco is the first fully developed and curated world in V1. The other five are part of the wider product identity and future exhibition expansion. Their public state must reflect their actual readiness; a directory card or introductory page must not imply a completed exhibition.

Country exhibition states are defined in Section 11.9.

## 2.4 Core collection taxonomy

The initial taxonomy includes:

- Stamps.
- First Day Covers.
- Coins.
- Documents.
- Letters.
- Souvenirs.
- Heritage Objects.
- Artifacts.

Additional categories MAY be introduced through the controlled taxonomy workflow. Category existence does not prove that public displayable objects exist in that category.

## 2.5 V1 administrative scope

The private Control Center must support the essential governance of:

- Countries and exhibition status.
- Eras and historical periods.
- Categories and taxonomy.
- Collections.
- Artifacts.
- Stories.
- Sources and evidence.
- Media assets and image rights.
- English and Arabic content.
- Verification and publication states.
- Authorized users and roles.
- Navigation and footer content.
- Core SEO metadata.
- Contact inquiries.
- Audit history and content revision.

The target administrative information architecture is the canonical 20-module structure in Section 16. V1 may phase advanced module capabilities only through an explicit release decision; it must not introduce an alternate, conflicting module map.

## 2.6 Explicit V1 exclusions

The following are outside V1 unless separately approved through change control:

- Online purchasing, checkout, cart, payments, or public artifact prices.
- Marketplace seller accounts or commercial product listings.
- Public visitor accounts as a prerequisite for browsing.
- Visitor-owned private collections, saved-item systems, or favorites.
- Subscription-based access.
- Public social feeds and user comments.
- Unmoderated public submissions.
- Full virtual reality tours.
- Augmented reality artifact experiences.
- Full immersive 3D environments.
- Gaming, reward, or points mechanics.
- Advanced public social-sharing systems beyond ordinary page sharing where approved.
- Unrestricted autonomous AI research.
- Automatic AI approval or publication.
- Public-facing technical dashboards.

The reference asset `favorite_heart_1024.webp`, account imagery, gift-boutique imagery, perfume-vanity imagery, or café imagery does not authorize the corresponding feature.

## 2.7 Future scope

Future capabilities may include:

- Fully developed Egypt, Syria, Mauritania, Libya, and Sudan exhibitions.
- Additional country worlds.
- Expanded taxonomy and collection groupings.
- Advanced semantic discovery.
- More capable but still governed AI research and guidance.
- Deeper cross-collection relationships.
- Additional editorial formats.
- Private visitor accounts and saved collections, subject to separate privacy and product approval.
- Expanded institutional analytics.
- Advanced exhibition formats.
- Optional immersive experiences subject to separate product approval.

Future scope must not be used as a dependency for V1 acceptance.

## 2.8 Content truth boundary

The product MUST NOT attempt to appear more complete than its underlying content and evidence justify. Planned exhibitions must not be represented as completed. Illustrative images must not be represented as photographs of real collection objects. Unknown provenance, uncertain dates, unverified ownership, incomplete translations, and empty collection categories must not be filled with fabricated material.

---

# 3. Audience & Visitor Needs

## 3.1 Audience segments

### A. Collectors and Philatelists

Need object identification, issue or production details where documented, classification, high-quality images, relevant references, and related items. They expect precise labels and transparent uncertainty.

### B. Numismatists

Need coin identity, issuer, denomination, material, date or period, mint or production details where documented, physical specifications where available, and references. The interface must not infer metal, weight, mint, or authenticity from an image alone.

### C. Researchers and Historians

Need source traceability, historical context, claim-level certainty, chronology, cross-references, and the ability to distinguish primary evidence, secondary literature, and interpretation.

### D. Heritage and Culture Enthusiasts

Need accessible context, country and cultural stories, meaningful visual presentation, and an understandable relationship between objects and cultural memory.

### E. General Visitors

Need clear orientation, accessible language, strong visual storytelling, simple navigation, short introductory copy, and optional access to deeper information.

### F. Institutions and Cultural Partners

Need credible institutional information, collection and rights context, professional contact routes, and a clear basis for potential collaboration. No partnership or institutional status may be implied before it is real and approved.

## 3.2 Progressive disclosure

Every content experience must support four information layers:

1. **Overview:** a short, accessible introduction.
2. **Story:** cultural, historical, or curatorial context.
3. **Details:** structured metadata and object-specific information.
4. **Sources:** documentary references and evidence appropriate for disclosure.

The general visitor must not be forced to read technical metadata. The researcher must not be prevented from accessing approved detailed information.

## 3.3 Visitor account model

Ordinary public exploration is anonymous and does not require registration. Contact forms may request limited information needed to answer an inquiry. Visitor accounts, private saved lists, and personalized collections are Future Scope, not V1.

---

# 4. Information Architecture, Navigation & Routes

## 4.1 Canonical public navigation

The primary navigation contains:

1. Home.
2. The Museum.
3. The Worlds.
4. Collections.
5. Stories.
6. AI Curator.
7. About.
8. Contact.

Search and language selection are global utility functions. They remain easy to reach without competing visually with the primary navigation.

## 4.2 Canonical public routes

The following route structure is the product baseline. Locale prefixing is mandatory for public English and Arabic experiences.

| Page | Canonical route pattern | Purpose |
|---|---|---|
| Home | `/{locale}` | Main entrance and discovery hub |
| The Museum | `/{locale}/the-museum` | Institutional orientation and museum philosophy |
| Worlds directory | `/{locale}/worlds` | Country-world discovery |
| Country world | `/{locale}/worlds/{country-slug}` | Individual cultural exhibition |
| Collections directory | `/{locale}/collections` | Browse curated collections |
| Collection detail | `/{locale}/collections/{collection-slug}` | Present one curated collection |
| Artifact detail | `/{locale}/artifacts/{artifact-slug}` | Present one heritage object |
| Stories directory | `/{locale}/stories` | Browse editorial and curatorial stories |
| Story detail | `/{locale}/stories/{story-slug}` | Present one story |
| AI Curator | `/{locale}/curator` | Guided museum discovery |
| Search | `/{locale}/search` | Museum-wide discovery |
| About | `/{locale}/about` | Approved institutional identity and mission |
| Contact | `/{locale}/contact` | General and collection inquiries |
| Privacy | `/{locale}/privacy` | Approved privacy notice |
| Terms | `/{locale}/terms` | Approved terms of use |

Locale identifiers are `en` and `ar`. The selected language preference must persist across navigation. The language switcher should preserve the current page and content context when a corresponding published translation exists.

## 4.3 Control Center route family

The private environment is rooted at `/control-center`. It must be protected by authentication and server-side authorization. A user must not gain access by hiding a navigation item alone. Every route and data operation must enforce permissions.

The internal module structure is defined in Section 16.

## 4.4 Route and navigation rules

- Every public page must have a canonical route and stable slug.
- Internal links must resolve to published and accessible content.
- A route must not expose draft or restricted content to anonymous visitors.
- The active language must be visible.
- Country, collection, artifact, and story context must be apparent through breadcrumbs or equivalent navigation cues where appropriate.
- The visitor must have a predictable return path.
- Direct links to private Control Center pages must be denied to unauthorized users.
- External links must be explicitly classified and validated.
- Duplicate or conflicting slugs must be prevented.
- Redirects must preserve SEO integrity and must not expose private routes.

## 4.5 Deterministic entrance behavior

The primary Home CTA, **Enter the Museum**, navigates to `/{locale}/the-museum`. The Museum page is the institutional orientation page, not a mandatory cinematic interstitial. Its principal exploration CTA leads to `/{locale}/worlds`. Visitors may enter other sections directly from the global navigation or featured homepage content; no single path is mandatory.

This decision resolves the previously overlapping descriptions of Home and The Museum without removing either page.

## 4.6 Primary visitor journeys

Primary journey:

`Home → The Museum → The Worlds → Country World → Collection → Artifact Detail → Related Story → AI Curator`

Alternative journeys:

- Home → Featured Collection → Artifact.
- Home → Featured Story → Related Artifacts.
- Search → Artifact, Story, Collection, or Country.
- AI Curator → Suggested Object or Collection.
- Country World → Featured Artifact → Related Story.

The visitor must be able to return to the originating country, collection, story, or search context without losing the browsing path unnecessarily.

---

# 5. Global Public Experience Requirements

## 5.1 Header

The global header contains, where appropriate:

- Approved Noujoude logo, wordmark, or monogram.
- Primary navigation.
- Language selector.
- Search access.
- AI Curator access.
- Current navigation context on deeper pages.

The header MUST NOT include pricing, cart, checkout, commercial promotions, or unapproved visitor account controls.

Desktop navigation may be fully expanded. Mobile navigation must use a compact, accessible menu with clear open/close behavior, touch-safe controls, and focus management.

## 5.2 Footer

The footer contains:

- Approved brand mark.
- Short institutional description.
- Tagline.
- Primary navigation links.
- Country-world links.
- Official contact details, only when approved.
- Language access.
- Copyright statement.
- Privacy and legal links when applicable.

The footer is an institutional closing element. It must not invent an address, phone number, social account, legal entity, or copyright owner.

## 5.3 Global search access

Search must be reachable from the primary public environment and must search the published public content set only. Search behavior is defined in Section 9.

## 5.4 Language selector

The selector must clearly identify English and Arabic. Changing language must retain the visitor's current content context when the same entity has a published version in the target language. When no target-language version exists, the interface must present an explicit localized notice and an explicit action to view the available language. It must not silently substitute or machine-generate an unapproved translation.

## 5.5 Navigation context and breadcrumbs

Where the page is nested, the visitor should be able to identify the current country, collection, artifact, or story and return to the relevant parent. Breadcrumbs must reflect the actual content relationships and current entry context; they must not invent a parent relationship merely to produce a breadcrumb.

## 5.6 Interface states

All public components must support relevant states:

- Initial / normal.
- Loading.
- Empty.
- No results.
- Error.
- Not found.
- Restricted.
- Temporarily unavailable.
- Offline / network failure.
- Media unavailable.
- Translation unavailable.

Messages must be human-readable and consistent with the museum voice. Technical stack traces and internal error details must never be shown publicly.

---

# 6. Public Page Specifications

Each page definition below is normative. Page templates may vary visually, but the purpose, required content, behavior, data rules, and acceptance conditions must remain consistent.

## 6.1 Home / Entrance

**Purpose:** Create the first emotional encounter with Noujoude and establish the museum's identity and available discovery paths.

**Required content:**

1. Approved monogram or wordmark.
2. Noujoude name.
3. Primary tagline.
4. One concise introductory statement.
5. Primary CTA: **Enter the Museum**.
6. A high-quality atmospheric museum visual.
7. A curated route into The Worlds, Collections, Stories, and AI Curator.
8. Optional featured content drawn only from approved published records.

**Required sections and order:**

1. Hero / Museum Entrance.
2. Institutional Introduction.
3. The Worlds.
4. Featured Collections.
5. Selected Artifacts.
6. Stories.
7. AI Curator Introduction.
8. Closing Invitation.

Sections may be hidden or reordered by an authorized Owner using approved page blocks, but the page must retain a clear primary identity and discovery hierarchy.

**Behavior:**

- The hero CTA navigates to The Museum.
- The global navigation remains available.
- Featured country, collection, artifact, and story cards link to their canonical public records.
- Published counts are derived from actual published records and current locale availability.
- A country card must show its real exhibition state.
- A missing feature item must be omitted or replaced by an approved editorial selection; never use fabricated content to fill space.

**Visual direction:** A restrained, dramatic museum entrance with deep noir or burgundy surroundings and controlled champagne-gold light. The composition must be spacious and focused, with no clutter, aggressive animation, or commercial landing-page patterns.

**Acceptance criteria:**

- A first-time visitor can identify the product as a digital heritage museum.
- The tagline and brand identity are visible.
- The Enter the Museum action works and leads to the canonical route.
- Featured content is real, approved, and linked correctly.
- Empty or unavailable sections do not render fabricated counts or objects.
- The layout is complete on mobile, tablet, and desktop.

## 6.2 The Museum

**Purpose:** Explain the museum's role, organization, philosophy, and ways to explore it.

**Required sections:**

1. Museum Identity — title, institutional introduction, primary museum visual, and cultural purpose.
2. Museum Philosophy — why collections matter, why heritage is preserved, the relationship between object and story, and the value of documentation and cultural memory.
3. Museum Exploration — entry points to The Worlds, Collections, Stories, and AI Curator.
4. Museum Atmosphere — approved images of museum interiors, gallery spaces, archival environments, and curated displays.
5. Institutional Closing — a concise statement connecting the museum's purpose to the tagline.

**Separation from Home:** The Museum is not a second generic homepage. Home is the landing and discovery hub; The Museum is the interpretive orientation page. It is not a mandatory full-screen interstitial.

**Acceptance criteria:** The page explains how to explore the museum and does not repeat the About page's institutional biography or invent a physical museum building.

## 6.3 The Worlds Directory

**Purpose:** Present the museum's country-based cultural organization.

**Heading:** The Worlds — Six Cultural Worlds.

Each country card includes:

- Country name in English and Arabic.
- Native name where appropriate and verified.
- Approved country visual.
- Short introduction.
- Featured collection, only when one exists.
- Count of published artifacts, only when data supports it.
- Exhibition status.
- Entry link.

**Exhibition labels:**

- Open Exhibition.
- Coming Soon.
- In Preparation.
- Temporarily Unavailable.

The label must reflect the actual publication and readiness state. A country with only an introduction is not a completed exhibition.

**Acceptance criteria:** All six defined countries can be represented in the directory, but only a genuinely ready exhibition may be presented as open. Empty worlds must not be filled with illustrative objects presented as collection material.

## 6.4 Country World Detail

Each country page is a distinct cultural exhibition within the Noujoude identity. It is not merely a country filter on a generic collection page.

**Required sections:**

1. Country Hero — country name, verified native/local name where relevant, country visual, short introduction, exhibition status, primary exploration action.
2. Curatorial Introduction — cultural identity, relevant heritage themes, actual museum material related to the country, and object/story context.
3. Featured Collections — title, cover, description, published item count, and link.
4. Featured Artifacts — image, official title, category, era if known, claim-review summary, and detail link.
5. Stories from the Country — title, introduction, imagery, related artifacts, and story link.
6. Curator Perspective — a documented or approved curatorial note explaining the relationship between selected objects and their cultural setting.
7. Related Exploration — other collections, stories, other country worlds, and relevant AI Curator prompts.

**Country-specific identity:** Country pages may vary in architectural reference, local material, color accents, historical themes, and culturally appropriate imagery. They must retain the Noujoude wordmark, typography system, core color identity, navigation, and overall quality standard.

**Acceptance criteria:** The page must identify which content is actual collection material, which is contextual illustration, and what is not yet available. All featured relationships must be genuine relationships in the content model.

## 6.5 Collections Directory

**Purpose:** Let visitors browse objects by object type, shared subject, cultural context, or curatorial logic.

**Required content:**

- Page heading and introduction.
- Collection categories and curated collections.
- Collection title and cover image.
- Short description.
- Country associations.
- Published object count, when available.
- Collection status.
- Link to collection detail.

The initial taxonomy includes Stamps, First Day Covers, Coins, Documents, Letters, Souvenirs, Heritage Objects, and Artifacts.

**Empty collection behavior:** If no public artifacts are available, show a clear unopened, in-preparation, or unavailable state. Do not use invented objects or AI-generated artifact imagery to simulate a populated collection.

**Collection-grid behavior:** Collections must be presented as curated museum groupings, not a shopping grid. Card density, image scale, and metadata must support discovery without prices, ratings, or purchase affordances.

## 6.6 Collection Detail

**Required content:**

- Collection title, subtitle, and introduction.
- Curatorial explanation of why these objects belong together.
- Country and period context where applicable.
- Cover image and approved gallery imagery.
- Published artifacts belonging to the collection.
- Related stories.
- Curator note.
- Related collections where meaningful.

**Required behavior:**

- Display only published artifacts available in the selected locale or clearly disclose language unavailability.
- Support filters only when corresponding structured data exists.
- Display a published artifact count derived from live records.
- Preserve the visitor's country or collection context when opening an artifact and returning.
- Do not remove an artifact record when removing its collection relationship.

**Acceptance criteria:** The collection page communicates its curatorial logic and does not imply that every item in the underlying private inventory is publicly available.

## 6.7 Artifact Detail

**Purpose:** Present an individual object with its identity, available evidence, context, and significance.

**Required content architecture:**

1. Object Identity — official title, original title where relevant, object type, category, and stable identifier where appropriate.
2. Main Image — primary approved image and gallery access.
3. Museum Description — short description and extended description when available.
4. Historical Context — date/period, geography, issuer/creator when documented, and context supported by evidence.
5. Classification — country relationships, era, category, and collection relationships.
6. Documentation — evidence references and a clear public summary of what has been reviewed.
7. Provenance — documented custody/ownership history events, only where supported and approved for disclosure.
8. Condition & Preservation — approved condition description, preservation observations, and relevant imagery.
9. Image & Usage Rights — public credits, restrictions, or notices required by the relevant media rights record.
10. Curator Note — approved curatorial interpretation, clearly distinguished from factual metadata.
11. Related Objects — genuine relationships such as shared collection, documented period, or editorial association.
12. Related Stories — published narratives connected to the object.
13. AI Curator Connection — optional entry point with the current artifact as context.
14. Return Navigation — return to originating collection, country, search results, or story where practical.

**Required behavior:**

- The visitor can inspect images, metadata, context, and related material.
- Unknown facts remain unknown; approximate dates are labelled approximate.
- The page distinguishes factual claims, curatorial interpretation, and absent information.
- Publication state is never presented as proof of authenticity.
- A general “Verified” badge must not imply that the object's authenticity or ownership has been established.

**Prohibited content:** Price, estimated sale value, purchase CTA, cart, checkout, seller information, or commercial language.

**Acceptance criteria:** A public artifact page has an approved locale title and description, an eligible image with rights clearance, valid relationships, no prohibited claims, and no internal-only fields.

## 6.8 Artifact Image Viewer

The viewer provides an inspection surface for the artifact's approved images.

**Controls:**

- Open image viewer.
- Close viewer.
- Previous / next image where multiple images exist.
- Zoom in and out where a suitable high-resolution source exists.
- Reset zoom.
- Pan or drag when zoomed.
- Display caption and applicable image credit.

**Input behavior:**

- Desktop: keyboard-accessible controls and Escape to close; arrow navigation when the viewer owns focus.
- Mobile: touch gestures and touch-safe controls.
- Focus must be trapped appropriately while modal and returned to the trigger on close.
- Background content must not remain interactable while the modal is active.
- Image proportions must be preserved; the viewer must not crop details unexpectedly.
- If the original/high-resolution file is unavailable, do not show a misleading zoom control.

## 6.9 Stories Directory and Story Detail

Stories are the emotional and editorial layer of the museum.

**Supported story types:**

- Exhibition story.
- Object story.
- Country story.
- Collection story.
- Thematic story.
- Curatorial essay.
- Contextual note.
- Historical reflection.
- Introductory museum text.

**Story directory card:** title, cover image, short summary, associated country/collection where applicable, and link.

**Story detail structure:**

1. Headline and optional subtitle.
2. Introduction.
3. Narrative body organized into readable sections.
4. Supporting images and captions.
5. Associated countries, collections, artifacts, and periods.
6. Source references where required.
7. Curator note or author attribution where approved.
8. Related stories and objects.

**Narrative standard:** Start with the object, question, or meaningful idea; move into documented historical or cultural context; end with a clear point for the visitor to remember. Keep the voice reflective, informed, emotionally resonant, and respectful. Avoid sensationalism, fiction presented as fact, generic museum clichés, and filler.

AI-generated text may assist drafting but MUST remain subject to human editorial and curatorial review before publication.

## 6.10 AI Curator Public Experience

The AI Curator is a museum guide, not a generic chatbot.

**Interface components:**

- Curator identity and disclosure that it is AI.
- Localized greeting.
- Short explanation of what it can help with.
- Suggested questions.
- Conversation area.
- Related object/story/collection cards when relevant.
- Clear source references where available.
- Fallback and unavailable states.

**Permitted visitor tasks:**

- Explain approved artifact descriptions.
- Help discover available objects and collections.
- Connect objects and stories using documented relationships.
- Explain approved historical context.
- Clarify metadata labels.
- Suggest exploration paths.
- Explain what is unknown or unavailable.
- Help visitors navigate the museum.

**Prohibited behavior:**

- Inventing dates, makers, ownership, authenticity, provenance, or historical events.
- Claiming personal experience or pretending to be human.
- Presenting unsupported inference as fact.
- Using private collection notes or visitor inquiries as public knowledge.
- Claiming the museum owns an item merely because it is discussed.
- Publishing or changing museum content.

The detailed AI contract is in Section 14.

## 6.11 About

**Purpose:** Explain the approved identity, mission, origin story, curatorial philosophy, and actual institutional context of Noujoude.

Possible sections:

- Institutional introduction.
- Approved founding story.
- Mission and vision.
- Curatorial philosophy.
- Collection scope and preservation approach.
- Owner/founder attribution where authorized.
- Institutional details and contact route where approved.

The page must not invent the institution's legal status, physical building, founder's biography, origin date, accreditations, or partnerships. It must not duplicate The Museum's orientation content.

## 6.12 Contact / Request Information

**Purpose:** Provide a formal, non-commercial channel for communication.

**Inquiry categories:**

- General Inquiry.
- Collection Information.
- Historical Research.
- Image Rights.
- Correction Request.
- Additional Documentation.
- Institutional Communication.

**Form fields:** name (where needed), email or approved reply channel, inquiry type, subject, message, and any legally required consent. Do not collect unnecessary sensitive information.

**Behavior:** validate fields, prevent spam and abuse, show localized success/error messages, protect private inquiry content, route the request to an authorized queue, and provide a reference number where supported. Inquiry content is not public and is not automatically accessible to the AI Curator.

## 6.13 Search

Search supports public discovery across:

- Artifact titles and alternative names.
- Country names.
- Era and period labels.
- Categories.
- Collection titles and descriptions.
- Story titles and published story text.
- Approved curator notes where explicitly included in the public search index.

**Result types:** Artifact, Collection, Country, Story.

Each result shows type, title, short excerpt, image where available, relevant country/period metadata, and a canonical destination.

**Search states:** Initial, Searching, Results Found, No Results, Error, and Unavailable.

Filters and sorting appear only when the associated structured data exists. Search indexes only public, published, locale-eligible content. Drafts, restricted notes, private records, inquiry submissions, and secrets must never enter the public search index.

## 6.14 Special Public Pages and States

The product includes museum-consistent experiences for:

- Not Found.
- General Error.
- Restricted Access.
- Session Expired where relevant to authenticated areas.
- Search Results.
- No Search Results.
- Empty Collection.
- Unavailable Artifact.
- Unavailable Story.
- Unavailable Media.
- Unavailable Translation.
- Offline / Connection Failure.

Every state explains the condition in visitor-friendly language and offers a safe path back where possible. Internal technical details remain private.

---

# 7. Content Architecture & Editorial Standards

## 7.1 Content types

The product supports these distinct content types:

- Institutional identity record.
- Static public page.
- Reusable page section/block.
- Country world.
- Era / historical period.
- Category / taxonomy node.
- Collection.
- Artifact.
- Story.
- Source / evidence reference.
- Provenance event.
- Media asset.
- Rights record.
- Translation / localized content.
- Inquiry.
- User, role, and permission.
- Publication and revision record.
- AI knowledge-source record.
- Audit event.

Each type must have a clear purpose and must not be represented by an overloaded generic “content” object where the meaning or access rules differ materially.

## 7.2 Editorial field types

Textual content may include:

- Title.
- Subtitle.
- Short summary.
- Introduction.
- Long description.
- Rich-text body.
- Metadata label.
- Curator note.
- Caption.
- Alt text.
- Guidance text.
- Institutional statement.
- Source citation text.
- Call-to-action label.

Every field must be assigned a content role, language, visibility, and editorial status.

## 7.3 Editorial workflow

The canonical editorial lifecycle is:

`Draft → Editorial Review → Curatorial / Fact Review (where required) → Approved → Published`

Content may be returned for correction at any review stage. Scheduling is optional and may be implemented where release operations support it. Archiving is separate from unpublishing.

The required reviewer depends on content type:

- Historical and object claims require curatorial/evidence review.
- Editorial copy requires editorial review.
- Translation requires language review.
- Media requires rights and asset review.
- Publication requires a user authorized to publish.

No AI-generated draft may approve itself or publish itself.

## 7.4 Editorial standards

All public text must:

- Be accurate and supported by the appropriate record or source.
- Distinguish fact, interpretation, uncertainty, and absence of information.
- Maintain the Noujoude voice.
- Avoid unsupported superlatives and claims.
- Use consistent terminology.
- Respect cultural names and original-language spellings.
- Be readable on mobile and accessible to assistive technology.
- Avoid duplicated copy across Home, The Museum, About, country pages, and collection pages.

## 7.5 Interface copy inventory

The editorial system must manage localized copy for:

- Navigation labels.
- Button labels.
- Form labels and instructions.
- Success and error messages.
- Loading messages.
- Empty states.
- No-result states.
- Rights and availability notices.
- Verification summaries.
- Translation-unavailable notices.
- AI Curator greetings and fallback responses.
- Search filters and result types.
- Consent and privacy notices.

System copy is part of the product and must be localized and reviewed, not hard-coded inconsistently across pages.

## 7.6 Content completeness rules

The system must distinguish a field that is intentionally not applicable from one that is missing. Empty strings must not be used as a substitute for a declared unknown, a restricted field, or a not-applicable state.

Public count labels must be based on records currently eligible for public display in the selected language. Internal draft records must not inflate visitor-facing collection totals.

---

# 8. Collection Model, Artifact Registry & Curatorial Evidence

## 8.1 Core principle

The collection record is the factual foundation of the museum. Each artifact must be represented as a real object record supported by available evidence and appropriate rights. A generated image, decorative visual, category illustration, or AI-generated description is not evidence that an object exists in the collection.

The data model MUST separate:

- Object identity.
- Descriptive metadata.
- Historical and cultural context.
- Factual claims.
- Evidence sources.
- Provenance events.
- Ownership statements.
- Authenticity assessments.
- Media and image rights.
- Verification/review state.
- Editorial approval.
- Locale-specific publication state.

These concepts must not be collapsed into one generic description or one global “verified” flag.

## 8.2 Logical entities

The logical model includes, at minimum:

1. `Country` — a country world within the museum.
2. `Era` — an historical period or chronological classification.
3. `Category` — an object type or taxonomy node.
4. `Collection` — a curated grouping of artifacts.
5. `Artifact` — an individual heritage object.
6. `Story` — a published narrative.
7. `Source` — a documentary or research reference.
8. `ArtifactClaim` — a specific factual statement about an artifact.
9. `ClaimEvidence` — a link between a claim and one or more evidence records.
10. `VerificationReview` — a review decision on a claim or defined set of claims.
11. `ProvenanceEvent` — a documented custody, ownership, transfer, or collection-history event.
12. `MediaAsset` — an image, document, or other media file.
13. `RightsRecord` — permissions and legal/usage restrictions for media or documentation.
14. `LocalizedContent` — locale-specific text and metadata where a separate translation record is needed.
15. `User`, `Role`, and `Permission` — the institutional access model.
16. `PublicationRecord` — locale-specific publication state and timestamp.
17. `Revision` — a version of an editable record.
18. `Inquiry` — a visitor-submitted communication.
19. `AIKnowledgeSource` — an approved source record eligible for retrieval.
20. `AuditEvent` — an immutable or protected record of a consequential action.

The list describes the logical domain model. It does not assert that all entities or fields already exist in the current physical database.

## 8.3 Country entity

A Country represents a cultural/geographical world within the museum.

| Field | Logical type | Requirement | Public use |
|---|---|---|---|
| `id` | UUID / stable identifier | System | No |
| `slug` | String | Required, unique | URL |
| `name_en` | String | Required for English publication | Yes |
| `name_ar` | String | Required for Arabic publication | Yes |
| `native_name` | String | Optional, verified | When relevant |
| `country_code` | String | Optional | Optional |
| `introduction` | Localized text | Required for an open exhibition | Yes |
| `long_description` | Localized rich text | Optional | Yes |
| `hero_media_id` | Media reference | Conditional | Yes |
| `mobile_hero_media_id` | Media reference | Optional | Yes |
| `cultural_theme_ids` | Relationship list | Optional | Yes |
| `exhibition_status` | Enum | Required | Yes |
| `featured_collection_ids` | Relationship list | Optional | Yes |
| `display_order` | Integer | Optional | No |
| `created_at`, `updated_at` | Timestamp | System | No |

A Country record is not proof that its exhibition is complete. Country-specific content must be reviewed for cultural specificity and source support.

## 8.4 Era entity

An Era represents a historical period or chronological classification.

| Field | Logical type | Requirement | Public use |
|---|---|---|---|
| `id` | UUID | System | No |
| `slug` | String | Required, unique | URL/filter |
| `name_en`, `name_ar` | String | Required for relevant locale publication | Yes |
| `start_year` | Integer | Optional | If known |
| `end_year` | Integer | Optional | If known |
| `date_precision` | Enum | Required | Yes |
| `description` | Localized text | Optional | Yes |
| `historical_context` | Localized rich text | Optional | Yes |
| `source_claim_ids` | Relationship list | Conditional | As policy allows |
| timestamps | System | System | No |

Supported date precision includes Exact Date, Exact Year, Approximate Year, Estimated Range, Broad Historical Period, and Unknown. Calendar system and uncertainty notes must be recorded where necessary. Approximate or estimated dates must never be rendered as exact dates.

## 8.5 Category entity

A Category represents an object classification.

| Field | Logical type | Requirement | Public use |
|---|---|---|---|
| `id` | UUID | System | No |
| `slug` | String | Required, unique | URL/filter |
| `name_en`, `name_ar` | String | Required for relevant locale publication | Yes |
| `description` | Localized text | Optional | Yes |
| `parent_id` | Category reference | Optional | Hierarchy |
| `icon_asset_id` | Media reference | Optional | Yes |
| `cover_asset_id` | Media reference | Optional | Yes |
| `display_order` | Integer | Optional | No |
| `is_active` | Boolean | Required | No |
| timestamps | System | System | No |

Categories may form a controlled hierarchy. Deactivating a category must not delete artifact records. A replacement or migration plan must exist before removing a category with active relationships.

## 8.6 Collection entity

A Collection represents a curated group of objects.

| Field | Logical type | Requirement | Public use |
|---|---|---|---|
| `id` | UUID | System | No |
| `slug` | String | Required, unique | URL |
| `title` | Localized string | Required for locale publication | Yes |
| `subtitle` | Localized string | Optional | Yes |
| `introduction` | Localized text | Required for publication | Yes |
| `editorial_content` | Localized rich text | Optional | Yes |
| `country_ids` | Many-to-many | Optional | Yes |
| `category_ids` | Many-to-many | Optional | Yes |
| `cover_media_id` | Media reference | Conditional | Yes |
| `story_ids` | Relationships | Optional | Yes |
| `curator_note` | Localized text | Optional | Yes |
| `publication_state` | Per-locale state | Required | No |
| `display_order` | Integer | Optional | No |
| `featured_state` | Boolean / editorial selection | Optional | Yes |
| timestamps | System | System | No |

Collections may be country-specific or cross-country. Their curatorial purpose must explain why the objects belong together. Collection membership is a relationship, not ownership of the artifact record.

## 8.7 Artifact entity — core record

An Artifact represents an individual heritage object.

| Field | Logical type | Requirement | Public use |
|---|---|---|---|
| `id` | UUID | System | No |
| `accession_number` | String | Optional / Owner-defined | Only if approved |
| `slug` | String | Required, unique | URL |
| `title` | Localized string | Required for locale publication | Yes |
| `original_title` | String | Optional, as documented | Yes |
| `alternative_names` | Structured list | Optional | When relevant |
| `object_type` | String / controlled enum | Required | Yes |
| `category_ids` | Relationship list | Required for public classification | Yes |
| `era_id` | Relationship | Optional | When known |
| `short_description` | Localized text | Required for public display | Yes |
| `long_description` | Localized rich text | Optional | Yes |
| `materials` | Structured list | Optional, evidence-based | When known |
| `dimensions` | Structured measurement | Optional, documented | When known |
| `production_date` | Structured date range + precision | Optional | When known |
| `origin_location` | Structured location | Optional | When known |
| `creator_or_issuer` | Structured party/reference | Optional | When documented |
| `primary_media_id` | Media reference | Conditional | Yes |
| `media_relationships` | Relationship list | Optional | Yes |
| `claim_ids` | Relationship list | Required for supported factual presentation | Appropriate summary |
| `provenance_event_ids` | Relationship list | Conditional | Approved disclosure only |
| `rights_record_ids` | Relationship list | Conditional | Appropriate public notice |
| `curator_note` | Localized text | Optional | Yes |
| `condition_record` | Structured record | Optional | If approved |
| `publication_state` | Per-locale state | Required | No |
| `created_at`, `updated_at` | Timestamp | System | No |
| `created_by`, `updated_by` | User reference | System | Internal |

An artifact may have several country relationships and several collection relationships. The data model must not force a single country or a single collection where the real curatorial record requires multiple associations.

## 8.8 Category-specific metadata profiles

The generic Artifact record must not force irrelevant fields onto every object. Category-specific metadata is conditional and must be shown only when appropriate and documented.

### Stamps and First Day Covers

Potential fields include issuing authority, issue date, face value, currency, series, catalogue reference, printing method, perforation, postmark/cancellation details, first-day issue information, envelope/postal details, and relevant condition notes. Each field is optional unless it applies and is supported by the actual item record.

### Coins

Potential fields include issuing authority, denomination, currency, issue or mint year, mint, metal/material, weight, diameter, thickness, edge, catalogue reference, and documented condition. The interface must not infer metal, weight, mint, or authenticity from visual appearance alone.

### Documents and Letters

Potential fields include document type, author/creator, sender, recipient, date, date precision, language, script, place, page count, archive identifier, transcription, translation, and display/copyright rights. The system must distinguish an original document image from a transcription or translation.

### Souvenirs and Heritage Objects

Potential fields include maker, material, technique, dimensions, function, cultural context, place, period, and condition where documented. Cultural or symbolic meaning must be supported and reviewed.

### Other Artifacts

Additional profiles may be introduced only through an approved category schema. Unstructured notes may supplement, but must not replace, fields required for filtering, sorting, accessibility, or evidence review.

## 8.9 Story entity

A Story represents an approved museum narrative.

| Field | Logical type | Requirement | Public use |
|---|---|---|---|
| `id` | UUID | System | No |
| `slug` | String | Required, unique | URL |
| `title`, `subtitle` | Localized strings | Required / optional | Yes |
| `summary` | Localized text | Required for publication | Yes |
| `body` | Localized rich text | Required for publication | Yes |
| `cover_media_id` | Media reference | Optional | Yes |
| `country_ids` | Many-to-many | Optional | Yes |
| `collection_ids` | Many-to-many | Optional | Yes |
| `artifact_ids` | Many-to-many | Optional | Yes |
| `source_ids` | Relationships | Conditional | Appropriate public reference |
| `author_reference` | User / approved display name | Optional | If approved |
| `curator_note` | Localized text | Optional | Yes |
| `publication_state` | Per-locale state | Required | No |
| timestamps | System | System | No |

Stories must explicitly identify the content they discuss. A relationship must have a meaningful editorial or documented basis.

## 8.10 Source entity

A Source represents a documentary, historical, or research reference used to support one or more factual claims.

| Field | Logical type | Requirement |
|---|---|---|
| `id` | UUID | System |
| `title` | String | Required |
| `author` | String/reference | Optional |
| `publisher_or_institution` | String | Optional |
| `publication_date` | Date/string | Optional |
| `source_type` | Controlled enum | Required |
| `url` | URL | Optional |
| `archive_identifier` | String | Optional |
| `page_or_reference` | String | Optional |
| `language` | Locale/language | Required when known |
| `excerpt` | Text | Optional, subject to rights |
| `reliability_assessment` | Structured review | Optional |
| `review_status` | Enum | Required |
| `notes` | Internal text | Optional |
| timestamps | System | System |

Source types may include historical book, academic publication, archival record, original document, museum reference, official institutional publication, private collection record, catalogue entry, or other documented reference.

A source link alone does not establish authenticity, ownership, or provenance.

## 8.11 Claim and evidence model

An ArtifactClaim is one specific factual statement, for example a proposed issue year, issuing authority, material, place of production, or historical association.

Each claim must record:

- Claim ID and linked artifact.
- Claim type.
- Claim text or structured value.
- Language, where applicable.
- Current review status.
- Uncertainty or qualification.
- Reviewer and review timestamp.
- Visibility/disclosure rule.

ClaimEvidence links a claim to one or more Source records and records the evidential relationship, reference location, relevant excerpt or note (subject to rights), and whether the source supports, contradicts, or contextualizes the claim.

**Claim review states:** Draft, Awaiting Evidence, Under Review, Supported, Partially Supported, Conflicting Evidence, Not Established, Rejected, Requires Re-review.

Verification is claim-specific. Verifying an object title or approximate period does not verify its authenticity, ownership, every date, or all historical statements. The public artifact page may display a concise documentation summary, but that summary must not imply more certainty than the reviewed claims support.

## 8.12 Provenance model

Provenance is the documented history of an object's custody, ownership, transfer, or collection history. It is not a synonym for a bibliography or source list.

A ProvenanceEvent may include:

- Event ID and artifact ID.
- Event type: created/issued, acquired, transferred, held by, deposited, documented, exhibited, or other approved type.
- Person or institution involved, where documented.
- Start/end date or period and date precision.
- Location where documented.
- Description of the event.
- Supporting source/evidence links.
- Confidence/review state.
- Restrictions on public disclosure.
- Reviewer and review date.

Gaps in provenance must remain gaps. The system must not infer an unbroken ownership chain from isolated records.

## 8.13 Ownership and authenticity

Ownership is a separate statement requiring its own evidence and approval. An artifact's presence in a collection database, physical possession, or display does not automatically prove legal ownership.

Authenticity is a separate assessment. It may require specialist examination or other qualified processes. The CMS must not automatically mark an artifact authentic because it has a source, provenance note, or curator description.

The public vocabulary must be precise. Use “documented”, “recorded”, “attributed”, “reported”, “estimated”, or “not established” where those terms match the evidence. Use “authentic”, “certified”, “original”, or “provenance confirmed” only when the applicable assessment and supporting basis exist and are approved for disclosure.

## 8.14 Media asset entity

A MediaAsset represents an original file or derivative.

| Field | Logical type | Requirement |
|---|---|---|
| `id` | UUID | System |
| `filename` | String | Required |
| `storage_key` | Protected storage reference | Required |
| `mime_type` | String | Required |
| `file_size` | Integer | System |
| `width`, `height` | Integer | System where image |
| `aspect_ratio` | Numeric | System where image |
| `checksum` | String | System |
| `alt_text_en`, `alt_text_ar` | Localized text | Required for meaningful public images |
| `caption_en`, `caption_ar` | Localized text | Optional |
| `media_role` | Controlled enum | Required |
| `focal_point` | Structured coordinates | Optional |
| `rights_record_id` | Relationship | Conditional |
| `is_primary` | Boolean | As required by related object |
| `display_order` | Integer | Optional |
| `source_asset_id` | Media relationship | For derivatives |
| timestamps / uploader | System | System |

Media roles include logo, entrance, country hero, collection cover, artifact primary, artifact secondary, story cover, AI Curator visual, decorative background, texture, mobile variant, certificate, watermark, document scan, and interface reference.

## 8.15 Rights record entity

A RightsRecord applies to a file and, where relevant, a defined usage context.

| Field | Logical type | Requirement |
|---|---|---|
| `id` | UUID | System |
| `rights_holder` | String/reference | Required when known |
| `creator` | String | Optional |
| `rights_type` | Controlled enum | Required |
| `permission_status` | Controlled enum | Required |
| `attribution_text` | String | Conditional |
| `license_reference` | URL/document reference | Optional |
| `usage_scope` | Structured list | Required |
| `allowed_channels` | Structured list | Optional |
| `geographic_restrictions` | Structured list | Optional |
| `start_date`, `expiry_date` | Date | Optional |
| `permission_document` | Protected file reference | Optional |
| `reviewed_by`, `review_date` | User/timestamp | Optional |
| `notes` | Internal text | Optional |

Rights states include Rights Confirmed, Public Domain Documented, Licensed, Permission Pending, Restricted, Not Cleared, Expired, and Unknown. The presence of a file in the library does not prove a right to display it.

## 8.16 Inquiry, user, publication, revision, and audit entities

**Inquiry:** inquiry ID, submitter fields required by the form, category, subject, message, submission timestamp, assigned staff member, state, internal notes, response history, and retention/deletion metadata.

**User:** user ID, name, email, active state, assigned role(s), permission scope, account creation date, last access, and security state. Passwords, secrets, recovery tokens, and signing credentials are not content fields and must never be displayed in the CMS.

**PublicationRecord:** content entity, locale, publication state, published/unpublished timestamps, publisher, scheduled time if used, and public route/slug version.

**Revision:** record type and ID, revision ID, previous and new values or a safe structured diff, author, timestamp, change reason, and associated review/publication state.

**AuditEvent:** event ID, timestamp, actor, action, target record, outcome, relevant before/after state where appropriate, and security context. Audit records are protected from ordinary editing.

## 8.17 Relationship cardinality — canonical rules

| Relationship | Cardinality | Rule |
|---|---|---|
| Country ↔ Collection | Many-to-many | A curated collection may span countries |
| Country ↔ Artifact | Many-to-many through typed relationship | Record whether a country is issuer, origin, production location, find location, or cultural association |
| Collection ↔ Artifact | Many-to-many | A primary display collection may be designated without restricting other memberships |
| Category ↔ Artifact | Many-to-many or controlled primary + secondary taxonomy | The approved ERD must support valid cross-classification without duplication |
| Era ↔ Artifact | Many-to-one or many-to-many according to documented periods | Do not force a precise era if the date is uncertain |
| Story ↔ Artifact | Many-to-many | Relationship must be meaningful and explicit |
| Story ↔ Collection | Many-to-many | Relationship must be editorially justified |
| Story ↔ Country | Many-to-many | Country association must be meaningful |
| Artifact ↔ Source | Many-to-many through ArtifactClaim / ClaimEvidence | Sources support claims, not merely the artifact in the abstract |
| Artifact ↔ ProvenanceEvent | One-to-many | Events remain chronologically ordered and evidence-linked |
| MediaAsset ↔ Artifact/Story/Collection/Country/Page | Many-to-many through usage relationships | Usage role and rights context must be retained |
| MediaAsset ↔ RightsRecord | One-to-many or many-to-many where rights differ by use | No universal permission assumption |
| Entity ↔ Locale | One-to-many localized records | Locale-specific editorial and publication states |

**Country relationship types** must include, as applicable: Issued In, Produced In, Originated In, Found In, Associated With, Used In, or other controlled values. A primary display country is a presentation choice; it does not erase other documented relationships.

Removing a relationship must not delete the underlying artifact, story, collection, source, or media record.

## 8.18 Data integrity and governance rules

- Use stable identifiers; do not use mutable titles as primary keys.
- Enforce unique canonical slugs within the appropriate locale and route namespace.
- Prevent orphaned relationships.
- Preserve referential integrity.
- Keep the original media file separate from derivatives.
- Record claim sources and review decisions.
- Separate artifact date from record creation date.
- Separate country of issue, origin, manufacture, discovery, and cultural association.
- Separate publication, verification, translation, media-processing, and rights states.
- Preserve audit history for consequential changes.
- Do not permanently delete referenced institutional records through ordinary UI actions.
- Distinguish `Unknown`, `Not Applicable`, `Not Recorded`, `Restricted`, and `Pending Verification`.
- Do not use an empty string to represent a meaningful unknown state.

## 8.19 Physical schema boundary

This document defines the logical product data model, not a final physical SQL schema. The source material mentions PostgreSQL and a `VECTOR(768)` embedding field as a possible/internal technical representation. Any vector dimension must match the selected embedding model and be verified against the actual implementation; it is not a public artifact field or a fixed product requirement. Physical column names, constraints, indexing, migrations, storage paths, and database-specific types belong in a separate approved Technical Data Dictionary and ERD.

---

# 9. Search, Discovery & Content Retrieval

## 9.1 Search scope

Search indexes only content that is public, published, approved for the selected locale, and not restricted by rights or access policy.

The index may include artifact titles, original and alternative names, public summaries, approved metadata, country names, period labels, category names, collection titles and descriptions, story titles and bodies, and approved public curator notes.

The following must never be indexed for public search: drafts, private curatorial notes, private provenance documents, rights permission files, visitor inquiries, user records, access credentials, and restricted content.

## 9.2 Search behavior

- Search must tolerate ordinary capitalization, spacing, and common punctuation differences.
- Search must respect the selected locale and may offer cross-language matching only when results are labelled clearly.
- Results must distinguish artifact, collection, country, and story types.
- Filters appear only when the relevant structured values exist in the current result set.
- Sort options must not imply chronology when dates are unknown or incomparable.
- Result counts must reflect current eligible results.
- Empty, no-results, unavailable, and error states must be distinct.

## 9.3 Sorting and filtering

Supported filter dimensions may include Country, Era/Period, Artifact Type, Category, Collection, and Material where structured and populated.

Supported sort choices may include Featured, Recently Added, Alphabetical, and Historical Period. “Oldest/Newest” chronology sorting is enabled only when the underlying dates are comparable and their precision is represented correctly.

## 9.4 Semantic search

Advanced semantic retrieval is Future Scope unless specifically included in the approved V1 technical plan. If introduced, it must respect publication, locale, rights, and access controls and must not retrieve unauthorized documents merely because they are semantically related.

---

# 10. Arabic–English Localization & Language Governance

## 10.1 Official public languages

The public museum supports:

- English (`en`).
- Arabic (`ar`).

Both are core product languages. The global interface, navigation, primary system messages, and essential institutional identity must be available in both languages. Individual records may have different translation completeness; the interface must represent that state honestly.

## 10.2 Language independence

Arabic and English are separately authored and reviewed content experiences. They must preserve the same factual meaning, claim status, and institutional intent, but they do not need to be word-for-word translations.

A change to the source text must mark the dependent translation as potentially outdated. The translation must be reviewed before it is treated as current and approved.

## 10.3 Locale-specific content and publication

Each content entity must have a separate editorial and publication state for each locale. A record may be approved and published in English while its Arabic version remains in review, or vice versa, provided the visitor-facing fallback behavior is explicit and consistent.

Core navigation and system UI must be available in both languages before V1 release. For individual records:

- If the selected locale is published, show that locale.
- If it is not published, show a localized notice that the content is not available in the selected language.
- Offer an explicit action to open the available language, if one exists.
- Never silently substitute another language.
- Never generate an unreviewed machine translation and present it as approved.

## 10.4 Language selector behavior

- The selector clearly identifies English and Arabic.
- The selected language persists as a visitor preference.
- When the corresponding localized route exists and is published, preserve the current page/entity context.
- If no localized equivalent exists, show the current content's language availability and a clear action to continue in the available language or return to the localized parent page.
- Do not send the visitor to an unrelated homepage merely because a translation is missing.

## 10.5 Arabic-specific requirements

- Use correct right-to-left direction at the document and component level.
- Use Arabic fonts with correct connected letter forms and shaping.
- Maintain natural Arabic punctuation, spacing, and paragraph flow.
- Use CSS logical properties rather than assuming left/right positions.
- Mirror directional controls where meaning requires it; do not mirror universal symbols or imagery without reason.
- Ensure mixed Arabic/Latin identifiers, dates, URLs, and numbers remain readable and correctly ordered.
- Preserve original names and native-language terms when appropriate.
- Do not stretch Arabic text to imitate Latin visual composition.
- Test forms, tables, metadata, breadcrumbs, drawers, image viewers, and navigation in RTL.

## 10.6 English-specific requirements

English must use clear, elegant, natural museum language. It must avoid literal translations that sound unnatural, generic marketing phrasing, and unsupported institutional claims. Display headings may use an editorial serif, while body and interface text must prioritize clarity.

## 10.7 Translation workflow

Translation states:

- Not Translated.
- Draft Translation.
- In Review.
- Approved.
- Published.
- Requires Correction.
- Outdated / Re-review Required.

Each translation record should retain source locale, target locale, source text/version, translated text, translator, reviewer, approval state, timestamps, and revision history.

Translation authority does not grant authority to alter historical facts, source meaning, provenance, or claim status.

## 10.8 Cultural terminology and names

A controlled terminology list should be maintained for:

- Country and place names.
- Historical periods.
- Object types.
- Cultural terms.
- Names and transliterations.
- Curatorial and rights terminology.

Original names must be preserved where appropriate. A transliteration must not replace the original name where the latter is important to identification.

## 10.9 SEO localization

English and Arabic pages require correct canonical and alternate-language relationships. Each locale should have an appropriate localized title, description, slug where supported, and social metadata. A missing translation must not generate an invalid `hreflang` or canonical relationship.

---

# 11. Publication, Review & Operational State Machines

State dimensions are independent. No single “status” field may be used to represent all aspects of editorial approval, factual verification, rights clearance, translation, media processing, and public availability.

## 11.1 Independent state dimensions

Each relevant record must support separate dimensions for:

1. Editorial workflow.
2. Claim verification.
3. Locale translation.
4. Publication.
5. Media processing.
6. Rights permission.
7. Exhibition availability.
8. AI knowledge eligibility.

A record can be factually supported but unpublished, published in one language but untranslated in another, or editorially approved while one image remains rights-restricted.

## 11.2 Editorial workflow

`Draft → In Review → Approved`

Possible branches:

- `In Review → Returned for Correction → Draft`.
- `Approved → Re-review Required` when a material change invalidates the review.
- `Approved → Rejected` when the reviewer rejects the content.

Approval does not automatically publish content.

## 11.3 Publication workflow

`Draft → In Review → Approved → Scheduled (optional) → Published`

From Published, authorized actions may move the record to Unpublished or Archived. Returning for correction must preserve the previous revision. Archiving retains the institutional record and removes it from active public presentation. Unpublishing removes public access without necessarily archiving the record.

A publication action must confirm:

- Required fields for the relevant locale are complete.
- Required editorial review is complete.
- Required curatorial/fact review is complete.
- Required media rights are clear.
- Public relationships resolve correctly.
- The route and SEO state are valid.
- The target locale is ready.

## 11.4 Approval invalidation

Material changes to factual claims, dates, ownership statements, provenance, primary images, rights records, source relationships, translations, or public descriptions may invalidate relevant prior approval. The system must identify the affected review and require re-review where appropriate.

A cosmetic edit that does not change meaning may follow a lighter editorial path, but the system must retain a revision record.

## 11.5 Claim review workflow

Claim states are defined in Section 8.11. A claim may be marked Supported only after evidence review. Conflicting or insufficient evidence must remain visible to authorized reviewers. Claim-level support does not imply authenticity or ownership.

## 11.6 Rights workflow

Rights statuses:

- Unknown.
- Permission Pending.
- Under Review.
- Rights Confirmed.
- Public Domain Documented.
- Licensed.
- Restricted.
- Not Cleared.
- Expired.

Only rights states explicitly cleared for the intended public use may be displayed. `Public Domain Documented` requires a documented basis, not an assumption based on age or internet availability. Expired, restricted, unknown, or not-cleared media must not be publicly served in a use that lacks permission.

## 11.7 Translation workflow

Translation states are defined in Section 10. A source text change must mark translations as outdated or requiring review. Published language versions remain independent.

## 11.8 Media processing workflow

Recommended states:

`Uploaded → Security Scan → Processing → Ready for Review → Approved for Use`

Failure or exception states include Rejected, Processing Failed, Rights Pending, Restricted, Archived, and Replacement Required.

Public display is permitted only when file validation, processing, rights, and editorial approval requirements for its role have been satisfied.

## 11.9 Country exhibition workflow

Country exhibition states:

- Planned / Coming Soon.
- In Preparation.
- Open Exhibition.
- Temporarily Unavailable.
- Closed / Archived.

“Open Exhibition” requires a complete and approved public experience for that world: introduction, a meaningful set of eligible collection or artifact content, accurate links, approved imagery, and locale behavior. An opening image alone is insufficient.

## 11.10 Inquiry workflow

Inquiry states:

- Received.
- Unassigned.
- Assigned.
- In Review.
- Awaiting Additional Information.
- Replied.
- Resolved.
- Closed.

Personal data remains restricted to authorized personnel and governed by the retention policy.

## 11.11 AI response states

The AI Curator may encounter:

- Grounded Answer Available.
- Partial Information Available.
- Related Information Available.
- Information Unavailable.
- Conflicting Sources.
- Question Outside Museum Knowledge.
- Retrieval Unavailable.
- Technical Service Failure.
- Human Review Recommended.

The response must reflect the actual condition and must not invent a response to preserve conversational flow.

## 11.12 Audit events

Consequential actions must be recorded, including creation, edits, review decisions, verification changes, publication, unpublication, archiving, restoration, rights updates, AI policy changes, permission changes, and critical settings changes.

---

# 12. Brand & Design System

## 12.1 Visual direction

The visual direction is **Nocturnal Museum Elegance**: a refined private-museum atmosphere with French-inspired museum refinement, archival authenticity, feminine elegance without excessive ornamentation, historic materials, restrained gold detailing, and controlled lighting.

The result must not look like a hotel, jewelry store, luxury shopping website, generic corporate dashboard, gaming interface, or generic SaaS product.

The atmosphere should be cinematic but restrained. It must create richness through space, material, light, hierarchy, and image quality—not through the volume of decorative effects.

## 12.2 Proposed canonical color palette

The following values are the proposed canonical visual specification from the source material. They are the working design baseline and remain subject to formal visual approval and reconciliation with any existing approved code tokens. Existing token differences must be documented; they must not be silently overwritten.

| Token | HEX | Primary role |
|---|---|---|
| Noir Museum | `#111014` | Primary background, hero, museum framing |
| Midnight Velvet | `#1A151C` | Secondary dark background |
| Deep Burgundy | `#351522` | Main burgundy exhibition surfaces |
| Heritage Burgundy | `#552536` | Secondary burgundy elements |
| Champagne Gold | `#C6A56B` | Primary gold accent |
| Soft Champagne | `#DFC99E` | Delicate highlights |
| Warm Ivory | `#F3EBDD` | Main light text and paper surfaces |
| Archive Paper | `#E5D8C3` | Archival/light content surfaces |
| Muted Stone | `#9D9184` | Secondary text and neutral details |
| Rose Accent | `#A96D78` | Very restrained feminine accent |
| Dark Wood | `#30241F` | Material/architectural reference |
| Museum Glass | `#D8D9D5` | Neutral translucent material reference |

## 12.3 Color hierarchy and distribution

Approximate visual guidance:

| Color family | Reference proportion |
|---|---:|
| Dark museum backgrounds | 55–70% |
| Burgundy and dark material surfaces | 15–25% |
| Ivory, paper, and neutral surfaces | 10–20% |
| Gold accents | 3–8% |
| Rose accents | 0–3% |

These proportions are guidance, not a rigid per-page quota. Gold must never dominate the interface. Rose must not replace burgundy and champagne as the central identity. Contrast and readability override decorative proportion.

## 12.4 Color usage rules

- **Noir:** primary backgrounds, hero environments, museum framing, dark navigation.
- **Burgundy:** exhibition environments, collection sections, editorial backgrounds, selected identity surfaces.
- **Champagne Gold:** logo details, fine separators, selected headings, small emphasis marks, approved icon details, selected interaction feedback.
- **Ivory:** readable text on dark backgrounds, archival surfaces, certificates, selected editorial panels.
- **Rose:** restrained floral or atmospheric accent only.
- **Dark Wood / Museum Glass:** material references, not arbitrary high-contrast UI colors.

Gold must not be used for long paragraphs or oversized decorative blocks. Accent colors must not be the only indicators of state.

## 12.5 Typography system

Proposed font roles from the source:

| Role | English | Arabic |
|---|---|---|
| Main display | Cormorant Garamond | Tajawal |
| Editorial headings | Cormorant Garamond | Tajawal |
| Body text | Inter | Tajawal |
| UI labels | Inter | Tajawal |
| Metadata | Inter | Tajawal |
| Numeric identifiers | Inter | Tajawal |

Font licenses and production suitability must be verified before deployment. If a font is unavailable or not properly licensed, use an approved substitute without changing the hierarchy or character of the design.

**Display typography:** editorial, elegant, spacious, high contrast; reserved for major exhibition titles and institutional statements.  
**Body typography:** readable at long lengths, stable across devices, appropriate for artifact descriptions and historical context.  
**Metadata typography:** compact and secondary, but never inaccessible or too small for important information.

Arabic typography must use proper Arabic shaping and natural RTL behavior. An English display font must not be used for Arabic body or display text.

## 12.6 Type scale and spacing

The design system must define explicit tokens for:

- Display, H1, H2, H3, H4.
- Lead, Body Large, Body, Body Small.
- Caption, Metadata, Button Label.
- Line heights, letter spacing, paragraph spacing, and maximum text widths.
- Section spacing, container widths, content widths, grid gaps, card padding, button heights, header heights, and mobile insets.

A single spacing scale must be used across the public museum and a separately tuned operational spacing scale may be used in the Control Center. Values must be documented in design tokens rather than scattered as arbitrary per-component values.

## 12.7 Logo and monogram system

Supported logo roles:

- Primary Wordmark — main site identity and formal institutional presentation.
- Stacked Wordmark — vertical compositions and selected promotional applications.
- N Monogram / Seal — compact navigation, loading identity, watermark, and small brand signatures.
- Burgundy Badge — selected approved identity applications.
- Watermark — approved original collection photographs and museum visual material where appropriate.

Integrity rules:

- No stretching or proportion distortion.
- No arbitrary rotation.
- No unapproved recoloring.
- No random shadow or glow.
- Do not recreate the official logo from text when the approved asset exists.
- Maintain clear space and minimum-size rules.
- Use a background variant that preserves legibility.
- A watermark must not obscure the object or documentary details.

## 12.8 Materials, textures, and backgrounds

Approved material families include velvet, silk, marble, handmade and archival paper, gold foil, antique wood, glass, wax seals, brass or aged metal, warm candlelight, soft reflections, fine dust, and restrained floral atmosphere.

Textures must feel materially believable and support the content. They must not reduce text contrast, create noise, or overwhelm the artifact. Background imagery is not a substitute for meaningful museum content.

## 12.9 Shapes, borders, cards, and frames

Preferred forms include refined museum labels, elegant frames, soft circles, archival cards, measured borders, subtle rectangles, and refined seals/badges.

Use thin borders, fine champagne lines, restrained archival frames, and delicate separators. Avoid heavy borders on every card, thick gold outlines, excessive containers, aggressive geometric UI, or ornamental framing that competes with the artifact.

Cards must prioritize the object and its information. They must not resemble commercial product cards. Avoid unnecessary grids and repeated card patterns where a strong editorial composition would be more appropriate.

## 12.10 Iconography

Icons must be minimal, elegant, consistent, recognizable, and subordinate to content. Relevant concepts include archive, location, collection, document, search, information, navigation, language, and curatorial guidance.

Do not use emoji as primary interface icons, gaming symbols, excessively detailed decorative icons, unrelated technology motifs, or mixed icon families.

## 12.11 Country-specific visual variants

A country world may adapt architectural references, cultural materials, local palette accents, historical themes, and appropriate imagery. It remains part of one museum brand. Country visuals must not reduce a culture to generic stereotypes or generic AI-generated decoration.

## 12.12 Photography and image composition

The photographic language should share:

- Natural material detail.
- Controlled directional lighting.
- Believable textures and shadows.
- Museum presentation.
- Refined composition.
- Cultural specificity.
- Realistic image proportions.
- No fabricated text or documentary details.

A real artifact photograph must preserve the object's actual characteristics. AI-generated imagery may be used as illustrative atmosphere but must never be presented as an original collection photograph.

## 12.13 Motion identity

Approved motion types include slow fade, gentle reveal, restrained upward movement, subtle image scale, soft light reveal, controlled transition, delicate hover feedback, corridor-like transition, archive-like opening, and respectful loading states.

Motion exists to guide attention, communicate hierarchy, support discovery, and make the museum feel alive. It must not distract, overwhelm, or become a gimmick.

Reference timing ranges:

| Motion category | Reference duration |
|---|---:|
| Fast interface response | 150 ms |
| Standard transition | 300 ms |
| Slow reveal | 800 ms |
| Cinematic reveal | 1,200 ms |
| Major entrance sequence | 2,000 ms |

These are reference ranges, not an instruction to animate every element. The experience must respect `prefers-reduced-motion`; essential information and navigation must remain available without animation.

## 12.14 Public versus Control Center design

The public museum may use larger spatial compositions, atmospheric visuals, calm pacing, and expressive negative space. The Control Center uses the same brand family but prioritizes data clarity, hierarchy, density, task efficiency, and error prevention. It must not copy the public cinematic interface at the expense of usability.

---

# 13. Media, Asset Library & Intellectual-Property Governance

## 13.1 Asset categories

The institutional visual library may contain:

- Logos, wordmarks, monograms, seals, certificates, and watermarks.
- Museum architecture and atmosphere imagery.
- Country-world illustrations and architectural references.
- Collection-category visuals.
- Original artifact photography and documentary scans.
- Story imagery.
- AI Curator visuals.
- Interface and layout reference imagery.
- Backgrounds, textures, lighting, overlays, and transitions.
- Mobile-specific variants and responsive derivatives.

## 13.2 Asset record

Every asset must have a stable Asset ID and a complete record containing, as applicable:

- Exact original filename.
- Storage identifier/path (not exposed publicly).
- File format and MIME type.
- File size, width, height, aspect ratio, and checksum.
- Asset category and intended role.
- Source, creator, and creation date where known.
- Original/derivative relationship.
- English and Arabic descriptions.
- English and Arabic alt text for meaningful public imagery.
- Captions and credits.
- Focal point and responsive crop guidance.
- Related country, collection, artifact, story, page, or component.
- Rights holder and permission state.
- Approved usage scope and channel restrictions.
- Approval state and reviewer.
- Upload date and uploader.
- Revision and replacement history.

## 13.3 Asset readiness and use states

The following states are distinct and must not be collapsed into a single “complete” flag:

- Referenced in Source Documentation.
- Source File Located.
- Present in Project.
- Copied into Public Assets.
- Manifested.
- Referenced by Code.
- Integrated into Public UI.
- Integrated into Control Center UI.
- Visually Verified in Context.
- Rights Cleared for Intended Use.
- Approved.
- Approved but Unused.
- Awaiting Generation.
- Awaiting Rights Review.
- Duplicate / Suspected Duplicate.
- Reference Only.
- Excluded from Current Scope.
- Archived.

A file's presence in a folder, copy operation, manifest, code reference, or documentation list does not alone prove that it is correctly integrated or legally usable. An asset is accepted only when its file identity, intended role, actual UI context, responsive behavior, rights, and visual quality are verified.

## 13.4 Original collection photography

- Preserve the original source file.
- Keep approved display derivatives separate.
- Do not retouch an image in a way that changes a historical object's material characteristics, inscriptions, marks, condition, or documentary details.
- Document significant processing, cropping, color correction, restoration, or reconstruction where relevant.
- Do not hide defects or marks that may be historically meaningful without an approved reason and appropriate disclosure.
- Record the photographer/source and applicable display rights.

## 13.5 AI-generated and illustrative imagery

AI-generated imagery may be used for atmosphere, architecture, conceptual exhibition environments, category visuals, transitions, and non-documentary illustrations.

It MUST NOT be presented as:

- An original photograph of a collection item.
- Proof that an artifact exists in the museum.
- An original historical document.
- A documentary photograph of a real event or place unless factually grounded and appropriately represented.
- A substitute for an actual artifact image in a way that misleads the visitor.

Where necessary, label it clearly as **AI-generated illustrative visual** or equivalent approved wording.

The ten additional requested assets in Appendix A are illustrative country/category visuals, not evidence of actual objects in the collection.

## 13.6 Rights model

The rights model must distinguish:

- Ownership of the physical object.
- Copyright in the photograph or scan.
- Copyright in a transcription, translation, or editorial text.
- Permission to display digitally.
- Permission to crop or otherwise transform.
- Permission to use in promotional materials.
- Attribution requirements.
- Geographic, temporal, platform, and channel restrictions.

Possession or ownership of a physical object does not automatically establish ownership of copyright in its photograph or permission to publish a document image.

## 13.7 Asset replacement and deletion

Before replacement or deletion, the system must identify every current use, including pages, sections, country worlds, collections, artifacts, stories, responsive variants, and other derivatives. The user must receive an impact summary.

The preferred action is archive or replace, not casual permanent deletion. Original archival files must be preserved under the approved retention policy. Replacing an image must preserve a traceable relationship to the previous file and must not silently invalidate rights approvals.

## 13.8 Duplicate detection

The Media Library may identify exact duplicate files, same-content files in different formats, visually similar files, and alternative resolutions. Similarity is a review aid only. Two visually similar historical photographs must not be automatically treated as duplicates without human confirmation.

---

# 14. AI Curator — Product, Knowledge, Safety & Governance Specification

## 14.1 Role and identity

The AI Curator is a museum guide and discovery assistant. It is presented honestly as AI and must never impersonate a human curator or claim personal experience, personal memory, or institutional authority it does not possess.

Its tone is elegant, warm, knowledgeable, precise, guide-like, concise when appropriate, and consistent with the museum voice.

## 14.2 Permitted visitor tasks

The AI Curator may:

- Answer questions about published artifact records.
- Explain approved descriptions and metadata.
- Suggest relevant collections, objects, stories, and country worlds.
- Connect objects and narratives using documented relationships.
- Explain the difference between known, estimated, disputed, and unknown information.
- Help visitors navigate the museum.
- Provide short interpretive context grounded in approved sources.
- Suggest follow-up exploration without implying unsupported connections.

## 14.3 Knowledge-source hierarchy

For public V1, the hierarchy is:

1. Published and approved museum artifact claims and metadata.
2. Published country, collection, and story content.
3. Museum-approved source references attached to the relevant claims.
4. Approved institutional documents specifically cleared for public AI retrieval.
5. External sources only if an explicitly approved external-research capability is introduced in a future release.

The public AI Curator must not treat a draft, private note, restricted record, inquiry, credential, permission file, or unapproved source as knowledge. In V1, unrestricted web research and autonomous research are outside scope.

## 14.4 Public retrieval access control

Public retrieval is limited to content that is:

- Published.
- Approved for the selected locale or explicitly eligible for cross-language response under the language policy.
- Cleared for public disclosure.
- Within the visitor-facing AI knowledge scope.

The retrieval layer must enforce permissions before content reaches the model. Hiding restricted content in the UI is not sufficient.

An administrative AI test environment may inspect unpublished or restricted content only when specifically authorized, isolated from public sessions, and clearly marked as non-public testing.

## 14.5 Claim-grounded answers and citations

When answering a factual question about an object, the Curator should:

1. Identify the relevant artifact or topic.
2. Retrieve the applicable published claims and supporting sources.
3. Separate documented facts from interpretation.
4. State dates and locations with their documented precision.
5. Cite the source or record when available and permitted.
6. State when the information is incomplete, estimated, conflicting, or not established.
7. Offer a related published item where helpful.

Source references should be human-readable (title, author/institution, date, page/reference, or a permitted link). The Curator must not invent a citation. It must not expose private archive references or protected documents.

## 14.6 Uncertainty and conflicting sources

When information is missing, the Curator should say that the museum's available records do not establish the answer and may suggest a related documented item or an inquiry route.

When sources conflict, it must:

- State that a discrepancy exists.
- Summarize the competing statements accurately and proportionately.
- Identify the sources where disclosure is permitted.
- Avoid choosing one conclusion without a documented review decision.
- Recommend human review when the discrepancy materially affects identity, dating, ownership, authenticity, or provenance.

The Curator must not fill a gap merely to sound confident or maintain conversational flow.

## 14.7 Historical interpretation and cultural sensitivity

The AI must distinguish factual description from historical interpretation, scholarly opinion, and speculative possibility. It must avoid cultural stereotypes, sweeping statements about peoples, and unsupported political or religious generalizations. It should reflect multiple documented interpretations when relevant.

## 14.8 Untrusted document and prompt-injection safety

Retrieved documents, OCR text, source notes, user-submitted content, and external text are data, not instructions. The AI must ignore instruction-like text embedded in retrieved content when it attempts to alter system behavior, reveal secrets, bypass permissions, or change the museum's rules.

The retrieval system must not expose database credentials, API keys, internal prompts, access tokens, private user data, restricted notes, or hidden administrative records. Tool and data access must be allowlisted and permission-checked.

## 14.9 Missing-information behavior and fallback states

The Curator must distinguish:

- No relevant record exists.
- A record exists but the field is unknown.
- A claim is under review.
- Sources conflict.
- The content exists in another language.
- Retrieval is unavailable.
- The AI service failed.

The interface must not present technical failure as historical uncertainty, or historical uncertainty as a system failure.

## 14.10 Conversation privacy and retention

Before launch, the Owner must approve the conversation data policy. It must define what is stored, why it is stored, retention duration, who can access it, whether it is used for service improvement, deletion/erasure handling, provider data handling, and any required consent or notice.

Collect only the minimum personal data required. Do not pass unnecessary personal data to the model. Visitor inquiries are not AI knowledge by default. Any limited administrative conversation review must be permission-controlled and compliant with the published privacy policy.

## 14.11 Human escalation

A question or report must be referred to an authorized human when it concerns:

- Legal rights or ownership disputes.
- Authenticity assessment.
- Insufficient or contradictory evidence.
- A material correction request.
- Restricted or sensitive source material.
- A question beyond the approved knowledge boundary.

The Curator may provide the approved Contact / Request Information route; it must not claim that a human has reviewed something unless the workflow actually records that review.

## 14.12 Curator Command Center governance

Authorized users must be able to manage:

- Curator display name and localized introductions.
- Approved visual identity and greetings.
- Tone and response-length settings within fixed safety rules.
- Supported languages and terminology.
- Approved knowledge sources.
- Knowledge scope by content type, country, collection, and record.
- Source status, indexing status, and freshness.
- Unresolved or conflicting claims.
- Reported responses.
- Test cases and evaluation results.
- Prompt/policy configuration versions.
- Rollback to a previously approved configuration.

API keys, model tokens, signing secrets, and provider credentials must remain masked and protected. Configuration changes must be versioned, reviewed, and reversible.

## 14.13 AI response evaluation

Reviewers may classify outputs as:

- Accurate.
- Partially Accurate.
- Unsupported.
- Incorrect.
- Missing Citation.
- Misstates Uncertainty.
- Inappropriate Tone.
- Incomplete Retrieval.
- Unauthorized Disclosure.

Unauthorized disclosure, fabrication of provenance/ownership/authenticity, or exposure of restricted information is a release-blocking defect.

## 14.14 AI release tests

The test set must include, at minimum:

- English and Arabic responses.
- Artifact identity questions.
- Date and period questions with differing precision.
- Provenance questions.
- Ownership and authenticity questions.
- Missing information.
- Conflicting sources.
- Related object suggestions.
- Country and collection navigation.
- Unsupported external questions.
- Restricted-source retrieval attempts.
- Prompt injection embedded in retrieved content.
- Privacy and secret-extraction attempts.
- Retrieval outage and model outage.

No public AI release is accepted without passing permission, fabrication, source attribution, localization, and fallback tests.

---

# 15. Master Control Center — Product Definition & Global Interaction Contract

## 15.1 Purpose

The Master Control Center is the central institutional environment through which authorized personnel manage all supported public-facing and institutional aspects of Noujoude: pages, sections, identity, country exhibitions, collections, artifacts, stories, media, sources, rights, AI Curator configuration, navigation, languages, SEO, inquiries, publishing, users, settings, audit history, and archives.

It is not merely a CMS, collection list, or technical dashboard. It is the operational command environment of the digital museum.

## 15.2 Owner control principle

The authorized Owner must be able to manage every supported content, visual, editorial, curatorial, and institutional control from the Control Center without manually editing source files for ordinary museum changes.

Examples include replacing the homepage hero, changing copy, adding a collection or artifact, updating a country cover, reordering a section, publishing a story, hiding a page section, changing approved CTA destinations, editing English or Arabic, selecting approved design tokens, changing navigation, replacing an image, updating AI knowledge sources, editing public contact details, and managing SEO metadata.

## 15.3 Protected technical boundary

Owner control does not mean unrestricted access to source code or security infrastructure. The normal CMS must not expose:

- Raw database credentials.
- API keys or provider tokens.
- Authentication secrets or private signing keys.
- Arbitrary SQL execution.
- Arbitrary JavaScript or CSS injection.
- Server filesystem access.
- Shell execution.
- Operating-system or Docker administration.
- Unrestricted database schema changes.
- Production deployment credentials.
- Destructive production infrastructure operations.

Secure integration settings may be configured through controlled interfaces, but secret values remain masked and are never retrievable as plain text.

## 15.4 Control Center visual identity

The Control Center follows the Noujoude identity with an operationally appropriate balance:

- Deep charcoal and midnight backgrounds.
- Dark burgundy navigation.
- Champagne-gold accents used sparingly.
- Warm ivory content surfaces where useful.
- Restrained archival lines and material cues.
- Refined typography and consistent iconography.
- Clear state indicators and readable data density.

It must not resemble a default WordPress panel, generic SaaS dashboard, cryptocurrency console, game interface, or decorative public museum page with poor operational clarity.

## 15.5 Main administrative layout

The Control Center consists of five persistent areas:

A. **Sidebar:** grouped institutional navigation, active state, expandable sections, role-aware visibility, responsive collapse.  
B. **Global Header:** Noujoude mark, current module, global search, admin language, notifications, user identity, role, account settings, and return-to-public-museum action.  
C. **Main Workspace:** the selected screen and its data.  
D. **Contextual Action Area:** relevant create, save, review, preview, approval, publish, archive, restore, and export actions.  
E. **Status / Notification Layer:** success, warning, error, pending review, and system information.

Desktop is the primary administration environment. Tablet and mobile must support essential review and status actions. Complex tables may adapt into card or detail views rather than being squeezed into unreadable narrow layouts.

## 15.6 Canonical 20-module navigation

| No. | Module | Primary responsibility |
|---:|---|---|
| 01 | Executive Overview | Trustworthy museum status and owner attention |
| 02 | Website & Page Studio | Public pages and approved page sections |
| 03 | Brand & Visual Identity Studio | Logo, tokens, typography, materials, components |
| 04 | Museum Worlds Management | Country exhibitions |
| 05 | Collections Management | Curated collection records |
| 06 | Artifact Management | Individual object records and evidence |
| 07 | Stories & Editorial Studio | Narratives and editorial content |
| 08 | Media & Asset Library | Institutional media and rights references |
| 09 | AI Curator Command Center | AI identity, knowledge, policies, evaluation |
| 10 | Navigation & Footer Studio | Global navigation and footer |
| 11 | SEO & Metadata Center | Search metadata and technical SEO controls |
| 12 | Language & Translation Center | Arabic/English content governance |
| 13 | Forms & Inquiries Center | Visitor communications |
| 14 | Users, Roles & Permissions | Institutional access governance |
| 15 | Publishing & Revision Control | Review, publication, history, rollback |
| 16 | System & Institutional Settings | Approved global configuration and integrations |
| 17 | Analytics & Insights | Valid measured activity and content insights |
| 18 | Notifications & Alerts | Actionable warnings and attention queues |
| 19 | Audit & Activity Center | Accountability and event history |
| 20 | Archive & Recovery Center | Archived content and controlled restoration |

This is the only canonical module map. Other lists of administrative features are subordinate screen groupings or earlier descriptions, not competing navigation structures.

## 15.7 Common screen contract

Every administrative screen must define and implement the following where applicable:

1. Screen title and purpose.
2. Breadcrumb or navigation context.
3. Current record identity and status.
4. Role-appropriate list, search, sort, and filters.
5. Structured form fields with required/conditional/optional labels.
6. Field-level and record-level validation.
7. Save state and unsaved-change handling.
8. Draft and review actions.
9. Preview behavior.
10. Approval and publication actions where permitted.
11. Error, empty, loading, and restricted states.
12. Related-record impact information.
13. Revision history and audit linkage for consequential changes.
14. Confirmation for destructive or high-impact operations.
15. Clear completion feedback.

## 15.8 Global administrative states

The interface must distinguish:

- Saved.
- Unsaved Changes.
- Saving.
- Save Failed.
- Draft.
- Pending Review.
- Approved.
- Scheduled.
- Published.
- Unpublished.
- Archived.
- Restricted.
- Failed Validation.

A success message may appear only after the operation succeeds. A failed operation must be visible and must not silently discard the user's data.

## 15.9 Global administrative controls

- **Global Search:** search artifact title/ID, country, collection, era, category, story, source, user, media filename, and page name. Search results must respect permissions.
- **Admin Language:** change the language of the Control Center independently from the public content language being edited.
- **Save State:** show the current persistence state of the record.
- **Preview:** where relevant, preview English/Arabic and desktop/mobile.
- **Confirmation:** explain the effect of high-impact changes before confirmation.
- **Permission Awareness:** identify unavailable actions; server-side authorization must reject unauthorized direct requests.
- **Traceability:** record consequential actions and their responsible user.

---

# 16. Master Control Center — Module-by-Module Screen Specification

## 16.1 Module 01 — Executive Overview

**Purpose:** Provide the Owner's primary administrative overview, showing only trustworthy information derived from actual system records and configured services.

**Required panels:**

A. **Museum Status:** public availability where monitored, publication status, active country exhibitions, recently updated pages, pending institutional reviews, and important notices.  
B. **Exhibition Overview:** total countries, open exhibitions, planned/coming-soon exhibitions, in-preparation exhibitions, and temporarily unavailable exhibitions.  
C. **Collection Overview:** total collections, published collections, drafts, items awaiting review, and empty/unavailable collections.  
D. **Artifact Overview:** total artifact records, published artifacts, records with supported claims, unreviewed/uncertain records, records under review, and records missing required fields.  
E. **Editorial Overview:** published stories, drafts, stories awaiting approval, incomplete translations, and recent content changes.  
F. **Media Overview:** files in library, files used by published pages, unused assets, rights-review queue, broken references, and missing metadata.  
G. **Translation Overview:** English completeness, Arabic completeness, missing translations, translations awaiting review, and stale translations.  
H. **Curatorial Attention:** missing evidence, conflicting claims, incomplete provenance, rights issues, and records requiring review.  
I. **Recent Activity:** latest editor, content changes, approvals, publications, and administrative actions.  
J. **Owner Attention:** actionable issues requiring institutional review.

**Accuracy rules:**

- Metrics must derive from real records or configured monitoring sources.
- Unavailable metrics must be labelled unavailable, not shown as zero.
- Do not fabricate visitor numbers, uptime, completion percentages, storage usage, or other metrics.
- Every attention item must link to the relevant record and identify the detected condition.

**Acceptance:** All dashboard values can be traced to their source; unavailable metrics are not fabricated; links respect permissions; dashboard status updates when records change.

## 16.2 Module 02 — Website & Page Studio

**Purpose:** Manage the content and approved visual structure of every public-facing page.

### Page Directory

The directory includes Home, The Museum, The Worlds, Country World templates, Collections, Collection Detail, Artifact Detail, Stories, Story Detail, AI Curator, About, Contact, Search, and approved special pages.

Each page record includes internal identifier, page type, public title, route, locale records, page status, publication state, SEO status, last modified timestamp, and last modified user.

### Page Editor

Fields include:

- Page name and page type.
- Public page title and localized titles.
- Main introduction.
- Main visual/background.
- Content sections and section type.
- Section visibility and order.
- CTA labels and destinations.
- Related content relationships.
- Desktop visual settings.
- Mobile visual settings.
- Locale metadata.
- SEO metadata.
- Publication state.

### Approved section/block types

1. **Hero:** title, subtitle, background image, logo/mark, primary and secondary CTA, alignment, focal point.
2. **Editorial Introduction:** heading, rich text, supporting image, layout.
3. **Country Worlds:** title, introduction, selected countries, order, images, featured country.
4. **Collection Grid:** heading, selected collections, order, approved card style.
5. **Featured Artifacts:** title, selected artifacts, layout, count.
6. **Story Feature:** story selection, image, title, introduction, link label.
7. **Image Gallery:** title, images, captions, order, layout.
8. **Timeline:** periods, dates, historical notes, associated evidence/sources.
9. **Curator Introduction:** AI Curator identity, intro, visual, suggested questions.
10. **Quote / Curatorial Statement:** text, approved attribution, source/author where appropriate.
11. **Metadata Panel:** selected metadata fields, labels, display order.
12. **Institutional CTA:** heading, supporting text, destination, label.
13. **Closing Section:** closing message, related destinations, visual treatment.

### Section controls

Authorized users may add, edit, duplicate, reorder, hide, show, preview, save as draft, or remove a section from a page. Removing a section must not delete its referenced country, collection, artifact, story, or media record.

### Page preview

Preview must distinguish the published version, current draft, and pending changes. It must support English, Arabic, desktop, tablet, and mobile. Unpublished material must be visibly marked as preview-only.

### Templates and change impact

The editor distinguishes unique institutional pages from shared Country, Collection, Artifact, and Story templates. Before changing a shared template, show the pages and records potentially affected. A template change must be previewable and reversible through revision history.

**Acceptance:** Page changes can be previewed before publishing; removing a section does not delete linked data; template impact is disclosed; all actions follow role permissions.

## 16.3 Module 03 — Brand & Visual Identity Studio

**Purpose:** Manage approved brand assets and safeguarded design tokens used across the museum.

### Logo management

Manage primary wordmark, stacked wordmark, monogram, seal, burgundy badge, watermark, and approved alternatives. Each variant records the file, background/transparent version, recommended use, restrictions, mobile suitability, and active state.

### Color identity

Manage token name, HEX value, color preview, intended use, contrast guidance, and approval state for the twelve tokens defined in Section 12. Color editing must preserve semantic mapping and contrast constraints.

### Typography

Manage approved English Display, Editorial, Body, UI, Arabic Display, Editorial, Body, and UI families. Each family includes license/source, available weights, fallback, and approved roles. Users may select only approved fonts and permitted styles.

### Materials and components

Manage approved velvet, marble, silk, paper, wood, glass, gold, embroidery, floral textures, and lighting overlays. Manage approved variants of primary/secondary buttons, text links, badges, metadata labels, cards, frames, dividers, and form fields.

### Motion identity

Manage only approved motion presets, intensity, entrance effects, transitions, hover behavior, and loading effects. Reduced-motion behavior cannot be disabled by branding settings.

### Country visual overrides

Allow approved country-specific variants while retaining the core Noujoude identity.

### Protected tokens

The CMS must not permit arbitrary CSS injection or values that break contrast, typography, layout, or brand safeguards. Major identity changes require preview, impact review, and explicit confirmation.

**Acceptance:** Every active token maps to an approved design token; license metadata is recorded; preview covers core templates and both languages; inaccessible or unsupported combinations are blocked or warned.

## 16.4 Module 04 — Museum Worlds Management

**Purpose:** Manage the six country exhibition records and their public states.

**Directory:** Morocco, Egypt, Syria, Mauritania, Libya, Sudan.

**Country record fields:**

- Internal country ID and slug.
- English and Arabic names.
- Native name where verified.
- Introductory and extended descriptions per locale.
- Country hero and mobile hero.
- Country visual settings within approved tokens.
- Exhibition status.
- Related collections, artifacts, and stories.
- Curator introduction/note.
- Display order and featured state.
- SEO metadata.
- Publication and revision information.

**Actions:** Create, edit, change images, edit approved visual presentation, associate collections/artifacts/stories, update exhibition status, preview, publish, unpublish, and archive.

**Validation:** An exhibition cannot be marked Open unless it meets the readiness standard in Section 11.9. Country-specific content and images require factual and cultural review. A country record alone does not prove that an exhibition is complete.

## 16.5 Module 05 — Collections Management

**Purpose:** Manage curated collections and their relationships.

**Collection record groups:**

- Identity: internal ID, slug, localized title, subtitle, category.
- Editorial: short/long description, introduction, curator note.
- Relationships: countries, artifacts, stories, related collections, eras where relevant.
- Visual: cover, gallery images, card image, alternative images, captions, alt text.
- Presentation: display order, featured state, visibility, approved layout variant, exhibition status.
- Publication: per-locale state and publication timestamps.

**Actions:** Create, edit, duplicate, reclassify, reorder, associate or disassociate artifacts, change cover, preview, publish, unpublish, and archive.

Removing an artifact from a collection removes only the relationship. It does not delete the artifact. Collection card counts must use eligible published artifacts only.

## 16.6 Module 06 — Artifact Management

**Purpose:** Provide the authoritative object-record editor for each museum artifact.

The Artifact Manager must provide these screens or clearly separated tabs:

### A. Artifact List

Search by title, ID, category, country, collection, era, and state. Filter by review status, locale readiness, rights state, publication state, and missing fields. Display only metadata appropriate to the user's role.

### B. Identity

Fields: Artifact ID, accession number if used, English title, Arabic title, original title, alternative names, slug, object type, primary image.

### C. Classification

Fields/relationships: country relationships with typed meaning, era, category, collections, tags, and other documented classifications.

### D. Description

Fields: short and long descriptions per locale, object type, materials, dimensions, physical characteristics, captions, and curator note.

### E. Historical Information

Fields: production/issue date, date precision, geographic associations, historical context, creator/issuer where documented, and related event claims where supported.

### F. Provenance

Manage documented previous ownership/custody events, collection history, acquisition records, supporting documents, source references, uncertainty notes, privacy restrictions, and review state.

### G. Claims and Verification

List individual claims, supporting and contradictory evidence, review decisions, unresolved questions, reviewer, and review date. Review is claim-specific; the UI must not show a global “authentic” conclusion based only on record completion.

### H. Condition and Preservation

Manage approved physical condition, preservation notes, conservation observations, condition images, and reviewer/assessment references.

### I. Media and Rights

Manage primary image, gallery, order, alt text, captions, derivative files, rights records, permissions, attribution, and restrictions.

### J. Presentation

Manage public visibility, selected display metadata, related objects, related stories, country/collection context, and public ordering.

### K. Locale and Publication

Manage independent English and Arabic editorial states, required-field validation, preview, approval, publication, unpublication, and archive actions.

### Required safeguards

- Missing information is never inferred automatically.
- Ownership and authenticity require separate support.
- Publishing is blocked when required rights, fields, or reviews are missing.
- A changed claim invalidates relevant previous review.
- Removal from a collection does not delete the artifact.
- The public record must not expose internal notes, private permission documents, or restricted source content.

**Acceptance:** A reviewer can inspect a claim and its evidence, a publisher sees the actual blocking conditions, and each public locale can be previewed before release.

## 16.7 Module 07 — Stories & Editorial Studio

**Purpose:** Provide an editorial environment for museum narratives.

**Story editor fields:** internal ID, English and Arabic title, subtitle, introduction, rich-text body, cover and supporting images, captions, country/collection/artifact relationships, source references, curator note, author display name where approved, editor, review state, publication state, and SEO details.

**Editorial groupings:** country, collection, historical period, theme, exhibition, and artifact relationship.

**Actions:** Draft, edit, preview, submit for review, return for correction, approve, publish, unpublish, and archive.

AI-generated copy may assist drafting but must remain visibly reviewable and must receive human editorial and curatorial approval where historical claims are present.

## 16.8 Module 08 — Media & Asset Library

**Purpose:** Maintain the central visual and documentary archive.

**Categories:** logos, monograms, seals, certificates, watermarks, museum architecture, country visuals, collection visuals, artifact photographs, story imagery, AI Curator visuals, interface imagery, backgrounds, textures, lighting, transitions, and mobile variants.

**Asset detail:** original filename, Asset ID, original format, MIME type, dimensions, ratio, size, checksum, thumbnail, English/Arabic description and alt text, caption, category, role, related country/collection/artifact/story/page, rights state, attribution, protected storage location, derivative versions, upload date, and uploader.

**Asset usage map:** show pages, sections, collections, artifacts, stories, mobile variants, and components using the file; identify unused assets and unresolved rights issues.

**Actions:** Upload, validate, edit metadata, update alt text, add caption, associate with a record, select primary, reorder, generate approved derivatives, replace, archive, and restore.

**Upload safeguards:** validate file type and size, inspect file content, scan where tooling supports it, reject executable or unsafe formats, preserve originals, and do not trust the filename or client-supplied MIME type alone.

**Deletion:** before deletion, identify all dependencies and warn of impact. Preserve original archival files according to the approved policy.

**Duplicate detection:** exact hash duplicates can be identified automatically; visual similarity is a human-review signal only.

## 16.9 Module 09 — AI Curator Command Center

**Purpose:** Govern AI identity, approved knowledge, response behavior, evaluation, and privacy.

### Curator identity

Manage display name, localized introductions, visual identity, greeting, tone, formality, response-length preference, and guiding personality. The system must always disclose that the Curator is AI.

### Language configuration

Manage English and Arabic behavior, response-language selection, localized terminology, and cultural terminology rules.

### Knowledge source management

Manage approved artifacts, collections, countries, eras, stories, source references, and specifically approved institutional documents. Each source has a status and access scope.

### Knowledge access rules

Control the AI's access to published content. Any administrative access to unpublished material must be limited to isolated authorized testing. Private notes, credentials, personal data, inquiries, and restricted records are not public AI knowledge.

### Answer policies

Manage non-fabrication, claim/source requirements, provenance and ownership restrictions, uncertainty handling, conflicting-source behavior, unsupported-question behavior, cultural sensitivity, and tone. Core safety constraints cannot be disabled by ordinary settings.

### Knowledge review

Inspect source status, indexing failures, incomplete retrieval, missing references, stale records, and conflicts.

### AI testing environment

Run approved tests for both languages, artifact and country questions, provenance, missing information, conflicting sources, out-of-scope questions, and restricted access attempts.

### Response evaluation

Classify outputs as Accurate, Partially Accurate, Unsupported, Incorrect, Missing Citation, Inappropriate Tone, Incomplete Retrieval, or Unauthorized Disclosure.

### Conversation governance

Where lawful and approved, retain limited administrative quality-review records with access and retention controls. Public inquiry data is excluded from knowledge by default.

### Configuration versioning

Prompt/policy rules, knowledge settings, and provider configuration must have identifiable versions, review history, and rollback. Provider secrets remain masked.

## 16.10 Module 10 — Navigation & Footer Studio

**Navigation item fields:** English label, Arabic label, destination, route, display position, parent item, visibility, active state, link type, and external-link classification.

**Footer fields:** approved logo, institutional statement, localized footer text, primary links, world links, contact details, legal links, copyright statement, and language variants.

**Restrictions:** prevent broken internal links, duplicate invalid routes, unsupported external destinations, and exposure of private Control Center routes. Require preview before public publication.

## 16.11 Module 11 — SEO & Metadata Center

**Page-level fields:** SEO title, meta description, slug, canonical URL, Open Graph title/description/image, indexing preference, and alternate-language relationship.

**Content-level fields:** localized title and description, search-friendly slug, related subject information, and indexing status for artifacts, stories, countries, and collections.

**Technical settings:** sitemap configuration, robots directives, canonical host, redirects, and social metadata defaults.

**Integrity controls:** prevent duplicate canonical URLs, broken redirects, indexing of private drafts, inconsistent locale associations, and fabricated structured data. Critical infrastructure settings remain protected.

## 16.12 Module 12 — Language & Translation Center

**Dashboard:** total records, English completion, Arabic completion, missing fields, unreviewed translations, outdated translations, and per-locale publication eligibility.

**Translation record:** source language, target language, source text and revision, translation, translator, reviewer, state, approval, and timestamps.

**Actions:** create/update translation, compare source and target, submit for review, approve, return for correction, mark outdated, and publish locale when eligible.

**Integrity:** distinguish missing, incomplete, outdated, approved, published, and original-language content. A translation is stale when its source changes until reviewed.

## 16.13 Module 13 — Forms & Inquiries Center

**Inquiry categories:** General Inquiry, Collection Information, Historical Research, Image Rights, Correction Request, Additional Documentation, Institutional Communication.

**Inquiry fields:** Inquiry ID, name, email/reply channel, category, subject, message, submission date, assigned staff member, status, internal notes, response history, and retention metadata.

**States:** Received, Unassigned, Assigned, In Review, Awaiting Additional Information, Replied, Resolved, Closed.

Personal data is available only to authorized users. Inquiry content must not appear on public pages, public search indexes, or AI knowledge by default. The interface must support spam handling and an appropriate retention/deletion workflow.

## 16.14 Module 14 — Users, Roles & Permissions

Each user record contains user identity, name, email, account state, assigned roles, permission scope, creation date, last access, and security state.

The module supports user invitation/creation, role assignment, access review, activation/deactivation, role changes, and revocation where supported by the authentication system. Changes to the Owner's authority require protected confirmation and audit logging.

Role definitions and permissions are detailed in Section 17.

## 16.15 Module 15 — Publishing & Revision Control

**Publishing functions:** submit for review, return for correction, approve, schedule where supported, publish, unpublish, archive, emergency unpublish, and view publication history.

**Revision record:** revision ID, prior/new content or safe structured diff, author, timestamp, reviewer, publication state, and change description.

**Comparison:** compare text, images, metadata, relationships, visibility, and localized content.

**Restore:** restoring a previous revision must create a new traceable revision; it must not erase intervening history.

**Emergency unpublishing:** authorized Owner or designated responsible role can remove problematic public content with a recorded reason and timestamp.

## 16.16 Module 16 — System & Institutional Settings

**Institutional information:** official museum name, tagline, approved description, contact details, default language, supported languages, and public identity.

**Website-wide settings:** metadata defaults, logo usage, navigation defaults, footer identity, supported content types, approved visual presets, and visitor-facing preferences.

**Contact settings:** official email, routing, inquiry categories, privacy notice, and approved communication information.

**Localization settings:** default language, language availability, locale preferences, and approved fallback behavior.

**Protected integration settings:** external services, AI provider, search service, media storage, and notification configuration. Sensitive values remain masked.

Raw SQL, environment files, Docker administration, shell execution, database deletion, source-code editing, and private deployment credentials are outside ordinary CMS settings.

## 16.17 Module 17 — Analytics & Insights

Potential indicators include page views, country-world visits, collection exploration, artifact views, story views, search activity, search result quality, AI Curator usage, language selection, inquiry volume, popular published content, and broken content references.

Analytics must be based on an actual configured analytics source. Unconfigured, unavailable, or privacy-restricted metrics must be shown as unavailable. Visitor privacy and consent rules take precedence.

The module may compare content performance across artifacts, countries, collections, stories, and entry/navigation patterns where measurement is valid.

## 16.18 Module 18 — Notifications & Alerts

**Alert categories:**

- Content: missing metadata, incomplete translation, awaiting review, broken image reference.
- Rights: permission pending, expired licence, restricted image, missing attribution.
- Curatorial: unsupported public claim, conflicting source, missing provenance, re-review required.
- System: service unavailable, integration failure, storage threshold, backup failure, authentication/security event.

**Severity:** Informational, Attention Required, Warning, Critical.

Each alert includes description, affected record/service, current state, owner/responsible person where assigned, created/updated times, and resolution history. Alerts must reflect actual detected conditions, not invented or stale warnings.

## 16.19 Module 19 — Audit & Activity Center

Record, where applicable:

- User login and access changes.
- Permission and role changes.
- Artifact creation/editing.
- Source and evidence changes.
- Verification decisions.
- Publication and unpublication.
- Archive and restore.
- Media replacement.
- Rights updates.
- AI policy/configuration changes.
- Site-wide settings changes.
- Inquiry assignment or status changes where required.

Each audit record includes event ID, timestamp, actor, action, target record, result, prior/new state where appropriate, and relevant context. Ordinary users must not be able to silently edit or erase audit history. Access to sensitive audit details is restricted.

## 16.20 Module 20 — Archive & Recovery Center

**Archive contents:** archived pages, artifacts, collections, stories, inactive country content, superseded media references, and eligible historical records.

**Recovery:** authorized users can inspect recoverable records and their original relationships before restoration. Restoration must avoid duplicate public records, broken links, and accidental publication.

**Deletion policy:** archiving and deletion are different. Important museum records should not be permanently deleted through casual UI actions. Permanent deletion requires appropriate authorization, confirmation, impact review of dependent artifacts/stories/images/sources/rights/audit records, and compliance with retention obligations.

**Recovery boundary:** content restoration is not disaster recovery. Database backup, infrastructure recovery, deployment rollback, and disaster recovery remain protected technical operations governed by Section 19.

---

# 17. Roles, Permissions & Owner Authority

## 17.1 General principles

Public access, editorial authority, curatorial authority, publication authority, and technical administration are separate permission domains. The ability to view a record or access a module does not automatically grant permission to edit, verify, approve, publish, archive, restore, delete, manage users, or change system settings.

Permissions must be enforced on the server and at the data/action layer. Hiding a menu item or button is not authorization.

## 17.2 Canonical roles

### A. Owner / Institutional Authority

The Owner is the highest institutional authority for the supported museum product controls.

The Owner may manage all supported public pages and sections, brand settings within safeguards, countries, collections, artifacts, stories, media, sources, rights records, languages, SEO, navigation, publishing, users and roles, inquiries, institutional settings, AI Curator policies and knowledge selection, analytics, audit visibility, archive, and content restoration.

The Owner's critical actions must be traceable. The Owner's authority must not be silently removed or downgraded by an ordinary administrator. Reassignment or removal of the highest-level Owner identity requires a protected recovery/transfer procedure and explicit audit record.

Owner control does not expose raw credentials, arbitrary code execution, production deployment secrets, direct unrestricted SQL, or destructive infrastructure operations.

### B. System Administrator

Manages approved technical administration, accounts, authentication settings, integrations, and operational configuration. Does not automatically receive curatorial authority to verify artifact claims, provenance, ownership, or authenticity. Does not automatically override the Owner.

### C. Museum Director

Manages institutional content governance, exhibition presentation, approved museum policy, and assigned publication oversight. May approve institutional content within the assigned scope.

### D. Curator

Manages artifact records, source relationships, evidence, provenance events, classification, claim review, curatorial notes, exhibition interpretation, and factual/curatorial approval. Does not automatically manage user security or infrastructure.

### E. Editor

Edits page copy, stories, object descriptions, and permitted public content. May submit records for review. Cannot independently mark uncertain historical claims verified or bypass curatorial review.

### F. Publisher

Manages approved publication transitions, scheduling where enabled, unpublishing, and publication status. Cannot bypass required curatorial, rights, or locale approval.

### G. Translator / Language Editor

Manages localized content, terminology, translation review, and locale completeness. Translation authority does not grant authority to alter factual claims, provenance, ownership, or verification state.

### H. Media Manager

Manages files, media metadata, derivatives, asset relationships, alt text, captions, and rights-record administration within the granted scope. A media-management role does not automatically prove legal rights; a qualified rights reviewer/Owner must approve relevant permission claims.

### I. Researcher / Contributor

Provides object descriptions, source material, contextual research, proposed corrections, and draft stories. Contributions remain subject to editorial and curatorial review. A contributor cannot publish or approve their own material unless separately granted that authority.

### J. Public Visitor

An anonymous visitor who can access published public content, search, use the AI Curator, change language, and submit permitted contact requests. No ordinary visitor account is required for browsing.

### K. AI Service Principal

A non-human service identity used only for explicitly authorized retrieval and inference operations. It has read-only, scoped access to eligible knowledge sources. It cannot publish, approve, edit collection records, change permissions, or access secrets beyond its minimal runtime requirement.

## 17.3 Permission actions

The permission vocabulary is:

- View.
- Create.
- Edit.
- Duplicate.
- Submit for Review.
- Review.
- Verify Claims.
- Approve.
- Publish.
- Unpublish.
- Archive.
- Restore.
- Delete (protected, exceptional).
- Manage Users.
- Manage Roles and Permissions.
- Manage Institutional Settings.
- Manage Security-Sensitive Integrations.
- View Audit Records.
- Export Data (where approved).

Every permission must be scoped by module, record type, record, locale, and action where relevant. A role must not acquire permissions solely because it can open a module.

## 17.4 Baseline role/action matrix

The matrix below is the default permission policy. Owner may grant narrower scopes where appropriate; privileges must not be broadened implicitly.

| Action domain | Owner | System Admin | Director | Curator | Editor | Publisher | Translator | Media Manager | Researcher |
|---|---|---|---|---|---|---|---|---|---|
| View public/admin records in scope | Yes | As needed | Yes | Yes | Yes | Yes | Yes | Yes | Assigned |
| Manage institutional identity | Yes | Technical only | Assigned | No | Draft only | No | No | No | No |
| Manage page sections | Yes | No | Yes | Assigned | Yes | No | Locale text only | No | No |
| Manage country/collection records | Yes | No | Yes | Yes | Assigned copy | Publish only | Locale text | Media only | Contribute |
| Edit artifact factual metadata | Yes | No | Oversight | Yes | Description only | No | No | Media fields only | Propose |
| Review/verify claims | Yes | No | Oversight | Yes | No | No | No | No | Evidence contribution |
| Manage provenance | Yes | No | Oversight | Yes | No | No | No | No | Propose |
| Edit stories/editorial copy | Yes | No | Yes | Curatorial text | Yes | No | Locale text | Media only | Draft |
| Review translation | Yes | No | Assigned | No factual authority | No | No | Yes | No | No |
| Manage media files | Yes | No | Oversight | Assigned | No | No | No | Yes | No |
| Approve rights status | Yes / delegated | No | Assigned | Evidence input | No | No | No | Record administration | No |
| Publish approved content | Yes | No | Assigned | No by default | No | Yes | No | No | No |
| Manage AI knowledge policy | Yes | Technical config only | Oversight | Source/curation input | No | No | Terminology only | No | No |
| Manage users/roles | Yes | Technical account admin | No | No | No | No | No | No | No |
| Manage protected integrations | Authorized secure interface | Technical admin | No | No | No | No | No | No | No |
| View audit records | Yes | Security scope | Assigned | Assigned | Own activity | Assigned | Own activity | Assigned | Own activity |
| Archive/restore content | Yes | No | Assigned | Assigned | Request | Assigned | No | Assigned | No |
| Permanent deletion | Protected Owner process | Technical safeguard only | No | No | No | No | No | No | No |

This is a baseline matrix; record-level and locale-level scope must be applied by the permission engine. A System Administrator's technical role is not a substitute for curatorial approval.

## 17.5 Separation of duties

- A researcher may submit a claim but cannot approve it solely because they submitted it.
- An editor may improve wording but cannot mark the underlying fact verified.
- A translator may correct language but cannot alter factual meaning without a content review.
- A publisher may publish only when required approvals, rights, and locale conditions are satisfied.
- An AI service principal cannot approve its own retrieved statements or modify the source records.
- A media manager may record a rights document but may not self-certify legal rights unless explicitly authorized and competent to do so.

For a small team, the Owner may perform multiple roles, but the system must preserve the distinct review events and record who made each decision.

## 17.6 Owner authority protection

- Ordinary administrators cannot silently remove or downgrade the Owner.
- Owner role changes require explicit protected confirmation and an audit record.
- Account recovery and transfer must be protected against unauthorized takeover.
- Critical operations must require re-authentication or additional verification where appropriate.
- Owner authority applies to supported product administration, not arbitrary code or infrastructure execution.

---

# 18. Publishing Operations, Revision, Concurrency & Recovery

## 18.1 Content submission

A contributor or editor saves a draft and submits it to the appropriate reviewer. Submission records the current revision and freezes the submitted snapshot for review. Further edits create a new revision or return the record to Draft; they must not silently mutate the snapshot under review.

## 18.2 Review and approval

The review interface must show the record, required fields, claim/evidence links, rights state, localized versions, related records, and previous review decisions. Reviewers may approve, return for correction, or reject with a recorded reason.

## 18.3 Preview

Preview must render the actual public template using the selected draft/revision and locale. It must identify preview-only content and must not be indexed or publicly accessible without authorization. Preview must cover desktop and mobile and must preserve page context.

## 18.4 Concurrent editing

The system must detect when another authorized user has changed the same record since the current user's last load. It must prevent silent last-write-wins loss for consequential content. Provide a conflict view or safe reload/merge path and preserve both users' work where feasible.

## 18.5 Revision history

Significant changes must be versioned. History must capture author, timestamp, change description, relevant review state, and publication state. A restored revision creates a new version rather than deleting later revisions.

## 18.6 Unpublishing and emergency removal

The Owner or authorized role may unpublish problematic content. Emergency unpublishing requires a reason, actor, timestamp, and affected route/record. The system must also handle search-index removal, related-content links, and cached public versions according to the delivery architecture.

## 18.7 Archive versus disaster recovery

Content archiving is a normal institutional workflow. Disaster recovery concerns restoration of infrastructure and data after a serious failure. They are separate processes with separate permissions, backups, and tests. The Control Center must not imply that an archived record is a backup of the database.

## 18.8 Record deletion

Default to archive or soft delete for institutional records. Permanent deletion is exceptional and must consider retention requirements, dependency links, rights records, audit history, and legal obligations. The system must not permit accidental cascade deletion of artifacts, stories, sources, or media because a collection or page section is removed.

---

# 19. Legal, Privacy, Security & Quality Requirements

## 19.1 Legal and institutional prerequisites

The applicable legal jurisdiction and responsible entity cannot be invented. Before public launch, the authorized Owner must identify the operating entity, the relevant jurisdiction(s), the responsible privacy contact, and any applicable requirements for visitor data, copyright, image rights, and online terms.

Required policy documents, reviewed for the actual entity and jurisdiction:

- Privacy Notice / Privacy Policy.
- Terms of Use.
- Cookie notice/consent mechanism where applicable.
- Copyright and image-use policy.
- Takedown/correction request process.
- Contact and inquiry retention policy.
- AI disclosure and conversation-data notice.
- Any required accessibility or legal disclosures.

The website must not publish template legal text that falsely identifies the controller, owner, address, registration, jurisdiction, or legal status.

## 19.2 Privacy and visitor data minimization

- Collect only data needed for the visitor's stated request.
- Identify purpose and retention for each field.
- Restrict inquiry records to authorized personnel.
- Do not expose inquiries through public search or AI retrieval.
- Protect data in transit and at rest where supported by the platform.
- Define retention and deletion procedures.
- Document third-party providers and processing roles.
- Provide applicable privacy rights and request routes based on the actual jurisdiction.
- Avoid unnecessary sensitive personal data.
- Do not reuse visitor contact data for unrelated marketing without an applicable lawful basis and required consent.

## 19.3 Security baseline

Security is a product requirement, not an optional polish phase.

The public application, Control Center, APIs, data layer, media pipeline, and AI retrieval services must be assessed as one system.

Minimum controls:

- Strong authentication for all administrative users.
- Multi-factor authentication for Owner and privileged accounts.
- Secure session handling, expiration, revocation, and re-authentication for critical actions.
- Rate limiting and abuse protection for authentication, forms, and AI requests.
- Server-side authorization on every protected route and data operation.
- Object-level authorization to prevent insecure direct object reference.
- Input validation and context-appropriate output encoding.
- Protection against SQL/command injection, XSS, CSRF, SSRF, and unsafe deserialization where applicable.
- Safe rich-text sanitization; no arbitrary script execution from CMS content.
- Secure file uploads with type/content validation, size limits, safe storage, and scanning where available.
- Secrets stored outside public source and masked in administrative interfaces.
- Secure transport and security headers appropriate to the production environment.
- Dependency and vulnerability management.
- Audit logging for privileged and sensitive actions.
- Restricted database and infrastructure privileges.
- Tested backup and recovery procedures.
- AI retrieval permission enforcement and prompt-injection defenses.

A security header set alone does not establish that the application is secure. Security must be verified through tests against the implemented system.

## 19.4 Security verification standard

Use the OWASP Application Security Verification Standard (ASVS) as the security control and verification catalogue. The current stable published edition identified for this specification is **ASVS 5.0.0**. The Control Center and associated APIs should target a Level 2 verification profile as the default baseline, with a documented threat assessment for any higher-risk component and explicit justification for exclusions. This is a target, not a compliance claim.

Reference: OWASP ASVS official project and downloads pages (see Appendix D).

## 19.5 Threat model priorities

At minimum, assess:

- Unauthorized access to `/control-center` and protected APIs.
- Privilege escalation and Owner account takeover.
- Broken object-level access checks.
- Exposure of draft, private, or rights-restricted content.
- Stored and reflected XSS through rich text, forms, metadata, and imported content.
- Injection through search, filtering, sorting, uploads, or integration inputs.
- Malicious or oversized file uploads.
- CSRF/session abuse.
- Secret exposure in source maps, logs, frontend bundles, or admin views.
- AI prompt injection through user prompts or retrieved documents.
- AI disclosure of private source material or administrative records.
- Unintended publication or indexing of private content.
- Unauthorized permanent deletion or destructive recovery operations.

## 19.6 Performance objectives

The following proposed user-experience targets use the published Core Web Vitals “good” thresholds at the 75th percentile:

| Metric | Target |
|---|---:|
| Largest Contentful Paint (LCP) | ≤ 2.5 seconds |
| Interaction to Next Paint (INP) | ≤ 200 milliseconds |
| Cumulative Layout Shift (CLS) | ≤ 0.1 |

These are performance targets, not measured current results. Measure real-user field data where possible, segment by device class and page template, and use lab tests to diagnose regressions. The public homepage, country page, collection page, artifact detail, and story page must be represented in the performance test set.

## 19.7 Image performance

- Use the correct image dimensions and modern formats supported by target browsers.
- Provide responsive image variants.
- Reserve layout dimensions to prevent layout shift.
- Lazy-load below-the-fold media.
- Prioritize the actual above-the-fold hero appropriately.
- Avoid loading all gallery images at initial render.
- Preserve visual detail in documentary and artifact images; optimization must not corrupt meaningful inscriptions or material features.
- Use focal-point and crop metadata where needed.

## 19.8 Accessibility

Target **WCAG 2.2 Level AA** for the public museum and Control Center, subject to an accessibility audit of the implemented experience.

Requirements include:

- Semantic landmarks and heading structure.
- Full keyboard access and visible focus.
- Correct accessible names and labels.
- Meaningful alt text; decorative images must be treated as decorative.
- Adequate contrast.
- Screen-reader-friendly state and error announcements.
- Accessible modals, drawers, dropdowns, and image viewers.
- Touch targets and focus behavior.
- No information conveyed by color alone.
- Reduced-motion support.
- Captions/transcripts for meaningful audio/video if introduced.
- RTL and LTR accessibility testing.
- Accessible admin tables, forms, validation, and status messages.

Reference: W3C WCAG 2.2 Recommendation and W3C WCAG standards overview (see Appendix D).

## 19.9 Browser and device support

Support current stable major versions of Chrome, Safari, Edge, and Firefox, plus iOS Safari and Android Chrome. Define the support window as the current stable version and the previous two major versions where practical. Internet Explorer is not a target. Exact device coverage must be recorded in the release test matrix.

Desktop is the primary Control Center environment; mobile still must support essential administrative tasks and review actions. The public museum must be fully usable at mobile widths, not merely compressed from desktop.

## 19.10 Reliability, monitoring, backup and recovery

The operational plan must define service availability target, monitoring ownership, alert routing, incident response, backup frequency, backup retention, encryption, geographic separation where required, Recovery Point Objective (RPO), Recovery Time Objective (RTO), and tested restoration procedure.

No claim of successful backup or recoverability is accepted without a restore test. Failures of search, AI, media delivery, analytics, or other external services must degrade gracefully and must not make core public content unavailable unnecessarily.

Monitoring should cover application errors, server errors, form failures, media failures, search failures, integration failures, latency, authorization failures, suspicious access, and backup/restore events where connected.

Numerical uptime/RPO/RTO commitments must be recorded in the operational service plan once the hosting and support model is known. They are not inferred from the design specification.

## 19.11 SEO and discoverability

Each public page requires a unique localized title and description, stable route, correct canonical configuration, Open Graph metadata where applicable, appropriate indexing policy, correct alternate-language relationships, and valid structured data where used.

Technical requirements include sitemap generation, robots directives, canonical host management, redirects, and social metadata defaults. Draft, private, restricted, and unavailable content must not be indexed. Duplicate canonicals, broken redirects, invalid hreflang relationships, and fabricated structured data are prohibited.

---

# 20. Acceptance Criteria, Verification & Release Governance

## 20.1 Acceptance principle

A requirement is not complete because it is described in this document, shown in a mock-up, or partially represented in source code. It is accepted only when the implemented behavior satisfies its acceptance criteria and the evidence is recorded.

## 20.2 Requirement identifiers

Use stable identifiers in the implementation and test register:

- `GOV` — document governance and product principles.
- `SCP` — scope and release boundaries.
- `NAV` — information architecture and routes.
- `UX` — public visitor experience.
- `CNT` — content and editorial.
- `COL` — collection and artifact registry.
- `DAT` — logical data model.
- `LOC` — localization.
- `STT` — states and workflow.
- `VIS` — visual identity and design system.
- `AST` — media and asset governance.
- `AI` — AI Curator.
- `ADM` — Control Center modules.
- `IAM` — roles and permissions.
- `OPS` — operations and recovery.
- `SEC` — security and privacy.
- `NFR` — performance, accessibility, compatibility, and reliability.
- `SEO` — search engine metadata and indexing.
- `TST` — acceptance and release testing.

Example: `UX-HOME-001`, `COL-CLAIM-003`, `ADM-ARTIFACT-010`, or `SEC-AUTH-002`.

## 20.3 Required test types

The release test plan must include:

1. Functional tests for every public page and administrative module.
2. Route, navigation, and deep-link tests.
3. Responsive visual tests for mobile, tablet, desktop, and wide desktop.
4. Arabic RTL and English LTR localization tests.
5. Editorial and publication workflow tests.
6. Claim/evidence and provenance integrity tests.
7. Rights and media visibility tests.
8. Role/permission and direct-API authorization tests.
9. AI grounding, privacy, prompt-injection, and fallback tests.
10. Accessibility tests, including keyboard and screen reader checks.
11. Performance tests on representative page templates.
12. Security verification against the agreed ASVS profile.
13. Backup and restore tests.
14. SEO, canonical, sitemap, and indexing tests.
15. Regression tests after material design, content model, or shared-template changes.

## 20.4 Baseline acceptance matrix

| ID | Requirement group | Acceptance evidence |
|---|---|---|
| GOV-001 | One authoritative specification | One approved version; superseded drafts identified |
| SCP-001 | V1 boundary | Release scope matches Section 2; excluded features absent |
| NAV-001 | Public routes | All canonical routes resolve correctly in both locales |
| NAV-002 | Private routes | Unauthorized direct access is denied server-side |
| UX-001 | Home identity | Brand, tagline, primary CTA, and curated entry points are correct |
| UX-002 | Home CTA | Enter the Museum navigates to the canonical The Museum route |
| UX-003 | Museum orientation | The Museum explains the institution and exploration paths without duplicating Home/About |
| UX-004 | Country directory | Six worlds show accurate exhibition states |
| UX-005 | Morocco V1 | Morocco is a complete, evidence-backed exhibition before it is labelled Open |
| UX-006 | Collection browsing | Counts and cards derive from eligible published records |
| UX-007 | Artifact detail | Required object fields, uncertainty, and evidence are presented correctly |
| UX-008 | Image viewer | Zoom/navigation/accessibility behavior works where high-resolution images exist |
| UX-009 | Stories | Stories link to real associated records and approved sources |
| UX-010 | Search | Only public published eligible content is indexed and returned |
| UX-011 | Contact | Inquiries are validated, protected, routed, and not publicly indexed |
| CNT-001 | Editorial workflow | Draft, review, approval, publication, archive, and correction paths work |
| CNT-002 | Editorial integrity | Facts and interpretation are distinguished; no invented claims are published |
| COL-001 | Artifact identity | Each artifact has a stable identifier and canonical slug |
| COL-002 | Claim/evidence | Factual claims have explicit supporting/contradictory evidence relationships |
| COL-003 | Verification | Review is claim-specific; no automatic authenticity conclusion |
| COL-004 | Provenance | Events are separate from bibliography and ownership claims |
| COL-005 | Ownership/authenticity | Separate evidence and review; no unsupported labels |
| DAT-001 | Relationships | Country, collection, story, media, and artifact relationships preserve cardinality and meaning |
| DAT-002 | Referential integrity | No unintended orphan or cascading deletion |
| LOC-001 | Bilingual UI | Core UI and navigation available in English and Arabic |
| LOC-002 | Locale state | Language availability is independent per content record |
| LOC-003 | Translation freshness | Source edits mark dependent translations for review |
| LOC-004 | RTL | Arabic layouts, forms, modal, tables, and metadata work in RTL |
| STT-001 | Publication dimension | Publication state is separate from verification and rights |
| STT-002 | Rights enforcement | Unclear/restricted media cannot be publicly served for unauthorized use |
| VIS-001 | Brand tokens | UI uses documented design tokens and approved logo variants |
| VIS-002 | Accessibility of design | Color, type, focus, and motion follow accessibility requirements |
| AST-001 | Asset provenance | Every used asset has an identifiable source and intended role |
| AST-002 | Asset rights | Each public media use is rights-cleared for that purpose |
| AST-003 | AI illustrations | Illustrative imagery is not represented as original collection photography |
| AI-001 | AI grounding | Factual answers are grounded in permitted published records/sources |
| AI-002 | AI citation | Sources are identified when available and disclosure is permitted |
| AI-003 | AI uncertainty | Missing and conflicting information are reported honestly |
| AI-004 | AI permissions | Public retrieval cannot access private or restricted records |
| AI-005 | AI safety | Prompt injection, secret extraction, and unauthorized disclosure tests pass |
| ADM-001 | Canonical modules | Control Center uses the 20-module map only |
| ADM-002 | Common screen contract | Screens provide validation, save state, preview, errors, and permission controls |
| ADM-003 | Owner controls | Owner can operate supported CMS functions without source edits |
| ADM-004 | Technical boundary | CMS does not expose arbitrary SQL, source code, or infrastructure secrets |
| IAM-001 | Role enforcement | Each action is checked server-side by role and scope |
| IAM-002 | Separation of duties | Contributor/editor/curator/publisher responsibilities are enforced |
| IAM-003 | Owner protection | Ordinary administrators cannot silently remove Owner authority |
| SEC-001 | Authentication | Administrative accounts are protected; privileged users use MFA |
| SEC-002 | Authorization | Direct routes and API calls enforce access controls |
| SEC-003 | Input/output security | Injection and XSS controls pass security tests |
| SEC-004 | Upload security | Upload validation and safe media handling work |
| SEC-005 | Secrets | Secrets do not appear in frontend bundles, logs, or CMS fields |
| SEC-006 | Privacy | Inquiry and conversation data follow approved retention and access rules |
| NFR-001 | Performance | Core Web Vitals meet targets on representative templates or exceptions are documented |
| NFR-002 | Accessibility | WCAG 2.2 AA audit has no unresolved release-blocking issue |
| NFR-003 | Responsive behavior | Public and admin experiences work at target breakpoints |
| OPS-001 | Monitoring | Critical failures are detected and routed |
| OPS-002 | Backup | Backup configuration is verified and restore test succeeds |
| SEO-001 | Metadata | Localized titles, descriptions, canonical, sitemap, and alternate links are correct |
| TST-001 | Evidence | Every release-critical requirement has recorded test evidence |

## 20.5 Publication acceptance checklist

Before any page, artifact, collection, story, or country world is published, the system must check:

- Required fields for the selected locale.
- Valid slug and canonical route.
- Approved editorial review.
- Required curatorial claim reviews.
- Clear media rights for every public image/document.
- Valid relationships and non-broken links.
- Correct locale status and translation freshness.
- Correct public/private field visibility.
- Appropriate SEO settings.
- No unresolved release-blocking validation error.

## 20.6 Release gates

### Gate 0 — Product Baseline

Master Specification adopted; requirement IDs assigned; scope and change-control authority established.

### Gate 1 — Institutional and Collection Readiness

Official identity fields approved; actual Morocco inventory loaded; claims/evidence, image permissions, and required content reviewed; no invented collection information.

### Gate 2 — Experience and Design Readiness

Public routes and page behavior complete; approved visual system applied; English and Arabic layouts reviewed; responsive and accessibility tests passed.

### Gate 3 — Administration and Data Readiness

Canonical Control Center modules and essential screens available; permissions enforced; data relationships and validation tested; publication and revision workflows complete.

### Gate 4 — AI and Governance Readiness

AI source scope, citation, uncertainty, privacy, and safety tests passed; legal/privacy policies approved; no restricted retrieval path remains.

### Gate 5 — Production Readiness

Security verification, performance, monitoring, backups, restore testing, SEO checks, and release regression are complete.

A gate may be marked Passed only with recorded evidence and an identified approver.

## 20.7 Completion rule

The product is not considered complete because all pages exist. It is complete only when:

- The intended museum experience works across target devices and languages.
- The actual public collection content is evidence-backed and rights-cleared.
- The Control Center reliably governs records and publication.
- AI respects the approved knowledge and privacy boundary.
- Security, accessibility, performance, and recovery criteria have been tested.
- No unresolved P0 defect remains.

---

# 21. Owner Inputs, Dependencies & Decisions Register

This section is intentionally limited to facts, approvals, assets, legal determinations, and implementation evidence that cannot be truthfully invented by the product team. It does not leave core page behavior or system functionality open for interpretation.

## 21.1 Owner-supplied institutional facts

| ID | Required input | Why required | State until supplied |
|---|---|---|---|
| OI-001 | Official English institutional/legal name | About, footer, policies, metadata | Owner Input Required |
| OI-002 | Official Arabic name and approved Noujoude Arabic rendering | Arabic identity | Owner Input Required |
| OI-003 | Actual institutional nature/legal status | Avoid false museum/legal claims | Owner Input Required |
| OI-004 | Actual founding story and dates | About and institutional storytelling | Owner Input Required |
| OI-005 | Owner/founder/collector attribution and approved wording | About and credits | Owner Input Required |
| OI-006 | Official contact channels | Contact and footer | Owner Input Required |
| OI-007 | Official location, only if intended for publication | Contact/About | Optional / Owner Input Required |
| OI-008 | Verifiable partnerships/accreditations, if any | Institutional claims | Evidence Required |
| OI-009 | Approved mission and vision wording | Institutional pages | Owner Input Required |

## 21.2 Collection and rights inputs

| ID | Required input | Why required | State until supplied |
|---|---|---|---|
| CI-001 | Actual artifact inventory and stable identifiers | Real collection records | Pending Inventory |
| CI-002 | Approved artifact photographs/scans | Public presentation | Pending Assets |
| CI-003 | Actual object metadata and date precision | Accurate labels | Pending Evidence |
| CI-004 | Supporting references for factual claims | Traceability | Pending Evidence |
| CI-005 | Documented provenance events where available | Object history | Pending Evidence |
| CI-006 | Ownership statements and evidence where applicable | Avoid false ownership claims | Pending Verification |
| CI-007 | Authenticity assessments, if the institution intends to make such claims | Avoid unsupported authenticity wording | Qualified Review Required |
| CI-008 | Display/copyright permissions for every public image/document | Lawful media use | Pending Rights Review |
| CI-009 | Actual country/collection assignments | Curatorial relationships | Pending Inventory |
| CI-010 | Final editorial copy for each published locale | Public language quality | Pending Editorial Approval |

## 21.3 Brand and asset approvals

| ID | Required input | State |
|---|---|---|
| BA-001 | Final approved logo and its variants | Pending Brand Approval |
| BA-002 | Final palette values and any differences from proposed tokens | Proposed Baseline / Pending Approval |
| BA-003 | Font license and approved deployment source | Pending License Verification |
| BA-004 | Final type sizes, spacing, breakpoints, and component tokens | Pending Design System Approval |
| BA-005 | Physical file verification of all 72 reference assets | Pending Asset Audit |
| BA-006 | Generation/existence and rights status of the 10 additional assets | Pending Verification |
| BA-007 | Actual code integration and visual use of each selected asset | Pending Implementation Verification |

## 21.4 Legal and operational inputs

| ID | Required input | State |
|---|---|---|
| LO-001 | Responsible legal entity and applicable jurisdiction(s) | Pending Legal Determination |
| LO-002 | Privacy controller/contact and approved privacy notice | Pending Legal Review |
| LO-003 | Terms of use and copyright/takedown procedure | Pending Legal Review |
| LO-004 | Cookie/analytics consent requirements | Pending Legal Review |
| LO-005 | AI conversation retention and provider data handling | Pending Privacy Approval |
| LO-006 | Backup frequency, retention, RPO, and RTO | Pending Operations Approval |
| LO-007 | Availability target and incident-response owner | Pending Operations Approval |
| LO-008 | Hosting, analytics, search, media, and AI providers | Pending Technical Architecture Record |

## 21.5 Implementation evidence inputs

The source document included a “Current Project Truth” paragraph referring to a Next.js foundation, PostgreSQL/pgvector work, and an asset library. Those are implementation claims, not product requirements, and are excluded from the normative product baseline.

A separate dated implementation report must confirm or reject each such claim using current source paths, commit identifiers, database evidence, test output, deployment checks, and verified asset files. Until such evidence is available, status is **Not Independently Verified**.

## 21.6 No additional product-design clarification required

The product behavior defined in this specification is the implementation baseline. A designer or developer should not need to ask the Owner to reinterpret the purpose of the pages, the navigation hierarchy, the six country worlds, the non-commercial museum identity, the core collection model, the 20-module Control Center, the role boundaries, the language behavior, the AI safety limits, or the basic state transitions.

The items in this register are real-world inputs and approvals, not unanswered product-design questions. Where an input is pending, the system must use an explicit unavailable/placeholder state or block the affected public claim; it must not invent a value.

## 21.7 Specification closure sequence

1. Confirm the institutional identity inputs.
2. Build and verify the actual artifact inventory and rights register.
3. Approve final editorial content in each locale.
4. Approve design tokens, logo assets, font licenses, and responsive rules.
5. Approve the physical ERD and data dictionary against this logical model.
6. Approve legal/privacy notices for the real entity and jurisdiction.
7. Verify implementation against requirement IDs and test evidence.
8. Resolve all P0 defects and record Owner acceptance.

---

# 22. Glossary

| Term | Definition |
|---|---|
| Artifact | An individual heritage object represented by a controlled museum record |
| Claim | A specific factual statement about an artifact or historical subject |
| Evidence | A source or document that supports, contradicts, or contextualizes a claim |
| Source | A documentary, historical, scholarly, institutional, or archival reference |
| Provenance | The documented custody/ownership/transfer or collection-history sequence of an object |
| Ownership | A legal or factual ownership statement that requires its own supporting basis |
| Authenticity Assessment | A separate assessment concerning whether an object is genuine/original; not implied by record completeness |
| Verification | A recorded review of a defined claim or record element against evidence |
| Publication | Authorization to make content publicly available |
| Locale | A language-specific presentation and content version, such as English or Arabic |
| Collection | A curated grouping of artifacts |
| Country World | A distinct country-based cultural exhibition within Noujoude |
| Story | An approved editorial or curatorial narrative |
| Media Asset | A visual/document file and its metadata/derivatives |
| Rights Record | Permission and usage restrictions associated with media or content |
| Control Center | The private administrative environment for the museum |
| AI Curator | The bounded AI-based museum guide |
| Revision | A versioned state of an editable record |
| Archive | Retained inactive content; not equivalent to a technical backup |
| RPO | Recovery Point Objective — acceptable maximum data-loss window |
| RTO | Recovery Time Objective — target time to restore service |
| Core Web Vitals | Field metrics for loading, responsiveness, and visual stability |

---

# 23. Non-Negotiable Product Invariants

The following rules apply across every page, country, collection, artifact, story, language, device, administrative module, and future expansion.

1. The official Noujoude identity is never replaced by an unrelated logo or improvised brand.
2. The main visual language remains grounded in noir museum, burgundy, champagne gold, warm ivory, archival materials, and restrained ornamentation.
3. Typography remains coherent across English and Arabic.
4. Public content remains culturally respectful, historically careful, refined, and honest about uncertainty.
5. The product remains non-commercial; no e-commerce or marketplace behavior is introduced without a formally approved product change.
6. Artifact identity, evidence, rights, verification, and publication states remain consistent wherever the artifact appears.
7. Country worlds may vary culturally but remain part of one Noujoude museum.
8. Artifact presentation adapts to its actual object type; coins, letters, documents, and stamps are not forced into meaningless identical metadata.
9. Arabic and English retain the same factual meaning but may use native editorial phrasing.
10. Desktop, tablet, and mobile layouts adapt without losing hierarchy or content.
11. Published states never substitute for verification states.
12. Illustrative imagery never becomes proof of artifact existence, ownership, authenticity, or historical fact.
13. Public AI never accesses private records and never invents a claim.
14. Owner control covers supported CMS functions but does not expose unsafe infrastructure controls.
15. Every critical operation is permission-controlled, traceable, and appropriately reversible.
16. A proposal never silently becomes an approved decision.
17. A documented feature never counts as implemented without evidence.
18. A file in a library never counts as integrated or rights-cleared by default.
19. Missing content is shown honestly rather than fabricated to create apparent completeness.
20. A change to an approved baseline is versioned, justified, and assessed for cross-system impact.

---


---

# Appendix A — Master Asset Catalog and Asset Governance Register
## A.1 Catalog authority and status

The filenames below are transcribed from the supplied source inventory. They are reference requirements, not proof that a file currently exists, has been generated, is legally cleared, is technically optimized, or is used by the live website. A file must pass physical verification, metadata review, rights review, visual approval, and usage mapping before it is marked production-ready.

The catalog preserves the original 72 reference filenames and the 10 separately requested additions. The category totals are 12 + 18 + 3 + 11 + 10 + 18 = 72 reference assets, plus 10 additional requested assets.

## A.2 Brand Identity Assets — 12

| Source line | Exact filename | Intended role | Intended association |
|---:|---|---|---|
| 3779 | `brand_seal_monogram_1024.webp` | Official monogram seal | Header, identity, certificates |
| 3780 | `logo_badge_burgundy_1024.webp` | Burgundy logo badge | Brand applications |
| 3781 | `logo_stacked_vertical_1024x1536.webp` | Vertical logo | Formal and vertical compositions |
| 3782 | `logo_wordmark_1024x768.webp` | Main wordmark | Homepage and identity |
| 3783 | `certificate_authenticity_1024.webp` | Certificate identity | Artifact documentation |
| 3784 | `certificate_identity_scene_4x3.webp` | Certificate visual scene | Archive and certificate presentation |
| 3785 | `premium_packaging_identity_1x1.webp` | Packaging identity reference | Brand presentation |
| 3786 | `social_announcement_seal_1x1.jpg` | Announcement seal | Approved communication visuals |
| 3787 | `watermark_system_16x9.webp` | Watermark reference | Approved image branding |
| 3788 | `wax_seal_texture_macro_1x1.jpg` | Wax seal texture | Certificates and archival details |
| 3789 | `launch_banner_16x9.jpg` | Launch banner | Institutional announcements |
| 3790 | `social_instagram_1024.webp` | Social visual asset | Approved social identity |

## A.3 Museum Architecture and Environment — 18

| Source line | Exact filename | Intended role | Intended association |
|---:|---|---|---|
| 3798 | `master_atmosphere_definitive.webp` | Main museum atmosphere | Homepage hero |
| 3799 | `main_entrance_mobile_9x16.webp` | Vertical entrance composition | Mobile homepage |
| 3800 | `grand_entrance_dusk.webp` | Grand entrance at dusk | Museum entrance |
| 3801 | `arrival_hall_morning.webp` | Arrival hall scene | The Museum |
| 3802 | `golden_hour_hall.webp` | Golden-hour hall | Museum architecture |
| 3803 | `grand_staircase.webp` | Staircase environment | Institutional spatial imagery |
| 3804 | `museum_building_1024.webp` | Building image | About and Museum |
| 3805 | `glass_dome_looking_up.webp` | Architectural detail | Museum environments |
| 3806 | `marble_corridor.webp` | Marble corridor | Spatial transitions |
| 3807 | `rose_courtyard_golden_hour.webp` | Courtyard atmosphere | Editorial and country contexts where suitable |
| 3808 | `luxury_night.webp` | Night environment | Museum background |
| 3809 | `luxury_library_night.webp` | Library atmosphere | Stories and archives |
| 3810 | `morning_gallery.webp` | Morning gallery | Exhibition environments |
| 3811 | `main_gallery_burgundy.webp` | Burgundy gallery | Museum galleries |
| 3812 | `archive_chamber.webp` | Archive room | Archive experience |
| 3813 | `private_archive_room_16x9.webp` | Private archive | Collection and documentation pages |
| 3814 | `collector_lounge_night.webp` | Collector lounge | Institutional atmosphere |
| 3815 | `museum_cafe_morning.webp` | Museum café environment | Optional visitor atmosphere reference |

## A.4 AI Curator Visual Assets — 3

| Source line | Exact filename | Intended role | Intended association |
|---:|---|---|---|
| 3825 | `ai_curator_sanctum_16x9.jpg` | Curator environment | AI Curator page |
| 3826 | `ai_curator_sparkle_1024.webp` | Curator identity detail | AI Curator visual identity |
| 3827 | `curator_hands_emotional_moment_16x9.webp` | Human-curatorial atmosphere | Museum storytelling |

## A.5 Collection and Heritage Visual Assets — 11

| Source line | Exact filename | Intended role | Intended association |
|---:|---|---|---|
| 3837 | `collection_gallery_shelves_16x9.jpg` | Collection shelving | Collections |
| 3838 | `rare_stamp_1024.webp` | Stamp visual | Stamps |
| 3839 | `rare_stamps_glass_cabinet_4x3.jpg` | Stamp cabinet | Stamp exhibition |
| 3840 | `heritage_jewelry_1024.webp` | Heritage jewelry visual | Heritage objects |
| 3841 | `historical_documents_atmosphere_4x3.jpg` | Document atmosphere | Documents |
| 3842 | `family_letters_1024.webp` | Letters visual | Letters and archives |
| 3843 | `family_letters_bundle_1x1.jpg` | Letter collection | Letter collections |
| 3844 | `vintage_collector_desk_16x9.jpg` | Collector desk environment | Collection storytelling |
| 3845 | `brand_muse_golden_hour.webp` | Brand atmosphere | Institutional storytelling |
| 3846 | `gift_boutique.webp` | Gift boutique visual | Reference only unless a museum gift area is approved |
| 3847 | `perfume_vanity_1024.webp` | Heritage vanity visual | Reference only unless relevant to actual collection material |

## A.6 Interface and Supporting Visual Assets — 10

| Source line | Exact filename | Intended role | Intended association |
|---:|---|---|---|
| 3857 | `app_interface_showcase_16x9.jpg` | Interface visual reference | UI design reference |
| 3858 | `interface_collection_page_4x3.jpg` | Collection layout reference | Collections UI |
| 3859 | `control_center_desk_16x9.jpg` | Control Center atmosphere | Administrative environment |
| 3860 | `mobile_app_scene_9x16.jpg` | Mobile experience reference | Mobile presentation |
| 3861 | `user_account_1024.webp` | Account visual | Restricted account-related interface if applicable |
| 3862 | `search_discovery_1024.webp` | Discovery visual | Search |
| 3863 | `contact_envelope_1024.webp` | Correspondence visual | Contact |
| 3864 | `telephone_1024.webp` | Contact visual | Contact information |
| 3865 | `favorite_heart_1024.webp` | Favorite icon reference | Future visitor interaction only if approved |
| 3866 | `location_paris_1024.webp` | Location visual | Location presentation if applicable |

## A.7 Textures, Backgrounds, Lighting and Transitions — 18

| Source line | Exact filename | Intended role | Intended association |
|---:|---|---|---|
| 3878 | `bg_ivory_petals.webp` | Ivory floral background | Selected editorial panels |
| 3879 | `bg_dark_museum_bokeh.webp` | Dark museum atmosphere | Dark page backgrounds |
| 3880 | `burgundy_velvet_texture.webp` | Velvet texture | Exhibition backgrounds |
| 3881 | `champagne_gold_marble_texture.webp` | Marble and gold | Luxury visual details |
| 3882 | `dark_museum_wood_texture.webp` | Dark wood | Archival environments |
| 3883 | `floral_section_background_16x9.webp` | Floral background | Selected thematic sections |
| 3884 | `gold_embroidery_detail_1x1.jpg` | Embroidery texture | Detailed archival accents |
| 3885 | `gold_leaf_dark_texture.webp` | Gold leaf background | Restrained luxury details |
| 3886 | `ivory_marble_texture.webp` | Ivory marble | Paper and architectural surfaces |
| 3887 | `ivory_silk_texture.webp` | Silk texture | Soft backgrounds |
| 3888 | `old_paper_texture.webp` | Aged archival paper | Document storytelling |
| 3889 | `rose_marble_texture.webp` | Rose marble | Selected identity sections |
| 3890 | `section_transition_background_16x9.webp` | Section transition | Page transitions |
| 3891 | `light_rays_dust.webp` | Light-ray atmosphere | Museum lighting |
| 3892 | `loading_golden_rays.webp` | Loading atmosphere | Loading states |
| 3893 | `rose_petals_floating.webp` | Floral motion visual | Selected transitions |
| 3894 | `warm_candlelight.webp` | Warm illumination | Museum atmosphere |
| 3895 | `overlay_glass_reflections.webp` | Glass reflection overlay | Museum displays |

## A.8 Additional Requested Assets — 10

These ten files are separate from the original 72-file reference inventory. Their generation and physical existence must be verified independently.

### A.8.1 Country World Hero Assets — 6

| Source line | Exact intended filename | Intended description | Intended destination |
|---:|---|---|---|
| 3923 | `world_morocco_hero_16x9.webp` | Authentic-inspired Moroccan architectural environment | Morocco World |
| 3924 | `world_egypt_hero_16x9.webp` | Historical Egyptian architectural environment | Egypt World |
| 3925 | `world_syria_hero_16x9.webp` | Historic Damascus-inspired environment | Syria World |
| 3926 | `world_mauritania_hero_16x9.webp` | Chinguetti manuscript and desert heritage environment | Mauritania World |
| 3927 | `world_libya_hero_16x9.webp` | Historic Tripoli and Mediterranean heritage environment | Libya World |
| 3928 | `world_sudan_hero_16x9.webp` | Nubian and Sudanese architectural heritage environment | Sudan World |

### A.8.2 Collection Category Assets — 4

| Source line | Exact intended filename | Intended description | Intended destination |
|---:|---|---|---|
| 3934 | `collection_first_day_covers_4x3.webp` | First-day covers and commemorative envelopes | First Day Covers |
| 3935 | `collection_coins_4x3.webp` | Numismatic heritage display | Coins |
| 3936 | `collection_artifacts_4x3.webp` | Curated heritage object display | Artifacts |
| 3937 | `collection_souvenirs_4x3.webp` | Historic keepsakes and commemorative objects | Souvenirs |

## A.9 Asset interpretation safeguards

- A visual reference of an artifact category is not evidence that the museum owns the depicted object.
- A country hero image is an illustrative exhibition visual unless it is independently documented as an original collection photograph.
- AI-generated and composite imagery must never be represented as documentary photography or an original artifact.
- `certificate_authenticity_1024.webp` is a design asset reference only; it does not establish that any artifact has been authenticated or certified.
- `user_account_1024.webp` and `favorite_heart_1024.webp` do not authorize visitor accounts, favorites, or saved collections in V1.
- `gift_boutique.webp` does not authorize a gift shop or commerce feature.
- `museum_cafe_morning.webp` does not establish that a public café exists.
- `location_paris_1024.webp` does not establish the museum's official location.
- Each asset's technical and legal status must be tracked separately: referenced, present, rights-cleared, approved, optimized, integrated, and verified are different states.

## A.10 Required per-asset metadata

Every asset record MUST include: Asset ID; exact filename; original filename; asset type; MIME type; dimensions; file size; color profile when relevant; source; creator; creation/acquisition date when known; rights holder; license; permitted uses; restrictions; expiry/review date where applicable; original/derivative relationship; alt text; caption; language; focal point; responsive variants; checksum; associated page/entity; status; approval record; and revision history.

## A.11 Asset lifecycle

`Referenced → Located → Metadata Recorded → Rights Reviewed → Curatorial/Brand Approved → Optimized → Integrated → Verified in Context`

An asset may be marked `Reference Only`, `Awaiting Generation`, `Awaiting Rights Review`, `Duplicate`, `Rejected`, or `Archived`. Status transitions must be auditable. No asset count may combine these distinct states into one completion percentage.


# Appendix B — Source-to-Master Traceability Matrix

## B.1 Source file identity

The source is `Pasted text(20261030-163919).txt`. It contains 8,174 logical lines (8,173 newline separators because the final line has no trailing line terminator), 31,973 whitespace-delimited words, and 241,590 bytes in the supplied UTF-8 text. Line numbers below refer to the logical lines produced by splitting the supplied file on newline characters.

## B.2 Complete source-range disposition

Every source line belongs to exactly one contiguous range below. The disposition identifies the canonical destination or explains why repeated covers, duplicated closings, or implementation-status material are not retained as independent normative chapters. This matrix is a traceability index; it does not assert that every original sentence remains verbatim. Unique requirements are retained in canonical form, repeated wording is merged, and non-normative implementation claims are moved to a separate evidence register.

| Original source lines | Source block / subject | Canonical master destination and disposition |
|---:|---|---|
| 1–12 | # NOUJOUDE | Document Control and Governance — Normalize the single cover; preserve project identity and metadata. |
| 13–53 | # 1. WHAT NOUJOUDE IS | Product Definition, Identity and Institutional Principles — Retain and consolidate the unique product definition and identity requirements. |
| 54–103 | # 3. BRAND IDENTITY | Editorial Voice and Brand Language (Chapter 7; cross-reference Chapter 1) — Merge voice rules into the canonical editorial model. |
| 104–203 | # 4. VISUAL IDENTITY | Design System and Visual Identity (Chapter 12) — Merge into one design-system specification; retain proposed values and approval status. |
| 204–247 | # 5. INFORMATION ARCHITECTURE | Information Architecture and Navigation (Chapter 4) — Merge route and hierarchy definitions. |
| 248–571 | # 6. PAGE-BY-PAGE SPECIFICATION | Public Page Specifications (Chapter 6) — Consolidate page definitions into the canonical route specifications. |
| 572–611 | # 7. CONTENT MODEL | Content Model and Editorial Architecture (Chapter 7) — Merge unique content definitions into canonical content governance. |
| 612–635 | # 8. STORYTELLING RULES | Storytelling and Curatorial Narrative (Chapter 7) — Retain distinct narrative principles; remove repeated descriptions. |
| 636–665 | # 9. VISUAL LIBRARY AND ASSET USE | Media and Asset Rules (Chapter 13) — Merge into the asset governance and rights model. |
| 666–720 | # 10. INTERACTION DESIGN | Interaction, Responsive Design and Visitor Experience (Chapters 5–6) — Retain interaction requirements and combine overlapping visitor flows. |
| 721–759 | # 12. ACCESSIBILITY | Accessibility and Localization (Chapters 10 and 19) — Consolidate language and accessibility rules. |
| 760–777 | # 14. FUTURE EXPANSION | Future Scope (Chapter 2) — Retain as explicitly deferred scope. |
| 778–794 | # 15. NON-NEGOTIABLE PROHIBITIONS | Product Prohibitions and Non-Goals (Chapters 2 and 23) — Retain as product invariants. |
| 795–812 | # 16. CURRENT PROJECT TRUTH | Implementation Truth — separate implementation register — Move out of normative product requirements; implementation facts require dated evidence. |
| 813–830 | # 17. FINAL PRODUCT DEFINITION | Product Definition and Identity (Chapter 1) — Merge final identity statements into one canonical definition. |
| 831–838 | # NOUJOUDE | Document Control and Governance — Remove duplicate cover metadata; retain no unique product requirement. |
| 839–1049 | # 18. PAGE-BY-PAGE DESCRIPTION | Public Page Specifications (Chapter 6) — Merge with first detailed page definitions; eliminate duplicate route treatments. |
| 1050–1149 | # 19. CONTENT-BY-CONTENT DESCRIPTION | Editorial Content Architecture (Chapter 7) — Merge content requirements by content entity and page. |
| 1150–1215 | # 20. UI/UX BEHAVIOR DESCRIPTION | Visitor Experience and UI Behavior (Chapters 5–6) — Consolidate duplicated interaction requirements. |
| 1216–1257 | # 21. AI BEHAVIOR BOUNDARIES | AI Curator Governance (Chapter 14) — Retain AI boundaries and knowledge obligations. |
| 1258–1319 | # 22. ASSET USAGE Boundaries | Asset Usage and Restrictions (Chapter 13) — Merge source-specific asset restrictions. |
| 1320–1364 | # 23. CURRENT PRODUCT BOUNDARIES | Scope and Product Boundaries (Chapter 2) — Retain scope limits and non-goals. |
| 1365–1378 | # NOUJOUDE | Document Control and Governance — Remove duplicate cover metadata. |
| 1379–1555 | # 25. OFFICIAL ROUTE MAP & INFORMATION ARCHITECTURE | Information Architecture and Routing (Chapter 4) — Use one canonical route map. |
| 1556–1741 | # 26. ROLES, RESPONSIBILITIES & PERMISSIONS | Roles and Permissions (Chapter 17) — Merge with the later detailed role matrix. |
| 1742–1855 | # 27. LANGUAGE RULES & MULTILINGUAL IDENTITY | Localization and Language Rules (Chapter 10) — Merge locale, directionality and translation rules. |
| 1856–2031 | # 28. SYSTEM STATES & CONTENT STATES | System and Content States (Chapter 11) — Merge state definitions with state machines and UI feedback. |
| 2032–2232 | # 29. V1 PRODUCT BOUNDARIES | V1 Scope and Future Boundaries (Chapter 2) — Preserve the release boundary and deferrals. |
| 2233–2256 | # 30. DEFINITIVE PRODUCT IDENTITY | Product Definition and Governance (Chapters 0–1) — Retain only non-duplicate closure decisions. |
| 2257–2274 | # NOUJOUDE | Document Control and Governance — Remove duplicate cover metadata. |
| 2275–3054 | # 31. COMPLETE CONTENT SPECIFICATION | Public Page Content and Behavior (Chapters 6–7) — Consolidate detailed page content, fields and behavior; preserve unique page-level requirements. |
| 3055–3379 | # 32. OFFICIAL VISUAL IDENTITY RULES | Design System and Visual Identity (Chapter 12) — Merge all visual values, materials, image treatments and layout rules. |
| 3380–3756 | # 33. COLLECTION DATA DICTIONARY | Logical Data Dictionary and Relationships (Chapter 8) — Consolidate as a logical model; do not assert physical schema implementation. |
| 3757–3965 | # 34. ASSET MASTER CATALOG | Asset Master Catalog (Appendix A) — Preserve all 72 reference filenames and 10 additional requested filenames verbatim. |
| 3966–4198 | # 35. CONSISTENCY MATRIX & DESIGN INVARIANTS | Consistency Matrix and Product Invariants (Chapter 23) — Merge conflicts, consistency constraints and invariants. |
| 4199–4256 | # 36. NON-NEGOTIABLE INSTITUTIONAL VALUES | Institutional Values and Identity (Chapter 1) — Retain principles; keep factual institutional claims as Owner Inputs. |
| 4257–4328 | # 37. FINAL DESCRIPTIVE COMPLETENESS STANDARD | Acceptance and Completeness (Chapter 20) — Merge into the acceptance matrix. |
| 4329–4341 | # NOUJOUDE | Control Center Overview (Chapter 15) — Use one canonical administrative overview. |
| 4342–4449 | # 38. MASTER CONTROL CENTER — INSTITUTIONAL DEFINITION | Control Center Principles and Capabilities (Chapter 15) — Retain the unique administrative system requirements. |
| 4450–4560 | # 39. CONTROL CENTER VISUAL IDENTITY | Control Center Design Language (Chapters 12 and 15) — Apply the canonical design system while retaining admin-specific usability requirements. |
| 4561–4593 | # 40. OFFICIAL CONTROL CENTER NAVIGATION | Twenty-Module Control Center Map (Chapter 16) — Use as the canonical module inventory. |
| 4594–4708 | # 41. MODULE 01 — EXECUTIVE OVERVIEW | Control Center Module 01 — Executive Overview (Chapter 16.1) — Merge module requirements. |
| 4709–4914 | # 42. MODULE 02 — WEBSITE & PAGE STUDIO | Control Center Module 02 — Website & Page Studio (Chapter 16.2) — Merge module requirements and Owner approvals. |
| 4915–5028 | # 43. MODULE 03 — BRAND & VISUAL IDENTITY STUDIO | Control Center Module 03 — Brand & Visual Identity Studio (Chapter 16.3) — Merge module requirements with the design system. |
| 5029–5084 | # 44. MODULE 04 — MUSEUM WORLDS MANAGEMENT | Control Center Module 04 — Museum Worlds Management (Chapter 16.4) — Merge module requirements. |
| 5085–5156 | # 45. MODULE 05 — COLLECTIONS MANAGEMENT | Control Center Module 05 — Collections Management (Chapter 16.5) — Merge module requirements. |
| 5157–5260 | # 46. MODULE 06 — ARTIFACT MANAGEMENT | Control Center Module 06 — Artifact Management (Chapter 16.6) — Merge module requirements. |
| 5261–5316 | # 47. MODULE 07 — STORIES & EDITORIAL STUDIO | Control Center Module 07 — Stories & Editorial Studio (Chapter 16.7) — Merge module requirements. |
| 5317–5418 | # 48. MODULE 08 — MEDIA & ASSET LIBRARY | Control Center Module 08 — Media & Asset Library (Chapter 16.8) — Merge module requirements and the canonical artifact model. |
| 5419–5539 | # 49. MODULE 09 — AI CURATOR COMMAND CENTER | Control Center Module 09 — AI Curator Command Center (Chapter 16.9) — Merge module requirements with editorial governance. |
| 5540–5579 | # 50. MODULE 10 — NAVIGATION & FOOTER STUDIO | Control Center Module 10 — Navigation & Footer Studio (Chapter 16.10) — Merge module requirements with asset governance. |
| 5580–5628 | # 51. MODULE 11 — SEO & METADATA CENTER | Control Center Module 11 — SEO & Metadata Center (Chapter 16.11) — Merge module requirements with evidence records. |
| 5629–5677 | # 52. MODULE 12 — LANGUAGE & TRANSLATION CENTER | Control Center Module 12 — Language & Translation Center (Chapter 16.12) — Merge module requirements with rights controls. |
| 5678–5726 | # 53. MODULE 13 — FORMS & INQUIRIES CENTER | Control Center Module 13 — Forms & Inquiries Center (Chapter 16.13) — Merge module requirements with locale governance. |
| 5727–5835 | # 54. MODULE 14 — USERS, ROLES & PERMISSIONS | Control Center Module 14 — Users, Roles & Permissions (Chapter 16.14; Chapter 17) — Merge module configuration, knowledge controls and safety policy. |
| 5836–5887 | # 55. MODULE 15 — PUBLISHING & REVISION CONTROL | Control Center Module 15 — Publishing & Revision Control (Chapter 16.15; Chapter 18) — Merge module controls with SEO and indexing requirements. |
| 5888–5942 | # 56. MODULE 16 — SYSTEM & INSTITUTIONAL SETTINGS | Control Center Module 16 — System & Institutional Settings (Chapter 16.16) — Merge module requirements and privacy constraints. |
| 5943–5982 | # 57. MODULE 17 — ANALYTICS & INSIGHTS | Control Center Module 17 — Analytics & Insights (Chapter 16.17) — Merge module requirements with the canonical permissions model. |
| 5983–6029 | # 58. MODULE 18 — NOTIFICATIONS & ALERTS | Control Center Module 18 — Notifications & Alerts (Chapter 16.18) — Merge module requirements with approval and release states. |
| 6030–6076 | # 59. MODULE 19 — AUDIT & ACTIVITY CENTER | Control Center Module 19 — Audit & Activity Center (Chapter 16.19; Chapter 18) — Merge module requirements with data minimization. |
| 6077–6111 | # 60. MODULE 20 — ARCHIVE & RECOVERY CENTER | Control Center Module 20 — Archive & Recovery Center (Chapter 16.20; Chapter 18) — Merge module requirements with audit and recovery policies. |
| 6112–6174 | # 61. MASTER CONTROL CENTER — GLOBAL CONTROLS | Global Control Center Rules (Chapter 15) — Retain shared behavior and screen contracts. |
| 6175–6236 | # 62. COMPLETE OWNER CONTROL MATRIX | Owner Authority and Control Matrix (Chapter 17) — Retain Owner authority and the defined security boundary. |
| 6237–6262 | # 63. ADMINISTRATIVE DESIGN PRINCIPLES | Administrative Experience Principles (Chapter 15) — Merge global admin UX requirements. |
| 6263–6283 | # 64. MASTER CONTROL CENTER — NON-NEGOTIABLE PROHIBITIONS | Administrative Prohibitions (Chapters 15, 17 and 19) — Retain security and administrative invariants. |
| 6284–6304 | # 65. FINAL CONTROL CENTER DEFINITION | Control Center Closure (Chapter 15) — Merge non-duplicate completion requirements. |
| 6305–6316 | # NOUJOUDE DIGITAL HERITAGE MUSEUM | Document Control and Governance — Remove duplicate cover metadata. |
| 6317–6352 | # 0. الغرض من هذه الوثيقة | Product Purpose and Principles (Chapters 0–1) — Retain and normalize the unique purpose and principles. |
| 6353–6413 | # 1. الهوية المؤسسية الحقيقية | Institutional Identity (Chapter 1) — Merge Owner-input and identity fields. |
| 6414–6511 | # 2. الجمهور المستهدف | Audience Definition (Chapter 3) — Retain audience groups and user needs. |
| 6512–6656 | # 3. المحتوى التحريري النهائي | Editorial Content Governance (Chapter 7) — Merge final editorial architecture and approval flow. |
| 6657–6756 | # 4. سجل المقتنيات الفعلي | Collection Inventory and Evidence (Chapter 8) — Merge inventory, artifact claims, verification and relationships. |
| 6757–6907 | # 5. النظام البصري الرقمي | Visual Identity (Chapter 12) — Merge duplicate palette and component rules; retain unique specifications. |
| 6908–7001 | # 6. إدارة الصور والوسائط والحقوق | Asset Rights and Usage (Chapter 13) — Merge rights, copyright and provenance-of-media controls. |
| 7002–7210 | # 7. تجربة الزيارة | Visitor Journey and Interactions (Chapters 5–6) — Merge with canonical visitor journey and page interaction model. |
| 7211–7529 | # 8. مركز التحكم | Control Center Modules (Chapters 15–17) — Merge corresponding module requirements into the 20-module canonical structure; do not create a second navigation system. |
| 7530–7630 | # 9. نموذج البيانات والعلاقات | Data Architecture and Relationships (Chapter 8) — Merge relationship and integrity rules. |
| 7631–7737 | # 10. الخصوصية والقانون وحقوق الملكية | Legal, Privacy and Rights (Chapter 19) — Retain policy requirements and Owner/legal inputs. |
| 7738–7865 | # 11. أمين المتحف الذكي | AI Curator Governance (Chapter 14) — Merge source hierarchy, uncertainty, escalation and privacy requirements. |
| 7866–8014 | # 12. معايير الجودة والتشغيل | Non-Functional Requirements (Chapter 19) — Merge measurable quality and operational standards. |
| 8015–8036 | # 13. مصفوفة القبول النهائية | Acceptance Matrix (Chapter 20) — Merge acceptance gates and evidence requirements. |
| 8037–8073 | # 14. سجل القرارات والمعلومات المعلقة | Owner Inputs and Open Decisions (Chapter 21) — Retain unresolved factual approvals and their owners. |
| 8074–8122 | # 15. ترتيب إغلاق الوثيقة | Specification Closure Sequence (Chapter 21) — Merge as governance sequence, not a second product roadmap. |
| 8123–8139 | # 16. قواعد منع التضخم والتناقض في الوثيقة | Document Control and Product Invariants (Chapters 0 and 23) — Retain anti-duplication and change-control rules. |
| 8140–8174 | # 17. التقييم النهائي | Document Status and Closure Note (Chapter 0) — Retain only document status; do not treat the source closing as another specification chapter. |

## B.3 Coverage rules

1. The master is the canonical requirement location; this matrix is the reverse index to the source.
2. A source paragraph may map to more than one master chapter where it contains separable requirements; the range-level destination lists the principal canonical home.
3. Repeated statements are represented once in the master and may be referenced through cross-links.
4. Source lines describing an implementation snapshot are not treated as product requirements. They require dated verification in the implementation register.
5. The 72 reference assets and 10 additional requested filenames are preserved exactly in Appendix A.
6. If a reviewer identifies a unique source requirement with no explicit destination, it must be recorded as a traceability defect and resolved before approval.


# Appendix C — Requirement-to-Implementation Verification Record

This appendix defines the controlled record used after the specification is approved. It deliberately does not claim any requirement is already implemented.

| Field | Required content |
|---|---|
| Requirement ID | Stable identifier from the master requirement catalogue |
| Requirement statement | The normative requirement being verified |
| Priority | P0, P1, P2, or F1 |
| Release | V1 or named future release |
| Implementation status | Not Started / In Progress / Implemented / Verified / Deferred / Not Applicable |
| Evidence | Source path, commit, migration, endpoint, asset path, test report, or deployment evidence |
| Verification method | Inspection, functional test, accessibility test, security test, content review, or visual review |
| Result | Pass / Fail / Blocked / Not Run |
| Verifier and date | Named responsible reviewer and verification date |
| Defect / exception | Linked defect, approved deviation, or limitation |

A requirement is `Verified` only when the relevant acceptance criteria have passed and evidence is attached. “Implemented” means code or configuration exists; it does not mean the behavior has passed verification.


# Appendix D — External Standards and Reference Basis

The following sources inform measurable quality requirements. They are references for standards and test criteria, not evidence of current conformance by the Noujoude website. Accessed 30 October 2026.

1. **W3C Web Content Accessibility Guidelines (WCAG) 2.2:** [W3C Recommendation](https://www.w3.org/TR/WCAG22/) and [WAI WCAG overview](https://www.w3.org/WAI/standards-guidelines/wcag/). The proposed accessibility target is WCAG 2.2 Level AA, subject to formal project approval and testing.
2. **Core Web Vitals:** [Google web.dev thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds) and [Google Search Central guidance](https://developers.google.com/search/docs/appearance/core-web-vitals). Proposed “good” thresholds are LCP ≤ 2.5 seconds, INP ≤ 200 milliseconds, and CLS ≤ 0.1, evaluated at the 75th percentile of real user experience data where sufficient data exists.
3. **OWASP Application Security Verification Standard (ASVS) 5.0.0:** [Official ASVS project](https://asvs.owasp.org/) and [official downloads](https://asvs.owasp.org/downloads/). The project must define a risk-based verification profile and map the applicable controls to the actual application architecture. Citing ASVS does not establish compliance.


# Appendix E — Approval Record

| Approval item | Status | Approver | Date | Evidence / notes |
|---|---|---|---|---|
| Product baseline and V1 scope | Pending Owner approval |  |  |  |
| Institutional facts and attribution | Owner input required |  |  |  |
| Visual identity tokens and typography | Proposed standard; final brand approval required |  |  |  |
| Actual collection inventory and documentation | Owner / Curatorial input required |  |  |  |
| Image and document rights | Rights review required |  |  |  |
| Logical data model | Proposed baseline; technical review required |  |  |  |
| Legal and privacy policies | Legal review required |  |  |  |
| Accessibility, performance and security targets | Proposed standards; verification required |  |  |  |
| Implementation conformance | Not assessed by this specification |  |  |  |



# Appendix F — Canonical Decisions and Conflict Resolution

This appendix makes the principal conflict resolutions explicit. It is subordinate to the normative requirements in the numbered chapters and exists to prevent the source addenda from being interpreted as parallel or competing specifications.

| Topic | Ambiguity or competing treatment in the source | Canonical decision in this master | Primary reference |
|---|---|---|---|
| Product identity | A general luxury website, a private collection showcase, and a museum experience were sometimes described interchangeably. | Noujoude is defined as a bilingual digital heritage museum. It is not an e-commerce site, marketplace, social network, or generic blog. | Chapters 1–2 |
| Home vs. The Museum | The entrance, homepage, and museum page were described as overlapping or as sequential mandatory screens. | Home is the landing and discovery hub. The Museum is the institutional orientation page. The Home CTA opens The Museum; visitors may bypass it through global navigation. | Chapters 4 and 6 |
| About vs. The Museum | Institutional biography, museum philosophy, and exploration guidance overlapped. | The Museum explains the museum concept and visitor exploration. About contains approved institutional identity, origin, ownership attribution, and mission facts. Neither page invents a physical building or legal status. | Chapter 6 |
| Country worlds | Six countries were sometimes presented as if all exhibitions were equally complete. | The six-world architecture is fixed. Morocco is the first fully developed V1 world. Each other world displays its actual readiness state and never implies completion without content and evidence. | Chapters 2, 6 and 11 |
| Country–Artifact relation | A single-country field was implied in some data descriptions. | An artifact may have multiple typed country relationships (issued in, produced in, originated in, found in, associated with, used in). A primary display country is a presentation choice, not a factual override. | Chapter 8 |
| Collection–Artifact relation | Single collection membership conflicted with cross-collection curatorial use. | Artifact and Collection support many-to-many membership; an optional primary display collection may be set without restricting other memberships. | Chapter 8 |
| Source vs. Provenance | Bibliographic references and custody/ownership history were sometimes conflated. | Source records document evidence/references. Provenance events document custody, transfer, or ownership history. They are distinct data entities and distinct public claims. | Chapter 8 |
| Verification vs. authenticity | Global verification wording could be read as proof that an artifact is authentic or legally owned. | Verification is claim-specific. Identity, date, issuer, material, provenance, ownership, and authenticity require their own evidence and review. A verified claim does not certify the object as a whole. | Chapters 8 and 11 |
| Artifact rights | Object possession, photograph copyright, and digital display permission could be conflated. | Physical ownership, photograph copyright, documentary rights, digital display permission, transformation rights, and promotional usage rights are separate. | Chapters 8, 13 and 19 |
| Localization | A single publication state could hide the fact that one language is complete and the other is not. | Each locale has independent editorial, review, translation, and publication state. Missing translations are disclosed; there is no silent fallback or unreviewed machine translation. | Chapters 10–11 |
| Publication state | Publication, verification, translation freshness, and rights status could be treated as one “complete” state. | These are separate dimensions. Publication eligibility requires all relevant prerequisites, but one state does not overwrite another. | Chapter 11 |
| Visual system | Repeated palettes and visual rules appeared across multiple addenda. | One design system governs public and administrative experiences. The Control Center uses the same brand family with operational density and clarity. Proposed tokens remain pending formal approval where specified. | Chapter 12 |
| Asset inventory | The source lists filenames that may not exist in the current project. | The 72 original filenames and 10 additional requested filenames are preserved as reference inventory only. Their presence, rights, generation, and integration require separate evidence. | Chapter 13 and Appendix A |
| Control Center navigation | Multiple module lists used different groupings and labels. | The 20-module map in Section 16 is the sole canonical administrative navigation. Earlier groupings are merged into those modules, not added as a second menu. | Chapters 15–17 |
| Owner authority | Full Owner control could be confused with unrestricted infrastructure privilege. | The Owner controls all supported CMS, content, identity, curatorial, publication, and institutional settings. Secrets, arbitrary SQL, shell, source code, deployment, and infrastructure remain in protected technical control paths. | Chapters 15 and 17 |
| Visitor accounts and favorites | Supporting images suggested accounts or favorites. | Anonymous browsing is the V1 default. Visitor accounts, favorites, and saved collections are future scope unless separately approved. | Chapter 2 and Appendix A |
| Commerce and gift areas | Boutique, café, and packaging images could be mistaken for approved commercial features. | Images do not authorize commerce, a gift shop, or café functionality. No purchase, price, checkout, or marketplace feature exists in V1. | Chapters 1–2 and Appendix A |
| AI Curator | General chatbot behavior could conflict with museum knowledge boundaries. | Public AI answers only from permitted, published, approved knowledge; it must expose uncertainty, cite sources when possible, and refuse or escalate unsupported or restricted questions. It cannot publish content or certify authenticity. | Chapter 14 |
| Data dictionary vs. database | Logical field suggestions could be misrepresented as deployed PostgreSQL schema. | This master defines a logical product model. Physical DDL, migrations, indexes, vector dimensions, and database implementation must be verified in separate technical artifacts. | Chapter 8 |
| Implementation status | Source addenda included project-state statements and claims about code/assets/database. | Such statements are not normative product requirements and are not considered current implementation truth without dated evidence in the Implementation Verification Record. | Chapters 0, 20 and Appendix C |
| Standards compliance | Standards references could be read as a current compliance claim. | WCAG, Core Web Vitals, and OWASP ASVS are verification targets/reference standards. No conformance is claimed until implementation tests and evidence pass. | Chapter 19 and Appendix D |

## F.1 Conflict-resolution rule

Where a source addendum, earlier page description, or implementation note conflicts with this master, the canonical decision above and the relevant normative chapter govern once the master has been approved. If a new material requirement emerges, it must be submitted through change control; it must not be inserted as an unnumbered appendix or parallel navigation tree.


# Appendix G — Final Closure of Previously Identified Requirements

## G.1 Purpose and authority

This appendix closes the previously raised specification gaps by (a) identifying where the requirement is already defined in this Master Specification, (b) adding the missing binding detail where required, and (c) distinguishing product decisions from owner-supplied facts and deployment-dependent service commitments. It is a controlled clarification of the existing chapters, not a competing specification. If a concise statement in this appendix appears to conflict with an earlier summary, the more specific rule in the relevant canonical chapter and this closure appendix govern; any material conflict must be recorded in the decision register before implementation.

The product specification is written to prevent routine design and engineering questions. It does not authorize the engineering team to invent institutional facts, collection records, legal identity, licenses, historical claims, or credentials.

## G.2 Closure matrix

| Previously flagged topic | Canonical location already present | Final closure decision |
|---|---|---|
| Museum is not an online store | §§1.2, 2.6, 6.7, 23 | Binding prohibition; no commerce implementation in V1 or implied by asset names. |
| No prices, Buy Now, cart, checkout, payment, seller flows | §§2.6, 6.7, 23 | Explicitly prohibited in public UX, CMS schemas, navigation, API, database domain, analytics events, and AI calls to action. |
| Official tagline | §§1.3, 23 | Preserve exactly: “More than a collection... it's a story.” No silent rewriting or alternate tagline. |
| Morocco-first release | §§2.1–2.3, 11.9; Appendix F | Morocco is the first fully curated V1 world. Other five worlds exist in the six-world architecture but show only content and exhibition states justified by approved readiness. |
| Six country worlds | §§2.3, 6.4, 16.4, Appendix A | Morocco, Egypt, Syria, Mauritania, Libya, Sudan. No additional country is added to V1 without change control. |
| Collection categories | §2.4, §§8.5–8.7, Appendix A | Preserve Stamps, First Day Covers, Coins, Documents, Letters, Souvenirs, Heritage Objects, and Artifacts. Taxonomy presence does not prove an object exists. |
| Feminine, luxurious museum identity | §§12–13, Appendix A | Apply the detailed visual rules in the Asset & Brand Requirements file. No generic luxury template or excessive ornamentation. |
| Owner control | §§15–17 | Owner controls supported institutional, editorial, collection, visual, publishing, and operational product settings through protected admin workflows. |
| CMS security boundary | §§16.16, 17.6, 19 | CMS MUST NOT expose arbitrary SQL, shell, source-code editing, environment files, infrastructure administration, database superuser access, deployment secrets, or raw storage credentials. |
| 72 + 10 asset catalog | Appendix A | Preserve all 72 reference filenames and all 10 separately requested filenames. File presence, rights clearance, approval, optimization, and integration are distinct states. |
| WCAG 2.2 AA | §19.8 | Binding V1 target for public experience and Control Center, verified through automated and manual testing. |
| Core Web Vitals | §19.6 | Binding target at the 75th percentile: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. These are targets, not current measurements. |
| OpenTelemetry | New requirement in G.10 | Traces, metrics, and structured logs MUST be instrumented through OpenTelemetry/OTLP or a documented compatible implementation. |
| Backup and RPO/RTO | New requirement in G.11 | Adopt the proposed baseline targets stated in G.11; prove feasibility with selected hosting before production. |
| Arabic/English SEO | §§4.2, 10.9, 16.11, 19.11 | Add the complete per-locale acceptance rules in G.9. |
| Twenty admin modules | §§15–17 | Preserve modules 01–20 and apply their module-level acceptance gates in G.8. |
| Line-by-line source coverage | Appendix B and supplied CSV | The CSV is an exact line locator and range-disposition aid. It is not represented as 8,174 independently adjudicated semantic verdicts. Requirement-level acceptance is tracked separately by requirement IDs and tests. |

## G.3 Binding product and commercial exclusions

Noujoude is a digital heritage museum and curated cultural experience, not a transactional product platform.

The following are prohibited in V1, including hidden, unlinked, API-only, or admin-configurable variants unless an Owner-approved change request explicitly changes the product identity:

- Artifact, collection, or story prices.
- Buy Now, Purchase, Add to Cart, Checkout, payment, invoice, or order flows.
- Marketplace seller profiles, commercial listings, bidding, or sales negotiation workflows.
- Product stock, inventory-for-sale, product variants, shipping, or delivery calculations.
- Sales funnels disguised as institutional inquiry forms.

The Contact / Request Information flow is for institutional communication, collection information, research, rights, correction, and collaboration inquiries. It must not silently become a sales pipeline.

No commerce framework, payment provider, cart schema, order schema, or sales analytics is to be installed for V1.

## G.4 Country-world release contract

The canonical six worlds are:

1. Morocco — first fully curated V1 exhibition.
2. Egypt.
3. Syria.
4. Mauritania.
5. Libya.
6. Sudan.

All six must have valid country records, localized identity fields, a controlled exhibition state, a route, and a defined relationship model. A country can be present in the directory without a complete public exhibition.

Country exhibition state MUST use the approved state machine in §11.9. The minimum public behaviors are:

- **Open:** render the approved exhibition with eligible published collections, artifacts, and stories.
- **Coming Soon / Planned:** render only approved introductory content and a clear planned state; do not imply a complete exhibition.
- **In Preparation:** public visibility is controlled by the approved state configuration; draft records remain private.
- **Temporarily Unavailable:** preserve the route and provide a controlled unavailable message without exposing draft/private data.
- **Hidden / Not Public:** do not expose the route through public navigation, search, sitemap, or AI retrieval.

Morocco must be treated as the first complete curation workstream. The implementation team must not make the other five countries appear equally complete by generating invented collections, artifacts, dates, or historical copy.

Country presentation must be culturally specific and reviewed. Architecture, manuscripts, material culture, colors, ornaments, and imagery must not be used as generic stereotypes. Illustrative visuals must be distinguished from actual collection photography.

## G.5 Collection taxonomy contract

The initial controlled taxonomy is:

- Stamps.
- First Day Covers.
- Coins.
- Documents.
- Letters.
- Souvenirs.
- Heritage Objects.
- Artifacts.

The CMS may allow taxonomy administration only through permission-controlled actions. Category labels and descriptions are localized editorial fields. Category creation does not automatically create collection records or imply public content availability.

The initial V1 taxonomy MUST NOT be expanded merely to accommodate irrelevant template assets or commerce-related imagery.

## G.6 Binding visual identity rules

The controlling art direction is **Nocturnal Museum Elegance**: refined, feminine, intimate, archival, culturally respectful, and cinematic without theatrical excess.

The visual language MUST draw its richness from composition, quiet space, architectural depth, accurate object photography, believable material textures, and controlled lighting. It MUST NOT resemble a hotel landing page, jewelry store, luxury shopping template, generic corporate theme, or literal fantasy palace.

The approved visual families include:

- Midnight/noir museum environments.
- Deep burgundy and restrained rose accents.
- Champagne and antique gold used as fine accents, never as dominant surfaces.
- Warm ivory and archive-paper surfaces for legibility and documentary presentation.
- Velvet, silk, marble, antique wood, archival paper, glass, wax-seal, and aged-metal material references.
- Restrained floral or rose atmosphere where relevant; flowers must not become a repetitive decorative layer.
- Museum glass reflections, controlled candlelight, soft directional illumination, and measured dust/light effects.
- Circular N monogram/seal applications and restrained wax-seal/roundel motifs where the approved brand files support them.

Do not create a literal palace environment or use the Eiffel Tower or another landmark as an unapproved institutional location claim. French-inspired refinement is a stylistic influence, not a statement about the museum's physical location or legal origin.

The proposed color tokens, their HEX values, font families, usage hierarchy, and accessibility safeguards remain in §12.2–12.13. Font licensing and final brand approval remain recorded dependencies; developers must not replace them with arbitrary alternatives without an ADR and visual review.

## G.7 Owner authority and hard technical boundary

The Owner is the highest institutional authority for supported product administration. The Owner MUST be able, without editing source code for ordinary museum operations, to:

- Create, edit, preview, order, hide, show, publish, unpublish, and archive supported public pages and page sections.
- Manage the Home hero, institutional copy, approved calls to action, page layouts, and related-content selections.
- Manage six country records, exhibition states, collections, artifacts, stories, eras, categories, and their relationships.
- Manage all permitted Arabic and English content, translation reviews, and locale publication state.
- Manage approved logos, brand variants, design tokens, approved fonts, material presets, page visual variants, and responsive presentation settings.
- Manage media metadata, approved derivative variants, asset assignments, rights records, attributions, and usage restrictions.
- Manage source references, evidence links, claim reviews, verification workflow, provenance events, and publication eligibility.
- Manage navigation, footer, approved SEO metadata, redirects, localized metadata, and indexing controls within safeguarded rules.
- Manage AI Curator knowledge sources, approved policy/configuration values, evaluation suites, response review, provider selection, and service enable/disable controls without exposing provider secrets.
- Manage forms, inquiry categories, routing, users, roles, permissions, notification rules, analytics configuration, and operational alerts within the permissions of the Owner role.
- Inspect revision history, audit activity, archive state, and recoverable content; restore supported content revisions.

Owner control MUST be implemented through explicit forms, safe structured configuration, preview, validation, confirmation, audit logging, and rollback where applicable.

The following are NOT ordinary CMS capabilities and MUST NOT be exposed as editable Owner UI fields:

- Arbitrary source-code or executable editing.
- Shell or operating-system command execution.
- Arbitrary SQL, database console access, schema mutation, or database superuser credentials.
- Editing `.env` files, secrets, signing keys, encryption keys, provider tokens, or raw storage credentials.
- Docker daemon, host OS, cloud account, network, firewall, DNS, or infrastructure administration.
- Unrestricted file-system browsing or arbitrary server-side file deletion.
- Disabling audit integrity, access-control enforcement, evidence requirements, privacy safeguards, or security logging.
- Direct deployment/release execution through the public CMS unless a separately secured deployment integration is explicitly approved.

Emergency technical break-glass procedures, if required, belong to a separately secured infrastructure process with independent authentication and audit, not the museum content interface.

## G.8 Control Center — screen-level acceptance gates

The 20 canonical modules remain those named in §§16.1–16.20. Each module MUST meet the following additional acceptance gates. These gates supplement, and do not replace, its field and workflow definitions in Chapter 16.

| Module | Minimum screen set / workflow | Acceptance gate |
|---|---|---|
| 01 Executive Overview | Dashboard; status panels; attention queue; activity links | Every metric derives from actual records or a configured source; unavailable is not zero; every alert links to a permitted source record. |
| 02 Website & Page Studio | Page directory; page editor; section/block editor; shared-template impact view; locale/device preview | All specified page blocks can be managed; preview is draft-aware; deleting a block cannot delete referenced domain records; shared-template impact is shown. |
| 03 Brand & Visual Identity Studio | Logo library; color tokens; typography; material presets; component presets; motion presets; preview | Only approved assets/tokens are selectable; license fields are recorded; contrast and reduced-motion safeguards cannot be bypassed through normal settings. |
| 04 Museum Worlds Management | Six-country directory; country editor; exhibition-state controls; relationships; preview | All six canonical worlds exist as records; Morocco is the V1 curation priority; readiness rules prevent unsupported Open status. |
| 05 Collections Management | Collection list; create/edit; taxonomy; relationship manager; card/cover preview | Counts use eligible published artifacts; removing a relationship does not delete the artifact; locale and rights conditions are respected. |
| 06 Artifact Management | Artifact list; identity; classification; claims/evidence; sources; provenance; condition; ownership/authenticity; media/rights; localization; review; preview; publish | No public publication without mandatory field, claim, locale, and rights gates; every verification statement is claim-scoped and evidence-linked; no false blanket authenticity claim. |
| 07 Stories & Editorial Studio | Story list; editor; narrative structure; media; artifact/country/collection relations; source review; localization; preview | Stories preserve attribution and evidence, use valid relations, and follow the same review/publication lifecycle as other editorial content. |
| 08 Media & Asset Library | Asset browser; upload; metadata; rights; derivatives; focal point; usage map; replacement/archive | Original is preserved; derivatives are traceable; rights and approval states are separate; blocked assets cannot enter public templates. |
| 09 AI Curator Command Center | Knowledge-source registry; indexing/reindexing; policy controls; test console; evaluation queue; version/rollback; privacy controls | Only approved and permitted sources are retrievable; every evaluation is recorded; policy safety floors cannot be disabled by ordinary settings; secrets remain masked. |
| 10 Navigation & Footer Studio | Navigation tree; footer editor; locale variants; destination validator; preview | No duplicate/invalid internal routes; private routes cannot be exposed; all public links resolve to eligible published destinations. |
| 11 SEO & Metadata Center | Locale-specific metadata editor; canonical/hreflang preview; sitemap/robots status; redirects; structured-data validation | Draft/private/restricted pages are not indexable; canonical and hreflang mappings are valid; structured data uses only verified fields. |
| 12 Language & Translation Center | Translation coverage dashboard; side-by-side editor; review queue; stale-source alerts; locale publish gate | Source revision changes mark dependent translations stale; no missing translation is silently replaced by an unreviewed translation; locale publishing is independent. |
| 13 Forms & Inquiries Center | Inbox; inquiry detail; assignment; status transitions; internal notes; response history; retention/deletion | Inquiry PII is role-restricted; inquiries are excluded from public search and AI retrieval; retention actions are logged. |
| 14 Users, Roles & Permissions | User directory; invitation; role editor; permission matrix; access review; deactivation/revocation | Authorization is server-enforced at route, operation, collection, field, and record scope as applicable; Owner authority cannot be silently removed. |
| 15 Publishing & Revision Control | Review queue; compare revisions; approve/return/reject; preview; schedule where supported; publish/unpublish; emergency withdrawal | Workflow transitions are authorized and logged; restored content creates a new revision; publication checks rights, locale, and evidence requirements. |
| 16 System & Institutional Settings | Institutional profile; locale defaults; approved public settings; integration status; safeguarded service configuration | Settings are schema-defined and validated; secrets are masked and never returned to client code; no raw SQL, shell, code, or infrastructure controls exist here. |
| 17 Analytics & Insights | Analytics overview; content performance; search insights; locale comparisons; export where permitted | Metrics identify source, time window, and privacy basis; unavailable data is not fabricated; exports respect permissions and privacy rules. |
| 18 Notifications & Alerts | Alert inbox; severity filters; affected-record detail; assignment; acknowledge/resolve; history | Alerts originate from actual detected conditions; acknowledgement does not erase the underlying issue; critical events remain auditable. |
| 19 Audit & Activity Center | Search/filter; event detail; actor/target/state diff; export under permission | Audit records are append-only to ordinary application roles; changes to role, rights, verification, publication, AI policy, and recovery are recorded. |
| 20 Archive & Recovery Center | Archive list; dependency preview; restore preview; recovery confirmation; retention view | Restore is permission-checked, creates a new event/revision, preserves relations, avoids accidental publication, and is distinct from infrastructure disaster recovery. |

### G.8.1 Shared administrative interaction contract

Every administrative screen MUST include, as applicable:

- A stable module title, purpose, current context, and breadcrumb.
- Loading, empty, error, restricted, success, and validation states.
- Search, sorting, pagination, and filters for list-scale records.
- Clear primary and secondary actions with destructive actions visually separated.
- Required/optional field indication and field-level validation.
- Confirmation for consequential actions, including the impact and affected records.
- Permission-aware controls and server-side enforcement.
- Accessible keyboard operation, focus management, labels, and status announcements.
- Localization of labels, validation, dates, numbers, and direction.
- Audit events for privileged and consequential operations.

A visible button is not accepted as an implemented feature. Each control must be wired to the correct server-side action and verified by a test.

## G.9 Bilingual SEO and indexing acceptance

The locale route patterns defined in §4.2 are mandatory: `/{locale}/...`, with `en` and `ar` identifiers. The following requirements apply to every public indexable entity:

1. English and Arabic pages have independent, human-reviewed titles and meta descriptions.
2. Each published locale has a stable canonical URL resolving to itself, unless a documented canonical consolidation rule applies.
3. `hreflang` alternate links are reciprocal and include only genuinely published locale equivalents.
4. Missing translation is not treated as a valid alternate-language page. Do not emit a broken or misleading `hreflang` target.
5. Slugs may be localized where configured, but the underlying content ID and translation relationship remain stable.
6. The language switcher preserves the equivalent page when the translation is published; otherwise it routes to the appropriate locale home or a clearly defined fallback, never to a 404 or to an unpublished draft.
7. Arabic pages use correct RTL metadata and language declaration; English uses LTR metadata.
8. Open Graph and social metadata are localized and use a rights-cleared image.
9. Sitemap output contains only canonical, published, indexable public routes.
10. `robots` directives and server responses prevent indexing of drafts, private Control Center routes, restricted records, previews, inquiries, and non-public assets.
11. Structured data must reflect verified facts and valid page types. Do not invent organization addresses, opening hours, legal status, aggregate ratings, prices, products, or event data.
12. Redirects must avoid chains and loops, preserve locale context where appropriate, and be tested.
13. Every locale switch, canonical, `hreflang`, sitemap entry, and redirect must be covered by automated route tests.

## G.10 Observability and operational telemetry

The production application MUST implement vendor-neutral observability using OpenTelemetry APIs/SDKs and OTLP-compatible export where feasible.

Required signals:

- **Traces:** public request lifecycle, CMS/API operations, database calls, media operations, search, AI retrieval and provider calls, background jobs, and external integrations.
- **Metrics:** request rate, error rate, latency percentiles, database pool health, job queue depth/failure/retry counts, media failures, search latency, AI latency/failure/cost where available, authentication failures, and backup/restore status.
- **Structured logs:** application errors, security-relevant events, workflow transitions, background job outcomes, and integration failures.

Telemetry MUST:

- Use request/correlation IDs across relevant boundaries.
- Exclude passwords, secrets, authorization tokens, private artifact data, full inquiry messages, and unnecessary personal information.
- Mask or pseudonymize identifiers when appropriate.
- Have defined retention and access controls.
- Avoid logging raw AI prompts or visitor messages unless an approved privacy design explicitly permits limited retention.
- Provide actionable alerts for critical service and security failures.

OpenTelemetry is the instrumentation standard, not a hosting provider. The deployment team must select and document the telemetry backend and alert routing before production launch.

## G.11 Backup, recovery, and service objectives

The following are the proposed V1 operational baseline targets. They are engineering acceptance targets, not public contractual SLAs. The selected hosting/storage providers and cost plan must demonstrate that they can meet them before production approval. If a provider cannot meet them, the gap must be explicitly presented to the Owner; the target must not be silently downgraded.

### G.11.1 Service availability objective

- Public museum monthly availability objective: **99.5%**, excluding pre-announced planned maintenance and documented force majeure according to the eventual service policy.
- Control Center availability objective: **99.5%** on the same measurement basis.
- Availability monitoring must test the public homepage, a representative content route, and the administrative authentication boundary without exposing private data.

### G.11.2 Recovery objectives

| System | RPO target | RTO target | Required protection |
|---|---:|---:|---|
| Primary PostgreSQL data | ≤ 1 hour | ≤ 4 hours | Encrypted backups, point-in-time recovery/WAL or provider-equivalent, isolated backup credentials, restore runbook |
| Object/media storage | ≤ 4 hours for approved source assets and critical metadata | ≤ 8 hours | Bucket versioning, protected deletion, replication or independent backup, checksum/inventory verification |
| Application configuration and deployment artifacts | ≤ 24 hours | ≤ 4 hours | Version-controlled configuration without secrets, reproducible build, protected deployment artifacts |

### G.11.3 Backup policy

- Database: daily encrypted backup plus continuous or sufficiently frequent point-in-time recovery logs to satisfy the one-hour RPO.
- Retention baseline: 35 daily recovery points, 12 weekly recovery points, and 12 monthly recovery points, subject to lawful retention and provider feasibility.
- Media: object versioning and protected deletion; critical originals must have an independent recoverable copy.
- Backups must be isolated from ordinary CMS credentials and production application write permissions.
- Backup encryption keys and credentials must not be exposed in the Control Center.
- Restore tests must run at least quarterly and before major database migrations or storage changes.
- Each restore test records date, dataset, measured RPO/RTO, integrity checks, failures, corrective actions, and reviewer.
- A backup job reporting success is not proof of recoverability; only a tested restore is acceptable evidence.

### G.11.4 Graceful degradation

Failure of AI, analytics, search enhancement, external media optimization, or notification integrations must not unnecessarily disable core published pages. Provide clear user-safe fallbacks and operator alerts. Core artifact and page content must remain available when nonessential integrations fail, wherever architecture permits.

## G.12 Final quality and release gates

A V1 release cannot be accepted until all P0 requirements pass and P1 requirements are either implemented or explicitly staged in an Owner-approved release decision. Minimum release gates:

- Functional tests cover core visitor journeys in both locales.
- Automated route tests cover all public route types and protected Control Center routes.
- Admin tests cover all twenty modules and permissions, including negative/unauthorized cases.
- Content and workflow tests cover verification, rights, localization, review, publication, unpublication, archive, and restore.
- Accessibility audit targets WCAG 2.2 AA with automated checks plus manual keyboard and screen-reader review of critical flows.
- Core Web Vitals targets in §19.6 are measured; failures have an owner-approved exception or remediation plan.
- Security verification is mapped to OWASP ASVS 5.0.0 Level 2 baseline; high-risk owner/admin operations receive documented additional controls.
- Backup restoration is tested against G.11 targets.
- OpenTelemetry signals and critical alert routing are verified in the selected environment.
- SEO tests validate canonical, `hreflang`, sitemap, robots, metadata, redirects, and noindex boundaries for both languages.
- Production build and deployment smoke tests pass.
- No critical/high security defect remains unresolved without explicit risk acceptance by the authorized Owner.

## G.13 Engineering questions and owner inputs

The implementation team MUST make ordinary technical decisions using this specification and the Technology & Security Standard. Do not stop to ask the Owner about routine component choices, route mechanics, database indexes, form behavior, standard responsive behavior, logging instrumentation, or test organization when a safe, documented professional default exists.

Owner input is required only for facts or approvals that cannot be inferred responsibly, including institutional legal identity, actual founding history, real artifact facts, ownership/provenance evidence, image licenses, final font licensing where not already proven, legal jurisdiction and policy approval, official contact information, and formal acceptance of cost/service commitments.

For every owner input, implement the independent technical workflow, record the dependency, keep unapproved content out of public output, and continue other work.

## G.14 Closure statement

The previously flagged requirements are now either (a) explicitly present in the canonical Master Specification and mapped above, or (b) newly defined in this appendix with testable acceptance conditions. The specification does not claim that the application has been built or that any referenced asset exists. Product decisions are closed at the specification level; factual, legal, licensing, hosting, and formal Owner approvals remain controlled inputs rather than engineering questions.
