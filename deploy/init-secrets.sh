#!/bin/sh
set -eu
project_root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
secrets_dir="$project_root/deploy/vps/secrets"
if [ -L "$secrets_dir" ]; then echo 'Refusing a symlink secrets directory.' >&2; exit 1; fi
umask 077
mkdir -p "$secrets_dir"
chmod 0700 "$secrets_dir"
for name in postgres_password app_db_password; do
  target="$secrets_dir/$name.txt"
  if [ -L "$target" ]; then echo "Refusing a symlink secret: $name" >&2; exit 1; fi
  if [ ! -e "$target" ]; then
    password=$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')
    if [ "${#password}" -ne 64 ]; then echo 'Password generation failed.' >&2; exit 1; fi
    (set -C; printf '%s\n' "$password" > "$target")
    echo "Created $name (value not displayed)."
  else
    if [ ! -s "$target" ]; then echo "Existing secret is empty: $name" >&2; exit 1; fi
    echo "Preserved existing $name."
  fi
  # Compose bind-mounts file secrets. Container users need read access, while
  # the root-only parent directory prevents other host users reading the files.
  chmod 0444 "$target"
done
