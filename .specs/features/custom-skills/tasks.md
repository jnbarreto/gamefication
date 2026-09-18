# Custom Skills Tasks

## Phase 1 — Data & domain

### Task 1.1 — Migration + parent seed backfill
**Depends on:** —
**Tests:** integration repo test still loads tree
**Gate:** `npm run test -w @gamefication/api` migration applies

### Task 1.2 — Skill domain + repository writes
**Depends on:** 1.1
**Tests:** Skill.test.ts, CreateSkill.test.ts, UpdateSkill.test.ts, DeleteSkill.test.ts
**Gate:** unit tests pass

### Task 1.3 — HTTP routes + presenter fields
**Depends on:** 1.2
**Tests:** presenter test, route-level use case tests
**Gate:** API tests pass

## Phase 2 — Frontend

### Task 2.1 — API types + graph from parentSkillId
**Depends on:** 1.3
**Tests:** build via typecheck
**Gate:** `npm run build -w @gamefication/web`

### Task 2.2 — Manage UI (create, move, delete, description modal)
**Depends on:** 2.1
**Tests:** manual smoke on Skills page
**Gate:** web build pass
