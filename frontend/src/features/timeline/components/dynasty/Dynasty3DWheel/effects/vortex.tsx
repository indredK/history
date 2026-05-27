/**
 * vortex 粒子涡旋
 *
 * 中心一团高速旋转的粒子涡漩,卡片在涡漩外围排成环并缓慢逆向公转。
 * 视觉重心在中心粒子流,卡片是"绕涡漩转的星体"。
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DynastyCard } from '../shared/DynastyCard';
import type { DynastyEffect, EffectLayoutProps, EffectParticlesProps } from './types';

const VORTEX_PARTICLES = 520;
const RADIUS_RATIO = 0.34;
const RADIUS_MIN = 2.6;
const RADIUS_MAX = 6.8;
const Y_LIFT = 0.3;

function radiusForViewport(width: number): number {
  return THREE.MathUtils.clamp(width * RADIUS_RATIO, RADIUS_MIN, RADIUS_MAX);
}

function VortexLayout({ dynasties, activeIndex, onCardClick }: EffectLayoutProps) {
  const total = dynasties.length;
  const groupRef = useRef<THREE.Group>(null);
  const currentRotationRef = useRef(0);
  const viewportWidth = useThree((state) => state.viewport.width);
  const radius = useMemo(() => radiusForViewport(viewportWidth), [viewportWidth]);

  const baseAngles = useMemo(() => {
    if (total === 0) return [];
    const step = (Math.PI * 2) / total;
    return dynasties.map((_, i) => i * step);
  }, [dynasties, total]);

  useFrame((_, delta) => {
    if (!groupRef.current || total === 0) return;
    const targetRotation = -baseAngles[activeIndex]!;
    let cur = currentRotationRef.current;
    let diff = targetRotation - cur;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    cur = THREE.MathUtils.damp(cur, cur + diff, 6, delta);
    // 在切换之外叠加非常缓慢的自然漂移
    cur += delta * 0.04;
    currentRotationRef.current = cur;
    groupRef.current.rotation.y = cur;
  });

  return (
    <group ref={groupRef}>
      {dynasties.map((dynasty, index) => {
        const angle = baseAngles[index] ?? 0;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const isActive = index === activeIndex;

        return (
          <group
            key={dynasty.id}
            position={[x, Y_LIFT, z]}
            rotation={[0, angle, 0]}
          >
            <DynastyCard
              dynasty={dynasty}
              position={[0, 0, 0]}
              faceCamera={false}
              rotationY={0}
              scaleHint={isActive ? 1 : 0.65}
              isVisible
              isActive={isActive}
              onClick={() => onCardClick(index)}
            />
          </group>
        );
      })}
    </group>
  );
}

function VortexParticles({ activeIndex, total }: EffectParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const viewportWidth = useThree((state) => state.viewport.width);
  const outerRadius = useMemo(() => radiusForViewport(viewportWidth), [viewportWidth]);

  const positions = useMemo(() => new Float32Array(VORTEX_PARTICLES * 3), []);
  // 每个粒子有自己的初始角度 / 半径 / 高度噪声 / 速度
  const seeds = useMemo(() => {
    const arr = new Float32Array(VORTEX_PARTICLES * 4);
    for (let i = 0; i < VORTEX_PARTICLES; i += 1) {
      arr[i * 4] = Math.random(); // 角度种子
      arr[i * 4 + 1] = Math.random(); // 半径种子(0=中心,1=外圈)
      arr[i * 4 + 2] = Math.random(); // 高度种子
      arr[i * 4 + 3] = Math.random(); // 速度种子
    }
    return arr;
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    // 涡漩半径上限 = 卡片环半径的 0.85,留出一点空间
    const vortexR = outerRadius * 0.85;

    for (let i = 0; i < VORTEX_PARTICLES; i += 1) {
      const aSeed = seeds[i * 4]!;
      const rSeed = seeds[i * 4 + 1]!;
      const hSeed = seeds[i * 4 + 2]!;
      const vSeed = seeds[i * 4 + 3]!;

      // 半径越小,旋转速度越快(中心快、外圈慢)
      const r = rSeed * vortexR + 0.3;
      const omega = 1.2 + (1 - rSeed) * 2.8; // 中心 ~4 rad/s,外圈 ~1.2
      const angle = aSeed * Math.PI * 2 + t * omega + vSeed * 0.4;

      arr[i * 3] = Math.sin(angle) * r;
      // 高度按二次曲线,中心被"吸"得更扁
      arr[i * 3 + 1] =
        Y_LIFT + (hSeed - 0.5) * 1.4 * (rSeed * 0.4 + 0.4)
        + Math.sin(t * 0.6 + hSeed * 12) * 0.06;
      arr[i * 3 + 2] = Math.cos(angle) * r;
    }
    attr.needsUpdate = true;
  });

  void activeIndex;
  void total;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.055}
        color="#f7d39a"
        transparent
        opacity={0.62}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export const vortexEffect: DynastyEffect = {
  id: 'vortex',
  name: '粒子涡旋',
  description: '中心粒子高速旋转,卡片在涡漩外圈缓慢公转',
  cost: 'mid',
  available: true,
  Layout: VortexLayout,
  Particles: VortexParticles,
  camera: {
    position: [0, 2.1, 5.4],
    fov: 58,
    lookAt: [0, 0.25, 0],
  },
};
