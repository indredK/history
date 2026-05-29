/**
 * 清朝统治者网格组件
 * Qing Ruler Grid Component
 *
 * 响应式网格布局
 *
 * Requirements: 4.1, 5.1, 5.2, 5.3
 */

import { FigureGrid } from '../common/FigureGrid';
import type { QingRuler } from '@/services/person/qing/types';
import { QingRulerCard } from './QingRulerCard';

interface QingRulerGridProps {
  rulers: QingRuler[];
  onRulerClick: (ruler: QingRuler) => void;
  loading?: boolean;
}

/**
 * 清朝统治者网格组件
 */
export function QingRulerGrid({
  rulers,
  onRulerClick,
  loading = false,
}: QingRulerGridProps) {
  return (
    <FigureGrid
      items={rulers}
      loading={loading}
      emptyTitle="暂无数据"
      emptySubtitle="没有找到符合条件的清朝统治者"
      renderCard={(ruler) => (
        <QingRulerCard ruler={ruler} onClick={() => onRulerClick(ruler)} />
      )}
      keyExtractor={(ruler) => ruler.id}
    />
  );
}

export default QingRulerGrid;
