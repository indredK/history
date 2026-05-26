# Build stage
FROM oven/bun:1.3.5-alpine AS build-stage

WORKDIR /workspace

# Copy workspace manifests so bun can honor the root lockfile without mutation
COPY package.json bun.lock ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json

# Install dependencies for the whole workspace using the committed lockfile
RUN bun install --frozen-lockfile

# Copy frontend source code
COPY frontend/ ./frontend/

# Build args for Vite
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=$VITE_BASE_PATH

ARG GIT_SHA=local
ENV GIT_SHA=$GIT_SHA

ARG BUILD_TIME
ENV BUILD_TIME=$BUILD_TIME

# Build the application
WORKDIR /workspace/frontend
RUN bun run build

# Production stage
FROM nginx:alpine AS production-stage

# Copy built assets to Nginx
COPY --from=build-stage /workspace/frontend/dist /usr/share/nginx/html

# Copy Nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
