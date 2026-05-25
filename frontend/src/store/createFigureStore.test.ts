/**
 * createFigureStore 工厂用例:
 * - tang/song/yuan/ming 4 个 store 字段、action 完全一致(只是泛型不同),
 *   工厂保证它们都按相同语义工作。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFigureStore, type FigureServiceLike } from './createFigureStore';

type Figure = { name: string; role: Role };
type Role = 'emperor' | 'official' | 'other';
type SortBy = 'name' | 'role';

function makeStore(serviceOverrides: Partial<FigureServiceLike<Figure, Role, SortBy>> = {}) {
  const filterAndSort = vi.fn((figs: Figure[]) => figs);
  const service = { filterAndSort, ...serviceOverrides } as FigureServiceLike<
    Figure,
    Role,
    SortBy
  >;

  const useStore = createFigureStore<Figure, Role, SortBy>({
    service,
    roleOptions: ['全部', 'emperor', 'official', 'other'],
    periodOptions: ['全部', '初期', '中期', '末期'],
    defaultSortBy: 'name',
  });
  return { useStore, filterAndSort };
}

describe('createFigureStore', () => {
  let useStore: ReturnType<typeof makeStore>['useStore'];
  let filterAndSort: ReturnType<typeof makeStore>['filterAndSort'];

  beforeEach(() => {
    ({ useStore, filterAndSort } = makeStore());
  });

  it('初始 state 默认值正确', () => {
    const s = useStore.getState();
    expect(s.figures).toEqual([]);
    expect(s.selectedFigure).toBeNull();
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
    expect(s.filters).toEqual({
      role: '全部',
      period: '全部',
      searchQuery: '',
      sortBy: 'name',
    });
  });

  it('setFigures / setSelectedFigure / setLoading / setError 写入正确', () => {
    const fig: Figure = { name: '李白', role: 'other' };
    useStore.getState().setFigures([fig]);
    expect(useStore.getState().figures).toEqual([fig]);

    useStore.getState().setSelectedFigure(fig);
    expect(useStore.getState().selectedFigure).toEqual(fig);

    useStore.getState().setLoading(true);
    expect(useStore.getState().loading).toBe(true);

    const err = new Error('boom');
    useStore.getState().setError(err);
    expect(useStore.getState().error).toBe(err);
  });

  it('setRoleFilter / setPeriodFilter / setSearchQuery / setSortBy 只改 filters 子字段', () => {
    useStore.getState().setRoleFilter('emperor');
    useStore.getState().setPeriodFilter('中期');
    useStore.getState().setSearchQuery('白');
    useStore.getState().setSortBy('role');

    expect(useStore.getState().filters).toEqual({
      role: 'emperor',
      period: '中期',
      searchQuery: '白',
      sortBy: 'role',
    });
  });

  it('getFilteredFigures 把当前 filters 透传给 service.filterAndSort', () => {
    const figs: Figure[] = [
      { name: '李白', role: 'other' },
      { name: '杜甫', role: 'official' },
    ];
    useStore.getState().setFigures(figs);
    useStore.getState().setRoleFilter('official');
    useStore.getState().setPeriodFilter('中期');
    useStore.getState().setSearchQuery('杜');
    useStore.getState().setSortBy('role');

    useStore.getState().getFilteredFigures();
    expect(filterAndSort).toHaveBeenCalledWith(figs, {
      role: 'official',
      period: '中期',
      query: '杜',
      sortBy: 'role',
    });
  });

  it('getRoleOptions / getPeriodOptions 返回配置传入的数组', () => {
    expect(useStore.getState().getRoleOptions()).toEqual([
      '全部',
      'emperor',
      'official',
      'other',
    ]);
    expect(useStore.getState().getPeriodOptions()).toEqual([
      '全部',
      '初期',
      '中期',
      '末期',
    ]);
  });

  it('两个工厂实例彼此独立(state 不共享)', () => {
    const { useStore: useA } = makeStore();
    const { useStore: useB } = makeStore();
    useA.getState().setLoading(true);
    expect(useA.getState().loading).toBe(true);
    expect(useB.getState().loading).toBe(false);
  });
});
