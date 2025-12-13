import Fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // 注册 CORS
  await fastify.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  });

  // 健康检查
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() };
  });

  const apiPrefix = process.env.API_PREFIX || '/api/v1';

  // API 路由
  await fastify.register(async (fastify) => {
    // 人物路由
    fastify.get<{ Params: { id: string } }>(
      '/persons/:id',
      async (request, reply) => {
        const { id } = request.params;
        const person = await prisma.person.findUnique({
          where: { id },
          include: { sources: true },
        });
        if (!person) {
          return reply.code(404).send({ error: 'Person not found' });
        }
        return person;
      }
    );

    fastify.get('/persons', async () => {
      return await prisma.person.findMany({
        include: { sources: true },
        take: 100,
      });
    });

    // 事件路由
    fastify.get<{ Querystring: { startYear?: string; endYear?: string } }>(
      '/events',
      async (request) => {
        const { startYear, endYear } = request.query;

        if (startYear && endYear) {
          return await prisma.event.findMany({
            where: {
              AND: [
                { startYear: { lte: parseInt(endYear) } },
                { endYear: { gte: parseInt(startYear) } },
              ],
            },
            orderBy: { startYear: 'asc' },
            include: { sources: true },
            take: 100,
          });
        }

        return await prisma.event.findMany({
          include: { sources: true },
          take: 100,
        });
      }
    );

    // 地点路由
    fastify.get('/places', async () => {
      return await prisma.place.findMany({
        include: { sources: true },
        take: 100,
      });
    });

    // 时间轴查询
    fastify.get<{ Querystring: { startYear?: string; endYear?: string } }>(
      '/timeline',
      async (request) => {
        const { startYear = '-3000', endYear = '2025' } = request.query;

        return await prisma.event.findMany({
          where: {
            AND: [
              { startYear: { lte: parseInt(endYear) } },
              { endYear: { gte: parseInt(startYear) } },
            ],
          },
          orderBy: { startYear: 'asc' },
          include: {
            sources: true,
            participants: { include: { person: true } },
            locations: { include: { place: true } },
          },
        });
      }
    );
  }, { prefix: apiPrefix });

  return fastify;
}

async function main() {
  const fastify = await buildServer();
  const port = parseInt(process.env.PORT || '3001');
  const host = '0.0.0.0';

  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');

    await fastify.listen({ port, host });
    console.log(`🚀 API 服务运行在 http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
