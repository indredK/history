/**
 * 朝代甘特图 - 数据转换
 *
 * 把扁平的 time.json（polity / ruler / era 三类时间区间块）转换为
 * ECharts custom series 所需的数据模型。
 *
 * time.json 形态：
 *  - polity 条目 = 一个政权的整体区间，title 为政权名（63 个唯一），作为甘特图的一行泳道。
 *  - ruler / era 条目 = 该政权下的君主 / 年号区间，subtitle 字段指向所属政权名。
 */

/** time.json 原始条目 */
export interface TimeBlock {
  id: string;
  type: 'polity' | 'ruler' | 'era';
  title: string;
  startYear: number;
  endYear: number;
  /** polity 固定为 "政权区间"；ruler / era 为所属政权名 */
  subtitle: string;
}

/** 喂给 custom series 的一条数据：value = [起始年, 结束年, 行号] */
export interface GanttDatum {
  value: [number, number, number];
  blockType: TimeBlock['type'];
  title: string;
  /** 所属政权名（用于取色 / tooltip） */
  rowName: string;
}

export interface GanttModel {
  /** 63 个政权名，按起始年升序（秦在最前 → 显示在最上） */
  categories: string[];
  /** 政权整体区间（每行一条底色带） */
  polityData: GanttDatum[];
  /** 君主区间（行内上半轨） */
  rulerData: GanttDatum[];
  /** 年号区间（行内下半轨） */
  eraData: GanttDatum[];
  /** 整体年份范围 [最小起始年, 最大结束年] */
  bounds: [number, number];
}

export function buildGanttModel(blocks: TimeBlock[]): GanttModel {
  const validBlocks = blocks.filter(
    (block) => block.startYear !== 0 && block.endYear !== 0 && block.endYear >= block.startYear,
  );

  // 1. 政权按起始年升序 → 行顺序（秦最先）
  const polities = validBlocks
    .filter((b) => b.type === 'polity')
    .sort((a, b) => a.startYear - b.startYear);

  const categories = polities.map((p) => p.title);

  // title → 行号。已确认 polity.title 无重复，安全。
  const indexByName = new Map<string, number>();
  categories.forEach((name, i) => indexByName.set(name, i));

  const polityData: GanttDatum[] = polities.map((p, i) => ({
    value: [p.startYear, p.endYear, i],
    blockType: 'polity',
    title: p.title,
    rowName: p.title,
  }));

  const rulerData: GanttDatum[] = [];
  const eraData: GanttDatum[] = [];
  let min = Infinity;
  let max = -Infinity;

  for (const b of validBlocks) {
    if (b.startYear < min) min = b.startYear;
    if (b.endYear > max) max = b.endYear;

    if (b.type === 'polity') continue;

    const yIndex = indexByName.get(b.subtitle);
    if (yIndex === undefined) continue; // 孤儿块（已验证为 0，严格模式下仍需判空）

    const datum: GanttDatum = {
      value: [b.startYear, b.endYear, yIndex],
      blockType: b.type,
      title: b.title,
      rowName: b.subtitle,
    };
    if (b.type === 'ruler') {
      rulerData.push(datum);
    } else {
      eraData.push(datum);
    }
  }

  // 兜底：blocks 为空时给出非 0 合法范围，避免 Infinity 传入 ECharts
  const bounds: [number, number] =
    min === Infinity || max === -Infinity ? [-3000, new Date().getFullYear()] : [min, max];

  return { categories, polityData, rulerData, eraData, bounds };
}
