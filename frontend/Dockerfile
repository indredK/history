# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lockb* ./

# Install dependencies
RUN if [ -f bun.lockb ]; then npm install -g bun && bun install; else npm install; fi

# Copy source code
COPY . .

# Build args for Vite
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

# Copy built assets to Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
