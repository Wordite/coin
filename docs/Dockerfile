# Multi-stage build for React Router docs
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build

# Runtime server using react-router-serve
FROM node:22-alpine AS runner
WORKDIR /app

# Copy runtime artifacts
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json package-lock.json ./

EXPOSE 3000

CMD ["npm", "run", "start"]
