import { type CSSProperties } from 'react';
import {
  ARC_SPAN_DEGREES,
  BASE_RADIUS,
  RADIUS_VARIATION,
} from './geometry';
import type { RadialMenuItem } from './types';
import { createCx } from '@utils/cssModules';
import styles from './RadialMenu.module.css';

const cx = createCx(styles);

interface RadialOrbitProps {
  visibleItems: Array<{ item: RadialMenuItem; globalIndex: number }>;
  visibleWindowStart: number;
  visibleCount: number;
  side: 'left' | 'right';
  resolvedAccent: string;
  activeItemId: string | undefined;
  ariaLabel: string;
  onSelect: (itemId: string) => void;
}

/** 径向模式视图：节点沿弧线排布 */
export function RadialOrbit({
  visibleItems,
  visibleWindowStart,
  visibleCount,
  side,
  resolvedAccent,
  activeItemId,
  ariaLabel,
  onSelect,
}: RadialOrbitProps) {
  return (
    <div className={cx('radial-menu__orbit')} role="listbox" aria-label={ariaLabel}>
      {visibleItems.map(({ item, globalIndex }) => {
        const isActive = item.id === activeItemId;
        const normalized = visibleCount === 1
          ? 0
          : ((globalIndex - visibleWindowStart) / (visibleCount - 1)) * 2 - 1;
        const angle = normalized * ARC_SPAN_DEGREES;
        const angleInRadians = (angle * Math.PI) / 180;
        const radius = BASE_RADIUS + Math.abs(normalized) * RADIUS_VARIATION;
        const orbitX = Math.cos(angleInRadians) * radius * (side === 'left' ? 1 : -1);
        const orbitY = Math.sin(angleInRadians) * radius;

        return (
          <button
            key={`${item.id}-${globalIndex}`}
            type="button"
            className={cx('radial-menu__node', isActive && 'radial-menu__node--active')}
            style={{
              '--item-accent': item.accentColor || resolvedAccent,
              '--item-accent-soft': `${item.accentColor || resolvedAccent}3d`,
              '--item-accent-glow': `${item.accentColor || resolvedAccent}52`,
              '--orbit-x': `${orbitX.toFixed(1)}px`,
              '--orbit-y': `${orbitY.toFixed(1)}px`,
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
              {item.subtitle ? (
                <span className={cx('radial-menu__node-subtitle')}>{item.subtitle}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
