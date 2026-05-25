import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // 由 bun 直接执行 TS;在 Docker 镜像中也使用 oven/bun 作为运行时,统一一致。
    seed: 'bun ./prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});