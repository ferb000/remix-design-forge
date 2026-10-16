# Deploy with Docker Compose

This is the single production path for a **fresh Ubuntu 24.04 VPS**.
Docker runs Nginx/the website, the Node API/email worker, PostgreSQL, and Certbot.
Private S3 stores uploads; an external SMTP provider sends confirmations.

```text
Internet -> Nginx container (80/443) -> built website and /admin
                                  -> API container -> PostgreSQL container
                                                   -> S3 and SMTP
```

The API and database have no published host ports. You do not install Node,
Nginx, Certbot, or systemd application services on the host.

## 1. Domain, SSH, and Docker

Before starting, point your domain's A record at the VPS. Remove stale AAAA
records unless you have separately configured IPv6. Allow inbound SSH from
your IP and public TCP 80/443 in the VPS provider's firewall; do not open
3002 or 5432.

From your own computer:

```sh
ssh YOUR_SSH_USER@YOUR_VPS_IP
# If required: ssh -i /path/to/key.pem YOUR_SSH_USER@YOUR_VPS_IP
```

The remaining commands run on the VPS as a sudo-enabled user. Keep SSH open
while configuring the firewall. Substitute your actual SSH port if it is not 22.

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: noble
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker compose version
```

Use Docker's current Compose plugin, not the old docker-compose command.

## 2. Clone and configure

Use the URL of your repository. For a private repository, configure a deploy
key or credential prompt; do not embed access tokens in the URL.

```bash
REPO_URL='git@github.com:YOUR_ACCOUNT/YOUR_REPOSITORY.git'
sudo install -d -o "$(id -un)" -g "$(id -gn)" -m 0755 /opt/design-forge
git clone "$REPO_URL" /opt/design-forge
cd /opt/design-forge
umask 077
cp .env.example .env
chmod 0600 .env
nano .env
```

Fill in DOMAIN and CERT_EMAIL, your administrator credentials, S3 settings,
and SMTP settings. DOMAIN is a hostname such as studio.example.com, with no
https:// prefix, path, or port. The API's public origin is derived from it.

Use a unique administrator password of at least 16 characters. For passwords
containing dollar signs, use single quotes in .env to prevent interpolation,
for example SMTP_PASS='literal$password'. Never source .env as a shell script.
The root .env is for production Compose; apps/api/.env remains local-only.

Configure AWS and SMTP before starting:

- **S3:** Follow [AWS setup](aws/README.md) once to create the private bucket
  and restricted upload/read identity. Set AWS_REGION and S3_BUCKET in .env.
  On EC2, use an instance role with IMDSv2 and a metadata hop limit of two.
  On other providers, set the restricted AWS access keys in .env.
- **SMTP:** Set SMTP_ENABLED=true and your provider's host, username, password,
  approved sender email, and reply-to inbox. Use port 587 with
  SMTP_SECURE=false (required STARTTLS), or port 465 with SMTP_SECURE=true.
  AWS SMTP credentials, if using SES, are separate from S3 access keys.
  Complete your provider's sender/domain verification and SPF/DKIM setup.
  SES sandbox accounts can send only to verified recipients.
- Leave AWS access-key values empty when using an EC2 role. Do not put
  credentials into Dockerfiles or frontend VITE variables.

Generate database secrets and validate the Compose configuration:

```bash
sudo sh deploy/init-secrets.sh
sudo docker compose config --quiet
```

The helper generates separate root/application database passwords **only if
missing**, preserving existing values. It does not display them. The root-only
secrets directory prevents access by other VPS users; files inside it are
readable when bind-mounted for the PostgreSQL/API container users. Do not
regenerate passwords on an initialized database.

Keep .env and deploy/vps/secrets backed up privately. Docker administrators
can inspect container runtime configuration, so restrict access to the VPS
and Docker daemon. Do not publish output from docker compose config without
--quiet because it can contain environment secrets.

## 3. Build and start

Run from /opt/design-forge:

```bash
sudo docker compose up -d --build
sudo docker compose ps
sudo docker compose logs --tail=80 api
```

Docker installs dependencies and builds the website. PostgreSQL initializes
the non-superuser application account, the API waits for database health,
then applies schema updates and seeds existing content once. Nginx waits for
API health. Until a certificate exists it serves an HTTP setup page; the
actual application is not offered over insecure HTTP.

Check HTTP bootstrap and SMTP without sending mail:

```bash
sudo docker compose exec web wget -qO- http://127.0.0.1/healthz
sudo docker compose exec api node src/verify-smtp.js
```

The SMTP command should report successful connection/authentication. Sender
approval and final inbox delivery still require the form test in step 5.
Allow outbound TCP 587/465 if required by your VPS provider; no inbound SMTP
port or mail-server container is needed.

## 4. Obtain HTTPS once

Confirm your domain resolves to this VPS and its HTTP setup page loads.
The following command reads DOMAIN and CERT_EMAIL inside the Certbot service,
so passwords in .env never need shell evaluation:

```bash
sudo docker compose run --rm --entrypoint sh certbot -c \
  'exec certbot certonly --webroot -w /var/www/certbot --email "$CERT_EMAIL" -d "$DOMAIN" --agree-tos --non-interactive --keep-until-expiring'
