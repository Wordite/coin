# Use Node.js Debian-based image to support native module builds
FROM node:22-bullseye-slim AS builder

# Install build tools and headers for native modules
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 make g++ pkg-config \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY src ./src
COPY index.html ./index.html
COPY vite.config.ts ./vite.config.ts
COPY tsconfig*.json ./

# Ensure index.html is a file
RUN if [ -d index.html ]; then rm -rf index.html; fi && test -f index.html

# Ensure public exists even if repo doesn't have it
RUN mkdir -p public

# Build the application
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Use nginx to serve the built files
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
