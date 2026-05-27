/**
 * 朝代 3D 立体轮播 —— 顶层组件
 * Dynasty 3D Wheel
 *
 * 数据获取 + 滚轮节流 + Three.js Canvas 渲染
 */

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { useRequest } from 'ahooks';
import { ResponsiveIconButton } from '@/components/ui';
import { useDynastyStore } from '@/store';
import { getDynasties } from '@/services/dataClient';
import type { Dynasty } from '@/services/culture/types';
import { formatTimelineYear } from '@/features/timeline/utils/dynastyUtils';
import { Scene } from './Scene';
import { useDynastyWheelScroll } from './useDynastyWheelScroll';
import './Dynasty3DWheel.css';

interface Dynasty3DWheelProps {
  className?: string;
}

export function Dynasty3DWheel({ className }: Dynasty3DWheelProps) {
  const { selectedDynasty, setSelectedDynasty } = useDynastyStore();
  const [allDynasties, setAllDynasties] = useState<Dynasty[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedDynastyId = selectedDynasty?.id ?? null;

  // 获取朝代数据
  useRequest(
    async () => {
      const result = await getDynasties();
      return result.data;
    },
    {
      cacheKey: 'dynasties_all',
      manual: false,
      onSuccess: (dynasties: Dynasty[]) => setAllDynasties(dynasties),
    }
  );

  const dynasties = allDynasties;

  useEffect(() => {
    if (dynasties.length === 0) {
      return;
    }

    if (selectedDynastyId) {
      const matchedIndex = dynasties.findIndex(
        (dynasty) => dynasty.id === selectedDynastyId,
      );

      if (matchedIndex >= 0 && matchedIndex !== activeIndex) {
        setActiveIndex(matchedIndex);
        return;
      }
    }

    if (activeIndex < 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, dynasties, selectedDynastyId]);

  // 同步当前激活朝代到全局 store
  useEffect(() => {
    if (activeIndex < 0) {
      return;
    }

    const activeDynasty = dynasties[activeIndex];

    if (activeDynasty && activeDynasty.id !== selectedDynastyId) {
      setSelectedDynasty(activeDynasty);
    }
  }, [activeIndex, dynasties, selectedDynastyId, setSelectedDynasty]);

  const wrapIndex = useCallback(
    (index: number) => {
      if (dynasties.length === 0) {
        return 0;
      }

      return ((index % dynasties.length) + dynasties.length) % dynasties.length;
    },
    [dynasties.length],
  );

  const stepIndex = useCallback(
    (direction: number) => {
      if (dynasties.length === 0) {
        return;
      }

      setActiveIndex((prev) => wrapIndex((prev < 0 ? 0 : prev) + direction));
    },
    [dynasties.length, wrapIndex],
  );

  const activeDynasty = activeIndex >= 0 ? dynasties[activeIndex] : null;
  const activePeriod = useMemo(() => {
    if (!activeDynasty) {
      return '';
    }

    const endLabel = activeDynasty.endYear
      ? formatTimelineYear(activeDynasty.endYear, { short: true })
      : '今';

    return `${formatTimelineYear(activeDynasty.startYear, { short: true })} - ${endLabel}`;
  }, [activeDynasty]);

  // 滚轮切换
  useDynastyWheelScroll({
    containerRef,
    total: dynasties.length,
    setActiveIndex,
  });

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (dynasties.length === 0) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepIndex(-1);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepIndex(1);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setActiveIndex(0);
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        setActiveIndex(dynasties.length - 1);
      }
    },
    [dynasties.length, stepIndex],
  );

  if (dynasties.length === 0 || activeIndex < 0 || !activeDynasty) return null;

  return (
    <div
      className={`dynasty-3d-wheel-container ${className || ''}`}
      ref={containerRef}
      role="group"
      tabIndex={0}
      aria-label="朝代环形切换器"
      onKeyDown={handleKeyDown}
      onPointerDown={() => {
        containerRef.current?.focus();
      }}
    >
      <Canvas shadows gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <Suspense fallback={null}>
          <Scene
            dynasties={dynasties}
            activeIndex={activeIndex}
            onCardClick={(index) => setActiveIndex(index)}
          />
        </Suspense>
      </Canvas>

      <div className="dynasty-navigation">
        <div className="dynasty-indicator">
          <Tooltip title="上一朝代" arrow>
            <ResponsiveIconButton
              aria-label="上一朝代"
              onClick={() => stepIndex(-1)}
              responsive={false}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                color: 'var(--color-text-secondary)',
                flexShrink: 0,
              }}
            >
              <KeyboardArrowLeft fontSize="small" />
            </ResponsiveIconButton>
          </Tooltip>

          <div className="dynasty-indicator-copy">
            <span className="dynasty-indicator-name">{activeDynasty.name}</span>
            <span className="dynasty-indicator-period">{activePeriod}</span>
          </div>

          <Tooltip title="下一朝代" arrow>
            <ResponsiveIconButton
              aria-label="下一朝代"
              onClick={() => stepIndex(1)}
              responsive={false}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                color: 'var(--color-text-secondary)',
                flexShrink: 0,
              }}
            >
              <KeyboardArrowRight fontSize="small" />
            </ResponsiveIconButton>
          </Tooltip>
        </div>

        <div className="dynasty-hint">
          <span>{activeIndex + 1} / {dynasties.length}</span>
          <span aria-hidden="true">·</span>
          <span>滚轮 / 点击卡片 / 左右方向键</span>
        </div>
      </div>
    </div>
  );
}
