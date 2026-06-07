#!/bin/sh
set -eu

: "${BACKEND_URL:=https://your-render-backend.onrender.com}"

export BACKEND_URL

envsubst '$BACKEND_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
