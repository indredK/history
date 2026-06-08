/**
 * Seed 入口:从 backend/prisma/seed-data/<table>.json 读取数据,
 * 通过 Prisma 写入空数据库(或刷新已有数据)。
 *
 * 用法:
 *   cd backend && bun prisma/seed.ts
 *   或:           bunx prisma db seed   (会读取 package.json#prisma.seed)
 *
 * 设计:
 * - 数据源 = JSON 文件,**不再依赖 dev.db**(dev.db 已从 git 剥离)
 * - 用 upsert 保证幂等:重复运行不会复制/失败
 * - JSON 文件里的数据已经是干净的 JS 对象/数组(由 scripts/export-db.ts 处理过反转义);
 *   Prisma 会再 stringify 一次写入 SQLite,这是正常的单层 JSON 列写入
 * - createdAt / updatedAt 来自源数据;新创建走 Prisma 的 @default(now())
 *
 * 注意:JSON 中的 `createdAt` / `updatedAt` 在 Prisma 里只在 create 路径接受;
 * upsert 的 update 路径不会重写它们(避免每次 seed 都刷新时间戳)。
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from '../src/prisma/prisma.extension';
import { Prisma } from '../src/generated/prisma/client';

const DATA_DIR = join(__dirname, 'seed-data');

interface RowBase {
  id: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

function loadJson<T = RowBase>(table: string): T[] {
  const file = join(DATA_DIR, `${table}.json`);
  if (!existsSync(file)) {
    console.warn(`  ⚠ ${table}.json 不存在,跳过`);
    return [];
  }
  return JSON.parse(readFileSync(file, 'utf-8')) as T[];
}

/**
 * 通用 upsert:`createOnly` 字段(如 createdAt)只在 create 时写入,
 * update 路径只刷新业务字段。
 */
async function upsertAll<T extends RowBase>(
  name: string,
  rows: T[],
  upsertOne: (row: T) => Promise<unknown>,
): Promise<void> {
  if (rows.length === 0) {
    console.log(`  · ${name}: 无数据,跳过`);
    return;
  }
  let ok = 0;
  for (const row of rows) {
    try {
      await upsertOne(row);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${name} id=${row.id}: ${(e as Error).message}`);
    }
  }
  console.log(`  ✓ ${name}: ${ok}/${rows.length}`);
}

/** 把 ISO 日期字符串安全转 Date(null/undefined 直接透传)。 */
function toDate(v: unknown): Date | undefined {
  if (v === null || v === undefined) return undefined;
  if (v instanceof Date) return v;
  if (typeof v === 'string' || typeof v === 'number') return new Date(v);
  return undefined;
}

function toNullableString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toJson(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  return JSON.stringify(v);
}

function toNullableNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const next = Number(v);
  return Number.isFinite(next) ? next : null;
}

async function upsertPerson(row: RowBase): Promise<unknown> {
  const r = row as Record<string, unknown>;
  const now = new Date();
  const createdAt = toDate(r.createdAt) ?? now;
  const updatedAt = toDate(r.updatedAt) ?? now;

  return prisma.$executeRaw(Prisma.sql`
    INSERT INTO persons (
      id, name, nameEn, courtesy, dynasty, period, gender,
      birthYear, birthMonth, deathYear, deathMonth, birthplace,
      biography, roles, aliases, achievements, works, events, evaluations,
      portraitUrl, sources, confidence, createdAt, updatedAt
    )
    VALUES (
      ${row.id}, ${String(r.name ?? '').trim()},
      ${toNullableString(r.nameEn ?? r.name_en)},
      ${toNullableString(r.courtesy)}, ${toNullableString(r.dynasty)},
      ${toNullableString(r.period)}, ${toNullableString(r.gender)},
      ${toNullableNumber(r.birthYear ?? r.birth_year)},
      ${toNullableNumber(r.birthMonth ?? r.birth_month)},
      ${toNullableNumber(r.deathYear ?? r.death_year)},
      ${toNullableNumber(r.deathMonth ?? r.death_month)},
      ${toNullableString(r.birthplace)}, ${toNullableString(r.biography)},
      ${toJson(r.roles)}, ${toJson(r.aliases)}, ${toJson(r.achievements)},
      ${toJson(r.works)}, ${toJson(r.events)}, ${toJson(r.evaluations)},
      ${toNullableString(r.portraitUrl)}, ${toJson(r.sources)},
      ${toNullableNumber(r.confidence)}, ${createdAt}, ${updatedAt}
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      nameEn = excluded.nameEn,
      courtesy = excluded.courtesy,
      dynasty = excluded.dynasty,
      period = excluded.period,
      gender = excluded.gender,
      birthYear = excluded.birthYear,
      birthMonth = excluded.birthMonth,
      deathYear = excluded.deathYear,
      deathMonth = excluded.deathMonth,
      birthplace = excluded.birthplace,
      biography = excluded.biography,
      roles = excluded.roles,
      aliases = excluded.aliases,
      achievements = excluded.achievements,
      works = excluded.works,
      events = excluded.events,
      evaluations = excluded.evaluations,
      portraitUrl = excluded.portraitUrl,
      sources = excluded.sources,
      confidence = excluded.confidence,
      updatedAt = excluded.updatedAt
  `);
}

async function main() {
  console.log(`▶ 从 ${DATA_DIR} 加载 seed 数据`);

  // 1) 顶层表(无 FK)
  await upsertAll('dynasties', loadJson('dynasties'), (r) =>
    prisma.dynasty.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  await upsertAll(
    'philosophical_schools',
    loadJson('philosophical_schools'),
    (r) =>
      prisma.philosophicalSchool.upsert({
        where: { id: r.id },
        create: {
          ...r,
          createdAt: toDate(r.createdAt),
          updatedAt: toDate(r.updatedAt),
        } as never,
        update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
      }),
  );

  await upsertAll('persons', loadJson('persons'), upsertPerson);

  await upsertAll('events', loadJson('events'), (r) =>
    prisma.event.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  await upsertAll('sanguo_figures', loadJson('sanguo_figures'), (r) =>
    prisma.sanguoFigure.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  await upsertAll('mythologies', loadJson('mythologies'), (r) =>
    prisma.mythology.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  await upsertAll('religion_nodes', loadJson('religion_nodes'), (r) =>
    prisma.religionNode.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  // 2) 依赖 dynasty
  await upsertAll('emperors', loadJson('emperors'), (r) =>
    prisma.emperor.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  await upsertAll('tang_figures', loadJson('tang_figures'), (r) =>
    prisma.tangFigure.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  await upsertAll('song_figures', loadJson('song_figures'), (r) =>
    prisma.songFigure.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  await upsertAll('yuan_figures', loadJson('yuan_figures'), (r) =>
    prisma.yuanFigure.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  await upsertAll('ming_figures', loadJson('ming_figures'), (r) =>
    prisma.mingFigure.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  await upsertAll('qing_rulers', loadJson('qing_rulers'), (r) =>
    prisma.qingRuler.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  // 3) 依赖 philosophical_school
  await upsertAll('scholars', loadJson('scholars'), (r) =>
    prisma.scholar.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  // 4) 依赖 religion_node
  await upsertAll('religion_edges', loadJson('religion_edges'), (r) =>
    prisma.religionEdge.upsert({
      where: { id: r.id },
      create: {
        ...r,
        createdAt: toDate(r.createdAt),
        updatedAt: toDate(r.updatedAt),
      } as never,
      update: { ...r, createdAt: undefined, updatedAt: undefined } as never,
    }),
  );

  console.log('✓ Seed 完成');
}

main()
  .catch((e) => {
    console.error('✗ Seed 失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
