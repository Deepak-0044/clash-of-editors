# CLASH OF EDITORS

**Only the best will claim the throne.**

A production-ready, full-stack anime / video editing competition platform: premium public website,
real registration pipeline, secure organizer dashboard, manual audition review, manual Final 16
selection, the 20-day notification rule, manual team formation, announcements and results.

---

## 1. Stack

| Layer      | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, React 19, Server Components/Actions) |
| Language   | TypeScript (strict)                                          |
| Styling    | Tailwind CSS v4 + custom design tokens                       |
| Icons      | lucide-react                                                 |
| Database   | PostgreSQL via Drizzle ORM (`drizzle-kit push`)              |
| Validation | Zod (server-side on every mutation) + native form validation |
| Auth       | Custom session auth: scrypt password hashing, hashed session tokens in httpOnly cookies, edge middleware guard |

## 2. Environment variables

```bash
DATABASE_URL=postgresql://user:password@host:5432/db   # required
NEXT_PUBLIC_SITE_URL=https://your-domain.com           # SEO / sitemap / OG
ADMIN_SETUP_TOKEN=some-long-random-string              # optional, see below
```

No admin password is ever hardcoded. The first owner account is created at `/admin/setup`
(only reachable while zero admin accounts exist). Once an account exists, creating another owner
requires `ADMIN_SETUP_TOKEN`.

## 3. Setup

```bash
npm install
npx drizzle-kit push      # create/update all tables
npm run build && npm start
```

Then:

1. Open `/admin/setup` and create the owner account.
2. Go to **Settings** → set status, season, registration opening/closing dates, contact links.
3. Fill the **Leaders**, **Timeline & Rules**, **Announcements** sections with real information.
   Everything ships as `TBA`/editable placeholders — the platform never invents dates, leaders,
   winners or statistics.

Default content seeded on first DB access: settings singleton, 9 TBA timeline phases,
12 editable rulebook sections and 4 unpublished leader slots (2 PC / 2 mobile).

## 4. Routes

**Public:** `/` · `/about` · `/how-it-works` · `/leaders` · `/editors` · `/timeline` · `/rules` ·
`/register` · `/results` · `/contact` · `/sitemap.xml` · `/robots.txt`

**API:** `POST /api/register` · `POST /api/contact` · `GET /api/health`

**Organizer (protected):** `/admin/login` · `/admin/setup` · `/admin/dashboard` ·
`/admin/registrations` · `/admin/registrations/[id]` · `/admin/final-16` · `/admin/leaders` ·
`/admin/teams` · `/admin/timeline` · `/admin/announcements` · `/admin/results` · `/admin/settings`

## 5. Data model

`admin_users`, `admin_sessions`, `competition_settings` (singleton id=1), `registrations`,
`evaluations` (1:1 with registration), `leaders`, `teams`, `team_members` (unique per registration),
`timeline_events`, `rule_sections`, `announcements`, `results`, `notifications`, `contact_messages`.

Unique constraints: admin email, session token hash, registration email, registration editing
username, one evaluation per registration, one team membership per registration.
Soft delete is used for registrations, leaders and teams.

## 6. Competition rules encoded in the app

- **Manual review only.** Scores (creativity, effort, cleanliness, overall quality) are stored for
  internal reference and never drive an automatic decision.
- **Hard Final-16 cap.** The `selected` status cannot exceed `competition_settings.editor_slots`.
- **Privacy.** Public queries never select email, internal notes or evaluation scores. The editors
  page returns nothing until `final_16_published` is true.
- **20-day rule.** `notification deadline = registration_closes_at + notification_window_days`.
  Countdown starts at the close of the registration period, never per participant. If the closing
  date is unset, every surface shows `TBA`.
- **Manual team formation.** Only editors with status `selected` can be assigned, capacity is
  enforced per team, and rosters stay hidden until teams are published.

## 7. Roles

| Role      | Permissions                                                             |
| --------- | ----------------------------------------------------------------------- |
| owner     | Everything, including creating further admin accounts                   |
| organizer | Content, selection, publishing, evaluations                             |
| reviewer  | Evaluations and non-final status changes only (cannot select or publish) |

## 8. Security notes

- Passwords: scrypt with per-user random salt, constant-time comparison.
- Sessions: 32-byte random token, SHA-256 hashed at rest, httpOnly + SameSite=Lax cookie, 12h TTL.
- `middleware.ts` blocks unauthenticated `/admin/*` navigation and adds `noindex` headers;
  every server action re-checks the session and role permission.
- All mutations validate input server-side and use parameterised Drizzle queries.
- `robots.txt` disallows `/admin` and `/api`.
