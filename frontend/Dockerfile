# Build stage
FROM oven/bun:1.3.5-alpine AS build-stage

WORKDIR /app

# Copy package files
COPY frontend/package.json ./package.json
COPY bun.lock ./bun.lock

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY frontend/ ./

# Build args for Vite
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=$VITE_BASE_PATH

# Build the application
RUN bun run build

# Production stage
FROM nginx:alpine AS production-stage

# Copy built assets to Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
