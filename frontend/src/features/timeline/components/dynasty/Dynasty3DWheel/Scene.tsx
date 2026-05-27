/**
 * 3D 场景 —— 灯光 + 粒子 + 朝代轮播
 */

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import type { Dynasty } from '@/services/culture/types';
import { Particles } from './Particles';
import { DynastyCarousel } from './DynastyCarousel';

interface SceneProps {
  dynasties: Dynasty[];
  activeIndex: number;
  onCardClick: (index: number) => void;
}

export function Scene({ dynasties, activeIndex, onCardClick }: SceneProps) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.35, 6.25);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.35, 6.25]} fov={48} />

      {/* 环境光 */}
      <ambientLight intensity={0.42} />

      {/* 主光源 */}
      <directionalLight position={[4, 4, 4]} intensity={1.05} castShadow />
      <directionalLight position={[-4, 3, -5]} intensity={0.4} />

      {/* 前侧补光 */}
      <pointLight position={[0, 0.6, 2.8]} intensity={1.45} distance={11} color="#f7d39a" />

      {/* 粒子背景 */}
      <Particles />

      {/* 朝代圆环 */}
      <DynastyCarousel
        dynasties={dynasties}
        activeIndex={activeIndex}
        onCardClick={onCardClick}
      />
    </>
  );
}