```

After successful issuance, Nginx detects the certificate and enables HTTPS
within 60 seconds. For an immediate switch:

```bash
sudo docker compose restart web
sudo docker compose exec web nginx -t
```

Visit https://YOUR_DOMAIN. HTTP should now redirect to HTTPS, except the
certificate challenge and health paths.

The Certbot container checks renewals every 12 hours. Nginx checks certificate
contents every 60 seconds and reloads only after validating its new
configuration. Neither container receives the Docker socket. Both certificate
and challenge files live in persistent volumes.

Verify renewal with Let's Encrypt's staging test:

```bash
sudo docker compose run --rm --entrypoint certbot certbot renew --dry-run
sudo docker compose logs --tail=50 certbot web
```

Certificate issuance needs public DNS and inbound port 80. If it fails, fix
DNS/firewall errors before retrying; repeated production requests can hit
certificate-authority rate limits.

## 5. Verify the application

Replace the example hostname below:

```bash
curl --fail -I https://studio.example.com/
curl --fail https://studio.example.com/api/health
curl --fail -I https://studio.example.com/admin/login
curl -i https://studio.example.com/api/inquiries
sudo docker compose ps
```

The inquiry request should return 401 without an admin session. In a browser:

1. Verify the public website has no admin shortcut.
2. Visit /admin and confirm it redirects to /admin/login.
3. Sign in with your configured account, upload an image, and open its
   /api/media/... URL. New files must be in private S3, not the container.
4. Send a public inquiry and book an available consultation using an email
   address you control. Verify admin records and both confirmation emails.
5. Attempt the same slot again: it must fail without another confirmation.
6. Sign out and confirm the dashboard cannot reopen without authentication.

Check persistence after recreating application containers:

```bash
sudo docker compose up -d --force-recreate api web
sudo docker compose ps
```

Previously saved records and queued emails remain in PostgreSQL. Original
seed images are packaged into the API image; bundled website images remain
in the web image. Certificates also survive recreation.

## 6. Updates and operations

For normal updates, first [back up the database](operations.md#database-backup),
then:

```bash
cd /opt/design-forge
git status --short
git pull --ff-only
sudo docker compose up -d --build
sudo docker compose ps
sudo docker compose logs --tail=50 api web
```

Do not overwrite .env or regenerate secrets during updates. A changed .env
takes effect through docker compose up -d, which recreates affected containers;
docker compose restart alone does not reload container environment settings.
After a domain change, issue a certificate for the new domain using step 4.

Useful commands:

```bash
sudo docker compose logs -f --tail=100 api web certbot
sudo docker compose exec api node src/verify-smtp.js
sudo docker compose exec -T db psql -U postgres -d design_forge -c \
  "SELECT id,kind,status,attempts,last_error FROM email_outbox ORDER BY created_at DESC LIMIT 20;"
sudo docker compose restart api
sudo docker compose down
sudo docker compose up -d
```

down stops the stack while preserving volumes. **Never use down -v** unless
you intentionally want to erase database and certificate volumes.
Do not uninstall/recreate PostgreSQL volumes for a routine update.

See [operations and backups](operations.md) for email retries and restore
checks. If you used the earlier host deployment, follow the separate
[migration checklist](migration.md) instead of initializing a fresh database.

## Troubleshooting

| Problem | Check |
| --- | --- |
| API never becomes healthy | API logs, S3/admin/SMTP configuration, database health and secret files |
| Website shows HTTP setup page | Certificate issuance succeeded, domain matches .env, restart web |
| 502 after replacing API | API health and Nginx logs; internal DNS refreshes within 10 seconds |
| Login fails or cookies disappear | HTTPS, exact domain, correct credentials and trusted proxy setting |
| S3 access denied on EC2 | Instance role permissions and IMDSv2 response hop limit of two |
| Missing email | smtp:verify command, provider logs/spam folder, email_outbox status |
| Port 80/443 already in use | Stop the earlier host Nginx or another ingress before starting web |
| Database authentication fails | Existing database passwords must match preserved secret files |

The repository's unit, integration, and browser checks do not replace testing
Docker builds, real TLS issuance/renewal, S3 permissions, and SMTP delivery on
a Docker-enabled machine. This workspace does not have Docker installed.

References: [Compose readiness](https://docs.docker.com/compose/how-tos/startup-order/),
[Certbot Docker](https://eff-certbot.readthedocs.io/en/stable/install.html#running-with-docker),
[AWS container metadata](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-IMDS-new-instances.html).


bash create-instance.sh design-forge-ec2.pub 102.176.94.233/32