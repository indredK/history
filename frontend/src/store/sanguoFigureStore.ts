/**
 * 三国人物状态管理Store
 * 基于 createFigureStore 工厂创建，使用 filterField: 'kingdom'
 */

import type { SanguoFigure, SanguoFigureRole, SanguoKingdom } from '@/services/person/sanguo/types';
import { sanguoFigureService, type SanguoFigureSortBy } from '@/services/person/sanguo';
import { createFigureStore, type FigureServiceLike } from './createFigureStore';

/**
 * 适配器：将工厂的 period 参数映射为 sanguo 的 kingdom 参数
 */
const sanguoServiceAdapter: FigureServiceLike<SanguoFigure, SanguoFigureRole, SanguoFigureSortBy> = {
  filterAndSort(figures, options) {
    const input: { role?: SanguoFigureRole | '全部'; kingdom?: SanguoKingdom | '全部'; query?: string; sortBy?: SanguoFigureSortBy } = {};
    if (options.role) input.role = options.role;
    if (options.period) input.kingdom = options.period as SanguoKingdom | '全部';
    if (options.query) input.query = options.query;
    if (options.sortBy) input.sortBy = options.sortBy;
    return sanguoFigureService.filterAndSort(figures, input);
  },
};

// 使用工厂创建底层 store
const _useBase = createFigureStore<SanguoFigure, SanguoFigureRole, SanguoFigureSortBy>({
  service: sanguoServiceAdapter,
  roleOptions: ['全部', 'ruler', 'strategist', 'general', 'advisor', 'official', 'other'],
  periodOptions: ['全部', '魏', '蜀', '吴', '其他'],
  defaultSortBy: 'kingdom',
  filterField: 'kingdom',
});

/**
 * 三国人物 store hook
 * 包装工厂 store，将 setPeriodFilter / getPeriodOptions 别名为 setKingdomFilter / getKingdomOptions，
 * 保持对外接口不变。
 */
export const useSanguoFigureStore = () => {
  const store = _useBase();
  return {
    ...store,
    setKingdomFilter: store.setPeriodFilter,
    getKingdomOptions: store.getPeriodOptions,
  };
};
