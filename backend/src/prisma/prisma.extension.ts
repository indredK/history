import { PrismaClient } from '../generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// Create libSQL client for local SQLite file.
// Keep the fallback aligned with README and prisma.config.ts so every dev
// startup reads the same migrated database, regardless of launch command.
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

const adapter = new PrismaLibSql({
  url: databaseUrl,
});

export const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

export type PrismaClientType = typeof prisma;
