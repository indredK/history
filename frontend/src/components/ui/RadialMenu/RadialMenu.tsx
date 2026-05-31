import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import {
  getResponsiveMenuMetrics,
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
  hiddenBelowWidth,
}: RadialMenuProps) {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1920 : window.innerWidth,
  );
  const layoutMetrics = useMemo(() => getResponsiveMenuMetrics(viewportWidth), [viewportWidth]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    halfSpan,
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
  } = useRadialMenu({ items, timelineItems, activeId, onSelect, side, accentColor, layoutMetrics });

  // 核心圆盘标题：长短名都在圆内一行显示。
  // 字号按字数和当前圆盘尺寸自适应；宽屏保持原观感，窄一些时同步收紧。
  // 在 JS 计算而非 SCSS calc：SCSS 会把 calc 内的 `/` 当除法优化掉，
  // 导致 clamp 失效，故由此处注入确定值。
  const coreTitle = (mode === 'timeline' ? timelineCoreLabel : activeItem?.label) || '未选中';
  const coreTitleWidth = Math.max(layoutMetrics.coreSize - 32, 58);
  const coreTitleSize = Math.max(9.6, Math.min(layoutMetrics.coreSize * 0.206, coreTitleWidth / Math.max(coreTitle.length, 1)));

  if (hiddenBelowWidth !== undefined && viewportWidth <= hiddenBelowWidth) {
    return null;
  }

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
        '--timeline-box': `${layoutMetrics.timelineBox}px`,
        '--anchor-box': `${layoutMetrics.anchorBox}px`,
        '--menu-min-height': `${layoutMetrics.menuMinHeight}px`,
        '--orbit-box': `${layoutMetrics.orbitBox}px`,
        '--menu-edge-offset': `${layoutMetrics.edgeOffset}px`,
        '--core-size': `${layoutMetrics.coreSize}px`,
        '--node-disc-size': `${layoutMetrics.nodeDiscSize}px`,
        '--node-copy-max-width': `${layoutMetrics.nodeCopyMaxWidth}px`,
        '--time-tick-width': `${layoutMetrics.timeTickWidth}px`,
        '--core-count-bottom': `${Math.max(12, layoutMetrics.coreSize * 0.16).toFixed(1)}px`,
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
                  layoutMetrics={layoutMetrics}
                />
              ) : (
                <RadialOrbit
                  visibleItems={visibleItems}
                  halfSpan={halfSpan}
                  side={side}
                  resolvedAccent={resolvedAccent}
                  activeItemId={activeItem?.id}
                  ariaLabel={ariaLabel}
                  onSelect={onSelect}
                  layoutMetrics={layoutMetrics}
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
                <span
                  className={cx('radial-menu__core-title')}
                  style={{ fontSize: `${coreTitleSize}px` } as CSSProperties}
                >
                  {coreTitle}
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
