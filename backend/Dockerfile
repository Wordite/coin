# Multi-stage build for production
FROM node:22-alpine AS base
# Prisma requires OpenSSL; sharp requires vips and build tools on Alpine
# Also install docker-compose for documentation rebuild
RUN apk add --no-cache openssl ca-certificates vips-dev docker-compose curl postgresql-client gzip

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install build dependencies for native modules
COPY package.json package-lock.json* ./
ENV NODE_ENV=development
RUN apk add --no-cache build-base python3 pkgconfig
RUN npm ci

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
# Create docker group with available GID and add user to it for Docker socket access
RUN addgroup --system docker
RUN adduser nestjs docker

# TODO: remove this after testing
RUN apk add --no-cache docker-cli jq

ENV NODE_ENV=production

# Copy built application and Prisma client
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules


# Create uploads, logs and scripts directories with proper permissions
RUN mkdir -p uploads logs scripts && chown nestjs:nodejs uploads logs scripts

# Switch to non-root user
USER nestjs


# Expose port
EXPOSE 3000

# No Dockerfile-level healthcheck; managed by compose or external checks

# Start: run database migrations, then start app
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]