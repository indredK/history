import { type CSSProperties } from 'react';
import { getOrbitNodeVisual } from './geometry';
import type { RadialMenuLayoutMetrics } from './geometry';
import type { RadialMenuItem } from './types';
import { createCx } from '@utils/cssModules';
import styles from './RadialMenu.module.scss';

const cx = createCx(styles);

interface RadialOrbitProps {
  visibleItems: Array<{ item: RadialMenuItem; globalIndex: number; offset: number }>;
  halfSpan: number;
  side: 'left' | 'right';
  resolvedAccent: string;
  activeItemId: string | undefined;
  ariaLabel: string;
  onSelect: (itemId: string) => void;
  layoutMetrics: RadialMenuLayoutMetrics;
}

/** 径向模式视图：节点沿弧线排布 */
export function RadialOrbit({
  visibleItems,
  halfSpan,
  side,
  resolvedAccent,
  activeItemId,
  ariaLabel,
  onSelect,
  layoutMetrics,
}: RadialOrbitProps) {
  return (
    <div className={cx('radial-menu__orbit')} role="listbox" aria-label={ariaLabel}>
      {visibleItems.map(({ item, globalIndex, offset }) => {
        const isActive = item.id === activeItemId;
        // 位置/透明度/缩放全部由「到连续中心的距离」driven，滚动时每帧平滑跟随。
        const visual = getOrbitNodeVisual(offset, halfSpan, side, layoutMetrics);

        return (
          <button
            key={`${item.id}-${globalIndex}`}
            type="button"
            className={cx('radial-menu__node', isActive && 'radial-menu__node--active')}
            style={{
              '--item-accent': item.accentColor || resolvedAccent,
              '--item-accent-soft': `${item.accentColor || resolvedAccent}3d`,
              '--item-accent-glow': `${item.accentColor || resolvedAccent}52`,
              '--orbit-x': `${visual.x.toFixed(1)}px`,
              '--orbit-y': `${visual.y.toFixed(1)}px`,
              '--orbit-opacity': visual.opacity.toFixed(3),
              '--orbit-scale': visual.scale.toFixed(3),
              // 淡出中的缓冲节点不接收指针，避免误点弧线外的半透明节点
              '--orbit-pointer': visual.opacity < 0.6 ? 'none' : 'auto',
            } as CSSProperties}
            onClick={() => onSelect(item.id)}
            aria-label={`选择${item.label}`}
            aria-current={isActive ? 'true' : undefined}
          >
            <span className={cx('radial-menu__node-disc')} aria-hidden="true">
              {item.meta || String(globalIndex + 1).padStart(2, '0')}
            </span>
            <span className={cx('radial-menu__node-copy')}>
              <span className={cx('radial-menu__node-title')}>{item.label}</span>
              {/* {item.subtitle ? (
                <span className={cx('radial-menu__node-subtitle')}>{item.subtitle}</span>
              ) : null}
              {isActive && item.tags?.length ? (
                <span className={cx('radial-menu__node-tags')}>
                  {item.tags.map((tag) => (
                    <span key={tag} className={cx('radial-menu__node-tag')}>{tag}</span>
                  ))}
                </span>
              ) : null} */}
            </span>
          </button>
        );
      })}
    </div>
  );
}
