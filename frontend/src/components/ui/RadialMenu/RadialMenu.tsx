import { type CSSProperties } from 'react';
import {
  ANCHOR_BOX,
  MENU_MIN_HEIGHT,
  TIMELINE_BOX,
} from './geometry';
import { RadialOrbit } from './RadialOrbit';
import { RadialTimeline } from './RadialTimeline';
import { useRadialMenu } from './useRadialMenu';
import type { RadialMenuProps } from './types';
import { createCx } from '@utils/cssModules';
import styles from './RadialMenu.module.scss';

const cx = createCx(styles);

/**
 * 径向/时间轴双模式轮盘菜单。
 * 外壳负责空状态、anchor 容器、核心圆盘与 CSS 变量注入，
 * 中间渲染区按 mode 切换 RadialOrbit / RadialTimeline。
 */
export function RadialMenu({
  items,
  timelineItems,
  activeId,
  onSelect,
  side,
  ariaLabel,
  emptyText,
  accentColor,
  emptyMode = 'text',
}: RadialMenuProps) {
  const {
    menuRef,
    isExpanded,
    setIsExpanded,
    mode,
    resolvedAccent,
    progressRatio,
    timelineProgressRatio,
    currentNumber,
    totalCount,
    activeItem,
    visibleItems,
    visibleWindowStart,
    visibleCount,
    activeTimelineItem,
    timelineRadius,
    timelineArcSpan,
    timelineRatios,
    timelineFullArcPath,
    timelineActiveArcPath,
    timelinePointerAngle,
    timelineCoreLabel,
    handleAnchorBlur,
    handleCoreClick,
    handleCoreKeyDown,
    handleNavKeyDown,
    handleTimelineSurfaceClick,
    selectTimelineIndex,
  } = useRadialMenu({ items, timelineItems, activeId, onSelect, side, accentColor });

  return (
    <aside
      ref={menuRef}
      className={cx('radial-menu', `radial-menu--${side}`, isExpanded && 'radial-menu--expanded')}
      style={{
        '--menu-accent': resolvedAccent,
        '--menu-accent-glow': `${resolvedAccent}2e`,
        '--menu-progress': (mode === 'timeline' ? timelineProgressRatio : progressRatio).toFixed(4),
        '--menu-count': totalCount,
        '--timeline-pointer-angle': `${timelinePointerAngle.toFixed(2)}deg`,
        '--timeline-pointer-length': `${(timelineRadius - 10).toFixed(1)}px`,
        '--timeline-box': `${TIMELINE_BOX}px`,
        '--anchor-box': `${ANCHOR_BOX}px`,
        '--menu-min-height': `${MENU_MIN_HEIGHT}px`,
      } as CSSProperties}
    >
      {items.length === 0 ? (
        emptyMode === 'disc' ? (
          <div className={cx('radial-menu__hub')}>
            <div className={cx('radial-menu__core')}>
              <div className={cx('radial-menu__core-disc', 'radial-menu__core-disc--empty')} aria-hidden="true" />
            </div>
          </div>
        ) : (
          <div className={cx('radial-menu__empty')}>{emptyText}</div>
        )
      ) : (
        <div
          className={cx('radial-menu__anchor')}
          onPointerLeave={() => setIsExpanded(false)}
          onFocusCapture={() => setIsExpanded(true)}
          onBlurCapture={handleAnchorBlur}
        >
          {isExpanded ? (
            <>
              <div className={cx('radial-menu__interaction-pad')} aria-hidden="true" />
              {mode === 'timeline' && timelineItems?.length ? (
                <RadialTimeline
                  timelineItems={timelineItems}
                  side={side}
                  ariaLabel={ariaLabel}
                  resolvedAccent={resolvedAccent}
                  activeTimelineItemId={activeTimelineItem?.id}
                  timelineRadius={timelineRadius}
                  timelineArcSpan={timelineArcSpan}
                  timelineRatios={timelineRatios}
                  timelineFullArcPath={timelineFullArcPath}
                  timelineActiveArcPath={timelineActiveArcPath}
                  onSurfaceClick={handleTimelineSurfaceClick}
                  onSelectTimeline={selectTimelineIndex}
                />
              ) : (
                <RadialOrbit
                  visibleItems={visibleItems}
                  visibleWindowStart={visibleWindowStart}
                  visibleCount={visibleCount}
                  side={side}
                  resolvedAccent={resolvedAccent}
                  activeItemId={activeItem?.id}
                  ariaLabel={ariaLabel}
                  onSelect={onSelect}
                />
              )}
            </>
          ) : null}

          <div className={cx('radial-menu__hub')}>
            <div className={cx('radial-menu__core')}>
              <div
                className={cx('radial-menu__core-disc')}
                onPointerEnter={() => setIsExpanded(true)}
                onClick={handleCoreClick}
                onKeyDown={(event) => {
                  handleCoreKeyDown(event);
                  if (!event.defaultPrevented) {
                    handleNavKeyDown(event);
                  }
                }}
                tabIndex={0}
                role={timelineItems?.length ? 'button' : undefined}
                aria-label={timelineItems?.length ? `切换${ariaLabel}显示模式` : undefined}
              >
                <span className={cx('radial-menu__core-title')}>
                  {mode === 'timeline'
                    ? (timelineCoreLabel || '未选中')
                    : (activeItem?.label || '未选中')}
                </span>
                {totalCount > 0 ? (
                  <span className={cx('radial-menu__core-count')} aria-hidden="true">
                    {currentNumber} / {totalCount}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
