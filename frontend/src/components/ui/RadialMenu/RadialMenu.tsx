import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RadialOrbit } from './RadialOrbit';
import { RadialTimeline } from './RadialTimeline';
import { getRadialMenuLayout } from './layout';
import { resolveInsets } from './placement';
import { useRadialMenu } from './useRadialMenu';
import type { RadialMenuBoundaryRect, RadialMenuProps } from './types';
import { createCx } from '@utils/cssModules';
import styles from './RadialMenu.module.scss';

const cx = createCx(styles);

function getRectLeft(rect: RadialMenuBoundaryRect) {
  return rect.left ?? rect.x ?? 0;
}

function getRectTop(rect: RadialMenuBoundaryRect) {
  return rect.top ?? rect.y ?? 0;
}

function getInitialBoundaryRect(boundary: RadialMenuProps['boundary']) {
  if (boundary && typeof boundary === 'object' && 'width' in boundary) {
    return {
      width: boundary.width,
      height: boundary.height,
      left: getRectLeft(boundary),
      top: getRectTop(boundary),
    };
  }

  if (typeof window !== 'undefined') {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      left: 0,
      top: 0,
    };
  }

  return {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  };
}

/**
 * 径向/时间轴双模式轮盘菜单。
 * 组件脱离文档流浮在 boundary 内，挂靠侧由父级通过 side 指定（left 朝右 / right 朝左）。
 */
