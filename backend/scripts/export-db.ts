/**
 * 一次性脚本:把 backend/prisma/dev.db 中的数据导出为 JSON,
 * 放到 backend/prisma/seed-data/<table>.json,作为新 seed 入口的数据源。
 *
 * 用法:
 *   cd backend && bun run scripts/export-db.ts
 *
 * 注意:
 * - 早期 seed 把 JSON 字段做了二次 JSON.stringify(prisma 又会再 stringify 一次),
 *   所以 SQLite 里很多 JSON 列是"被多次转义的字符串"。本脚本逐层 unwrap,
 *   保证导出的 JSON 是干净的对象/数组结构。
 * - 表名沿用 schema.prisma 的 @@map 物理名;FK 关系不在这里处理,由 seed.ts
 *   按依赖顺序写入即可。
 * - 仅导出当前 dev.db 有数据的 16 张表;空表(EventLocation / EventParticipant /
 *   EventSource / PersonSource / PlaceSource / sources / places)直接跳过。
 */
import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DB_PATH = join(__dirname, '..', 'prisma', 'dev.db');
const OUT_DIR = join(__dirname, '..', 'prisma', 'seed-data');

if (!existsSync(DB_PATH)) {
  console.error(`✗ dev.db 不存在: ${DB_PATH}`);
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });

/** 已知的 JSON 列 — 来自 schema.prisma 中标 `Json?` 的字段。 */
const JSON_COLUMNS: Record<string, string[]> = {
  emperors: ['eraNames', 'achievements', 'historicalEvaluation'],
  scholars: ['majorWorks', 'contributions'],
  philosophical_schools: ['coreBeliefs', 'keyTexts'],
  tang_figures: [
    'positions',
    'achievements',
    'works',
    'events',
    'evaluations',
    'sources',
  ],
  song_figures: [
    'positions',
    'achievements',
    'works',
    'events',
    'evaluations',
    'sources',
  ],
  yuan_figures: [
    'positions',
    'achievements',
    'works',
    'events',
    'evaluations',
    'sources',
  ],
  ming_figures: [
    'positions',
    'achievements',
    'works',
    'events',
    'evaluations',
    'sources',
  ],
  qing_rulers: [
    'positions',
    'achievements',
    'policies',
    'majorEvents',
    'events',
    'evaluations',
    'sources',
  ],
  sanguo_figures: [
    'positions',
    'achievements',
    'battles',
    'events',
    'evaluations',
    'sources',
  ],
  mythologies: ['stories', 'symbolism'],
};

/**
 * 逐层 unwrap:
 * - null / 空字符串 → null
 * - 字符串看起来像 JSON 就 parse;如果 parse 出来还是字符串,再 parse 一次
 *   (兼容历史上"双重 stringify"的列)
 * - 最多 unwrap 3 层,防御性
 */
function unwrapJson(raw: unknown): unknown {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'string') return raw;
  if (raw.length === 0) return null;

  let current: unknown = raw;
  for (let i = 0; i < 3; i++) {
    if (typeof current !== 'string') break;
    const s = current.trim();
    // 不像 JSON 就停下
    if (!s.startsWith('{') && !s.startsWith('[') && !s.startsWith('"')) {
      break;
    }
    try {
      current = JSON.parse(s);
    } catch {
      // 解不开就保留当前层
      break;
    }
  }
  return current;
}

interface Row {
  [key: string]: unknown;
}

function exportTable(db: Database, tableName: string): number {
  const rows = db.query(`SELECT * FROM "${tableName}"`).all() as Row[];
  const jsonCols = JSON_COLUMNS[tableName] ?? [];
  const cleaned = rows.map((row) => {
    const out: Row = { ...row };
    for (const col of jsonCols) {
      if (col in out) {
        out[col] = unwrapJson(out[col]);
      }
    }
    return out;
  });
  const outPath = join(OUT_DIR, `${tableName}.json`);
  writeFileSync(outPath, JSON.stringify(cleaned, null, 2) + '\n', 'utf-8');
  return rows.length;
}

const TABLES_IN_ORDER = [
  // 顶层无外键依赖
  'dynasties',
  'philosophical_schools',
  'persons',
  'events',
  'sanguo_figures',
  'mythologies',
  'religion_nodes',
  // 依赖 dynasty
  'emperors',
  'tang_figures',
  'song_figures',
  'yuan_figures',
  'ming_figures',
  'qing_rulers',
  // 依赖 philosophical_school
  'scholars',
  // 依赖 religion_node
  'religion_edges',
];

function main() {
  const db = new Database(DB_PATH, { readonly: true });
  console.log(`▶ 从 ${DB_PATH} 导出 → ${OUT_DIR}`);

  let total = 0;
  for (const t of TABLES_IN_ORDER) {
    const n = exportTable(db, t);
    total += n;
    console.log(`  • ${t}: ${n} 行`);
  }
  db.close();
  console.log(`✓ 完成,共 ${total} 行,${TABLES_IN_ORDER.length} 张表`);
}

main();
