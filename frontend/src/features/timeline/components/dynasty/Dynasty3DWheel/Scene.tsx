/**
 * 3D 场景 —— 灯光 + 当前 effect 的 Particles + Layout
 *
 * 不同的 effect 共享灯光与外壳,只切换:
 * - 排布与运动(effect.Layout)
 * - 专属粒子(effect.Particles,可选,缺省回落到通用星尘)
 * - 镜头预设(effect.camera,可选)
 */

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import type { Dynasty } from '@/services/culture/types';
import { Particles } from './Particles';
import type { DynastyEffect } from './effects/types';

interface SceneProps {
  effect: DynastyEffect;
  dynasties: Dynasty[];
  activeIndex: number;
  onCardClick: (index: number) => void;
}

const DEFAULT_CAMERA = { position: [0, 0.35, 6.25] as [number, number, number], fov: 48 };

export function Scene({ effect, dynasties, activeIndex, onCardClick }: SceneProps) {
  const { camera } = useThree();
  const cameraPreset = effect.camera ?? DEFAULT_CAMERA;

  useEffect(() => {
    camera.position.set(...cameraPreset.position);
    if (effect.camera?.lookAt) {
      camera.lookAt(...effect.camera.lookAt);
    } else {
      camera.lookAt(0, 0, 0);
    }
  }, [camera, cameraPreset.position, effect.camera?.lookAt]);

  const Layout = effect.Layout;
  const ParticlesImpl = effect.Particles;

  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPreset.position} fov={cameraPreset.fov} />

      <ambientLight intensity={0.42} />
      <directionalLight position={[4, 4, 4]} intensity={1.05} castShadow />
      <directionalLight position={[-4, 3, -5]} intensity={0.4} />
      <pointLight position={[0, 0.6, 2.8]} intensity={1.45} distance={11} color="#f7d39a" />

      {ParticlesImpl ? (
        <ParticlesImpl activeIndex={activeIndex} total={dynasties.length} />
      ) : (
        <Particles />
      )}

      <Layout
        dynasties={dynasties}
        activeIndex={activeIndex}
        onCardClick={onCardClick}
      />
    </>
  );
}
