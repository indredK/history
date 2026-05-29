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

export interface FigureFilters<TRole extends string, TSortBy extends string, TFilterField extends string = 'period'> {
  role: TRole | '全部';
  /** 筛选字段，默认 'period'，三国使用 'kingdom' */
  [K in TFilterField]: string;
  searchQuery: string;
  sortBy: TSortBy;
}

export interface FigureStoreState<
  TFigure,
  TRole extends string,
  TSortBy extends string,
  TFilterField extends string = 'period',
> {
  figures: TFigure[];
  selectedFigure: TFigure | null;
  loading: boolean;
  error: Error | null;
  filters: FigureFilters<TRole, TSortBy, TFilterField>;
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
      [filterField]: '全部',
      searchQuery: '',
      sortBy: options.defaultSortBy,
    } as FigureStoreState<TFigure, TRole, TSortBy>['filters'],

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
      return options.service.filterAndSort(figures, {
        role: filters.role,
        period: filters[filterField as keyof typeof filters] as string,
        query: filters.searchQuery,
        sortBy: filters.sortBy,
      });
    },

    getRoleOptions: () => options.roleOptions,
    getPeriodOptions: () => options.periodOptions,
  }));
}
