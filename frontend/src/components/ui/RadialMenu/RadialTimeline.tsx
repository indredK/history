import { type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import {
  TIMELINE_BOX,
  formatTimelineYear,
  getPointerAngle,
  getTimelinePosition,
} from './geometry';
import type { RadialTimelineItem } from './types';
import { createCx } from '@utils/cssModules';
import styles from './RadialMenu.module.scss';

const cx = createCx(styles);

interface RadialTimelineProps {
  timelineItems: RadialTimelineItem[];
  side: 'left' | 'right';
  ariaLabel: string;
  resolvedAccent: string;
  activeTimelineItemId: string | undefined;
  timelineRadius: number;
  timelineArcSpan: number;
  timelineFullArcPath: string;
  timelineActiveArcPath: string;
  onSurfaceClick: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onSelectTimeline: (index: number, id: string) => void;
}

/** 时间轴模式视图：SVG 弧线 + 指针 + 刻度按钮 */
export function RadialTimeline({
  timelineItems,
  side,
  ariaLabel,
  resolvedAccent,
  activeTimelineItemId,
  timelineRadius,
  timelineArcSpan,
  timelineFullArcPath,
  timelineActiveArcPath,
  onSurfaceClick,
  onSelectTimeline,
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
        viewBox={`0 0 ${TIMELINE_BOX} ${TIMELINE_BOX}`}
        aria-hidden="true"
      >
        <g transform={side === 'right' ? `translate(${TIMELINE_BOX} 0) scale(-1 1)` : undefined}>
          <path className={cx('radial-menu__timeline-arc')} d={timelineFullArcPath} />
          {timelineActiveArcPath ? (
            <path className={cx('radial-menu__timeline-arc', 'radial-menu__timeline-arc--active')} d={timelineActiveArcPath} />
          ) : null}
        </g>
      </svg>
      <div className={cx('radial-menu__timeline-pointer')} aria-hidden="true" />
      {timelineItems.map((item, index) => {
        const position = getTimelinePosition(index, timelineItems.length, side, timelineRadius, timelineArcSpan);
        const isActive = item.id === activeTimelineItemId;
        const yearLabel = formatTimelineYear(item.yearValue, item.yearLabel);

        return (
          <button
            key={`${item.id}-timeline`}
            type="button"
            className={cx('radial-menu__time-tick', isActive && 'radial-menu__time-tick--active')}
            style={{
              '--item-accent': item.accentColor || resolvedAccent,
              '--item-accent-soft': `${item.accentColor || resolvedAccent}3d`,
              '--item-accent-glow': `${item.accentColor || resolvedAccent}52`,
              '--tick-x': `${position.x.toFixed(1)}px`,
              '--tick-y': `${position.y.toFixed(1)}px`,
              '--tick-angle': `${getPointerAngle(position.angle, side).toFixed(2)}deg`,
            } as CSSProperties}
            onClick={(event) => {
              event.stopPropagation();
              onSelectTimeline(index, item.id);
            }}
          >
            <span className={cx('radial-menu__time-tick-mark')} aria-hidden="true" />
            <span className={cx('radial-menu__time-tick-label')}>{yearLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
