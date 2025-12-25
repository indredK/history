# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lockb* ./

# Install dependencies
RUN npm install

# Copy source code (includes prisma/dev.db if exists)
COPY . .

# Generate Prisma client
ENV DATABASE_URL="file:./prisma/dev.db"
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install wget for health check
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Copy package files and install production dependencies
COPY package.json package-lock.json* bun.lockb* ./
RUN npm install --omit=dev

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma client (CRITICAL - this was missing!)
COPY --from=builder /app/src/generated ./src/generated

# Create data directory and persistence
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start command - initialize database if needed
CMD ["sh", "-c", "if [ ! -f /app/prisma/dev.db ]; then npx prisma migrate deploy; fi && node dist/src/main.js"]
