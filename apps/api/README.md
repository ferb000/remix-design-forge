# Design Forge API

Express and PostgreSQL backend for the unified website and protected admin
routes. Requires Node.js 22+ and PostgreSQL. See [VPS deployment](../../deploy/README.md)
for the full Docker Compose stack, HTTPS, private S3 and SMTP configuration.

## Run locally

1. Run `npm install` from the repository root.
2. Copy `apps/api/.env.example` to `apps/api/.env` and set `DATABASE_URL`.
3. From `apps/api`, run `npm run db:create` to create the dedicated
   `design_forge` database if needed. The PostgreSQL user needs CREATEDB for
   this helper; an administrator can create the database separately instead.
4. From the root, run `npm run db:setup`.
5. Start the frontend and API from the root:

```sh
npm run dev
```

API: http://localhost:3002. Website: http://localhost:3000.
Admin: http://localhost:3000/admin (login at `/admin/login`).

Use `npm run dev:api` or `npm run dev:web` to start
an app separately. The combined command labels each app's output and stops
the other process when one exits. Press Ctrl+C to stop both.

The unified client uses Vite's same-origin `/api` proxy locally and Nginx's
`/api` proxy in production. Leave `VITE_API_BASE_URL` empty for this setup;
development API settings can override it. Production ignores browser overrides.
`PUBLIC_API_URL` is
the reachable API URL used for image links. `CORS_ORIGINS` is a comma-separated
allowlist of frontend origins. The server defaults to loopback locally; Docker
sets HOST=0.0.0.0 without publishing an API host port. Docker database passwords
are read from DATABASE_PASSWORD_FILE and combined with DATABASE_URL. The API
trusts one proxy hop only when TRUST_PROXY_HOPS=1, as configured by Compose.

Setup creates tables and seeds the website's existing 24 projects and 15 clients
once. Existing image assets are served through `/assets`; client SVG icons stay
in the frontend and match by ID. Inquiries and bookings begin empty, so demo
messages are never presented as real submissions. Setup does not restore
deleted records. It creates the configured administrator only if absent.

