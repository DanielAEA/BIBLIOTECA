#!/bin/sh
set -e

CONFIG_PATH="/usr/share/nginx/html/assets/config.json"

cat <<EOF > "$CONFIG_PATH"
{
  "apiUrl": "${API_URL:-${BACKEND_URL:-}}"
}
EOF

if [ -n "$PORT" ] && [ "$PORT" != "80" ]; then
  sed -i "s/listen 8080;/listen $PORT;/g" /etc/nginx/conf.d/default.conf
fi

sed -i 's/error_log .* notice;/error_log \/var\/log\/nginx\/error.log warn;/g' /etc/nginx/nginx.conf

exec "$@"
