# Custom Skills & Hierarchy Specification

## Problem Statement

The skill tree hierarchy is hardcoded in the frontend and the API exposes skills as a flat catalog. Users cannot add their own skills, attach sub-skills, or reorganize the tree from the Skills screen.

## Goals

- [ ] Users can create custom skills with name and optional description
- [ ] Custom skills appear in the skill tree under the chosen parent
- [ ] Users can move skills between nodes and delete custom skills they no longer need
- [ ] Hierarchy is persisted in the database and drives the tree UI

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Multi-parent skills | Tree model is single-parent only |
| Cross-category reparent | Keeps category boundaries intact |
| Deleting seeded MVP skills | Protects quest/history integrity |
| Auth / multi-user | AD-007 |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Hierarchy storage | `skills.parent_skill_id` nullable FK | Matches tree model; API drives UI | y |
| Seeded skills | Reparent allowed; delete blocked | User can reorganize without breaking seed catalog | y |
| Custom skills | `is_custom = true`; delete when xp=0, no children | Safe cleanup | y |
| Root placement | `parent_skill_id = null` under category hub | Matches current virtual category node | y |
| Slug generation | Auto kebab-case from name with numeric suffix on collision | No slug field in UI | y |
| Description UX | Pop-up overlay on demand | User request; keeps tree compact | y |
| Manage mode | Toggle on Skills page; move via select skill + click target node | Matches existing click-first tree UX | y |
| Max depth | 8 levels | Prevents runaway trees | y |
| Name/description limits | 100 / 500 chars | Matches DB + UI density | y |

**Open questions:** none

---

## User Stories

### P1: Create custom skill ⭐ MVP

**User Story**: As a developer, I want to create a custom skill under a category or parent node so that my personal skill tree reflects my learning path.

**Acceptance Criteria**:

1. WHEN the user submits a valid create form with name and optional parent THEN the system SHALL persist the skill with `is_custom = true`, create character progress at 0 XP, and return it in GET /api/v1/skills.
2. IF name is empty or exceeds 100 characters THEN the system SHALL reject the request with HTTP 400.
3. IF parentSkillId is provided and belongs to another category THEN the system SHALL reject the request with HTTP 400.
4. WHEN a custom skill is created THEN the system SHALL auto-generate a unique kebab-case slug from the name.

**Independent Test**: POST skill under Node.js parent → refresh tree → node visible as child with 0 XP.

---

### P1: Persisted hierarchy in tree ⭐ MVP

**User Story**: As a developer, I want the skill tree to reflect database hierarchy so that custom and reparented skills appear correctly.

**Acceptance Criteria**:

1. WHEN GET /api/v1/skills is called THEN each skill SHALL include `parentSkillId`, `description`, and `isCustom`.
2. WHEN the Skills page renders THEN the system SHALL build the graph from API hierarchy (virtual category hub + parent links).
3. WHEN seeded skills are loaded THEN the system SHALL use migrated `parent_skill_id` values matching the former static graph.

**Independent Test**: TypeScript appears under Node.js; custom child appears under chosen parent.

---

### P1: Manage skills (move & delete) ⭐ MVP

**User Story**: As a developer, I want to move skills between nodes and delete unused custom skills so that I can maintain my tree.

**Acceptance Criteria**:

1. WHEN the user moves a skill to a new parent in manage mode THEN the system SHALL update `parent_skill_id` via PATCH /api/v1/skills/:id.
2. IF the move would create a cycle or exceed max depth THEN the system SHALL reject with HTTP 400.
3. WHEN DELETE /api/v1/skills/:id is called on a custom skill with 0 XP and no children THEN the system SHALL remove the skill.
4. IF delete is attempted on a seeded skill OR skill with XP OR skill with children THEN the system SHALL reject with HTTP 400.

**Independent Test**: Move custom skill to another parent; delete empty custom skill; seeded skill delete fails.

---

### P2: Description pop-up

**User Story**: As a developer, I want to read a skill description in a pop-up so that optional context does not clutter the sidebar.

**Acceptance Criteria**:

1. WHEN the user opens description on a skill with description THEN the system SHALL show a modal with name and full description text.
2. WHEN the skill has no description THEN the system SHALL hide or disable the description action.

**Independent Test**: Create skill with description → open pop-up → text matches.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| CSK-01 | P1: Create custom skill | API + UI | Pending |
| CSK-02 | P1: Persisted hierarchy | Migration + UI | Pending |
| CSK-03 | P1: Manage skills | API + UI | Pending |
| CSK-04 | P2: Description pop-up | UI | Pending |

---

## Success Criteria

- [ ] User creates a custom sub-skill and sees it in the tree within one refresh
- [ ] User moves a skill without breaking tree layout
- [ ] Seeded skills remain deletable=false via API
