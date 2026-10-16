# Design Forge

One React application for the public website and authenticated admin dashboard,
with an Express/PostgreSQL API.

```text
apps/web/       Website and admin screens in one codebase
apps/api/       API, database schema, and upload storage
compose.yml    Production Nginx, API, PostgreSQL and Certbot stack
deploy/docker/ Production container builds and certificate-aware Nginx
deploy/aws/    Private S3 upload/read IAM policy
```

## Local development

Run `npm install`. Configure `apps/api/.env` using its `.env.example`, then
run `npm run db:setup` against your local PostgreSQL database.

```sh
npm run dev
```

- Website: http://localhost:3000
- Admin login: http://localhost:3000/admin/login
- Protected dashboard: http://localhost:3000/admin
- API: http://localhost:3002 (the site proxies `/api` to it)

The public site has no admin shortcuts. Login requires the administrator
configured in the API environment. The login form contains no demo password.
Local uploads use disk by default; production stores files in private S3 and
streams public portfolio images through the API. CloudFront is not required.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the unified frontend and API together |
| `npm run dev:web` | Run the frontend separately |
| `npm run dev:api` | Run the API separately |
| `npm run build` | Build the frontend and check API syntax |
| `npm run lint` | Check frontend TypeScript |
| `npm run test:api` | PostgreSQL/HTTP integration and upload-storage tests |
| `npm run test:web` | Playwright admin route/authentication browser tests |
| `npm run test:deploy` | Compose structure, deployment scripts and secret initialization checks |
| `npm run db:setup` | Apply schema and initialize existing content |
| `npm run smtp:verify` | Check configured SMTP connection/authentication without sending mail |

Production uses `docker compose up -d --build` after the initial domain,
credentials and certificate setup: [VPS deployment instructions](deploy/README.md).
API contract and booking rules: [API README](apps/api/README.md).
