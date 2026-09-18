# MVP Specification — Leone Dev RPG

## Problem Statement

Professional growth is hard to measure day-to-day. Leone Dev RPG turns study, work, and career actions into a personal RPG with XP, skills, quests, and evidence — prioritizing execution over content consumption.

## Goals

- [ ] Answer "what to do today?" via daily quests and active quest list
- [ ] Track XP, skill evolution, and history with immutable transactions
- [ ] Support evidence on meaningful completions
- [ ] Avoid toxic gamification — no XP loss, no punishment for rest

## Out of Scope (MVP)

| Feature                   | Reason                         |
| ------------------------- | ------------------------------ |
| Auth / multi-user         | AD-007 — single-user localhost |
| Auto achievement triggers | AD-005 — manual unlock only    |
| Boss entity               | AD-014 — Boss quest type only  |
| HP / Energy               | Post-MVP                       |
| Developer Shop            | Post-MVP                       |
| Weekly Review             | Post-MVP                       |
| Rest days config          | Post-MVP                       |
| Advanced history filters  | AD-016 — basic only            |

---

## Assumptions & Open Questions

| Assumption / decision            | Chosen default                  | Rationale                    | Confirmed? |
| -------------------------------- | ------------------------------- | ---------------------------- | ---------- |
| Timezone for streak/day boundary | `America/Sao_Paulo`             | User locale                  | y          |
| Single character per install     | One seeded character            | Personal app, no auth        | y          |
| i18n library                     | `react-i18next`                 | Standard Vite + React i18n   | y          |
| Theme persistence                | `localStorage`                  | Survives refresh             | y          |
| API language                     | English keys, localized UI only | Backend stays locale-neutral | y          |

**Open questions:** none

---

## User Stories

### P1: Complete a quest and earn XP ⭐ MVP

**User Story**: As a developer, I want to complete a quest with skill XP allocation so that my character and skills progress with a traceable history.

**Acceptance Criteria**:

1. WHEN a quest with status IN_PROGRESS is completed THEN the system SHALL set status to COMPLETED, record completedAt, and create XP transactions.
2. WHEN a quest is completed THEN the system SHALL distribute XP to character total and each allocated skill (sum equals quest baseXp).
3. WHEN XP is added THEN the system SHALL append an immutable XpTransaction (never update or delete).
4. IF quest has no skill allocation THEN the system SHALL reject completion at creation time (≥1 skill required).
5. The system SHALL NOT deduct XP for incomplete dailies, rest days, or broken streaks.

**Independent Test**: Create quest → start → complete with evidence URL → verify character XP, skill XP, and transaction history.

---

### P1: Daily quests with soft limit ⭐ MVP

**User Story**: As a developer, I want ~3 daily quests per day so that I focus without feeling punished.

**Acceptance Criteria**:

1. WHEN listing today's dailies THEN the system SHALL return quests of type DAILY created for the current calendar day (timezone AD assumption).
2. WHEN a 4th DAILY quest is created on the same day THEN the system SHALL allow creation and return a soft-limit warning in the response.
3. WHEN only 1 of 3 dailies is completed THEN the system SHALL award XP only for the completed quest(s).

**Independent Test**: Create 4 dailies → verify warning on 4th → complete 1 → verify partial XP.

---

### P1: Dashboard snapshot ⭐ MVP

**User Story**: As a developer, I want a dashboard showing level, XP, today's quests, skills, and recent history.

**Acceptance Criteria**:

1. WHEN GET /dashboard is called THEN the system SHALL return character (level, xp, progress to next level), today's dailies, top skills, recent transactions, streak, and stale skill alerts.
2. WHEN a skill has received no XP for ≥12 days THEN the system SHALL include it in stale alerts.

**Independent Test**: Seed data → hit dashboard → verify all sections present.

---

### P2: Streak with bonuses

**User Story**: As a developer, I want streak tracking with milestone bonuses so that consistency is rewarded without punishing breaks.

**Acceptance Criteria**:

1. WHEN ≥1 quest is completed on a calendar day THEN the system SHALL increment streak if last activity was yesterday or today.
2. WHEN a day passes with no completed quest THEN the system SHALL reset current streak to 0 without removing accumulated XP.
3. WHEN streak reaches 3, 7, 14, or 30 days THEN the system SHALL grant the corresponding bonus XP once per streak cycle.

**Independent Test**: Complete quests on consecutive days → verify streak and bonus transactions.

---

### P2: Manual achievements

**User Story**: As a developer, I want to unlock achievements manually with optional evidence.

**Acceptance Criteria**:

1. WHEN POST /achievements/:slug/unlock is called THEN the system SHALL create AchievementUnlock and optional evidence.
2. WHEN an achievement is already unlocked THEN the system SHALL reject duplicate unlock.

**Independent Test**: Unlock achievement with PR URL evidence → appears in list as unlocked.

---

### P2: UI locale and theme toggle

**User Story**: As a developer, I want to switch PT/EN and dark/light at any time.

**Acceptance Criteria**:

1. WHEN the user toggles language THEN the UI SHALL switch between Portuguese and English immediately.
2. WHEN the user toggles theme THEN the UI SHALL switch between dark and light mode immediately.
3. WHEN the page is reloaded THEN the system SHALL restore the last selected language and theme from localStorage.

**Independent Test**: Toggle both → refresh → preferences persist.

---

## Requirement Traceability

| Requirement ID | Story                   | Phase          | Status  |
| -------------- | ----------------------- | -------------- | ------- |
| RPG-01         | P1: Complete quest      | Foundation→API | Pending |
| RPG-02         | P1: Daily soft limit    | API            | Pending |
| RPG-03         | P1: Dashboard           | API + Frontend | Pending |
| RPG-04         | P2: Streak              | Domain→API     | Pending |
| RPG-05         | P2: Achievements manual | API            | Pending |
| RPG-06         | P2: i18n + theme        | Frontend       | Pending |

---

## Success Criteria

- [ ] Complete a real work quest with PR evidence in under 2 minutes
- [ ] Dashboard loads character, dailies, skills, history in one request
- [ ] Zero XP deduction paths in codebase
- [ ] Domain unit tests cover Character, Quest, Streak, XpTransaction
