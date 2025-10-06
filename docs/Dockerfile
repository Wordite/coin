# Multi-stage build for React Router docs
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all deps (dev deps needed for react-router CLI at build time)
RUN npm ci

# Copy source code
COPY . .

# Build the application
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build

# Runtime server using react-router-serve
FROM node:22-alpine AS runner
WORKDIR /app

# Install only production deps for runtime serve
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built app
COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["npm", "run", "start"]
