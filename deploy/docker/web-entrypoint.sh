#!/bin/sh
set -eu
# Restrict DOMAIN before it is interpolated into Nginx directives and paths.
if ! printf '%s' "${DOMAIN:-}" | grep -Eq '^([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$'; then
  echo 'DOMAIN must be a hostname without a scheme, path, wildcard, or port.' >&2
  exit 1
fi
export DOMAIN
certificate="${LETSENCRYPT_DIR:-/etc/letsencrypt}/live/$DOMAIN/fullchain.pem"
private_key="${LETSENCRYPT_DIR:-/etc/letsencrypt}/live/$DOMAIN/privkey.pem"
config="${NGINX_CONFIG_DIR:-/etc/nginx/conf.d}/default.conf"
templates_dir="${NGINX_TEMPLATES_DIR:-/opt/design-forge}"

certificate_state() {
  if [ -s "$certificate" ] && [ -s "$private_key" ]; then
    sha256sum "$certificate" "$private_key" | sha256sum | cut -d ' ' -f 1
  else
    printf '%s\n' missing
  fi
}
render() {
  mode=http
  if [ -s "$certificate" ] && [ -s "$private_key" ]; then mode=https; fi
  # Only substitute DOMAIN: preserve Nginx's own $host, $uri and proxy variables.
  envsubst '${DOMAIN}' < "$templates_dir/nginx-$mode.conf.template" > "$config"
}

initial_state=$(certificate_state)
render
nginx -t
(
  state=$initial_state
  while sleep "${CERTIFICATE_POLL_SECONDS:-60}"; do
    next_state=$(certificate_state)
    if [ "$state" != "$next_state" ]; then
      cp "$config" "$config.previous"
      render
      if nginx -t && nginx -s reload; then
        state=$next_state
        echo 'Nginx certificate configuration reloaded.'
      else
        mv "$config.previous" "$config"
        echo 'Certificate reload failed; retained previous Nginx configuration.' >&2
      fi
    fi
  done
) &
watcher=$!
nginx -g 'daemon off;' &
nginx_pid=$!
stop() {
  kill "$watcher" 2>/dev/null || true
  nginx -s quit 2>/dev/null || true
}
trap stop TERM INT
set +e
wait "$nginx_pid"
status=$?
# A signal can interrupt wait before Nginx has completed graceful shutdown.
kill "$watcher" 2>/dev/null || true
wait "$nginx_pid" 2>/dev/null
exit "$status"
