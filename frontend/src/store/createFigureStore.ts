/**
 * 通用人物 store 工厂(§2.1 起步)
 *
 * tang / song / yuan / ming / sanguo 五个朝代的人物 store 字段、action 完全一致,
 * 只是泛型类型与默认选项不同。本工厂抽掉重复,保留每个朝代的对外 hook 名,
 * 并不改动 TangContent / SongContent / YuanContent / MingContent 的解构方式。
 *
 * 通过 filterField 配置支持自定义筛选字段名:
 * - 默认 'period'，用于 tang/song/yuan/ming
 * - 'kingdom'，用于 sanguo
 */

import { create, type UseBoundStore, type StoreApi } from 'zustand';

export interface FigureFilters<TRole extends string, TSortBy extends string> {
  role: TRole | '全部';
  /** 筛选字段，默认 'period'，三国使用 'kingdom' */
  period: string;
  kingdom: string;
  searchQuery: string;
  sortBy: TSortBy;
}

export interface FigureStoreState<
  TFigure,
  TRole extends string,
  TSortBy extends string,
> {
  figures: TFigure[];
  selectedFigure: TFigure | null;
  loading: boolean;
  error: Error | null;
  filters: FigureFilters<TRole, TSortBy>;
  setFigures: (figures: TFigure[]) => void;
  setSelectedFigure: (figure: TFigure | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setRoleFilter: (role: TRole | '全部') => void;
  setPeriodFilter: (period: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: TSortBy) => void;
  getFilteredFigures: () => TFigure[];
  getRoleOptions: () => string[];
  getPeriodOptions: () => string[];
}

interface FigureFilterAndSortInput<TRole extends string, TSortBy extends string> {
  role?: TRole | '全部';
  period?: string;
  query?: string;
  sortBy?: TSortBy;
}

export interface FigureServiceLike<
  TFigure,
  TRole extends string,
  TSortBy extends string,
> {
  filterAndSort: (
    figures: TFigure[],
    options: FigureFilterAndSortInput<TRole, TSortBy>,
  ) => TFigure[];
}

export interface CreateFigureStoreOptions<
  TFigure,
  TRole extends string,
  TSortBy extends string,
> {
  service: FigureServiceLike<TFigure, TRole, TSortBy>;
  roleOptions: string[];
  periodOptions: string[];
  defaultSortBy: TSortBy;
  /** 自定义筛选字段名，默认 'period'。三国使用 'kingdom' */
  filterField?: string;
}

export function createFigureStore<
  TFigure,
  TRole extends string,
  TSortBy extends string,
>(
  options: CreateFigureStoreOptions<TFigure, TRole, TSortBy>,
): UseBoundStore<StoreApi<FigureStoreState<TFigure, TRole, TSortBy>>> {
  const filterField = options.filterField ?? 'period';

  return create<FigureStoreState<TFigure, TRole, TSortBy>>((set, get) => ({
    figures: [],
    selectedFigure: null,
    loading: false,
    error: null,
    filters: {
      role: '全部',
      period: filterField === 'period' ? '全部' : '',
      kingdom: filterField === 'kingdom' ? '全部' : '',
      searchQuery: '',
      sortBy: options.defaultSortBy,
    },

    setFigures: (figures) => set({ figures }),
    setSelectedFigure: (figure) => set({ selectedFigure: figure }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setRoleFilter: (role) =>
      set((state) => ({ filters: { ...state.filters, role } })),
    setPeriodFilter: (period) =>
      set((state) => ({ filters: { ...state.filters, [filterField]: period } })),
    setSearchQuery: (query) =>
      set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
    setSortBy: (sortBy) =>
      set((state) => ({ filters: { ...state.filters, sortBy } })),

    getFilteredFigures: () => {
      const { figures, filters } = get();
      const opts: FigureFilterAndSortInput<TRole, TSortBy> = {};
      if (filters.role) opts.role = filters.role;
      const filterVal = filters[filterField as keyof typeof filters] as string;
      if (filterVal) opts.period = filterVal;
      if (filters.searchQuery) opts.query = filters.searchQuery;
      if (filters.sortBy) opts.sortBy = filters.sortBy;
      return options.service.filterAndSort(figures, opts);
    },

    getRoleOptions: () => options.roleOptions,
    getPeriodOptions: () => options.periodOptions,
  }));
}
