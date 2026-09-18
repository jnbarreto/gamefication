# Auth & Permissions Specification

## Problem Statement

The app currently runs as a single-user localhost install with no access control (AD-007). Adding JWT login with role-based permissions enables multiple users, protects game data, and prepares the product for deployment beyond local-only use.

## Goals

- [ ] Users authenticate with email and password and receive a JWT
- [ ] Each user accesses only their own character and game data
- [ ] Admins can manage users and assign roles
- [ ] Unauthenticated visitors see a login screen with the Login.png background

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| OAuth / external providers | Deferred to v2 per user request |
| Refresh tokens | JWT expiry + re-login is sufficient for MVP |
| Per-endpoint custom ACL | Role-based (ADMIN / PLAYER) only |
| Email verification on signup | Register is immediate; only reset uses email |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Roles | `ADMIN`, `PLAYER` | Covers admin ops vs normal play | y |
| Token storage (web) | `localStorage` key `gamefication.auth.token` | Matches theme/i18n persistence pattern | y |
| Token transport | `Authorization: Bearer <token>` | Standard JWT header | y |
| Password hashing | Node `crypto.scrypt` | No extra native deps | y |
| JWT library | `jsonwebtoken` | Express ecosystem standard | y |
| User ↔ character | 1:1 — one character per user | Matches personal RPG model | y |
| Seed admin | Migration seeds `admin@gamefication.local` / `admin123` | Local dev bootstrap; override via env | y |
| JWT TTL | 7 days | Balance convenience vs security for MVP | y |
| Login errors | Generic "Invalid credentials" (401) | Prevent email enumeration | y |
| Public routes | `/api/v1/health`, `POST /api/v1/auth/login` only | All game endpoints require auth | y |

**Open questions:** none

---

## User Stories

### P1: Login with JWT ⭐ MVP

**User Story**: As a user, I want to log in with email and password so that I receive a JWT and can access the app.

**Why P1**: Without login, no multi-user or protected API.

**Acceptance Criteria**:

1. WHEN valid email and password are submitted to POST /api/v1/auth/login THEN the system SHALL return HTTP 200 with `{ token, user: { id, email, displayName, role } }`.
2. IF email or password is invalid THEN the system SHALL return HTTP 401 with code `INVALID_CREDENTIALS` and message "Invalid credentials".
3. IF email or password is missing or malformed THEN the system SHALL return HTTP 400 with a validation error.
4. The JWT payload SHALL include `sub` (user id), `role`, and `characterId`.
5. WHEN a request hits a protected route without a valid Bearer token THEN the system SHALL return HTTP 401 with code `UNAUTHORIZED`.

**Independent Test**: POST login with seed admin → receive token → GET /api/v1/auth/me with Bearer header → returns user profile.

---

### P1: Role-based permissions ⭐ MVP

**User Story**: As an admin, I want users to have roles so that access is scoped correctly.

**Why P1**: Core security requirement from user request.

**Acceptance Criteria**:

1. WHEN a PLAYER calls game endpoints (character, dashboard, quests, skills, xp, achievements) THEN the system SHALL scope data to that user's character only.
2. WHEN an ADMIN calls game endpoints THEN the system SHALL scope data to the admin's own character (same as PLAYER for game data).
3. WHEN a PLAYER calls GET/POST/PATCH /api/v1/users THEN the system SHALL return HTTP 403 with code `FORBIDDEN`.
4. WHEN an ADMIN calls user-management endpoints THEN the system SHALL allow list, create, and update user role/displayName.
5. WHEN an ADMIN creates a user THEN the system SHALL create a linked character row and return the user without password hash.

**Independent Test**: Login as PLAYER → GET /api/v1/users → 403. Login as ADMIN → GET /api/v1/users → 200 list.

---

### P1: Login page UI ⭐ MVP

**User Story**: As a user, I want a login screen with the branded background so that I can sign in before using the RPG.

**Why P1**: User-facing entry point; explicit Login.png requirement.

**Acceptance Criteria**:

1. WHEN the user is not authenticated THEN the web app SHALL render the login page instead of game pages.
2. The login page SHALL use `apps/web/assets/Login.png` as the full-viewport background image.
3. WHEN login succeeds THEN the web app SHALL store the token, fetch /auth/me, and render the main app.
4. WHEN the user clicks logout THEN the web app SHALL clear the token and return to the login page.
5. WHEN an API call returns 401 THEN the web client SHALL clear the token and show the login page.

**Independent Test**: Open app unauthenticated → see login with background → login → see dashboard → logout → back to login.

---

### P2: Admin user management UI

**User Story**: As an admin, I want to manage users from the app so that I can onboard players without SQL.

**Why P2**: API-first; UI is convenience layer.

**Acceptance Criteria**:

1. WHERE the logged-in user has role ADMIN the header SHALL show a Users nav entry.
2. WHEN the admin opens Users THEN the system SHALL list users with email, displayName, and role.
3. WHEN the admin creates a user THEN the system SHALL POST /api/v1/users and refresh the list.

**Independent Test**: Admin login → Users page → create player → player can login.

---

## Edge Cases

- IF JWT is expired or malformed THEN the system SHALL return HTTP 401.
- IF a user has no linked character THEN game endpoints SHALL return HTTP 404 with code `CHARACTER_NOT_FOUND`.
- IF duplicate email on user create THEN the system SHALL return HTTP 422 with code `EMAIL_ALREADY_EXISTS`.
- WHEN password is set on create THEN the system SHALL require minimum 8 characters.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| AUTH-01 | P1: Login JWT | API | Pending |
| AUTH-02 | P1: Role permissions | API | Pending |
| AUTH-03 | P1: Login UI | Frontend | Pending |
| AUTH-04 | P2: Admin users UI | Frontend | Pending |

---

## Success Criteria

- [ ] Seed admin can log in and load dashboard in under 30 seconds
- [ ] PLAYER cannot access /api/v1/users
- [ ] Login page displays Login.png background
- [ ] No game endpoint works without Bearer token (except health + login)
