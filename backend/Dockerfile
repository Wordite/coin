# Multi-stage build for production
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager
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

# Create uploads and logs directories with proper permissions
RUN mkdir -p uploads logs && chown nestjs:nodejs uploads logs

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]