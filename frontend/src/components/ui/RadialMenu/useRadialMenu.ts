import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  MAX_VISIBLE_ITEMS,
  MOTION_EASING,
  MOTION_SNAP_THRESHOLD,
  TIMELINE_CENTER,
  WHEEL_RESET_MS,
  WHEEL_STEP_DELTA,
  clamp,
  formatTimelineYear,
  getPointerAngle,
  getTimelineArcConfig,
  getTimelineArcPath,
  getTimelinePosition,
  getTimelineRatios,
} from './geometry';
import type { RadialMenuProps } from './types';

type UseRadialMenuArgs = {
  items: RadialMenuProps['items'];
  timelineItems: RadialMenuProps['timelineItems'] | undefined;
  activeId: RadialMenuProps['activeId'];
  onSelect: RadialMenuProps['onSelect'];
  side: RadialMenuProps['side'];
  accentColor: RadialMenuProps['accentColor'] | undefined;
};

export function useRadialMenu({
  items,
  timelineItems,
  activeId,
  onSelect,
  side,
  accentColor,
}: UseRadialMenuArgs) {
  const activeIndex = Math.max(items.findIndex((item) => item.id === activeId), 0);
  const activeTimelineIndex = Math.max(timelineItems?.findIndex((item) => item.id === activeId) ?? -1, 0);
  const activeTimelineItem = timelineItems?.[activeTimelineIndex] ?? null;
  const [animatedIndex, setAnimatedIndex] = useState(activeIndex);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'radial' | 'timeline'>('radial');
  const wheelDeltaRef = useRef(0);
  const lastWheelEventTimeRef = useRef(0);
  const pendingIndexRef = useRef(activeIndex);
  const pendingTimelineIndexRef = useRef(activeTimelineIndex);
  const animatedIndexRef = useRef(activeIndex);
  const animationFrameRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const activeItem = items[activeIndex] ?? null;
  const resolvedAccent = activeItem?.accentColor || accentColor || 'var(--imperial-accent)';
  const progressRatio = items.length > 0 ? (activeIndex + 1) / items.length : 0;
  const visibleCount = Math.min(items.length, MAX_VISIBLE_ITEMS);
  const visibleWindowStart = clamp(
    animatedIndex - (visibleCount - 1) / 2,
    0,
    Math.max(items.length - visibleCount, 0),
  );
  const visibleItems = useMemo(() => {
    const sliceStart = Math.floor(visibleWindowStart);
    return items.slice(sliceStart, sliceStart + visibleCount).map((item, index) => ({
      item,
      globalIndex: sliceStart + index,
    }));
  }, [items, visibleCount, visibleWindowStart]);
  const timelineActiveIndex = timelineItems && timelineItems.length > 0
    ? activeTimelineIndex
    : activeIndex;
  const timelineProgressRatio = timelineItems && timelineItems.length > 0
    ? (timelineActiveIndex + 1) / timelineItems.length
    : 0;
  const timelineArcConfig = getTimelineArcConfig(timelineItems?.length ?? 0);
  const timelineRadius = timelineArcConfig.radius;
  const timelineArcSpan = timelineArcConfig.arcSpan;
  const timelineHalfArc = timelineArcSpan / 2;
  // 按真实年份计算各刻度归一化位置；年份缺失时回退均匀分布。
  const timelineRatios = useMemo(
    () => getTimelineRatios((timelineItems ?? []).map((item) => item.yearValue)),
    [timelineItems],
  );
  const timelineActiveRatio = timelineRatios[timelineActiveIndex] ?? 0;
  const timelineActivePosition = getTimelinePosition(timelineActiveRatio, timelineItems?.length ?? 0, side, timelineRadius, timelineArcSpan);
  const timelineActiveAngle = timelineActivePosition.angle;
  const timelinePointerAngle = getPointerAngle(timelineActiveAngle, side);
  const timelineFullArcPath = getTimelineArcPath(-timelineHalfArc, timelineHalfArc, timelineRadius);
  const timelineActiveArcPath = timelineItems && timelineItems.length > 1
    ? getTimelineArcPath(-timelineHalfArc, timelineActiveAngle, timelineRadius)
    : '';
  const timelineCoreLabel = formatTimelineYear(activeTimelineItem?.yearValue, activeTimelineItem?.yearLabel);

  // 当前位置计数（1-based）：随模式取径向/时间轴的索引与总数。
  const isTimelineMode = mode === 'timeline' && !!timelineItems?.length;
  const totalCount = isTimelineMode ? (timelineItems?.length ?? 0) : items.length;
  const currentNumber = totalCount > 0
    ? (isTimelineMode ? timelineActiveIndex : activeIndex) + 1
    : 0;

  useEffect(() => {
    if (items.length === 0) {
      pendingIndexRef.current = 0;
      pendingTimelineIndexRef.current = 0;
      animatedIndexRef.current = 0;
      setAnimatedIndex(0);
      setMode('radial');
      return;
    }

    pendingIndexRef.current = activeIndex;
  }, [activeIndex, items.length]);

  useEffect(() => {
    if (!timelineItems || timelineItems.length === 0) {
      pendingTimelineIndexRef.current = 0;
      return;
    }

    pendingTimelineIndexRef.current = activeTimelineIndex;
  }, [activeTimelineIndex, timelineItems]);

  useEffect(() => {
    if (!timelineItems || timelineItems.length === 0) {
      if (mode === 'timeline') {
        setMode('radial');
      }
    }
  }, [mode, timelineItems]);

  useEffect(() => {
    if (items.length === 0) {
      return undefined;
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
    if (!isExpanded) {
      wheelDeltaRef.current = 0;
      lastWheelEventTimeRef.current = 0;
    }
  }, [isExpanded]);

  useEffect(() => {
    wheelDeltaRef.current = 0;
    lastWheelEventTimeRef.current = 0;
  }, [mode]);

  const selectIndex = useCallback((targetIndex: number) => {
    const targetItem = items[targetIndex];

    if (targetItem) {
      pendingIndexRef.current = targetIndex;
      onSelect(targetItem.id);
    }
  }, [items, onSelect]);

  const applyWheelDelta = useCallback((deltaY: number) => {
    const sourceItems = mode === 'timeline' && timelineItems?.length ? timelineItems : items;

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

    const currentIndex = mode === 'timeline' && timelineItems?.length
      ? pendingTimelineIndexRef.current
      : pendingIndexRef.current;
    const targetIndex = clamp(currentIndex + steps, 0, sourceItems.length - 1);

    if (mode === 'timeline' && timelineItems?.length) {
      const targetItem = timelineItems[targetIndex];

      if (targetItem && targetIndex !== currentIndex) {
        pendingTimelineIndexRef.current = targetIndex;
        onSelect(targetItem.id);
        return true;
      }

      wheelDeltaRef.current = 0;
      return false;
    }

    if (targetIndex !== currentIndex) {
      selectIndex(targetIndex);
      return true;
    }

    wheelDeltaRef.current = 0;
    return false;
  }, [items, mode, onSelect, selectIndex, timelineItems]);

  const handleAnchorBlur = useCallback((event: ReactFocusEvent<HTMLElement>) => {
    const nextFocused = event.relatedTarget;

    if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
      setIsExpanded(false);
    }
  }, []);

  useEffect(() => {
    const menuElement = menuRef.current;

    if (!menuElement || !isExpanded) {
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
  }, [applyWheelDelta, isExpanded]);

  const handleCoreClick = useCallback(() => {
    if (timelineItems && timelineItems.length > 0) {
      setMode((currentMode) => (currentMode === 'radial' ? 'timeline' : 'radial'));
      setIsExpanded(true);
    }
  }, [timelineItems]);

  const handleCoreKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCoreClick();
    }
  }, [handleCoreClick]);

  const handleTimelineSurfaceClick = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!timelineItems || timelineItems.length === 0) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + TIMELINE_CENTER;
    const centerY = rect.top + TIMELINE_CENTER;
    const localX = event.clientX - centerX;
    const localY = event.clientY - centerY;

    // 使用弧线角度计算
    const clickAngle = Math.atan2(localY, Math.abs(localX)) * (180 / Math.PI);
    const halfArc = timelineArcSpan / 2;
    const normalizedAngle = clamp((clickAngle + halfArc) / timelineArcSpan, 0, 1); // -halfArc..+halfArc → 0..1
    // 刻度按真实年份非均匀分布，取归一化位置最接近点击处的刻度（最近邻）。
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
  }, [activeId, onSelect, timelineItems, timelineArcSpan, timelineRatios]);

  const selectTimelineIndex = useCallback((index: number, id: string) => {
    pendingTimelineIndexRef.current = index;
    onSelect(id);
  }, [onSelect]);

  // 在当前模式对应的数据源里相对移动 step 步（方向键导航）。
  const stepBy = useCallback((step: number) => {
    const useTimeline = mode === 'timeline' && !!timelineItems?.length;
    const sourceItems = useTimeline ? timelineItems! : items;

    if (sourceItems.length === 0) {
      return;
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
      selectIndex(targetIndex);
    }
  }, [items, mode, onSelect, selectIndex, timelineItems]);

  // 方向键导航：↑/← 上一项，↓/→ 下一项，Home/End 首尾。
  const handleNavKeyDown = useCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    const useTimeline = mode === 'timeline' && !!timelineItems?.length;
    const total = useTimeline ? (timelineItems?.length ?? 0) : items.length;

    if (total === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        setIsExpanded(true);
        stepBy(-1);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        setIsExpanded(true);
        stepBy(1);
        break;
      case 'Home':
        event.preventDefault();
        setIsExpanded(true);
        stepBy(-total);
        break;
      case 'End':
        event.preventDefault();
        setIsExpanded(true);
        stepBy(total);
        break;
      default:
        break;
    }
  }, [items.length, mode, stepBy, timelineItems]);

  return {
    menuRef,
    isExpanded,
    setIsExpanded,
    mode,
    resolvedAccent,
    progressRatio,
    timelineProgressRatio,
    currentNumber,
    totalCount,
    // 径向视图
    activeItem,
    visibleItems,
    visibleWindowStart,
    visibleCount,
    // 时间轴视图
    activeTimelineItem,
    timelineRadius,
    timelineArcSpan,
    timelineRatios,
    timelineFullArcPath,
    timelineActiveArcPath,
    timelinePointerAngle,
    timelineCoreLabel,
    // 回调
    handleAnchorBlur,
    handleCoreClick,
    handleCoreKeyDown,
    handleNavKeyDown,
    handleTimelineSurfaceClick,
    selectTimelineIndex,
  };
}
