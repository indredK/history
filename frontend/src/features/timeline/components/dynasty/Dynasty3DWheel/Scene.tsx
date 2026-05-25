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
    camera.position.set(0, 0.5, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 4]} fov={60} />

      {/* 环境光 */}
      <ambientLight intensity={0.3} />

      {/* 主光源 */}
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />

      {/* 点光源 —— 跟随活跃卡片 */}
      <pointLight position={[0, 0, 0]} intensity={2} distance={10} color="#ffd700" />

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
