/**
 * orbit 环形轨道
 *
 * 完整 360° 圆环,所有朝代卡片均匀分布。
 * 整个 group 围绕 y 轴旋转,把 activeIndex 那张转到正前(z 最大处)。
 * 粒子从激活卡片尾部沿切线飞出,模拟尾迹。
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DynastyCard } from '../shared/DynastyCard';
import type { DynastyEffect, EffectLayoutProps, EffectParticlesProps } from './types';

const TRAIL_PARTICLES = 220;
const RADIUS_RATIO = 0.32; // viewport 宽度的 32% 作为环半径
const RADIUS_MIN = 2.4;
const RADIUS_MAX = 6.5;
const Y_LIFT = 0.4;

function radiusForViewport(width: number): number {
  return THREE.MathUtils.clamp(width * RADIUS_RATIO, RADIUS_MIN, RADIUS_MAX);
}

function OrbitLayout({ dynasties, activeIndex, onCardClick }: EffectLayoutProps) {
  const total = dynasties.length;
  const groupRef = useRef<THREE.Group>(null);
  const currentRotationRef = useRef(0);
  const viewportWidth = useThree((state) => state.viewport.width);
  const radius = useMemo(() => radiusForViewport(viewportWidth), [viewportWidth]);

  // 轨道线
  const orbitLine = useMemo(() => {
    const segments = 128;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.sin(t) * radius, Y_LIFT, Math.cos(t) * radius));
    }
    const g = new THREE.BufferGeometry().setFromPoints(points);
    const m = new THREE.LineBasicMaterial({
      color: '#d2a05a',
      transparent: true,
      opacity: 0.18,
    });
    return new THREE.Line(g, m);
  }, [radius]);

  // 每张卡固定在自己的 baseAngle 上,group 整体旋转把 active 转到 angle=0(正前)
  const baseAngles = useMemo(() => {
    if (total === 0) return [];
    const step = (Math.PI * 2) / total;
    return dynasties.map((_, i) => i * step);
  }, [dynasties, total]);

  useFrame((_, delta) => {
    if (!groupRef.current || total === 0) return;
    // 目标:让 activeAngle + groupRotation = 0(mod 2π)
    // 即 groupRotation = -activeAngle
    const targetRotation = -baseAngles[activeIndex]!;
    let cur = currentRotationRef.current;
    // 选择最短路径(环形差值)
    let diff = targetRotation - cur;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    cur = THREE.MathUtils.damp(cur, cur + diff, 8, delta);
    currentRotationRef.current = cur;
    groupRef.current.rotation.y = cur;
  });

  return (
    <group ref={groupRef}>
      <primitive object={orbitLine} />

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
              scaleHint={isActive ? 1 : 0.7}
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

function OrbitParticles({ activeIndex, total }: EffectParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const viewportWidth = useThree((state) => state.viewport.width);
  const radius = useMemo(() => radiusForViewport(viewportWidth), [viewportWidth]);

  const positions = useMemo(() => new Float32Array(TRAIL_PARTICLES * 3), []);
  const seeds = useMemo(() => {
    const sd = new Float32Array(TRAIL_PARTICLES);
    for (let i = 0; i < TRAIL_PARTICLES; i += 1) {
      sd[i] = Math.random();
    }
    return sd;
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

    // 整圈分布,沿圆周方向飘动
    for (let i = 0; i < TRAIL_PARTICLES; i += 1) {
      const seed = seeds[i] ?? 0;
      const angle = seed * Math.PI * 2 + t * 0.35; // 缓慢公转
      const wobble = Math.sin(t * 0.8 + seed * 17) * 0.18;
      const r = radius + wobble + Math.sin(t * 0.5 + seed * 9) * 0.4;
      arr[i * 3] = Math.sin(angle) * r;
      arr[i * 3 + 1] = Y_LIFT + (seed - 0.5) * 1.1 + Math.sin(t * 0.4 + seed * 12) * 0.12;
      arr[i * 3 + 2] = Math.cos(angle) * r;
    }
    attr.needsUpdate = true;
  });

  void activeIndex;
  void total;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        color="#f1c784"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export const orbitEffect: DynastyEffect = {
  id: 'orbit',
  name: '环形轨道',
  description: '完整 360° 圆环,旋转把激活卡片转到正前',
  cost: 'mid',
  available: true,
  Layout: OrbitLayout,
  Particles: OrbitParticles,
  camera: {
    position: [0, 1.7, 5.6],
    fov: 56,
    lookAt: [0, 0.3, 0],
  },
};
