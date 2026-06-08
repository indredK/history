/**
 * 通用 3D 朝代卡片
 *
 * 卡片本身没有 3D 背景面片,只有一块透明的点击热区 + HTML 内容层。
 * Layout 负责把卡片放到正确位置,卡片自身处理:
 * - 面向相机(可选)
 * - 激活/悬停时 HTML 内容的微动画与透明度
 */

import { useMemo, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { dynastyConfig, dynastyUtils } from '@/config';
import type { Dynasty } from '@/services/culture/types';
import { formatTimelineYear } from '@/features/timeline/utils/dynastyUtils';

export interface DynastyCardProps {
  dynasty: Dynasty;
  position: [number, number, number];
  /** 卡片是否朝向相机,false 时由父级控制朝向 */
  faceCamera?: boolean;
  /** 沿 y 轴的固定旋转(faceCamera=false 时使用) */
  rotationY?: number;
  /** 父级给的额外缩放(用于景深/淡出) */
  scaleHint?: number;
  /** 是否参与 HTML 渲染(隐藏的卡片不渲染 Html 节省 DOM) */
  isVisible: boolean;
  isActive: boolean;
  onClick: () => void;
}

export function DynastyCard({
  dynasty,
  position,
  faceCamera = true,
  rotationY,
  scaleHint = 1,
  isVisible,
  isActive,
  onClick,
}: DynastyCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);
  const [hovered, setHovered] = useState(false);

  const dynastyColor = dynasty.color || dynastyConfig.defaultColor;
  const { threeDConfig, cardStyles } = dynastyConfig;
  const dynastyYearLabel = `${formatTimelineYear(dynasty.startYear, { short: true })} - ${
    dynasty.endYear === undefined || dynasty.endYear === null
      ? '现在'
      : formatTimelineYear(dynasty.endYear, { short: true })
  }`;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    groupRef.current.getWorldPosition(worldPosition);

    if (faceCamera) {
      groupRef.current.lookAt(
        state.camera.position.x,
        worldPosition.y,
        state.camera.position.z,
      );
    } else if (typeof rotationY === 'number') {
      groupRef.current.rotation.y = rotationY;
    }

    const activePulse = isActive
      ? Math.sin(state.clock.elapsedTime * threeDConfig.animation.pulseSpeed) *
        threeDConfig.cardScale.pulseAmplitude
      : 0;

    const stateScale = isActive
      ? threeDConfig.cardScale.active + activePulse
      : hovered
        ? threeDConfig.cardScale.hover
        : threeDConfig.cardScale.default;

    const targetScale = (isVisible ? 1 : 0.001) * scaleHint * stateScale;

    const nextScale = THREE.MathUtils.damp(
      groupRef.current.scale.x,
      targetScale,
      10,
      delta,
    );
    groupRef.current.scale.setScalar(nextScale);

    const visibility = THREE.MathUtils.clamp(scaleHint, 0, 1);

    if (contentRef.current) {
      const contentAlpha = isActive
        ? visibility
        : visibility * visibility * 0.6;
      contentRef.current.style.opacity = isVisible
        ? `${THREE.MathUtils.clamp(contentAlpha, 0, 1)}`
        : '0';

      // 屏幕空间 Html 不参与 3D 透视,这里手动给非激活卡片缩小,
      // 营造景深与避免左右文字互相重叠
      const baseFactor = isActive
        ? threeDConfig.cardScale.active + activePulse
        : hovered
          ? threeDConfig.cardScale.hover
          : threeDConfig.cardScale.default;
      const screenScale = visibility * baseFactor;
      contentRef.current.style.transform = `scale(${screenScale})`;
      contentRef.current.style.transformOrigin = 'center center';
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 透明点击热区 —— 只承接 hover/click,视觉上不可见 */}
      <mesh
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
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {isVisible && (
        <Html
          position={[0, 0, 0.02]}
          center
          zIndexRange={[8, 0]}
          style={{
            width: '260px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            ref={contentRef}
            style={{
              opacity: 0.18,
              padding: 0,
              color: cardStyles.colors.text,
              textAlign: 'center',
              willChange: 'transform, opacity',
              filter: isActive
                ? `drop-shadow(0 0 12px ${dynastyUtils.getColorWithAlpha(dynastyColor, 0.55)})`
                : 'none',
            }}
          >
            <div
              style={{
                fontSize: isActive
                  ? cardStyles.fontSize.title.active
                  : cardStyles.fontSize.title.default,
                fontWeight: 700,
                color: dynastyColor,
                textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.4)',
                lineHeight: 1.1,
                marginBottom: '4px',
              }}
            >
              {dynasty.name}
            </div>

            {dynasty.name_en && (isActive || hovered) && (
              <div
                style={{
                  fontSize: cardStyles.fontSize.subtitle,
                  opacity: 0.78,
                  marginBottom: '4px',
                  textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                  letterSpacing: '0.04em',
                }}
              >
                {dynasty.name_en}
              </div>
            )}

            <div
              style={{
                fontSize: cardStyles.fontSize.period,
                color: cardStyles.colors.text,
                opacity: 0.88,
                textShadow: '0 1px 6px rgba(0,0,0,0.75)',
                marginBottom: dynasty.description && (isActive || hovered) ? '6px' : 0,
              }}
            >
              {dynastyYearLabel}
            </div>

            {dynasty.description && (isActive || hovered) && (
              <div
                style={{
                  fontSize: cardStyles.fontSize.description,
                  opacity: 0.74,
                  textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {dynasty.description}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
