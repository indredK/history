import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 历史人物原始记录的最小约定:
 * - JSON 字段在 Prisma 层全部以 `string | null` 落库;
 * - 各朝代模型可能拥有这里的全部或部分字段;
 * - transformFigure 把 string 反序列化成结构化对象。
 *
 * 用 unknown(而非 any)防止任意成员访问污染调用方。
 */
export interface FigureJsonRecord {
  achievements?: unknown;
  positions?: unknown;
  events?: unknown;
  evaluations?: unknown;
  sources?: unknown;
  works?: unknown;
  battles?: unknown;
  policies?: unknown;
  majorEvents?: unknown;
  [key: string]: unknown;
}

@Injectable()
export class FigureBaseService {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * 统一转换人物数据，处理 JSON 字段
   *
   * 接受 unknown,运行时 null/undefined 直接返回空对象,
   * 其他形状统一进入 JSON 字段反序列化分支。
   */
  protected transformFigure<T>(figure: unknown): T {
    if (!figure || typeof figure !== 'object') return {} as T;

    const source = figure as FigureJsonRecord;

    return {
      ...source,
      achievements: this.parseJson(source.achievements),
      positions: this.parseJson(source.positions),
      events: this.parseJson(source.events),
      evaluations: this.parseJson(source.evaluations),
      sources: this.parseJson(source.sources),
      works: this.parseJson(source.works),
      battles: this.parseJson(source.battles),
      policies: this.parseJson(source.policies),
      majorEvents: this.parseJson(source.majorEvents),
    } as T;
  }

  /**
   * 把可能是 JSON 字符串的字段安全反序列化:
   * - 空值 → null
   * - 字符串 → 尝试 JSON.parse,失败回退到原字符串
   * - 其他类型(对象/数组等)直接透传
   */
  protected parseJson(value: unknown): unknown {
    if (!value) return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        return value;
      }
    }
    return value;
  }
}
