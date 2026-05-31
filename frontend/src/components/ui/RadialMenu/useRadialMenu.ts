import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import type { RadialMenuLayout } from './layout';
import {
  MOTION_EASING,
  MOTION_SNAP_THRESHOLD,
  ORBIT_BUFFER,
  WHEEL_RESET_MS,
  WHEEL_STEP_DELTA,
  clamp,
  formatTimelineYear,
  getTimelineArcPath,
  getTimelineRatios,
  projectPointToArcRatio,
} from './geometry';
import type {
  RadialMenuClickBehavior,
  RadialMenuDisplayState,
  RadialMenuItem,
  RadialMenuMode,
  RadialMenuProps,
  RadialMenuViewMode,
  RadialTimelineItem,
} from './types';

type UseRadialMenuArgs = {
  items: RadialMenuItem[];
  timelineItems: RadialTimelineItem[] | undefined;
  activeId: RadialMenuProps['activeId'];
  onSelect: RadialMenuProps['onSelect'];
  accentColor: RadialMenuProps['accentColor'] | undefined;
  layout: RadialMenuLayout;
  mode: RadialMenuMode;
  defaultView: RadialMenuViewMode;
  rememberLastView: boolean;
  clickBehavior: RadialMenuClickBehavior;
  collapseOnSelect: boolean;
  previewOnHover: boolean;
};

function getPreferredView({
  allowOrbit,
  allowTimeline,
  defaultView,
  rememberLastView,
  lastExpandedView,
}: {
  allowOrbit: boolean;
  allowTimeline: boolean;
  defaultView: RadialMenuViewMode;
  rememberLastView: boolean;
  lastExpandedView: RadialMenuViewMode;
}) {
  if (rememberLastView && ((lastExpandedView === 'orbit' && allowOrbit) || (lastExpandedView === 'timeline' && allowTimeline))) {
    return lastExpandedView;
  }

  if (defaultView === 'timeline' && allowTimeline) {
    return 'timeline';
  }

  if (allowOrbit) {
    return 'orbit';
  }

  return 'timeline';
}

