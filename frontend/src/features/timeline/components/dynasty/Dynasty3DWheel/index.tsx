/**
 * 朝代 3D 立体轮播 —— 顶层组件
 * Dynasty 3D Wheel
 *
 * 数据获取 + 滚轮节流 + Three.js Canvas 渲染 + 效果切换
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
import { Canvas } from '@react-three/fiber';
import { useDynastyStore } from '@/store';
import { getDynasties } from '@/services/dataClient';
import type { Dynasty } from '@/services/culture/types';
import { Scene } from './Scene';
import { useDynastyWheelScroll } from './useDynastyWheelScroll';
import { EffectSwitcher } from './EffectSwitcher';
import { DEFAULT_EFFECT_ID, getEffectById } from './effects/registry';
import './Dynasty3DWheel.scss';

interface Dynasty3DWheelProps {
  className?: string;
}

const EFFECT_STORAGE_KEY = 'dynasty3DWheel.effectId';

export function Dynasty3DWheel({ className }: Dynasty3DWheelProps) {
  const { selectedDynasty, setSelectedDynasty, setDynasties } = useDynastyStore();
  const [allDynasties, setAllDynasties] = useState<Dynasty[]>([]);
  const [effectId, setEffectId] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_EFFECT_ID;
    return window.localStorage.getItem(EFFECT_STORAGE_KEY) ?? DEFAULT_EFFECT_ID;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedDynastyId = selectedDynasty?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    const loadDynasties = async () => {
      const result = await getDynasties();

      if (!cancelled) {
        setAllDynasties(result.data);
        setDynasties(result.data);
      }
    };

    void loadDynasties();

    return () => {
      cancelled = true;
    };
  }, [setDynasties]);

  const dynasties = allDynasties;
  const effect = useMemo(() => getEffectById(effectId), [effectId]);

  const handleEffectChange = useCallback((id: string) => {
    setEffectId(id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(EFFECT_STORAGE_KEY, id);
    }
  }, []);

  const activeIndex = useMemo(() => {
    if (dynasties.length === 0) return -1;
    if (!selectedDynastyId) return 0;
    const idx = dynasties.findIndex((d) => d.id === selectedDynastyId);
    return idx >= 0 ? idx : 0;
  }, [dynasties, selectedDynastyId]);

  useEffect(() => {
    if (dynasties.length === 0 || selectedDynastyId) return;
    const first = dynasties[0];
    if (first) setSelectedDynasty(first);
  }, [dynasties, selectedDynastyId, setSelectedDynasty]);

  const setActiveIndex = useCallback(
    (indexOrUpdater: number | ((prev: number) => number)) => {
      if (dynasties.length === 0) return;
      const next =
        typeof indexOrUpdater === 'function'
          ? indexOrUpdater(activeIndex)
          : indexOrUpdater;
      const target = dynasties[next];
      if (target && target.id !== selectedDynastyId) {
        setSelectedDynasty(target);
      }
    },
    [dynasties, activeIndex, selectedDynastyId, setSelectedDynasty],
  );

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
            effect={effect}
            dynasties={dynasties}
            activeIndex={activeIndex}
            onCardClick={(index) => setActiveIndex(index)}
          />
        </Suspense>
      </Canvas>

      <div className="dynasty-effect-switcher-anchor">
        <EffectSwitcher currentId={effectId} onChange={handleEffectChange} />
      </div>
    </div>
  );
}
