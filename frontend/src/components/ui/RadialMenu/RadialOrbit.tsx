import { type CSSProperties } from 'react';
import { getOrbitNodeVisual } from './geometry';
import type { RadialMenuLayout } from './layout';
import type { RadialMenuDisplayState, RadialMenuItem } from './types';
import { createCx } from '@utils/cssModules';
import styles from './RadialMenu.module.scss';

const cx = createCx(styles);

interface RadialOrbitProps {
  visibleItems: Array<{ item: RadialMenuItem; globalIndex: number; offset: number }>;
  halfSpan: number;
  resolvedAccent: string;
  activeItemId: string | undefined;
  ariaLabel: string;
  onSelect: (itemId: string) => void;
  layout: RadialMenuLayout;
  displayState: RadialMenuDisplayState;
}

/** 径向模式视图：节点沿弧线排布 */
export function RadialOrbit({
  visibleItems,
  halfSpan,
  resolvedAccent,
  activeItemId,
  ariaLabel,
  onSelect,
  layout,
  displayState,
}: RadialOrbitProps) {
  const previewFactor = displayState === 'preview' ? 0.62 : 1;

  return (
    <div className={cx('radial-menu__orbit')} role="listbox" aria-label={ariaLabel}>
      {visibleItems.map(({ item, globalIndex, offset }) => {
        const isActive = item.id === activeItemId;
        const visual = getOrbitNodeVisual(offset, halfSpan, layout);
        const style = {
          left: `${visual.x.toFixed(1)}px`,
          top: `${visual.y.toFixed(1)}px`,
          opacity: Number((visual.opacity * previewFactor).toFixed(3)),
          transform: `translate(-50%, -50%) scale(${(visual.scale * (displayState === 'preview' ? 0.96 : 1)).toFixed(3)})`,
          '--item-accent': item.accentColor || resolvedAccent,
          '--item-accent-soft': `${item.accentColor || resolvedAccent}3d`,
          '--item-accent-glow': `${item.accentColor || resolvedAccent}52`,
          pointerEvents: displayState === 'expanded' && visual.opacity >= 0.6 ? 'auto' : 'none',
        } as CSSProperties;

        return (
          <button
            key={`${item.id}-${globalIndex}`}
            type="button"
            className={cx(
              'radial-menu__node',
              `radial-menu__node--${visual.axis}-${visual.labelPlacement}`,
              isActive && 'radial-menu__node--active',
            )}
            style={style}
            onClick={() => onSelect(item.id)}
            aria-label={`选择${item.label}`}
            aria-current={isActive ? 'true' : undefined}
            tabIndex={displayState === 'expanded' ? 0 : -1}
          >
            <span className={cx('radial-menu__node-disc')} aria-hidden="true">
              {item.meta || String(globalIndex + 1).padStart(2, '0')}
            </span>
            <span className={cx('radial-menu__node-copy')}>
              <span className={cx('radial-menu__node-title')}>{item.label}</span>
              {isActive && displayState === 'expanded' && item.tags?.length ? (
                <span className={cx('radial-menu__node-tags')}>
                  {item.tags.map((tag) => (
                    <span key={tag} className={cx('radial-menu__node-tag')}>{tag}</span>
                  ))}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