export function useRadialMenu({
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
}: UseRadialMenuArgs) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const wheelDeltaRef = useRef(0);
  const lastWheelEventTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const activeIndex = Math.max(items.findIndex((item) => item.id === activeId), 0);
  const activeTimelineIndex = Math.max(timelineItems?.findIndex((item) => item.id === activeId) ?? -1, 0);
  const activeItem = items[activeIndex] ?? null;
  const activeTimelineItem = timelineItems?.[activeTimelineIndex] ?? null;
  const resolvedAccent = activeTimelineItem?.accentColor || activeItem?.accentColor || accentColor || 'var(--imperial-accent)';
  const allowTimeline = mode !== 'orbit' && !!timelineItems?.length;
  const allowOrbit = mode !== 'timeline' || !allowTimeline;
  const lastExpandedViewRef = useRef<RadialMenuViewMode>(defaultView === 'timeline' && allowTimeline ? 'timeline' : 'orbit');
  const [displayState, setDisplayState] = useState<RadialMenuDisplayState>(
    layout.displayMode === 'hidden' ? 'hidden' : 'collapsed',
  );
  const [viewMode, setViewMode] = useState<RadialMenuViewMode>(
    getPreferredView({
      allowOrbit,
      allowTimeline,
      defaultView,
      rememberLastView,
      lastExpandedView: lastExpandedViewRef.current,
    }),
  );
  const [animatedIndex, setAnimatedIndex] = useState(activeIndex);
  const pendingIndexRef = useRef(activeIndex);
  const pendingTimelineIndexRef = useRef(activeTimelineIndex);
  const animatedIndexRef = useRef(activeIndex);

  const progressRatio = items.length > 0 ? (activeIndex + 1) / items.length : 0;
  const timelineProgressRatio = timelineItems && timelineItems.length > 0
    ? (activeTimelineIndex + 1) / timelineItems.length
    : 0;
  const totalCount = viewMode === 'timeline' && allowTimeline ? (timelineItems?.length ?? 0) : items.length;
  const currentNumber = totalCount > 0
    ? ((viewMode === 'timeline' && allowTimeline ? activeTimelineIndex : activeIndex) + 1)
    : 0;
  const visibleCount = Math.min(items.length, layout.visibleOrbitCount);
  const halfSpan = (visibleCount - 1) / 2;
  const orbitCenter = clamp(animatedIndex, halfSpan, Math.max(items.length - 1 - halfSpan, halfSpan));
  const visibleItems = useMemo(() => {
    const renderStart = Math.ceil(orbitCenter - halfSpan - ORBIT_BUFFER);
    const renderEnd = Math.floor(orbitCenter + halfSpan + ORBIT_BUFFER);
    const result: Array<{ item: RadialMenuItem; globalIndex: number; offset: number }> = [];

    for (let globalIndex = renderStart; globalIndex <= renderEnd; globalIndex += 1) {
      const item = items[globalIndex];

      if (item) {
        result.push({ item, globalIndex, offset: globalIndex - orbitCenter });
      }
    }

    return result;
  }, [halfSpan, items, orbitCenter]);

  const timelineRatios = useMemo(
    () => getTimelineRatios((timelineItems ?? []).map((item) => item.yearValue)),
    [timelineItems],
  );
  const timelineActiveRatio = timelineRatios[activeTimelineIndex] ?? 0;
  const timelineHalfArc = layout.timelineArcSpan / 2;
  const timelineActiveAngleOffset = (clamp(timelineActiveRatio, 0, 1) * 2 - 1) * timelineHalfArc;
  const timelineFullArcPath = allowTimeline
    ? getTimelineArcPath(-timelineHalfArc, timelineHalfArc, layout.timelineRadius, layout)
    : '';
  const timelineActiveArcPath = allowTimeline && (timelineItems?.length ?? 0) > 1
    ? getTimelineArcPath(-timelineHalfArc, timelineActiveAngleOffset, layout.timelineRadius, layout)
    : '';
  const timelinePointerAngle = layout.bearing + timelineActiveAngleOffset;
  const timelineCoreLabel = formatTimelineYear(activeTimelineItem?.yearValue, activeTimelineItem?.yearLabel);

  useEffect(() => {
    if (layout.displayMode === 'hidden') {
      setDisplayState('hidden');
    } else {
      setDisplayState((current) => (current === 'hidden' ? 'collapsed' : current));
    }
  }, [layout.displayMode]);

  useEffect(() => {
    if (!allowTimeline && viewMode === 'timeline') {
      setViewMode('orbit');
    }
  }, [allowTimeline, viewMode]);

  useEffect(() => {
    pendingIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    pendingTimelineIndexRef.current = activeTimelineIndex;
  }, [activeTimelineIndex]);

  useEffect(() => {
    if (items.length === 0) {
      animatedIndexRef.current = 0;
      setAnimatedIndex(0);
      return;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = () => {
      const current = animatedIndexRef.current;
      const delta = activeIndex - current;

      if (Math.abs(delta) <= MOTION_SNAP_THRESHOLD) {
        animatedIndexRef.current = activeIndex;
        setAnimatedIndex(activeIndex);
        animationFrameRef.current = null;
        return;
      }

      const nextValue = current + delta * MOTION_EASING;
      animatedIndexRef.current = nextValue;
      setAnimatedIndex(nextValue);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [activeIndex, items.length]);

  useEffect(() => {
    if (displayState !== 'expanded') {
      wheelDeltaRef.current = 0;
      lastWheelEventTimeRef.current = 0;
    }
  }, [displayState]);

  useEffect(() => {
    wheelDeltaRef.current = 0;
    lastWheelEventTimeRef.current = 0;
  }, [viewMode]);

  useEffect(() => {
    if (displayState !== 'expanded') {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setDisplayState('collapsed');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDisplayState('collapsed');
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [displayState]);

  const openExpanded = useCallback((targetView?: RadialMenuViewMode) => {
    const nextView = targetView ?? getPreferredView({
      allowOrbit,
      allowTimeline,
      defaultView,
      rememberLastView,
      lastExpandedView: lastExpandedViewRef.current,
    });

    setViewMode(nextView);
    setDisplayState('expanded');
  }, [allowOrbit, allowTimeline, defaultView, rememberLastView]);

  const collapse = useCallback(() => {
    setDisplayState('collapsed');

    if (!rememberLastView) {
      setViewMode(defaultView === 'timeline' && allowTimeline ? 'timeline' : 'orbit');
    }
  }, [allowTimeline, defaultView, rememberLastView]);

  const finalizeSelection = useCallback(() => {
    if (collapseOnSelect) {
      collapse();
    } else {
      setDisplayState('expanded');
    }
  }, [collapse, collapseOnSelect]);

  const selectIndex = useCallback((targetIndex: number) => {
    const targetItem = items[targetIndex];

    if (targetItem) {
      pendingIndexRef.current = targetIndex;
      onSelect(targetItem.id);
      finalizeSelection();
    }
  }, [finalizeSelection, items, onSelect]);

  const selectTimelineIndex = useCallback((index: number, id: string) => {
    pendingTimelineIndexRef.current = index;
    onSelect(id);
    finalizeSelection();
  }, [finalizeSelection, onSelect]);

  const selectItemId = useCallback((itemId: string) => {
    const targetIndex = items.findIndex((item) => item.id === itemId);

    if (targetIndex >= 0) {
      selectIndex(targetIndex);
    }
  }, [items, selectIndex]);

  const applyWheelDelta = useCallback((deltaY: number) => {
    const useTimeline = viewMode === 'timeline' && allowTimeline;
    const sourceItems = useTimeline ? (timelineItems ?? []) : items;

    if (sourceItems.length <= 1) {
      return false;
    }

    const now = performance.now();

    if (
      now - lastWheelEventTimeRef.current > WHEEL_RESET_MS
      || (wheelDeltaRef.current !== 0 && Math.sign(wheelDeltaRef.current) !== Math.sign(deltaY))
    ) {
      wheelDeltaRef.current = 0;
    }

    lastWheelEventTimeRef.current = now;
    wheelDeltaRef.current += deltaY;

    if (Math.abs(wheelDeltaRef.current) < WHEEL_STEP_DELTA) {
      return false;
    }

    let steps = 0;

    while (Math.abs(wheelDeltaRef.current) >= WHEEL_STEP_DELTA) {
      if (wheelDeltaRef.current > 0) {
        wheelDeltaRef.current -= WHEEL_STEP_DELTA;
        steps += 1;
      } else {
        wheelDeltaRef.current += WHEEL_STEP_DELTA;
        steps -= 1;
      }
    }

    if (steps === 0) {
      return false;
    }

    const currentIndex = useTimeline ? pendingTimelineIndexRef.current : pendingIndexRef.current;
    const targetIndex = clamp(currentIndex + steps, 0, sourceItems.length - 1);

    if (targetIndex === currentIndex) {
      wheelDeltaRef.current = 0;
      return false;
    }

    const targetItem = sourceItems[targetIndex];

    if (!targetItem) {
      wheelDeltaRef.current = 0;
      return false;
    }

    if (useTimeline) {
      pendingTimelineIndexRef.current = targetIndex;
      onSelect(targetItem.id);
    } else {
      pendingIndexRef.current = targetIndex;
      onSelect(targetItem.id);
    }

    return true;
  }, [allowTimeline, items, onSelect, timelineItems, viewMode]);

  useEffect(() => {
    const menuElement = menuRef.current;

    if (!menuElement || displayState !== 'expanded') {
      return undefined;
    }

    const handleNativeWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      applyWheelDelta(event.deltaY);
    };

    menuElement.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      menuElement.removeEventListener('wheel', handleNativeWheel);
    };
  }, [applyWheelDelta, displayState]);

  const stepBy = useCallback((step: number) => {
    const useTimeline = viewMode === 'timeline' && allowTimeline;
    const sourceItems = useTimeline ? (timelineItems ?? []) : items;

    if (sourceItems.length === 0) {
      return;
    }

    if (displayState !== 'expanded') {
      openExpanded(useTimeline ? 'timeline' : 'orbit');
    }

    const currentIndex = useTimeline ? pendingTimelineIndexRef.current : pendingIndexRef.current;
    const targetIndex = clamp(currentIndex + step, 0, sourceItems.length - 1);

    if (targetIndex === currentIndex) {
      return;
    }

    const targetItem = sourceItems[targetIndex];

    if (!targetItem) {
      return;
    }

    if (useTimeline) {
      pendingTimelineIndexRef.current = targetIndex;
      onSelect(targetItem.id);
    } else {
      pendingIndexRef.current = targetIndex;
      onSelect(targetItem.id);
    }
  }, [allowTimeline, displayState, items, onSelect, openExpanded, timelineItems, viewMode]);

  const handleCoreClick = useCallback(() => {
    if (layout.displayMode === 'hidden') {
      return;
    }

    if (clickBehavior === 'toggle-only' || !allowTimeline || !allowOrbit) {
      if (displayState === 'expanded') {
        collapse();
      } else {
        openExpanded();
      }
      return;
    }

    if (displayState === 'collapsed' || displayState === 'preview' || displayState === 'hidden') {
      openExpanded();
      return;
    }

    if (viewMode === 'orbit') {
      setViewMode('timeline');
      return;
    }

    collapse();
  }, [allowOrbit, allowTimeline, clickBehavior, collapse, displayState, layout.displayMode, openExpanded, viewMode]);

  const handleCorePointerEnter = useCallback(() => {
    if (previewOnHover && displayState === 'collapsed' && allowOrbit) {
      setViewMode('orbit');
      setDisplayState('preview');
    }
  }, [allowOrbit, displayState, previewOnHover]);

  const handlePointerLeave = useCallback(() => {
    if (displayState === 'preview') {
      setDisplayState('collapsed');
    }
  }, [displayState]);

  const handleFocusCapture = useCallback(() => {
    if (previewOnHover && displayState === 'collapsed' && allowOrbit) {
      setViewMode('orbit');
      setDisplayState('preview');
    }
  }, [allowOrbit, displayState, previewOnHover]);

  const handleAnchorBlur = useCallback((event: ReactFocusEvent<HTMLElement>) => {
    const nextFocused = event.relatedTarget;

    if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
      if (displayState === 'preview') {
        setDisplayState('collapsed');
      }
    }
  }, [displayState]);

  const handleCoreKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCoreClick();
    }
  }, [handleCoreClick]);

  const handleNavKeyDown = useCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    const useTimeline = viewMode === 'timeline' && allowTimeline;
    const total = useTimeline ? (timelineItems?.length ?? 0) : items.length;

    if (total === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        stepBy(-1);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        stepBy(1);
        break;
      case 'Home':
        event.preventDefault();
        stepBy(-total);
        break;
      case 'End':
        event.preventDefault();
        stepBy(total);
        break;
      default:
        break;
    }
  }, [allowTimeline, items.length, stepBy, timelineItems?.length, viewMode]);

  const handleTimelineSurfaceClick = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!allowTimeline || !timelineItems || timelineItems.length === 0) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const normalizedAngle = projectPointToArcRatio(localX, localY, layout);
    let targetIndex = 0;
    let minDistance = Infinity;

    timelineRatios.forEach((ratio, index) => {
      const distance = Math.abs(ratio - normalizedAngle);

      if (distance < minDistance) {
        minDistance = distance;
        targetIndex = index;
      }
    });

    const targetItem = timelineItems[targetIndex];

    if (targetItem && targetItem.id !== activeId) {
      pendingTimelineIndexRef.current = targetIndex;
      onSelect(targetItem.id);
    }
  }, [activeId, allowTimeline, layout, onSelect, timelineItems, timelineRatios]);

  useEffect(() => {
    if (displayState === 'expanded') {
      lastExpandedViewRef.current = viewMode;
    }
  }, [displayState, viewMode]);

  return {
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
    selectIndex,
  };
}
