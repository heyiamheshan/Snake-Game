#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "✅ PostgreSQL is ready"

echo "🗄  Running Prisma db push..."
# Pass --url explicitly so Prisma doesn't need datasource.url in prisma.config.ts
npx prisma db push \
  --schema prisma/schema.prisma \
  --url "$DATABASE_URL" \
  --accept-data-loss
echo "✅ Database schema is up to date"

echo "🚀 Starting server..."
exec node server.js
