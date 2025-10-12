# Multi-stage build for production
FROM node:22-bookworm-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies (including dev) for build tools (nest, prisma)
COPY package.json package-lock.json* ./
ENV NODE_ENV=development
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


# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Install only production dependencies (no dev tools needed at runtime)
COPY package.json package-lock.json* ./
ENV NODE_ENV=production
RUN npm ci --omit=dev

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