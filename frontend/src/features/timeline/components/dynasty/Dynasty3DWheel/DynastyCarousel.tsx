/**
 * 朝代卡片轮播 —— 平滑插值位移
 */

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { dynastyConfig } from '@/config';
import type { Dynasty } from '@/services/culture/types';
import { DynastyCard } from './DynastyCard';

interface DynastyCarouselProps {
  dynasties: Dynasty[];
  activeIndex: number;
  onCardClick: (index: number) => void;
}

export function DynastyCarousel({
  dynasties,
  activeIndex,
  onCardClick,
}: DynastyCarouselProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPosition = useRef<number>(0);
  const currentPosition = useRef<number>(0);

  const spacing = dynastyConfig.threeDConfig.spacing;
  const moveSpeed = dynastyConfig.threeDConfig.animation.moveSpeed;

  useEffect(() => {
    targetPosition.current = -activeIndex * spacing;
  }, [activeIndex, spacing]);

  useFrame(() => {
    if (!groupRef.current) return;
    // 平滑插值移动
    currentPosition.current +=
      (targetPosition.current - currentPosition.current) * moveSpeed;
    groupRef.current.position.x = currentPosition.current;
  });

  return (
    <group ref={groupRef}>
      {dynasties.map((dynasty, index) => {
        const x = index * spacing;
        const isActive = index === activeIndex;
        const distanceFromCenter = Math.abs(index - activeIndex);
        const zOffset = -distanceFromCenter * 0.3;

        return (
          <DynastyCard
            key={dynasty.id}
            dynasty={dynasty}
            position={[x, 0, zOffset]}
            rotation={[0, 0, 0]}
            isActive={isActive}
            onClick={() => onCardClick(index)}
          />
        );
      })}
    </group>
  );
}
