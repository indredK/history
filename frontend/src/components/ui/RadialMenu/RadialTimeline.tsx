import { type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import {
  formatTimelineYear,
  getTimelinePosition,
} from './geometry';
import type { RadialMenuLayout } from './layout';
import type { RadialMenuDisplayState, RadialTimelineItem } from './types';
import { createCx } from '@utils/cssModules';
import styles from './RadialMenu.module.scss';

const cx = createCx(styles);

interface RadialTimelineProps {
  timelineItems: RadialTimelineItem[];
  ariaLabel: string;
  resolvedAccent: string;
  activeTimelineItemId: string | undefined;
  timelineRatios: number[];
  timelineFullArcPath: string;
  timelineActiveArcPath: string;
  timelinePointerAngle: number;
  onSurfaceClick: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onSelectTimeline: (index: number, id: string) => void;
  layout: RadialMenuLayout;
  displayState: RadialMenuDisplayState;
}

/** 时间轴模式视图：SVG 弧线 + 指针 + 刻度按钮 */
export function RadialTimeline({
  timelineItems,
  ariaLabel,
  resolvedAccent,
  activeTimelineItemId,
  timelineRatios,
  timelineFullArcPath,
  timelineActiveArcPath,
  timelinePointerAngle,
  onSurfaceClick,
  onSelectTimeline,
  layout,
  displayState,
}: RadialTimelineProps) {
  return (
    <div
      className={cx('radial-menu__timeline')}
      role="listbox"
      aria-label={`${ariaLabel}时间刻度`}
      onClick={onSurfaceClick}
    >
      <svg
        className={cx('radial-menu__timeline-svg')}
        viewBox={`0 0 ${layout.surfaceWidth} ${layout.surfaceHeight}`}
        aria-hidden="true"
      >
        <path className={cx('radial-menu__timeline-arc')} d={timelineFullArcPath} />
        {timelineActiveArcPath ? (
          <path className={cx('radial-menu__timeline-arc', 'radial-menu__timeline-arc--active')} d={timelineActiveArcPath} />
        ) : null}
      </svg>
      <div
        className={cx('radial-menu__timeline-pointer')}
        aria-hidden="true"
        style={{
          left: `${layout.anchorX.toFixed(1)}px`,
          top: `${layout.anchorY.toFixed(1)}px`,
          width: `${layout.pointerLength.toFixed(1)}px`,
          transform: `translateY(-50%) rotate(${timelinePointerAngle.toFixed(2)}deg)`,
        } as CSSProperties}
      />
      {timelineItems.map((item, index) => {
        const ratio = timelineRatios[index] ?? (timelineItems.length > 1 ? index / (timelineItems.length - 1) : 0);
        const position = getTimelinePosition(ratio, timelineItems.length, layout);
        const isActive = item.id === activeTimelineItemId;
        const yearLabel = formatTimelineYear(item.yearValue, item.yearLabel);

        return (
          <button
            key={`${item.id}-timeline`}
            type="button"
            className={cx(
              'radial-menu__time-tick',
              `radial-menu__time-tick--label-${position.labelPosition}`,
              isActive && 'radial-menu__time-tick--active',
            )}
            style={{
              left: `${position.x.toFixed(1)}px`,
              top: `${position.y.toFixed(1)}px`,
              '--item-accent': item.accentColor || resolvedAccent,
              '--item-accent-soft': `${item.accentColor || resolvedAccent}3d`,
              '--item-accent-glow': `${item.accentColor || resolvedAccent}52`,
              '--tick-angle': `${position.angle.toFixed(2)}deg`,
              pointerEvents: displayState === 'expanded' ? 'auto' : 'none',
            } as CSSProperties}
            onClick={(event) => {
              event.stopPropagation();
              onSelectTimeline(index, item.id);
            }}
            tabIndex={displayState === 'expanded' ? 0 : -1}
          >
            <span className={cx('radial-menu__time-tick-mark')} aria-hidden="true" />
            <span className={cx('radial-menu__time-tick-label')}>{yearLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
