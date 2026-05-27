/**
 * 3D 朝代卡片 —— 单张卡片的 mesh + Html 文字层
 */

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { dynastyConfig, dynastyUtils } from '@/config';
import type { Dynasty } from '@/services/culture/types';

interface DynastyCardProps {
  dynasty: Dynasty;
  depthBounds: {
    min: number;
    max: number;
  };
  isActive: boolean;
  onClick: () => void;
}

export const DynastyCard = forwardRef<THREE.Group, DynastyCardProps>(
  function DynastyCard(
    { dynasty, depthBounds, isActive, onClick }: DynastyCardProps,
    ref,
    ) {
      const groupRef = useRef<THREE.Group>(null);
      const meshRef = useRef<THREE.Mesh>(null);
      const borderRef = useRef<THREE.Mesh>(null);
      const surfaceMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
      const borderMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
      const contentRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    useImperativeHandle(ref, () => groupRef.current as THREE.Group);

    const dynastyColor = dynasty.color || dynastyConfig.defaultColor;
    const color = useMemo(() => new THREE.Color(dynastyColor), [dynastyColor]);
    const materialConfig = dynastyUtils.getMaterialConfig(dynastyColor, isActive);
    const { threeDConfig, cardStyles, alphaLevels } = dynastyConfig;

    const baseCardStyle = useMemo(
      () => ({
        ...dynastyUtils.getCardStyle(dynastyColor, isActive),
        transform: 'translate3d(0, 0, 0) scale(0.72)',
        opacity: 0.18,
        padding: isActive ? '12px 14px' : '10px 12px',
      }),
      [dynastyColor, isActive],
    );

    useFrame((state, delta) => {
      if (
        !groupRef.current ||
        !meshRef.current ||
        !borderRef.current ||
        !surfaceMaterialRef.current ||
        !borderMaterialRef.current ||
        !contentRef.current
      ) {
        return;
      }

      const depthRange = Math.max(0.01, depthBounds.max - depthBounds.min);
      const depthProgress = THREE.MathUtils.clamp(
        (groupRef.current.position.z - depthBounds.min) / depthRange,
        0,
        1,
      );
      const baseScale = THREE.MathUtils.lerp(0.66, 0.98, depthProgress);
      const activePulse = isActive
        ? Math.sin(state.clock.elapsedTime * threeDConfig.animation.pulseSpeed) *
          threeDConfig.cardScale.pulseAmplitude
        : 0;
      const targetScale =
        baseScale *
        (isActive
          ? threeDConfig.cardScale.active + activePulse
          : hovered
            ? threeDConfig.cardScale.hover
            : threeDConfig.cardScale.default);
      const targetTiltY = THREE.MathUtils.clamp(
        -groupRef.current.position.x * 0.06,
        -0.3,
        0.3,
      );
      const targetTiltX = THREE.MathUtils.lerp(0.1, -0.03, depthProgress);
      const contentScale =
        THREE.MathUtils.lerp(0.7, hovered ? 0.99 : 0.94, depthProgress) *
        (isActive ? 1.05 : 1);
      const contentOpacity = THREE.MathUtils.lerp(
        0.16,
        isActive ? 1 : 0.92,
        depthProgress,
      );

      meshRef.current.scale.x = THREE.MathUtils.damp(
        meshRef.current.scale.x,
        targetScale,
        10,
        delta,
      );
      meshRef.current.scale.y = THREE.MathUtils.damp(
        meshRef.current.scale.y,
        targetScale,
        10,
        delta,
      );
      meshRef.current.scale.z = 1;
      borderRef.current.scale.x = meshRef.current.scale.x;
      borderRef.current.scale.y = meshRef.current.scale.y;
      borderRef.current.scale.z = 1;

      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetTiltY,
        8,
        delta,
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetTiltX,
        8,
        delta,
      );

      surfaceMaterialRef.current.opacity = THREE.MathUtils.damp(
        surfaceMaterialRef.current.opacity,
        THREE.MathUtils.lerp(0.18, materialConfig.opacity, depthProgress),
        10,
        delta,
      );
      surfaceMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        surfaceMaterialRef.current.emissiveIntensity,
        THREE.MathUtils.lerp(
          alphaLevels.emissive * 0.8,
          materialConfig.emissiveIntensity,
          depthProgress,
        ),
        10,
        delta,
      );
      borderMaterialRef.current.opacity = THREE.MathUtils.damp(
        borderMaterialRef.current.opacity,
        THREE.MathUtils.lerp(
          0.04,
          isActive ? alphaLevels.border * 1.75 : alphaLevels.shimmer * 1.5,
          depthProgress,
        ),
        10,
        delta,
      );

      contentRef.current.style.transform = `translate3d(0, 0, 0) scale(${contentScale})`;
      contentRef.current.style.opacity = `${contentOpacity}`;
      contentRef.current.style.filter = `saturate(${THREE.MathUtils.lerp(
        0.75,
        1.12,
        depthProgress,
      )})`;
    });

    return (
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          onPointerOver={() => {
            setHovered(true);
            if (typeof document !== 'undefined') {
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={() => {
            setHovered(false);
            if (typeof document !== 'undefined') {
              document.body.style.cursor = 'default';
            }
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (!isActive) {
              onClick();
            }
          }}
        >
          <planeGeometry
            args={[threeDConfig.geometry.cardWidth, threeDConfig.geometry.cardHeight]}
          />
          <meshStandardMaterial
            ref={surfaceMaterialRef}
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

        <mesh ref={borderRef} position={[0, 0, -0.01]}>
          <planeGeometry
            args={[threeDConfig.geometry.borderWidth, threeDConfig.geometry.borderHeight]}
          />
          <meshBasicMaterial
            ref={borderMaterialRef}
            color={color}
            transparent
            opacity={
              isActive ? alphaLevels.border * 1.75 : alphaLevels.shimmer * 1.4
            }
            side={THREE.DoubleSide}
          />
        </mesh>

        <Html
          position={[0, 0, 0.02]}
          center
          distanceFactor={5.4}
          transform
          sprite
          zIndexRange={[8, 0]}
          style={{
            width: '190px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div ref={contentRef} style={baseCardStyle}>
            <div
              style={{
                position: 'absolute',
                inset: '-40%',
                background:
                  'linear-gradient(45deg, transparent 28%, rgba(241, 199, 132, 0.14) 50%, transparent 72%)',
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
                  fontWeight: 700,
                  marginBottom: '4px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.65)',
                  transition: 'all 0.3s ease',
                }}
              >
                {dynasty.name}
              </div>
              {dynasty.name_en && (isActive || hovered) && (
                <div
                  style={{
                    fontSize: cardStyles.fontSize.subtitle,
                    opacity: isActive ? 0.92 : 0.74,
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
                  marginBottom: dynasty.description && (isActive || hovered) ? '6px' : '2px',
                }}
              >
                {dynasty.startYear} - {dynasty.endYear || '现在'}
              </div>
              {dynasty.description && (isActive || hovered) && (
                <div
                  style={{
                    fontSize: cardStyles.fontSize.description,
                    opacity: isActive ? 0.84 : 0.74,
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
  },
);
