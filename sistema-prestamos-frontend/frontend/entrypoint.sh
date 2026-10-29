#!/bin/sh
set -e

CONFIG_PATH="/usr/share/nginx/html/assets/config.json"

cat <<EOF > "$CONFIG_PATH"
{
  "apiUrl": "${API_URL:-${BACKEND_URL:-}}",
  "googleClientId": "${GOOGLE_CLIENT_ID:-}",
  "microsoftClientId": "${MICROSOFT_CLIENT_ID:-}"
}
EOF

if [ -n "$PORT" ]; then
  sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf
fi

exec "$@"
