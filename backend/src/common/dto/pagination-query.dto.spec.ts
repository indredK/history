import { PaginationQueryDto } from './pagination-query.dto';

/**
 * PaginationQueryDto 单元测试 (§1.6)
 *
 * 所有列表 query DTO 的父类,提供 page/limit 默认值 + skip/take getter。
 *
 * 覆盖目标:
 * - 默认值在不设置时正确(page=1, limit=20)
 * - skip getter: (page - 1) * limit 的计算
 * - skip getter: page/limit 显式设为 undefined 时回落到默认 (?? 1, ?? 20)
 * - take getter: 等同 limit,limit=undefined 时回落 20
 */
describe('PaginationQueryDto', () => {
  describe('默认值', () => {
    it('未设置时 page=1, limit=20', () => {
      const dto = new PaginationQueryDto();
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(20);
    });

    it('默认 skip=0,take=20', () => {
      const dto = new PaginationQueryDto();
      expect(dto.skip).toBe(0);
      expect(dto.take).toBe(20);
    });
  });

  describe('skip getter', () => {
    it('page=1 limit=20 → skip=0', () => {
      const dto = new PaginationQueryDto();
      dto.page = 1;
      dto.limit = 20;
      expect(dto.skip).toBe(0);
    });

    it('page=2 limit=20 → skip=20', () => {
      const dto = new PaginationQueryDto();
      dto.page = 2;
      dto.limit = 20;
      expect(dto.skip).toBe(20);
    });

    it('page=5 limit=10 → skip=40', () => {
      const dto = new PaginationQueryDto();
      dto.page = 5;
      dto.limit = 10;
      expect(dto.skip).toBe(40);
    });

    it('page=undefined 回落 1,limit=undefined 回落 20 → skip=0', () => {
      const dto = new PaginationQueryDto();
      dto.page = undefined;
      dto.limit = undefined;
      expect(dto.skip).toBe(0);
    });

    it('只 page 显式 undefined,limit=50 → skip=0', () => {
      const dto = new PaginationQueryDto();
      dto.page = undefined;
      dto.limit = 50;
      expect(dto.skip).toBe(0);
    });

    it('page=3 limit=undefined → skip=(3-1)*20=40', () => {
      const dto = new PaginationQueryDto();
      dto.page = 3;
      dto.limit = undefined;
      expect(dto.skip).toBe(40);
    });
  });

  describe('take getter', () => {
    it('limit=10 → take=10', () => {
      const dto = new PaginationQueryDto();
      dto.limit = 10;
      expect(dto.take).toBe(10);
    });

    it('limit=undefined → take=20', () => {
      const dto = new PaginationQueryDto();
      dto.limit = undefined;
      expect(dto.take).toBe(20);
    });

    it('limit=100(最大允许值)→ take=100', () => {
      const dto = new PaginationQueryDto();
      dto.limit = 100;
      expect(dto.take).toBe(100);
    });
  });
});
