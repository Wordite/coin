# Multi-stage build for React Router docs with SSR server
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
ARG NODE_ENV
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV NODE_ENV=$NODE_ENV
RUN npm run build

# Production stage: Run SSR server
FROM node:22-alpine

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built server and client from builder
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Start the React Router SSR server
CMD ["npm", "start"]
