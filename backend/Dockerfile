# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lockb* ./

# Install dependencies
RUN npm install

# Copy source code (dev.db 不入镜像,首次启动通过 migrate + seed 重建)
COPY . .

# Generate Prisma client
ENV DATABASE_URL="file:./prisma/dev.db"
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage — 用 oven/bun 作为运行时:
#   - 体积接近 node:slim
#   - seed.ts 是 TypeScript 文件,bun 可直接执行,无需额外构建/装载器
#   - 部署后启动序列:migrate deploy → (首次)db seed → bun dist/src/main.js
FROM oven/bun:1.3-slim

WORKDIR /app

# 健康检查所需
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Copy package files and install production dependencies
COPY package.json package-lock.json* bun.lockb* ./
RUN bun install --production --frozen-lockfile || bun install --production

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

# Start command:
#   - 首次启动:迁移 schema + 用 prisma/seed-data/*.json 填充种子数据
#   - 后续启动:仅执行 migrate deploy(幂等,无新迁移直接跳过)
CMD ["sh", "-c", "bunx prisma migrate deploy && (if [ ! -f /app/prisma/dev.db.seeded ]; then bunx prisma db seed && touch /app/prisma/dev.db.seeded; fi) && bun dist/src/main.js"]
