#!/bin/sh
set -eu
app_password=$(cat /run/secrets/app_db_password)
psql --username "$POSTGRES_USER" --dbname postgres --set=ON_ERROR_STOP=1 --set=app_password="$app_password" <<'SQL'
CREATE ROLE design_forge WITH LOGIN PASSWORD :'app_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE DATABASE design_forge OWNER design_forge;
SQL
