# Multi-stage build for production
FROM node:22-bookworm-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager (avoid OS package mirrors)
COPY package.json package-lock.json* ./
# Ensure devDependencies are installed for build tools (nest, prisma)
ENV NODE_ENV=development
# Retry npm ci up to 3 times in case of network issues, include dev deps explicitly
RUN for i in 1 2 3; do npm ci --include=dev && break || sleep 5; done && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client using local binary (avoid npx network fetch) with retries
RUN for i in 1 2 3; do ./node_modules/.bin/prisma generate && break || sleep 5; done

# Build the application
RUN npm run build

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Install only production dependencies (no dev tools needed at runtime)
COPY package.json package-lock.json* ./
ENV NODE_ENV=production
# Retry npm ci up to 3 times in case of network issues
RUN for i in 1 2 3; do npm ci --omit=dev && break || sleep 5; done && npm cache clean --force

# Copy built application and Prisma client
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
# Copy Prisma CLI from build stage to avoid network install at runtime
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Create uploads and logs directories with proper permissions
RUN mkdir -p uploads logs && chown nestjs:nodejs uploads logs

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# No Dockerfile-level healthcheck; managed by compose or external checks

# Start: run database migrations, then start app
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]