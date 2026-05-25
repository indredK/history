import { Test, type TestingModule } from '@nestjs/testing';
import { FigureBaseService } from './figure-base.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 暴露 protected 方法做测试用的子类
 */
class TestableFigureBase extends FigureBaseService {
  public _transform<T>(figure: unknown): T {
    return this.transformFigure<T>(figure);
  }
  public _parse(value: unknown): unknown {
    return this.parseJson(value);
  }
}

/**
 * FigureBaseService 单元测试 (§1.6)
 *
 * tang/song/yuan/ming/qing/sanguo 6 个 figure 服务都继承自这个基类,
 * 它的 JSON 字段解析逻辑必须健壮(string→obj、非法 JSON 兜底、null/空值)。
 */
describe('FigureBaseService', () => {
  let service: TestableFigureBase;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [TestableFigureBase, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = moduleRef.get<TestableFigureBase>(TestableFigureBase);
  });

  describe('parseJson', () => {
    it('null / undefined / 空字符串 → null', () => {
      expect(service._parse(null)).toBeNull();
      expect(service._parse(undefined)).toBeNull();
      expect(service._parse('')).toBeNull();
    });

    it('合法 JSON 字符串 → 解析后的对象', () => {
      expect(service._parse('["a","b"]')).toEqual(['a', 'b']);
      expect(service._parse('{"k":1}')).toEqual({ k: 1 });
      expect(service._parse('"plain"')).toBe('plain');
    });

    it('非法 JSON 字符串 → 原样返回(不抛错)', () => {
      expect(service._parse('not json')).toBe('not json');
      expect(service._parse('{invalid}')).toBe('{invalid}');
    });

    it('已经是对象 / 数组的输入 → 直接返回(不二次解析)', () => {
      const arr = ['a', 'b'];
      const obj = { k: 1 };
      expect(service._parse(arr)).toBe(arr);
      expect(service._parse(obj)).toBe(obj);
    });

    it('数字 / 布尔输入 → 原样返回', () => {
      expect(service._parse(42)).toBe(42);
      expect(service._parse(true)).toBe(true);
    });
  });

  describe('transformFigure', () => {
    it('保留非 JSON 字段,只解析白名单 9 个 JSON 字段', () => {
      const result = service._transform<Record<string, unknown>>({
        id: 'libai',
        name: '李白',
        birthYear: 701,
        achievements: '["诗仙"]',
        positions: '["翰林"]',
        events: '[]',
        evaluations: '["流芳千古"]',
        sources: '["唐书"]',
        works: '["将进酒"]',
        battles: null,
        policies: null,
        majorEvents: null,
      });

      expect(result.id).toBe('libai');
      expect(result.name).toBe('李白');
      expect(result.birthYear).toBe(701);
      expect(result.achievements).toEqual(['诗仙']);
      expect(result.positions).toEqual(['翰林']);
      expect(result.events).toEqual([]);
      expect(result.evaluations).toEqual(['流芳千古']);
      expect(result.sources).toEqual(['唐书']);
      expect(result.works).toEqual(['将进酒']);
      // battles/policies/majorEvents = null → 仍然 null
      expect(result.battles).toBeNull();
      expect(result.policies).toBeNull();
      expect(result.majorEvents).toBeNull();
    });

    it('falsy 输入(null / undefined)→ 空对象', () => {
      expect(service._transform(null)).toEqual({});
      expect(service._transform(undefined)).toEqual({});
    });

    it('白名单字段缺失时,parseJson(undefined) → null(不会抛错)', () => {
      const result = service._transform<Record<string, unknown>>({
        id: 'x',
        name: 'x',
      });

      // 所有 9 个白名单字段都被显式加成 null
      expect(result.achievements).toBeNull();
      expect(result.positions).toBeNull();
      expect(result.events).toBeNull();
      expect(result.evaluations).toBeNull();
      expect(result.sources).toBeNull();
      expect(result.works).toBeNull();
      expect(result.battles).toBeNull();
      expect(result.policies).toBeNull();
      expect(result.majorEvents).toBeNull();
    });

    it('非法 JSON 字段不会污染整体返回,其它字段照常给出', () => {
      const result = service._transform<Record<string, unknown>>({
        id: 'x',
        name: 'x',
        achievements: 'invalid-json',
        positions: '["有效"]',
      });

      // achievements 走 catch 分支保留原字符串
      expect(result.achievements).toBe('invalid-json');
      expect(result.positions).toEqual(['有效']);
    });
  });
});
