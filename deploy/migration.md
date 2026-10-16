# From the earlier host deployment to Compose

The main guide assumes a fresh server. If you already deployed, use this
checklist before starting the new stack. Schedule a maintenance window.

1. Back up PostgreSQL with the old deployment's working commands and copy the
   dump off the VPS. Back up `/etc/design-forge/api.env`, database password
   files, existing TLS certificates, and `apps/api/uploads`. Do not publish
   these files or overwrite them with examples.
2. Inspect the existing PostgreSQL volume:

   ```bash
   sudo docker volume inspect design-forge_postgres_data
   sudo docker ps --filter volume=design-forge_postgres_data
   ```

   The new Compose file explicitly uses that same volume and PostgreSQL major
   version 17. If your volume has a different name or PostgreSQL major version,
   stop and adapt the volume mapping or plan a dump/restore. Do not attach an
   incompatible data directory or silently initialize a new empty volume.
3. Copy current S3, SMTP, and administrator settings into the root `.env`.
   Keep the original initial administrator password setting; changing it does
   not rotate an existing account. Set DOMAIN/CERT_EMAIL. Compose replaces the
   old localhost database URL with `db:5432` and injects the password from the
   mounted file. Preserve `deploy/vps/secrets/app_db_password.txt` and the root
   password file exactly. The initialization helper must not generate a new
   password for an existing database.
4. Inspect old container mount paths and copy any secrets to the expected
   paths before running the helper. The prior initialization SQL runs only on
   an empty PostgreSQL data directory. It must not be rerun to rotate users.
5. Stop the host API and host Nginx after the backup:

   ```bash
   sudo systemctl stop design-forge-api
   sudo systemctl stop nginx
   ```

   Retain their configuration until rollback is no longer needed. Stop the
   old database container if Compose does not manage it under the same
   `design-forge` project/service labels. Never run two PostgreSQL processes
   against the same volume. Do not remove the data volume.
6. Run `sudo docker compose up -d --build` at the repository root. Check logs
   and existing records. The shared project/service identity allows Compose
   to recreate the database container while keeping its volume. The database
   host port is no longer published.
7. Reuse existing certificates by copying the entire `/etc/letsencrypt` tree
   into the new certificate volume with its archive/live symlink structure
   intact, or issue a new certificate using the main guide's Certbot command.
   Preserve the old certificate tree until the transition is verified.
8. If legacy local uploads exist, populate the new `design-forge_legacy_uploads`
   volume. For example, once Compose has created the volume, substitute the
   absolute old upload directory:

   ```bash
   sudo docker run --rm \
     --mount type=bind,src=/ABSOLUTE/OLD/UPLOADS,dst=/source,readonly \
     --mount type=volume,src=design-forge_legacy_uploads,dst=/target \
     alpine sh -c 'cp -a /source/. /target/ && chmod -R a+rX /target'
   ```

   The API mounts this volume read-only to preserve old `/uploads/` links;
   all new production uploads go to S3. Absolute localhost URLs in older
   database records require a deliberate data correction to the new HTTPS
   origin; the deployment does not rewrite them silently.
9. Verify private login/logout, existing projects and clients, old images,
   S3 uploads, inquiries, reservations, emails, and certificate renewal.
   Confirm database and queued-email persistence after container recreation.
10. Only after verification, disable the superseded host services:

    ```bash
    sudo systemctl disable design-forge-api nginx
    ```

For rollback, stop the new stack **without `-v`**, restore old service settings
and the database container configuration, then start the old host services.
If a schema change is incompatible with old code, restore a verified backup
under an explicit recovery plan rather than assuming an image rollback also
rolls back database migrations.
