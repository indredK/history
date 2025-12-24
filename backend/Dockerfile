# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lockb* ./

# Install dependencies
# Using bun/npm based on lock file, assuming npm if not specific, but user has bun.lock
RUN if [ -f bun.lockb ]; then npm install -g bun && bun install; else npm install; fi

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f bun.lockb ]; then npm install -g bun && bun install --production; else npm install --production; fi

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start:prod"]
