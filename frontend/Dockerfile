# Use Node.js Debian-based image to support native module builds
FROM node:22-bullseye-slim AS builder

# Install build tools and headers for native modules (usb/libusb/udev)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 make g++ pkg-config libusb-1.0-0-dev libudev-dev \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (allow native builds under Debian)
RUN npm ci

# Copy source code
COPY . .

# Build the application
ARG VITE_BACKEND_URL=/api
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
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