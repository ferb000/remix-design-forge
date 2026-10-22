# Compose operations

Run these commands from `/opt/design-forge`. Keep the root `.env`, database
secret files, certificates, database backups, and S3 objects protected and
recoverable. Never commit them. Docker volumes are persistence, not backups.

## Database backup

```bash
umask 077
mkdir -p backups
chmod 0700 backups
sudo docker compose exec -T db pg_dump -U postgres -d design_forge -Fc \
  > "backups/design_forge-$(date -u +%Y%m%dT%H%M%SZ).dump"
ls -lh backups
```

Copy backups to a protected location off the VPS and schedule recurring backups
before accepting real customer data. Verify the command succeeds and the dump
is nonempty; delete a failed partial backup only after identifying it. From
your computer, a chosen dump can be downloaded with:

```sh
scp YOUR_SSH_USER@YOUR_VPS_IP:/opt/design-forge/backups/CHOSEN_FILENAME.dump .
```

Use the same SSH key options as your normal SSH connection. S3 versioning
helps protect object history; keep database backups and uploaded objects
together as part of a tested recovery plan.

## Restore check

Restore into a **new, empty recovery database**, not the live database:

```bash
sudo docker compose exec -T db createdb -U postgres -O design_forge design_forge_restore_check
sudo docker compose exec -T db pg_restore -U postgres \
  -d design_forge_restore_check --no-owner --role=design_forge \
  < backups/CHOSEN_FILENAME.dump
sudo docker compose exec -T db psql -U postgres -d design_forge_restore_check \
  -c 'SELECT count(*) FROM projects;'
```

Choose a different recovery database name if that one already exists. A live
restore requires a planned outage and explicit data replacement; these
verification commands do not replace the production database.

## SMTP confirmations

```bash
sudo docker compose exec api node src/verify-smtp.js
sudo docker compose exec -T db psql -U postgres -d design_forge -c \
  "SELECT id,kind,status,attempts,last_error,sent_at FROM email_outbox ORDER BY created_at DESC LIMIT 20;"
sudo docker compose logs --tail=100 api
```

Verification opens an SMTP connection without sending mail. Confirmation
jobs are committed with their submissions. The worker checks every five
seconds and tries up to five total deliveries, waiting 1, 2, 4, then 8 minutes.
Each submission queues a visitor confirmation and a separate ADMIN_EMAIL
notification. Job IDs start with `confirmation-` and `notification-` respectively.
Failed delivery does not undo a booking or inquiry. SMTP acceptance does not
prove inbox delivery; consult the provider's delivery logs and spam folder.

Fix SMTP settings in `.env`, apply them with `sudo docker compose up -d api`,
and retry a selected failed job:

```bash
sudo docker compose exec -T db psql -U postgres -d design_forge -c \
  "UPDATE email_outbox SET status='pending',attempts=0,next_attempt_at=now(),last_error=NULL WHERE status='failed' AND id='REPLACE_WITH_EMAIL_JOB_ID';"
```

SMTP_ENABLED=false disables new confirmation jobs; enabling it later does not
email older submissions retroactively. Existing queued jobs resume when the
worker is enabled. A crash after SMTP acceptance but before recording success
can cause a duplicate retry despite stable Message-ID values.

## Certificates

```bash
sudo docker compose run --rm --entrypoint certbot certbot renew --dry-run
sudo docker compose logs --tail=100 certbot web
sudo docker compose exec web nginx -t
```

Renewals run every 12 hours and Nginx detects updated certificates within 60
seconds. Preserve the certificate volume. Keep public port 80 and the ACME
challenge route available for renewals.

## Startup and shutdown

```bash
sudo docker compose ps
sudo docker compose down
sudo docker compose up -d
```

Do not use `down -v`. API shutdown waits for active mail processing; the API
has a 60-second stop grace period. Containers restart after a host reboot
when Docker starts. A healthcheck marks an unhealthy service but does not by
itself restart a still-running process; inspect the logs and underlying cause.
