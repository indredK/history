/**
 * 3D 朝代卡片 —— 单张卡片的 mesh + Html 文字层
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { dynastyConfig, dynastyUtils } from '@/config';
import type { Dynasty } from '@/services/culture/types';

interface DynastyCardProps {
  dynasty: Dynasty;
  position: [number, number, number];
  rotation: [number, number, number];
  isActive: boolean;
  onClick: () => void;
}

export function DynastyCard({
  dynasty,
  position,
  rotation,
  isActive,
  onClick,
}: DynastyCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const dynastyColor = dynasty.color || dynastyConfig.defaultColor;
  const color = new THREE.Color(dynastyColor);
  const materialConfig = dynastyUtils.getMaterialConfig(dynastyColor, isActive);
  const { threeDConfig, cardStyles, alphaLevels } = dynastyConfig;

  useFrame((state) => {
    if (!meshRef.current) return;

    if (isActive) {
      const scale =
        threeDConfig.cardScale.active +
        Math.sin(state.clock.elapsedTime * threeDConfig.animation.pulseSpeed) *
          threeDConfig.cardScale.pulseAmplitude;
      meshRef.current.scale.setScalar(scale);
    } else {
      meshRef.current.scale.setScalar(threeDConfig.cardScale.default);
    }

    if (hovered && !isActive) {
      meshRef.current.scale.setScalar(threeDConfig.cardScale.hover);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          if (!isActive) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isActive) onClick();
        }}
      >
        <planeGeometry
          args={[threeDConfig.geometry.cardWidth, threeDConfig.geometry.cardHeight]}
        />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={materialConfig.emissiveIntensity}
          metalness={materialConfig.metalness}
          roughness={materialConfig.roughness}
          side={THREE.DoubleSide}
          transparent
          opacity={materialConfig.opacity}
        />
      </mesh>

      {/* 发光边框 */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry
          args={[threeDConfig.geometry.borderWidth, threeDConfig.geometry.borderHeight]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={
            isActive ? alphaLevels.border * 1.75 : alphaLevels.shimmer * 1.5
          }
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 文字信息 */}
      <Html
        position={[0, 0, 0.01]}
        center
        distanceFactor={5}
        style={{ width: '180px', pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={dynastyUtils.getCardStyle(dynastyColor, isActive)}>
          {/* 光影流动效果 */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background:
                'linear-gradient(45deg, transparent 30%, rgba(241, 199, 132, 0.12) 50%, transparent 70%)',
              animation: isActive ? 'shimmer 3s ease-in-out infinite' : 'none',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                fontSize: isActive
                  ? cardStyles.fontSize.title.active
                  : cardStyles.fontSize.title.default,
                fontWeight: 'bold',
                marginBottom: '4px',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                transition: 'all 0.3s ease',
              }}
            >
              {dynasty.name}
            </div>
            {dynasty.name_en && (
              <div
                style={{
                  fontSize: cardStyles.fontSize.subtitle,
                  opacity: 0.9,
                  marginBottom: '6px',
                }}
              >
                {dynasty.name_en}
              </div>
            )}
            <div
              style={{
                fontSize: cardStyles.fontSize.period,
                background: cardStyles.colors.periodBackground,
                padding: '3px 8px',
                borderRadius: '10px',
                display: 'inline-block',
                marginBottom: '4px',
              }}
            >
              {dynasty.startYear} - {dynasty.endYear || '现在'}
            </div>
            {dynasty.description && (
              <div
                style={{
                  fontSize: cardStyles.fontSize.description,
                  opacity: 0.8,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {dynasty.description}
              </div>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}
