import { PrismaClient } from '../generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

// Create libSQL client for local SQLite file
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

const adapter = new PrismaLibSql({
  url: databaseUrl,
});

export const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

export type PrismaClientType = typeof prisma;
