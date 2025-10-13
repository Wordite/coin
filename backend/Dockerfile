# Multi-stage build for production
FROM node:22-bookworm-slim AS base
# Prisma requires OpenSSL; sharp prefers system libvips
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates libvips \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies (including dev) for build tools (nest, prisma)
COPY package.json package-lock.json* ./
ENV NODE_ENV=development
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends build-essential python3 pkg-config \
  && rm -rf /var/lib/apt/lists/*
ENV npm_config_build_from_source=true
RUN npm ci
RUN npm rebuild sharp --build-from-source --unsafe-perm --verbose || npm rebuild sharp --build-from-source --force || true

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client using local binary
RUN npx prisma generate

# Build the application
RUN npm run build
RUN npm prune --omit=dev

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

ENV NODE_ENV=production

# Copy built application and Prisma client
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules


# Create uploads and logs directories with proper permissions
RUN mkdir -p uploads logs && chown nestjs:nodejs uploads logs

# Switch to non-root user
USER nestjs


# Expose port
EXPOSE 3000

# No Dockerfile-level healthcheck; managed by compose or external checks

# Start: run database migrations, then start app
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]