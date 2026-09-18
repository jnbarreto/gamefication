# Leone Dev RPG — Project State

## Decisions

| ID     | Decision                 | Choice                                                       | Status | Date       |
| ------ | ------------------------ | ------------------------------------------------------------ | ------ | ---------- |
| AD-001 | Daily quest limit        | Soft limit (~3/day) — warn after 3, allow more               | active | 2026-09-14 |
| AD-002 | Streak qualification     | ≥1 quest completed on the day (any type)                     | active | 2026-09-14 |
| AD-003 | Skill mastery            | Auto-calculated from skill XP + optional manual override     | active | 2026-09-14 |
| AD-004 | Quest skill allocation   | Required ≥1 skill on quest creation                          | active | 2026-09-14 |
| AD-005 | Achievements MVP         | Manual unlock only (no auto-triggers in MVP)                 | active | 2026-09-14 |
| AD-006 | Frontend stack           | Vite + React + Tailwind                                      | active | 2026-09-14 |
| AD-007 | Auth MVP                 | JWT email/password — ADMIN + PLAYER roles                    | active | 2026-09-14 |
| AD-008 | Repo structure           | npm workspaces monorepo (`apps/api`, `apps/web`)             | active | 2026-09-14 |
| AD-009 | Database access          | SQL raw + `pg` (no ORM)                                      | active | 2026-09-14 |
| AD-010 | Migrations               | Custom simple versioned runner                               | active | 2026-09-14 |
| AD-011 | Project name             | `gamefication`                                               | active | 2026-09-14 |
| AD-012 | i18n                     | PT + EN with runtime toggle                                  | active | 2026-09-14 |
| AD-013 | Theme                    | Dark + Light with runtime toggle                             | active | 2026-09-14 |
| AD-014 | Bosses MVP               | Boss as quest type only — no separate Boss entity            | active | 2026-09-14 |
| AD-015 | Evidence MVP             | Optional on quest complete / achievement unlock              | active | 2026-09-14 |
| AD-016 | History filters MVP      | Basic — last 30 days + by skill                              | active | 2026-09-14 |
| AD-017 | Deploy MVP               | Local Docker; Vercel for frontend later                      | active | 2026-09-14 |
| AD-018 | Character level formula  | `xpForLevel(n) = n * 100`; level = max n where totalXp ≥ sum | active | 2026-09-14 |
| AD-019 | Skill mastery thresholds | 0 / 25 / 75 / 200 / 500 XP                                   | active | 2026-09-14 |
| AD-020 | Streak bonuses           | 3d→+10, 7d→+30, 14d→+75, 30d→+200 XP (once per cycle)        | active | 2026-09-14 |
| AD-021 | Visual identity          | Ficha Viva — see `.specs/design-system.md`                     | active | 2026-09-14 |

## Handoff

**Phase:** Auth — implementation complete

**Next microtask:** Run migration (`npm run migrate` or `docker compose up`) and smoke-test register + password reset

**Feature:** `.specs/features/auth/` — JWT login, role permissions, login UI, admin users page

**Done recently:**

- Auth spec validated (`AUTH-01`..`AUTH-04`)
- API: users table, JWT middleware, scoped character by userId
- Web: Login page with `Login.png`, AuthProvider, Users admin page
