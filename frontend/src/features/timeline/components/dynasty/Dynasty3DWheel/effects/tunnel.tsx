/**
 * tunnel 散景隧道
 *
 * 卡片沿 z 轴排成一列,activeIndex 在最近端(z 最大),
 * 其余的依次后退淡出,远端融入"灭点"。
 * 背景用一系列同心粒子环,从远处朝相机扑来,营造隧道穿越感。
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DynastyCard } from '../shared/DynastyCard';
import { getWrappedOffset } from '../shared/carouselMath';
import type { DynastyEffect, EffectLayoutProps, EffectParticlesProps } from './types';

const VISIBLE_RANGE = 5;
const RING_COUNT = 14;
const RING_PARTICLES_PER = 64;
const TUNNEL_PARTICLES = RING_COUNT * RING_PARTICLES_PER;

// 卡片在隧道中的间距(z 方向)
const Z_STEP = 1.5;
// 激活卡片的 z 位置(最靠前)
const Z_FRONT = 0.6;
const Y_LIFT = 0.6;
// 越远的卡片往两侧轻微偏移,避免完全挡住
const X_DRIFT = 0.05; // 每多 1 格累计的水平偏移系数
const TUNNEL_DEPTH = 16; // 粒子环最深处 z

interface SlotTarget {
  position: THREE.Vector3;
  scaleHint: number;
}

function computeSlot(offset: number): SlotTarget {
  const distance = Math.abs(offset);
  // offset 0 在最前,offset>0 往里走
  const normalizedOffset = offset; // 保留正负
  const z = Z_FRONT - Math.max(0, normalizedOffset) * Z_STEP - Math.max(0, -normalizedOffset) * Z_STEP * 0.6;
  // 给负 offset(已经"过去"的卡片)一点点 x 偏移,让它从画面侧滑出
  const x = normalizedOffset < 0 ? normalizedOffset * X_DRIFT * 6 : 0;

  let scaleHint = 0;
  if (distance <= VISIBLE_RANGE) {
    // 远卡片缩小;最前一张 1.0,最远一张 ~0.3
    const t = distance / (VISIBLE_RANGE + 0.5);
    scaleHint = THREE.MathUtils.clamp(1 - t * 0.7, 0, 1);
  }

  return {
    position: new THREE.Vector3(x, Y_LIFT, z),
    scaleHint,
  };
}

interface SlotRef {
  group: THREE.Group | null;
  currentOffset: number;
}

function TunnelLayout({ dynasties, activeIndex, onCardClick }: EffectLayoutProps) {
  const total = dynasties.length;
  const slotsRef = useRef<SlotRef[]>([]);

  useFrame((_, delta) => {
    if (total === 0) return;

    for (let index = 0; index < total; index += 1) {
      const ref = slotsRef.current[index];
      if (!ref || !ref.group) continue;

      const targetOffset = getWrappedOffset(index, activeIndex, total);
      let cur = ref.currentOffset;
      const diff = targetOffset - cur;
      if (Math.abs(diff) > VISIBLE_RANGE + 2) {
        cur = targetOffset;
      } else {
        cur = THREE.MathUtils.damp(cur, targetOffset, 11, delta);
      }
      ref.currentOffset = cur;

      const slot = computeSlot(cur);
      ref.group.position.copy(slot.position);
    }
  });

  return (
    <group>
      {dynasties.map((dynasty, index) => {
        const initOffset = getWrappedOffset(index, activeIndex, total);
        const initSlot = computeSlot(initOffset);
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
          >
            <DynastyCard
              dynasty={dynasty}
              position={[0, 0, 0]}
              faceCamera
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

function TunnelParticles({ activeIndex, total }: EffectParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const viewportWidth = useThree((state) => state.viewport.width);

  // 隧道半径随视口宽度调整
  const tunnelRadius = useMemo(
    () => THREE.MathUtils.clamp(viewportWidth * 0.28, 1.6, 4.5),
    [viewportWidth],
  );

  const positions = useMemo(() => new Float32Array(TUNNEL_PARTICLES * 3), []);
  // 每个粒子绑到一个 ring(0..RING_COUNT-1)和一个角度种子
  const ringIndices = useMemo(() => {
    const arr = new Int16Array(TUNNEL_PARTICLES);
    for (let i = 0; i < TUNNEL_PARTICLES; i += 1) {
      arr[i] = Math.floor(i / RING_PARTICLES_PER);
    }
    return arr;
  }, []);
  const angleSeeds = useMemo(() => {
    const arr = new Float32Array(TUNNEL_PARTICLES);
    for (let i = 0; i < TUNNEL_PARTICLES; i += 1) {
      const within = i % RING_PARTICLES_PER;
      arr[i] = (within / RING_PARTICLES_PER) * Math.PI * 2 + Math.random() * 0.1;
    }
    return arr;
  }, []);
  const radiusJitter = useMemo(() => {
    const arr = new Float32Array(TUNNEL_PARTICLES);
    for (let i = 0; i < TUNNEL_PARTICLES; i += 1) {
      arr[i] = (Math.random() - 0.5) * 0.4;
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

    // 每个 ring 沿 z 轴向相机移动,到达最近后回到最深处
    const ringSpacing = TUNNEL_DEPTH / RING_COUNT;
    const flowSpeed = 1.2;

    for (let i = 0; i < TUNNEL_PARTICLES; i += 1) {
      const ringIdx = ringIndices[i]!;
      // 该 ring 当前 z = -depth + ((ringIdx*spacing + t*speed) % depth)
      const ringZRaw = ringIdx * ringSpacing - ((t * flowSpeed) % TUNNEL_DEPTH);
      const ringZ = ringZRaw < -TUNNEL_DEPTH ? ringZRaw + TUNNEL_DEPTH : ringZRaw;
      // 半径随 z 变小,远处的环更小,近处的环更大,模拟隧道
      const rFactor = 1 - (ringZ / -TUNNEL_DEPTH) * 0.5; // ringZ=0 -> 1, ringZ=-DEPTH -> 0.5
      const r = tunnelRadius * rFactor + radiusJitter[i]!;
      const angle = angleSeeds[i]! + t * 0.15;

      arr[i * 3] = Math.sin(angle) * r;
      arr[i * 3 + 1] = Y_LIFT + Math.cos(angle) * r * 0.6; // 椭圆,上下扁
      arr[i * 3 + 2] = ringZ;
    }
    attr.needsUpdate = true;
  });

  void activeIndex;
  void total;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.07}
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

export const tunnelEffect: DynastyEffect = {
  id: 'tunnel',
  name: '散景隧道',
  description: '卡片由远及近,背景同心粒子环朝相机扑来',
  cost: 'mid',
  available: true,
  Layout: TunnelLayout,
  Particles: TunnelParticles,
  camera: {
    position: [0, 1.4, 4.6],
    fov: 64,
    lookAt: [0, 0.5, 0],
  },
};
