import { useMemo, useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useDynastyStore } from '../../../../store';
import { getDynasties } from '../../../../services/dataClient';
import { useRequest } from 'ahooks';
import type { Dynasty } from '../../../../services/culture/types';
import './Dynasty3DWheel.css';

interface Dynasty3DWheelProps {
  className?: string;
}

interface DynastyCardProps {
  dynasty: Dynasty;
  position: [number, number, number];
  rotation: [number, number, number];
  isActive: boolean;
  onClick: () => void;
}

function DynastyCard({ dynasty, position, rotation, isActive, onClick }: DynastyCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const dynastyColor = dynasty.color || '#8B4513';
  const color = new THREE.Color(dynastyColor);

  useFrame((state) => {
    if (meshRef.current) {
      // 活跃卡片的脉冲效果
      if (isActive) {
        const scale = 1.15 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(0.85);
      }
      
      // 悬停效果
      if (hovered && !isActive) {
        meshRef.current.scale.setScalar(0.95);
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          if (!isActive) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isActive) {
            onClick();
          }
        }}
      >
        <planeGeometry args={[2.2, 2.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.5 : 0.1}
          metalness={0.3}
          roughness={0.4}
          side={THREE.DoubleSide}
          transparent
          opacity={isActive ? 1 : 0.6}
        />
      </mesh>
      
      {/* 发光边框 */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.3, 2.5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.7 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 文字信息 */}
      <Html
        position={[0, 0, 0.01]}
        center
        distanceFactor={5}
        style={{
          width: '180px',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${dynastyColor}cc, ${dynastyColor}88)`,
            padding: '12px',
            borderRadius: '10px',
            textAlign: 'center',
            color: 'white',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transform: `scale(${isActive ? 1 : 0.85})`,
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 光影流动效果 */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: `linear-gradient(
                45deg,
                transparent 30%,
                rgba(255, 255, 255, 0.1) 50%,
                transparent 70%
              )`,
              animation: isActive ? 'shimmer 3s ease-in-out infinite' : 'none',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontSize: isActive ? '18px' : '15px',
              fontWeight: 'bold',
              marginBottom: '4px',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              transition: 'all 0.3s ease',
            }}
          >
            {dynasty.name}
          </div>
          {dynasty.name_en && (
            <div style={{ fontSize: '9px', opacity: 0.9, marginBottom: '6px' }}>
              {dynasty.name_en}
            </div>
          )}
          <div
            style={{
              fontSize: '10px',
              background: 'rgba(255,255,255,0.2)',
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
                fontSize: '8px',
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

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 1000;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      colors[i3] = Math.random();
      colors[i3 + 1] = Math.random() * 0.5 + 0.5;
      colors[i3 + 2] = 1;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particles.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(particles.colors, 3));
    return geo;
  }, [particles]);

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function DynastyCarousel({ 
  dynasties, 
  activeIndex, 
  onCardClick 
}: { 
  dynasties: Dynasty[]; 
  activeIndex: number;
  onCardClick: (index: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPosition = useRef<number>(0);
  const currentPosition = useRef<number>(0);

  const spacing = 3; // 卡片之间的间距

  useEffect(() => {
    targetPosition.current = -activeIndex * spacing;
  }, [activeIndex]);

  useFrame(() => {
    if (groupRef.current) {
      // 平滑插值移动
      currentPosition.current += (targetPosition.current - currentPosition.current) * 0.1;
      groupRef.current.position.x = currentPosition.current;
    }
  });

  return (
    <group ref={groupRef}>
      {dynasties.map((dynasty, index) => {
        const x = index * spacing;
        const isActive = index === activeIndex;
        
        // 计算与中心的距离，用于透视效果
        const distanceFromCenter = Math.abs(index - activeIndex);
        const zOffset = -distanceFromCenter * 0.3; // 非中心卡片向后移动（减少深度）

        return (
          <DynastyCard
            key={dynasty.id}
            dynasty={dynasty}
            position={[x, 0, zOffset]}
            rotation={[0, 0, 0]}
            isActive={isActive}
            onClick={() => onCardClick(index)}
          />
        );
      })}
    </group>
  );
}

function Scene({ 
  dynasties, 
  activeIndex, 
  onCardClick 
}: { 
  dynasties: Dynasty[]; 
  activeIndex: number;
  onCardClick: (index: number) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.5, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 4]} fov={60} />
      
      {/* 环境光 */}
      <ambientLight intensity={0.3} />
      
      {/* 主光源 */}
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />
      
      {/* 点光源 - 跟随活跃卡片 */}
      <pointLight position={[0, 0, 0]} intensity={2} distance={10} color="#ffd700" />

      {/* 粒子背景 */}
      <Particles />
      
      {/* 朝代圆环 */}
      <DynastyCarousel dynasties={dynasties} activeIndex={activeIndex} onCardClick={onCardClick} />
    </>
  );
}

export function Dynasty3DWheel({ className }: Dynasty3DWheelProps) {
  const { setSelectedDynasty } = useDynastyStore();
  const [allDynasties, setAllDynasties] = useState<Dynasty[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 使用ahooks的useRequest获取数据
  useRequest(
    async () => {
      const result = await getDynasties();
      return result.data;
    },
    {
      cacheKey: 'dynasties_all',
      manual: false, // enabled: true -> manual: false
      onSuccess: (dynasties: Dynasty[]) => setAllDynasties(dynasties)
    }
  );

  const dynasties = useMemo(() => {
    return allDynasties;
  }, [allDynasties]);

  useEffect(() => {
    if (dynasties.length > 0) {
      setSelectedDynasty(dynasties[activeIndex] as any);
    }
  }, [activeIndex, dynasties, setSelectedDynasty]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrollingRef.current) return;

      const delta = e.deltaY;
      const direction = delta > 0 ? 1 : -1;

      setActiveIndex((prev) => {
        const newIndex = (prev + direction + dynasties.length) % dynasties.length;
        return newIndex;
      });

      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 200);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [dynasties.length]);

  if (dynasties.length === 0) {
    return null;
  }

  return (
    <div className={`dynasty-3d-wheel-container ${className || ''}`} ref={containerRef}>
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene 
            dynasties={dynasties} 
            activeIndex={activeIndex} 
            onCardClick={(index) => setActiveIndex(index)}
          />
        </Suspense>
      </Canvas>

    
    </div>
  );
}