export function RadialMenu({
  items,
  timelineItems,
  activeId,
  onSelect,
  side = 'right',
  inset = 24,
  offset = 0,
  boundary = 'viewport',
  safePadding = 24,
  mode = 'auto',
  density = 'comfortable',
  compactBelow = 1240,
  hiddenBelow,
  hiddenBelowWidth,
  defaultView = 'orbit',
  rememberLastView = false,
  clickBehavior = 'expand-then-cycle',
  collapseOnSelect = false,
  previewOnHover = true,
  ariaLabel,
  emptyText,
  accentColor,
  emptyMode = 'text',
}: RadialMenuProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [hostRect, setHostRect] = useState(() => getInitialBoundaryRect(boundary));
  const resolvedHiddenBelow = hiddenBelow ?? hiddenBelowWidth ?? 0;
  const safeInsets = useMemo(() => resolveInsets(safePadding, 24), [safePadding]);
  const overlayStyle = useMemo(() => {
    if (boundary === 'container') {
      return { position: 'absolute', inset: 0 } as CSSProperties;
    }

    if (boundary && typeof boundary === 'object' && 'width' in boundary) {
      return {
        position: 'fixed',
        left: `${getRectLeft(boundary)}px`,
        top: `${getRectTop(boundary)}px`,
        width: `${boundary.width}px`,
        height: `${boundary.height}px`,
      } as CSSProperties;
    }

    return { position: 'fixed', inset: 0 } as CSSProperties;
  }, [boundary]);

  useEffect(() => {
    const element = rootRef.current;

    if (!element) {
      return undefined;
    }

    const updateRect = () => {
      const rect = element.getBoundingClientRect();
      setHostRect({
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      });
    };

    updateRect();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateRect);
      return () => window.removeEventListener('resize', updateRect);
    }

    const observer = new ResizeObserver(() => updateRect());
    observer.observe(element);
    window.addEventListener('resize', updateRect);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateRect);
    };
  }, [boundary]);

  const layout = useMemo(() => getRadialMenuLayout({
    hostWidth: hostRect.width,
    hostHeight: hostRect.height,
    side,
    inset,
    offset,
    boundaryRect: {
      x: 0,
      y: 0,
      width: hostRect.width,
      height: hostRect.height,
    },
    safeInsets,
    orbitItemCount: items.length,
    timelineItemCount: timelineItems?.length ?? 0,
    mode: mode === 'orbit' || !timelineItems?.length
      ? 'orbit'
      : mode === 'timeline'
        ? 'timeline'
        : 'auto',
    density,
    compactBelow,
    hiddenBelow: resolvedHiddenBelow,
  }), [
    compactBelow,
    density,
    hostRect.height,
    hostRect.width,
    inset,
    offset,
    items.length,
    mode,
    resolvedHiddenBelow,
    safeInsets,
    side,
    timelineItems?.length,
  ]);
  const {
    menuRef,
    displayState,
    viewMode,
    resolvedAccent,
    progressRatio,
    timelineProgressRatio,
    currentNumber,
    totalCount,
    activeItem,
    activeTimelineItem,
    visibleItems,
    halfSpan,
    timelineRatios,
    timelineFullArcPath,
    timelineActiveArcPath,
    timelinePointerAngle,
    timelineCoreLabel,
    allowTimeline,
    handleAnchorBlur,
    handleCoreClick,
    handleCoreKeyDown,
    handleCorePointerEnter,
    handleFocusCapture,
    handleNavKeyDown,
    handlePointerLeave,
    handleTimelineSurfaceClick,
    selectTimelineIndex,
    selectItemId,
  } = useRadialMenu({
    items,
    timelineItems,
    activeId,
    onSelect,
    accentColor,
    layout,
    mode,
    defaultView,
    rememberLastView,
    clickBehavior,
    collapseOnSelect,
    previewOnHover,
  });
  const setRootRef = useCallback((node: HTMLElement | null) => {
    rootRef.current = node;
    menuRef.current = node as HTMLDivElement | null;
  }, [menuRef]);

  const coreTitle = (viewMode === 'timeline' ? timelineCoreLabel : activeItem?.label) || '未选中';
  const coreTitleWidth = Math.max(layout.coreSize - 32, 58);
  const coreTitleSize = Math.max(
    9.6,
    Math.min(layout.coreSize * 0.206, coreTitleWidth / Math.max(coreTitle.length, 1)),
  );
  const isHidden = layout.displayMode === 'hidden';

  return (
    <aside
      ref={setRootRef}
      className={cx(
        'radial-menu',
        boundary === 'container' ? 'radial-menu--container' : 'radial-menu--viewport',
        `radial-menu--${side}`,
        isHidden && 'radial-menu--hidden',
        layout.displayMode === 'compact' && 'radial-menu--compact',
        displayState === 'preview' && 'radial-menu--preview',
        displayState === 'expanded' && 'radial-menu--expanded',
      )}
      style={{
        ...overlayStyle,
        '--menu-accent': resolvedAccent,
        '--menu-accent-glow': `${resolvedAccent}2e`,
        '--menu-progress': (viewMode === 'timeline' ? timelineProgressRatio : progressRatio).toFixed(4),
        '--menu-core-size': `${layout.coreSize}px`,
        '--menu-node-size': `${layout.nodeSize}px`,
        '--menu-tick-width': `${layout.tickWidth}px`,
        '--menu-label-max-width': `${layout.labelMaxWidth}px`,
      } as CSSProperties}
    >
      <div
        className={cx('radial-menu__surface')}
        onPointerLeave={handlePointerLeave}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleAnchorBlur}
        aria-hidden={isHidden}
      >
        {isHidden ? null : items.length === 0 ? (
          emptyMode === 'disc' ? (
            <div
              className={cx('radial-menu__core')}
              style={{ left: `${layout.anchorX}px`, top: `${layout.anchorY}px` } as CSSProperties}
            >
              <div className={cx('radial-menu__core-disc', 'radial-menu__core-disc--empty')} aria-hidden="true" />
            </div>
          ) : (
            <div
              className={cx('radial-menu__empty')}
              style={{ left: `${layout.anchorX}px`, top: `${layout.anchorY}px` } as CSSProperties}
            >
              {emptyText}
            </div>
          )
        ) : (
          <>
            {(displayState === 'preview' || displayState === 'expanded') ? (
              viewMode === 'timeline' && allowTimeline ? (
                <RadialTimeline
                  timelineItems={timelineItems ?? []}
                  ariaLabel={ariaLabel}
                  resolvedAccent={resolvedAccent}
                  activeTimelineItemId={activeTimelineItem?.id}
                  timelineRatios={timelineRatios}
                  timelineFullArcPath={timelineFullArcPath}
                  timelineActiveArcPath={timelineActiveArcPath}
                  timelinePointerAngle={timelinePointerAngle}
                  onSurfaceClick={handleTimelineSurfaceClick}
                  onSelectTimeline={selectTimelineIndex}
                  layout={layout}
                  displayState={displayState}
                />
              ) : (
                <RadialOrbit
                  visibleItems={visibleItems}
                  halfSpan={halfSpan}
                  resolvedAccent={resolvedAccent}
                  activeItemId={activeItem?.id}
                  ariaLabel={ariaLabel}
                  onSelect={selectItemId}
                  layout={layout}
                  displayState={displayState}
                />
              )
            ) : null}

            <div
              className={cx('radial-menu__core')}
              style={{ left: `${layout.anchorX}px`, top: `${layout.anchorY}px` } as CSSProperties}
            >
              <div
                className={cx('radial-menu__core-disc')}
                onPointerEnter={handleCorePointerEnter}
                onClick={handleCoreClick}
                onKeyDown={(event) => {
                  handleCoreKeyDown(event);
                  if (!event.defaultPrevented) {
                    handleNavKeyDown(event);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={allowTimeline ? `切换${ariaLabel}显示模式` : ariaLabel}
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
          </>
        )}
      </div>
    </aside>
  );
}
