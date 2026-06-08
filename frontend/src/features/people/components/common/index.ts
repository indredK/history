/**
 * 共享组件导出
 */

export { GridSkeleton } from './GridSkeleton';
export { PeopleFilter } from './PeopleFilter';
export { PeopleCollectionContent } from './PeopleCollectionContent';
export { FigureGrid } from './FigureGrid';
export { DynastyFigureCard } from './DynastyFigureCard';
export {
  BaseFigureDetailModal,
  calculateAge,
  formatHistoricalYear,
  formatLifespan,
  formatLifespanWithAge,
} from './BaseFigureDetailModal';
export { useFigureCollection } from './useFigureCollection';
export type { DynastyFigureData, ThemeColor } from './BaseFigureDetailModal';
export type {
  FilterOption,
  FilterConfig,
  SortOption,
  FigureCollectionOptions,
  FigureCollectionStore,
} from './useFigureCollection';
