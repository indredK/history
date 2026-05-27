/**
 * arc 长廊
 *
 * 卡片按相对 activeIndex 的 offset 排到一条柔和弯曲的长廊上(coverflow 风格)。
 * - 横向间距(spacing)直接绑定 viewport.width,让卡片在容器内均匀铺开
 * - z 方向用平方衰减做景深,远卡片向后退,产生"长廊"感
 * - 卡片 yaw 朝向中心,左右两侧自然侧身
 *
 * 数据可能有几十个朝代,因此只渲染中心 ±VISIBLE_RANGE 张,远的彻底淡出。
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DynastyCard } from '../shared/DynastyCard';
import { getWrappedOffset } from '../shared/carouselMath';
import type { DynastyEffect, EffectLayoutProps, EffectParticlesProps } from './types';

const VISIBLE_RANGE = 4;
const TRAIL_PARTICLES = 160;

// 视口可见宽度的多少比例分配给一张卡片的间距(0.18 ≈ 同时看到 5-6 张卡,中心一张+左右各 2-3 张)
const SPACING_RATIO = 0.18;
const SPACING_MIN = 1.4;
const SPACING_MAX = 6.0;

// 单张卡片的最大 z 后退量(每多 1 格 offset 后退 Z_PER_STEP * offset²)
const Z_PER_STEP = 0.32;
const Z_MAX = 2.4;
// 单张卡片的最大 yaw 旋转(向中心侧身),与 offset 成正比
const YAW_PER_STEP = (8 * Math.PI) / 180;
const YAW_MAX = (32 * Math.PI) / 180;

// 内容整体抬高,避开底部浮条
const ARC_LIFT = 0.85;

function spacingForViewport(viewportWidth: number): number {
  return THREE.MathUtils.clamp(viewportWidth * SPACING_RATIO, SPACING_MIN, SPACING_MAX);
}

interface SlotTarget {
  position: THREE.Vector3;
  rotationY: number;
  scaleHint: number;
  visible: boolean;
}

function computeSlot(offset: number, spacing: number): SlotTarget {
  const distance = Math.abs(offset);
  const sign = offset === 0 ? 0 : Math.sign(offset);
  const x = offset * spacing;
  const z = -Math.min(Z_MAX, Z_PER_STEP * offset * offset);
  const yaw = -sign * Math.min(YAW_MAX, YAW_PER_STEP * distance);
  const visible = distance <= VISIBLE_RANGE;

  let scaleHint = 0;
  if (visible) {
    const t = distance / (VISIBLE_RANGE + 0.5);
    scaleHint = THREE.MathUtils.clamp(1 - t * t * 0.85, 0, 1);
  }

  return {
    position: new THREE.Vector3(x, ARC_LIFT, z),
    rotationY: yaw,
    scaleHint,
    visible,
  };
}

interface SlotRefs {
  group: THREE.Group | null;
  currentOffset: number;
}

function ArcLayout({ dynasties, activeIndex, onCardClick }: EffectLayoutProps) {
  const total = dynasties.length;
  const slotsRef = useRef<SlotRefs[]>([]);
  const viewportWidth = useThree((state) => state.viewport.width);
  const spacing = useMemo(() => spacingForViewport(viewportWidth), [viewportWidth]);

  const baseline = useMemo(() => {
    const segments = 64;
    const points: THREE.Vector3[] = [];
    const halfRange = VISIBLE_RANGE + 0.5;
    for (let i = 0; i <= segments; i += 1) {
      const t = (i / segments) * 2 - 1;
      const offset = t * halfRange;
      points.push(computeSlot(offset, spacing).position.clone());
    }
    const g = new THREE.BufferGeometry().setFromPoints(points);
    const m = new THREE.LineBasicMaterial({
      color: '#d2a05a',
      transparent: true,
      opacity: 0.18,
    });
    return new THREE.Line(g, m);
  }, [spacing]);

  useFrame((_, delta) => {
    if (total === 0) return;

    for (let index = 0; index < total; index += 1) {
      const ref = slotsRef.current[index];
      if (!ref || !ref.group) continue;

      const targetOffset = getWrappedOffset(index, activeIndex, total);
      const damping = 12;
      let cur = ref.currentOffset;
      const diff = targetOffset - cur;
      if (Math.abs(diff) > VISIBLE_RANGE + 2) {
        cur = targetOffset;
      } else {
        cur = THREE.MathUtils.damp(cur, targetOffset, damping, delta);
      }
      ref.currentOffset = cur;

      const slot = computeSlot(cur, spacing);
      ref.group.position.copy(slot.position);
      ref.group.rotation.y = slot.rotationY;
    }
  });

  return (
    <group>
      <primitive object={baseline} />

      {dynasties.map((dynasty, index) => {
        const initOffset = getWrappedOffset(index, activeIndex, total);
        const initSlot = computeSlot(initOffset, spacing);
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
            rotation={[0, initSlot.rotationY, 0]}
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

function ArcParticles({ activeIndex }: EffectParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const viewportWidth = useThree((state) => state.viewport.width);
  const spacing = useMemo(() => spacingForViewport(viewportWidth), [viewportWidth]);
  const halfRange = VISIBLE_RANGE + 0.5;

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(TRAIL_PARTICLES * 3);
    const sd = new Float32Array(TRAIL_PARTICLES);
    for (let i = 0; i < TRAIL_PARTICLES; i += 1) {
      sd[i] = Math.random();
    }
    return { positions: pos, seeds: sd };
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

    for (let i = 0; i < TRAIL_PARTICLES; i += 1) {
      const seed = seeds[i] ?? 0;
      const offset = (seed * 2 - 1) * halfRange;
      const wobble = Math.sin(t * 0.5 + seed * 12) * 0.3;
      const x = offset * spacing + wobble;
      const z = -Math.min(Z_MAX, Z_PER_STEP * offset * offset)
        + Math.sin(t * 0.7 + seed * 18) * 0.2;
      const y = ARC_LIFT + (seed - 0.5) * 1.0 + Math.sin(t * 0.6 + seed * 9) * 0.15;
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    attr.needsUpdate = true;
  });

  void activeIndex;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
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

export const arcEffect: DynastyEffect = {
  id: 'arc',
  name: '弧形长廊',
  description: '中心卡片在最前,两侧沿弧向后退',
  cost: 'low',
  available: true,
  Layout: ArcLayout,
  Particles: ArcParticles,
  camera: {
    position: [0, 1.5, 4.4],
    fov: 62,
    lookAt: [0, 0.85, 0],
  },
};
