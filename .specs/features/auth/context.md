# Auth Context

**Gathered:** 2026-09-14
**Spec:** `.specs/features/auth/spec.md`
**Status:** Ready for design

---

## Feature Boundary

JWT email/password login, role-based permissions (ADMIN / PLAYER), protected API, login page with Login.png background. No external auth providers (v2).

---

## Implementation Decisions

### Login page layout

- Full-viewport `Login.png` background with dark overlay for contrast
- Centered panel (design-system tokens: `bg-surface`, `border-default`, mono labels)
- Email + password fields, primary submit button
- Error message inline below form
- Language and theme toggles remain available on login page

### Session handling

- JWT in `localStorage`; `Authorization: Bearer` on all API calls
- 401 from API triggers logout and login redirect
- No server-side session store

### Permissions

- `ADMIN`: game data for own character + user CRUD
- `PLAYER`: game data for own character only
- No fine-grained permission flags in MVP

### Agent's Discretion

- Exact login panel width and overlay opacity (follow design system)
- Admin Users page layout (simple table + create form)

### Declined / Undiscussed Gray Areas → Assumptions

All captured in spec Assumptions table.

---

## Specific References

- Background image: `apps/web/assets/Login.png`
- No OAuth / Google / GitHub — v2

---

## Deferred Ideas

- OAuth providers (v2)
- Self-service registration
- Password reset flow
