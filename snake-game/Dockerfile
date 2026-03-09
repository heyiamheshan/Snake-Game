# Root Dockerfile for Snake Game
# This file allows deployment platforms to auto-detect the backend service.
# For multi-service local development, use docker-compose.yml.

# The backend is the primary service that requires a Docker build on most platforms.
FROM node:22-alpine

# Install netcat for the healthcheck wait in entrypoint
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy package files from the server directory
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy source from the server directory
COPY server/prisma ./prisma
COPY server/prisma.config.ts ./
COPY server/app.js server/server.js ./
COPY server/routes ./routes

# Generate Prisma client — use --schema to bypass prisma.config.ts
RUN npx prisma generate --schema prisma/schema.prisma

# Copy and prepare entrypoint
COPY server/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
