import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type CSSProperties,
  type WheelEvent as ReactWheelEvent,
} from 'react';

export interface SideRadialMenuItem {
  id: string;
  label: string;
  subtitle?: string;
  meta?: string;
  accentColor?: string;
}

interface SideRadialMenuProps {
  items: SideRadialMenuItem[];
  activeId: string;
  onSelect: (itemId: string) => void;
  side: 'left' | 'right';
  ariaLabel: string;
  emptyText: string;
  accentColor?: string;
  emptyMode?: 'text' | 'disc';
}

const MAX_VISIBLE_ITEMS = 5;
const ARC_SPAN_DEGREES = 76;
const BASE_RADIUS = 144;
const RADIUS_VARIATION = 18;
const WHEEL_STEP_DELTA = 36;
const MOTION_EASING = 0.22;
const MOTION_SNAP_THRESHOLD = 0.002;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function SideRadialMenu({
  items,
  activeId,
  onSelect,
  side,
  ariaLabel,
  emptyText,
  accentColor,
  emptyMode = 'text',
}: SideRadialMenuProps) {
  const activeIndex = Math.max(items.findIndex((item) => item.id === activeId), 0);
  const [animatedIndex, setAnimatedIndex] = useState(activeIndex);
  const [isExpanded, setIsExpanded] = useState(false);
  const wheelDeltaRef = useRef(0);
  const pendingIndexRef = useRef(activeIndex);
  const animatedIndexRef = useRef(activeIndex);
  const animationFrameRef = useRef<number | null>(null);
  const orbitRef = useRef<HTMLDivElement | null>(null);
  const coreDiscRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (items.length === 0) {
      pendingIndexRef.current = 0;
      animatedIndexRef.current = 0;
      setAnimatedIndex(0);
      return;
    }

    pendingIndexRef.current = activeIndex;
  }, [activeIndex, items.length]);

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

  const selectIndex = useCallback((targetIndex: number) => {
    const targetItem = items[targetIndex];

    if (targetItem) {
      pendingIndexRef.current = targetIndex;
      onSelect(targetItem.id);
    }
  }, [items, onSelect]);

  const handleWheel = useCallback((event: ReactWheelEvent<HTMLElement>) => {
    if (items.length <= 1) {
      return;
    }

    event.preventDefault();

    if (wheelDeltaRef.current !== 0 && Math.sign(wheelDeltaRef.current) !== Math.sign(event.deltaY)) {
      wheelDeltaRef.current = 0;
    }

    wheelDeltaRef.current += event.deltaY;

    if (Math.abs(wheelDeltaRef.current) < WHEEL_STEP_DELTA) {
      return;
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
      return;
    }

    const targetIndex = clamp(pendingIndexRef.current + steps, 0, items.length - 1);

    if (targetIndex !== pendingIndexRef.current) {
      selectIndex(targetIndex);
    }
  }, [items.length, selectIndex]);

  const handleAnchorBlur = useCallback((event: ReactFocusEvent<HTMLElement>) => {
    const nextFocused = event.relatedTarget;

    if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
      setIsExpanded(false);
    }
  }, []);

  const isPointerWithinInteractionZone = useCallback((clientX: number, clientY: number) => {
    const orbitElement = orbitRef.current;
    const coreDiscElement = coreDiscRef.current;

    if (!orbitElement || !coreDiscElement) {
      return false;
    }

    const orbitRect = orbitElement.getBoundingClientRect();
    const orbitCenterX = orbitRect.left + orbitRect.width / 2;
    const orbitCenterY = orbitRect.top + orbitRect.height / 2;
    const orbitRadius = orbitRect.width / 2;
    const deltaX = clientX - orbitCenterX;
    const deltaY = clientY - orbitCenterY;
    const isInsideHalfArc = Math.hypot(deltaX, deltaY) <= orbitRadius
      && (side === 'left' ? deltaX >= -20 : deltaX <= 20);

    if (isInsideHalfArc) {
      return true;
    }

    const coreRect = coreDiscElement.getBoundingClientRect();

    return (
      clientX >= coreRect.left
      && clientX <= coreRect.right
      && clientY >= coreRect.top
      && clientY <= coreRect.bottom
    );
  }, [side]);

  useEffect(() => {
    if (!isExpanded) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!isPointerWithinInteractionZone(event.clientX, event.clientY)) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isExpanded, isPointerWithinInteractionZone]);

  return (
    <aside
      className={`cyber-arc-menu cyber-arc-menu--${side}${isExpanded ? ' cyber-arc-menu--expanded' : ''}`}
      style={{
        '--menu-accent': resolvedAccent,
        '--menu-accent-glow': `${resolvedAccent}2e`,
        '--menu-progress': progressRatio.toFixed(4),
      } as CSSProperties}
      onWheel={handleWheel}
    >
      {items.length === 0 ? (
        emptyMode === 'disc' ? (
          <div className="cyber-arc-menu__hub">
            <div className="cyber-arc-menu__core">
              <div className="cyber-arc-menu__core-disc cyber-arc-menu__core-disc--empty" aria-hidden="true" />
            </div>
          </div>
        ) : (
          <div className="cyber-arc-menu__empty">{emptyText}</div>
        )
      ) : (
        <div
          className="cyber-arc-menu__anchor"
          onFocusCapture={() => setIsExpanded(true)}
          onBlurCapture={handleAnchorBlur}
        >
          <div
            ref={orbitRef}
            className="cyber-arc-menu__orbit"
            role="listbox"
            aria-label={ariaLabel}
          >
            {visibleItems.map(({ item, globalIndex }) => {
              const isActive = item.id === activeItem?.id;
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
                  className={`cyber-arc-menu__node${isActive ? ' cyber-arc-menu__node--active' : ''}`}
                  style={{
                    '--item-accent': item.accentColor || resolvedAccent,
                    '--item-accent-soft': `${item.accentColor || resolvedAccent}3d`,
                    '--item-accent-glow': `${item.accentColor || resolvedAccent}52`,
                    '--orbit-x': `${orbitX.toFixed(1)}px`,
                    '--orbit-y': `${orbitY.toFixed(1)}px`,
                  } as CSSProperties}
                  onClick={() => onSelect(item.id)}
                  aria-label={`选择${item.label}`}
                  aria-selected={isActive}
                >
                  <span className="cyber-arc-menu__node-disc" aria-hidden="true">
                    {item.meta || String(globalIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="cyber-arc-menu__node-copy">
                    <span className="cyber-arc-menu__node-title">{item.label}</span>
                    {item.subtitle ? (
                      <span className="cyber-arc-menu__node-subtitle">{item.subtitle}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="cyber-arc-menu__hub">
            <div className="cyber-arc-menu__core">
              <div
                ref={coreDiscRef}
                className="cyber-arc-menu__core-disc"
                onPointerEnter={() => setIsExpanded(true)}
                tabIndex={0}
              >
                <span className="cyber-arc-menu__core-title">{activeItem?.label || '未选中'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