The local example administrator uses development credentials. Configure
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` before first setup. Passwords
are hashed with scrypt. Session tokens are random, stored as hashes in PostgreSQL,
expire after eight hours, and are revoked on logout. Changing the environment
password after setup does not change an existing account's password.

## Existing API contract

Responses use `{ success, data, message? }`. Login returns `{ user, expiresAt }`
and an HttpOnly session cookie (Secure in production). The browser sends this
cookie on private requests. Cookie-authenticated writes require an allowed
Origin. Local login responses also include a token for API integration tests;
Bearer authorization remains supported for explicit API clients.

| Method | Route | Access / behavior |
| --- | --- | --- |
| POST | `/api/auth/login` | Public; email/password login |
| GET | `/api/auth/session` | Admin; validate restored session |
| POST | `/api/auth/logout` | Admin; revoke session |
| GET | `/api/health` | Public; checks PostgreSQL connectivity |
| GET | `/api/projects` | Public; existing gallery project objects |
| GET | `/api/projects/:id` | Public; one project |
| POST | `/api/projects` | Admin; JSON or multipart `project` JSON + `image` |
| PUT | `/api/projects/:id` | Admin; partial project JSON |
| DELETE | `/api/projects/:id` | Admin; remove project |
| GET | `/api/clients` | Public; client names, subtitles, logo URLs |
| GET | `/api/clients/:id` | Public; one client |
| POST | `/api/clients` | Admin; JSON or multipart `client` JSON + `logo` |
| DELETE | `/api/clients/:id` | Admin; remove client |
| POST | `/api/upload` | Admin; multipart `file`, returns `{ url }` |
| GET | `/api/media/:name` | Public portfolio image streamed from private S3 |
| POST | `/api/inquiries` | Public; name/email/message, returns `{ received, id }` |
| GET | `/api/inquiries` | Admin; inbox with status and server timestamp |
| PATCH | `/api/inquiries/:id` | Admin; `{ status: new/reviewed/archived }` |
| POST | `/api/bookings` | Public; existing scheduler fields, returns `{ booked, reservationId }` |
| GET | `/api/bookings` | Admin; confirmed consultations |
| GET | `/api/bookings/availability` | Public; upcoming dates and available 30-minute slots |

The session, logout, and inquiry-status routes implement behaviors already
present in the UI. No account registration, email delivery, external calendar,
payments, or additional management screens are included.

The website's Connect section opens the scheduler through “Schedule
Consultation.” Availability uses upcoming weekdays within a rolling 30-day
window and the existing six start times: 10:00, 11:30, 14:00, 16:00, 17:30,
and 19:00 CET. CET means fixed UTC+01:00 throughout the year, as explicitly
labeled by the original scheduler. Reservations last 30 minutes and share
one studio calendar across services. Pending and confirmed bookings occupy
slots; completed bookings do not. Past or invalid dates and unsupported times
are rejected. Availability responses include date, time, UTC start/end, and
availability only, with no customer details.

PostgreSQL's non-overlapping range constraint prevents simultaneous requests
from reserving overlapping calls; the losing request receives HTTP 409. The
frontend refreshes availability every 30 seconds and on window focus, disables
unavailable slots and duplicate submissions, and returns to slot selection on
a booking conflict while preserving the visitor's entered details. Availability
must be online before confirming. Existing bookings are backfilled with UTC
intervals at setup. If legacy dates/times cannot be parsed or old reservations
overlap, setup stops rather than deleting or silently changing reservations.

Uploads support JPG, PNG, WebP, GIF, and SVG with a 50 MB limit. Files use random
names, raster signatures are checked, unsafe SVG content is rejected, and
image responses have a restrictive content security policy. Production stores
new files in private S3 and serves stable `/api/media/:name` URLs through the
API. It requires `S3_BUCKET` and `AWS_REGION`; no CloudFront distribution or
public bucket is needed. Local development defaults to `apps/api/uploads`.
Preserve that directory only for existing local uploads. Deleting a project or
client removes its record; uploaded files remain available for existing links.

Public portfolio reads retain the existing curated fallback when the API is
unavailable. Login, admin mutations, inquiries, and bookings never pretend to
succeed offline. Errors are shown through the existing browser dialog pattern.
The public data refreshes when its tab gains focus or the admin returns to the
public route, which mounts the website's data provider again.

## SMTP confirmations

Set SMTP_ENABLED=true and configure SMTP_HOST, SMTP_PORT, SMTP_SECURE,
SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_FROM_NAME, and SMTP_REPLY_TO in the API
environment. Use port 587 with SMTP_SECURE=false for required STARTTLS, or
465 with SMTP_SECURE=true. SMTP_FROM must be approved by your provider.
Local development defaults to SMTP_ENABLED=false.

Run `npm run smtp:verify` from the repository root to verify the connection
and authentication without sending mail. The [Compose SMTP guide](../../deploy/operations.md#smtp-confirmations)
includes production commands and queue troubleshooting.

Successful submissions and their email jobs commit in one transaction.
POST /api/bookings and POST /api/inquiries include `data.emailStatus` with
`queued` or `disabled`. The frontend displays an email notice when queued.
The API worker checks the durable email_outbox table every five seconds,
with up to five delivery attempts. Failures do not remove saved submissions.
Only the submitting visitor receives a confirmation; internal notifications,
meeting links, and calendar invitations are not generated. No email is queued
for invalid or overlapping bookings. SMTP acceptance does not guarantee inbox
delivery; process failure after acceptance can result in a duplicate retry.

## Verification commands

```sh
npm run test:api
npm run lint
npm run build
```

Set `TEST_DATABASE_URL` to an existing test database. If omitted, integration
tests use `DATABASE_URL`. Tests create a uniquely named schema and temporary
upload directory, then remove only those test resources. Existing application
tables and uploads are untouched. Tests exercise real HTTP requests and
PostgreSQL, including authentication, private access, validation, multipart
uploads, website-to-admin submissions, restart persistence, deletions, and
session revocation.

Scheduling constraints follow [PostgreSQL range exclusion constraints](https://www.postgresql.org/docs/17/rangetypes.html#RANGETYPES-CONSTRAINT).

SMTP transport follows [Nodemailer SMTP configuration](https://nodemailer.com/smtp).

Implementation references: [node-postgres parameterized queries](https://node-postgres.com/features/queries),
[transactions](https://node-postgres.com/features/transactions), and
[Express Multer](https://expressjs.com/en/resources/middleware/multer/).
