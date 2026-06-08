/**
 * 人物数据服务工厂
 * 封装各朝代 Service 中重复的过滤/搜索/排序/格式化逻辑
 */

export interface FigureBase {
  name: string;
  courtesy?: string;
  birthYear?: number | null;
  deathYear?: number | null;
  positions: string[];
  faction?: string;
  role: string;
}

export interface FigureServiceHelperConfig<T extends FigureBase, TRole extends string, TSortBy extends string> {
  /** 角色标签映射 */
  roleLabels: Record<TRole, string>;
  /** 按出生年获取时期标签的函数（用于 filterByPeriod） */
  getPeriod: (birthYear: number) => string;
  /** 角色排序优先级 */
  roleOrder: Record<TRole, number>;
  /** 搜索时额外的可搜索字段（默认搜索 name, courtesy, positions, faction） */
  extraSearchFields?: Array<(figure: T) => string | undefined>;
  /** 额外的排序策略 */
  extraSortStrategies?: Partial<Record<TSortBy, (a: T, b: T) => number>>;
}

export interface FigureServiceHelper<T extends FigureBase, TRole extends string, TSortBy extends string> {
  filterByRole(figures: T[], role: TRole | '全部'): T[];
  filterByPeriod(figures: T[], period: string): T[];
  filterByFaction(figures: T[], faction: string): T[];
  searchFigures(figures: T[], query: string): T[];
  sortFigures(figures: T[], sortBy: TSortBy): T[];
  filterAndSort(
    figures: T[],
    options: {
      role?: TRole | '全部';
      period?: string;
      faction?: string;
      query?: string;
      sortBy?: TSortBy;
    }
  ): T[];
  getRoleLabel(role: TRole): string;
  formatLifespan(figure: T): string;
  calculateAge(figure: T): number;
}

export function createFigureServiceHelper<
  T extends FigureBase,
  TRole extends string,
  TSortBy extends string
>(config: FigureServiceHelperConfig<T, TRole, TSortBy>): FigureServiceHelper<T, TRole, TSortBy> {
  const { roleLabels, getPeriod, roleOrder, extraSearchFields, extraSortStrategies } = config;

  return {
    filterByRole(figures: T[], role: TRole | '全部'): T[] {
      if (role === '全部' || !role) return figures;
      return figures.filter(f => f.role === role);
    },

    filterByPeriod(figures: T[], period: string): T[] {
      if (period === '全部' || !period) return figures;
      return figures.filter(f => isKnownHistoricalYear(f.birthYear) && getPeriod(f.birthYear) === period);
    },

    filterByFaction(figures: T[], faction: string): T[] {
      if (faction === '全部' || !faction) return figures;
      return figures.filter(f => f.faction === faction);
    },

    searchFigures(figures: T[], query: string): T[] {
      if (!query || query.trim() === '') return figures;
      const lowerQuery = query.toLowerCase().trim();
      return figures.filter(figure => {
        if (figure.name.toLowerCase().includes(lowerQuery)) return true;
        if (figure.courtesy?.toLowerCase().includes(lowerQuery)) return true;
        if (figure.positions.some(p => p.toLowerCase().includes(lowerQuery))) return true;
        if (figure.faction?.toLowerCase().includes(lowerQuery)) return true;
        if (extraSearchFields) {
          for (const getField of extraSearchFields) {
            const value = getField(figure);
            if (value?.toLowerCase().includes(lowerQuery)) return true;
          }
        }
        return false;
      });
    },

    sortFigures(figures: T[], sortBy: TSortBy): T[] {
      const sorted = [...figures];

      // 检查额外排序策略
      if (extraSortStrategies && sortBy in extraSortStrategies) {
        const strategy = extraSortStrategies[sortBy];
        if (strategy) return sorted.sort(strategy as (a: T, b: T) => number);
      }

      switch (sortBy as string) {
        case 'birthYear':
          return sorted.sort((a, b) => getSortableYear(a.birthYear) - getSortableYear(b.birthYear));
        case 'name':
          return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
        case 'role':
          return sorted.sort((a, b) => {
            const orderDiff = (roleOrder[a.role as TRole] ?? 99) - (roleOrder[b.role as TRole] ?? 99);
            if (orderDiff !== 0) return orderDiff;
            return getSortableYear(a.birthYear) - getSortableYear(b.birthYear);
          });
        default:
          return sorted;
      }
    },

    filterAndSort(
      figures: T[],
      options: {
        role?: TRole | '全部';
        period?: string;
        faction?: string;
        query?: string;
        sortBy?: TSortBy;
      }
    ): T[] {
      let result = figures;
      if (options.role) result = this.filterByRole(result, options.role);
      if (options.period) result = this.filterByPeriod(result, options.period);
      if (options.faction) result = this.filterByFaction(result, options.faction);
      if (options.query) result = this.searchFigures(result, options.query);
      if (options.sortBy) result = this.sortFigures(result, options.sortBy);
      return result;
    },

    getRoleLabel(role: TRole): string {
      return roleLabels[role] || '其他';
    },

    formatLifespan(figure: T): string {
      const birthKnown = isKnownHistoricalYear(figure.birthYear);
      const deathKnown = isKnownHistoricalYear(figure.deathYear);
      if (!birthKnown && !deathKnown) return '生卒不详';
      const birthYear = birthKnown ? formatHistoricalYear(figure.birthYear) : '生年不详';
      const deathYear = deathKnown ? formatHistoricalYear(figure.deathYear) : '卒年不详';
      return `${birthYear} - ${deathYear}`;
    },

    calculateAge(figure: T): number {
      if (!isKnownHistoricalYear(figure.birthYear) || !isKnownHistoricalYear(figure.deathYear)) {
        return 0;
      }
      if (figure.deathYear < figure.birthYear) return 0;
      return figure.deathYear - figure.birthYear;
    },
  };
}

function isKnownHistoricalYear(year: number | null | undefined): year is number {
  return typeof year === 'number' && Number.isFinite(year) && year !== 0;
}

function formatHistoricalYear(year: number): string {
  return year < 0 ? `公元前${Math.abs(year)}年` : `${year}年`;
}

function getSortableYear(year: number | null | undefined): number {
  return isKnownHistoricalYear(year) ? year : Number.POSITIVE_INFINITY;
}
