# ── Backend Dockerfile ─────────────────────────────────────────────────────
FROM node:22-alpine

# Install netcat for the healthcheck wait in entrypoint
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY app.js server.js ./
COPY routes ./routes

# Generate Prisma client — use --schema to bypass prisma.config.ts
# (prisma.config.ts requires DATABASE_URL which isn't available at build time)
RUN npx prisma generate --schema prisma/schema.prisma

# Copy and prepare entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
