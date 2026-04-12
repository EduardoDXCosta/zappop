#!/bin/sh
set -e
echo "Running migrations..."
node db/migrate.mjs
echo "Starting server..."
exec node server.js
