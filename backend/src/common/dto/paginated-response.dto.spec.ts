import { PaginatedResponseDto } from './paginated-response.dto';

/**
 * PaginatedResponseDto 单元测试 (§1.6)
 *
 * 所有列表接口的统一分页包络。覆盖目标:
 * - meta.totalPages = ceil(total / limit) 的舍入边界
 * - hasNext / hasPrev 在首页 / 末页 / 中间页 / 仅 1 页的状态机
 * - total=0(空集)的边界行为
 * - data 数组原样保留(不复制不修改)
 */
describe('PaginatedResponseDto', () => {
  describe('meta.totalPages 取整', () => {
    it('total=20 limit=10 → 2 页(整除)', () => {
      const dto = new PaginatedResponseDto([], 20, 1, 10);
      expect(dto.meta.totalPages).toBe(2);
    });

    it('total=21 limit=10 → 3 页(向上取整)', () => {
      const dto = new PaginatedResponseDto([], 21, 1, 10);
      expect(dto.meta.totalPages).toBe(3);
    });

    it('total=1 limit=10 → 1 页', () => {
      const dto = new PaginatedResponseDto([], 1, 1, 10);
      expect(dto.meta.totalPages).toBe(1);
    });

    it('total=0 → 0 页(Math.ceil(0/N)=0)', () => {
      const dto = new PaginatedResponseDto([], 0, 1, 10);
      expect(dto.meta.totalPages).toBe(0);
    });
  });

  describe('hasNext / hasPrev 状态机', () => {
    it('首页(page=1),共 3 页 → hasPrev=false, hasNext=true', () => {
      const dto = new PaginatedResponseDto([], 25, 1, 10);
      expect(dto.meta.hasPrev).toBe(false);
      expect(dto.meta.hasNext).toBe(true);
    });

    it('中间页(page=2),共 3 页 → hasPrev=true, hasNext=true', () => {
      const dto = new PaginatedResponseDto([], 25, 2, 10);
      expect(dto.meta.hasPrev).toBe(true);
      expect(dto.meta.hasNext).toBe(true);
    });

    it('末页(page=3),共 3 页 → hasPrev=true, hasNext=false', () => {
      const dto = new PaginatedResponseDto([], 25, 3, 10);
      expect(dto.meta.hasPrev).toBe(true);
      expect(dto.meta.hasNext).toBe(false);
    });

    it('仅 1 页(page=1, total<=limit) → 双 false', () => {
      const dto = new PaginatedResponseDto([], 5, 1, 10);
      expect(dto.meta.hasPrev).toBe(false);
      expect(dto.meta.hasNext).toBe(false);
    });

    it('total=0 时 page=1 → 双 false(因 totalPages=0,1>0 但 hasNext: 1<0=false)', () => {
      const dto = new PaginatedResponseDto([], 0, 1, 10);
      expect(dto.meta.hasPrev).toBe(false);
      expect(dto.meta.hasNext).toBe(false);
    });
  });

  describe('data 数组', () => {
    it('原样保留,不复制不修改', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const dto = new PaginatedResponseDto(items, 2, 1, 10);
      expect(dto.data).toBe(items);
    });

    it('空数组也能正常构造', () => {
      const dto = new PaginatedResponseDto([], 0, 1, 10);
      expect(dto.data).toEqual([]);
      expect(dto.meta.total).toBe(0);
    });
  });

  describe('meta 完整字段', () => {
    it('包含全部 6 个字段', () => {
      const dto = new PaginatedResponseDto([], 100, 3, 25);
      expect(dto.meta).toEqual({
        page: 3,
        limit: 25,
        total: 100,
        totalPages: 4,
        hasNext: true,
        hasPrev: true,
      });
    });
  });
});
