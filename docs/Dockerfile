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
ARG NODE_ENV
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV NODE_ENV=$NODE_ENV
RUN npm run build

# Use nginx to serve the built files (like frontend)
FROM nginx:alpine

# Copy built client files to nginx
COPY --from=builder /app/build/client /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]