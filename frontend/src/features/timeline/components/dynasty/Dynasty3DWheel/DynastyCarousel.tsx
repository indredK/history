/**
 * 朝代卡片轮播 —— 环形轨道动画
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { dynastyConfig } from '@/config';
import type { Dynasty } from '@/services/culture/types';
import {
  buildCircularCarouselLayout,
  getCircularTrackPoint,
  type CircularCarouselOptions,
} from '@/utils';
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
  const cardRefs = useRef<Array<THREE.Group | null>>([]);
  const currentIndex = useRef(activeIndex);

  const { geometry, animation } = dynastyConfig.threeDConfig;
  const motionDamping = Math.max(8, animation.moveSpeed * 96);

  const layoutOptions = useMemo<CircularCarouselOptions>(() => {
    const requestedSlots = dynasties.length >= 7 ? 7 : dynasties.length;

    return {
      visibleSlots: requestedSlots > 2 && requestedSlots % 2 === 0
        ? requestedSlots - 1
        : requestedSlots,
      radiusX: Math.max(4.3, geometry.cardWidth * 2.05),
      radiusZ: Math.max(2.5, geometry.cardHeight * 0.98),
      verticalLift: 0.18,
      zOffset: Math.max(1.8, geometry.cardHeight * 0.8),
    };
  }, [dynasties.length, geometry.cardHeight, geometry.cardWidth]);

  const depthBounds = useMemo(() => {
    const radiusZ = layoutOptions.radiusZ ?? 2.5;
    const zOffset = layoutOptions.zOffset ?? radiusZ * 0.72;

    return {
      min: -radiusZ - zOffset,
      max: radiusZ - zOffset,
    };
  }, [layoutOptions.radiusZ, layoutOptions.zOffset]);

  const orbitLine = useMemo(() => {
    const points: THREE.Vector3[] = [];

    for (let step = 0; step <= 72; step += 1) {
      const angle = (step / 72) * Math.PI * 2;
      const point = getCircularTrackPoint(angle, layoutOptions);
      points.push(new THREE.Vector3(point.x, point.y, point.z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: '#d2a05a',
      transparent: true,
      opacity: 0.14,
    });

    return new THREE.LineLoop(geometry, material);
  }, [layoutOptions]);

  cardRefs.current.length = dynasties.length;

  useFrame((_, delta) => {
    if (dynasties.length === 0) {
      return;
    }

    currentIndex.current = THREE.MathUtils.damp(
      currentIndex.current,
      activeIndex,
      motionDamping,
      delta,
    );

    const layout = buildCircularCarouselLayout(
      dynasties.length,
      currentIndex.current,
      layoutOptions,
    );

    layout.forEach((item, index) => {
      const card = cardRefs.current[index];

      if (!card) {
        return;
      }

      card.position.set(item.x, item.y, item.z);
      card.visible = item.visible;
    });
  });

  return (
    <group>
      <primitive object={orbitLine} />

      {dynasties.map((dynasty, index) => (
        <DynastyCard
          key={dynasty.id}
          ref={(node) => {
            cardRefs.current[index] = node;
          }}
          dynasty={dynasty}
          depthBounds={depthBounds}
          isActive={index === activeIndex}
          onClick={() => onCardClick(index)}
        />
      ))}
    </group>
  );
}
