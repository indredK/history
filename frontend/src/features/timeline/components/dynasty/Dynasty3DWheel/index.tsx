/**
 * 朝代 3D 立体轮播 —— 顶层组件
 * Dynasty 3D Wheel
 *
 * 数据获取 + 滚轮节流 + Three.js Canvas 渲染
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useRequest } from 'ahooks';
import { useDynastyStore } from '@/store';
import { getDynasties } from '@/services/dataClient';
import type { Dynasty } from '@/services/culture/types';
import { Scene } from './Scene';
import { useDynastyWheelScroll } from './useDynastyWheelScroll';
import './Dynasty3DWheel.css';

interface Dynasty3DWheelProps {
  className?: string;
}

export function Dynasty3DWheel({ className }: Dynasty3DWheelProps) {
  const { setSelectedDynasty } = useDynastyStore();
  const [allDynasties, setAllDynasties] = useState<Dynasty[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const dynasties = useMemo(() => allDynasties, [allDynasties]);

  // 同步当前激活朝代到全局 store
  useEffect(() => {
    if (dynasties.length > 0) {
      setSelectedDynasty(dynasties[activeIndex]);
    }
  }, [activeIndex, dynasties, setSelectedDynasty]);

  // 滚轮切换
  useDynastyWheelScroll({
    containerRef,
    total: dynasties.length,
    setActiveIndex,
  });

  if (dynasties.length === 0) return null;

  return (
    <div
      className={`dynasty-3d-wheel-container ${className || ''}`}
      ref={containerRef}
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
    </div>
  );
}
