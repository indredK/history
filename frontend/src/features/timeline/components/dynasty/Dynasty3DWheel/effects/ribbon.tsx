/**
 * ribbon 时光飘带
 *
 * 一条 S 形立体丝带从画面深处飘到前方,卡片串在丝带上随时间流动。
 * 丝带本身由两层粒子构成:边缘亮粒子勾边,内部柔光粒子带填充。
 * activeIndex 决定哪一段的卡片落在前景。
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DynastyCard } from '../shared/DynastyCard';
import { getWrappedOffset } from '../shared/carouselMath';
import type { DynastyEffect, EffectLayoutProps, EffectParticlesProps } from './types';

const VISIBLE_RANGE = 5;
const RIBBON_PARTICLES = 360;

const SPACING_RATIO = 0.14;
const SPACING_MIN = 1.1;
const SPACING_MAX = 4.5;

// 丝带在 y 方向波动 + z 方向退后
const Y_AMPLITUDE = 0.55;
const Z_AMPLITUDE = 1.1;
const FREQ = 0.55; // 沿参数 t(offset)的波频
const ARC_LIFT = 0.7;

function spacingForViewport(width: number): number {
  return THREE.MathUtils.clamp(width * SPACING_RATIO, SPACING_MIN, SPACING_MAX);
}

interface SlotTarget {
  position: THREE.Vector3;
  rotationY: number;
  rotationZ: number;
  scaleHint: number;
}

function ribbonPosition(offset: number, spacing: number, time: number): THREE.Vector3 {
  // 主水平流动 + 时间相位让丝带"流过"
  const phase = offset * FREQ + time * 0.25;
  const x = offset * spacing;
  const y = ARC_LIFT + Math.sin(phase) * Y_AMPLITUDE;
  const z = -Math.abs(offset) * 0.18 + Math.cos(phase) * Z_AMPLITUDE - 0.4;
  return new THREE.Vector3(x, y, z);
}

function computeSlot(offset: number, spacing: number, time: number): SlotTarget {
  const distance = Math.abs(offset);
  const here = ribbonPosition(offset, spacing, time);
  // 用 ε 后的位置算切线,得到卡片朝向
  const eps = 0.001;
  const next = ribbonPosition(offset + eps, spacing, time);
  const tangent = next.clone().sub(here).normalize();
  const rotationY = Math.atan2(tangent.x, tangent.z) - Math.PI / 2;
  // z 旋转跟着 y 速度,模拟"飘带翻转"
  const rotationZ = -Math.cos(offset * FREQ + time * 0.25) * 0.35;

  let scaleHint = 0;
  if (distance <= VISIBLE_RANGE) {
    const t = distance / (VISIBLE_RANGE + 0.5);
    scaleHint = THREE.MathUtils.clamp(1 - t * t * 0.8, 0, 1);
  }

  return {
    position: here,
    rotationY,
    rotationZ,
    scaleHint,
  };
}

interface SlotRef {
  group: THREE.Group | null;
  currentOffset: number;
}

function RibbonLayout({ dynasties, activeIndex, onCardClick }: EffectLayoutProps) {
  const total = dynasties.length;
  const slotsRef = useRef<SlotRef[]>([]);
  const viewportWidth = useThree((state) => state.viewport.width);
  const spacing = useMemo(() => spacingForViewport(viewportWidth), [viewportWidth]);

  useFrame((state, delta) => {
    if (total === 0) return;
    const time = state.clock.elapsedTime;

    for (let index = 0; index < total; index += 1) {
      const ref = slotsRef.current[index];
      if (!ref || !ref.group) continue;

      const targetOffset = getWrappedOffset(index, activeIndex, total);
      let cur = ref.currentOffset;
      const diff = targetOffset - cur;
      if (Math.abs(diff) > VISIBLE_RANGE + 2) {
        cur = targetOffset;
      } else {
        cur = THREE.MathUtils.damp(cur, targetOffset, 10, delta);
      }
      ref.currentOffset = cur;

      const slot = computeSlot(cur, spacing, time);
      ref.group.position.copy(slot.position);
      ref.group.rotation.set(0, slot.rotationY, slot.rotationZ);
    }
  });

  return (
    <group>
      {dynasties.map((dynasty, index) => {
        const initOffset = getWrappedOffset(index, activeIndex, total);
        const initSlot = computeSlot(initOffset, spacing, 0);
        if (!slotsRef.current[index]) {
          slotsRef.current[index] = { group: null, currentOffset: initOffset };
        }
        if (Math.abs(initOffset) > VISIBLE_RANGE) {
          slotsRef.current[index]!.currentOffset = initOffset;
        }

        return (
          <group
            key={dynasty.id}
            ref={(node) => {
              if (slotsRef.current[index]) {
                slotsRef.current[index]!.group = node;
              }
            }}
            position={initSlot.position}
            rotation={[0, initSlot.rotationY, initSlot.rotationZ]}
          >
            <DynastyCard
              dynasty={dynasty}
              position={[0, 0, 0]}
              faceCamera={false}
              rotationY={0}
              scaleHint={initSlot.scaleHint}
              isVisible
              isActive={index === activeIndex}
              onClick={() => onCardClick(index)}
            />
          </group>
        );
      })}
    </group>
  );
}

function RibbonParticles({ activeIndex, total }: EffectParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const viewportWidth = useThree((state) => state.viewport.width);
  const spacing = useMemo(() => spacingForViewport(viewportWidth), [viewportWidth]);

  const positions = useMemo(() => new Float32Array(RIBBON_PARTICLES * 3), []);
  const seeds = useMemo(() => {
    const arr = new Float32Array(RIBBON_PARTICLES * 2);
    for (let i = 0; i < RIBBON_PARTICLES; i += 1) {
      arr[i * 2] = Math.random(); // 沿丝带的 t 位置
      arr[i * 2 + 1] = (Math.random() - 0.5) * 2; // -1..1,丝带宽度方向偏移
    }
    return arr;
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const halfRange = VISIBLE_RANGE + 1;
  const ribbonHalfWidth = 0.28;

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime;
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < RIBBON_PARTICLES; i += 1) {
      const tSeed = seeds[i * 2]!;
      const wSeed = seeds[i * 2 + 1]!;
      const offset = (tSeed * 2 - 1) * halfRange;
      const here = ribbonPosition(offset, spacing, time);
      const next = ribbonPosition(offset + 0.01, spacing, time);
      const tangent = next.clone().sub(here).normalize();
      // 丝带"宽度方向"= tangent × y 轴,得到水平偏移量
      const sideX = -tangent.z;
      const sideZ = tangent.x;
      const w = wSeed * ribbonHalfWidth;

      arr[i * 3] = here.x + sideX * w;
      arr[i * 3 + 1] = here.y + Math.sin(time * 0.7 + i) * 0.04;
      arr[i * 3 + 2] = here.z + sideZ * w;
    }
    attr.needsUpdate = true;
  });

  void activeIndex;
  void total;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        color="#f7d39a"
        transparent
        opacity={0.55}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export const ribbonEffect: DynastyEffect = {
  id: 'ribbon',
  name: '时光飘带',
  description: '卡片串在 S 形立体丝带上,丝带由密集粒子构成',
  cost: 'high',
  available: true,
  Layout: RibbonLayout,
  Particles: RibbonParticles,
  camera: {
    position: [0, 1.6, 5.0],
    fov: 60,
    lookAt: [0, 0.6, 0],
  },
};
