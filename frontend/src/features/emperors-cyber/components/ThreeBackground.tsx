import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function generateParticlePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  return positions;
}

function generateParticleColors(count: number): Float32Array {
  const colors = new Float32Array(count * 3);
  const palette = [
    [0, 0.94, 1],
    [1, 0.18, 0.33],
    [0.69, 0.32, 0.87],
    [1, 0.8, 0],
    [0.2, 0.78, 0.35],
  ];

  for (let i = 0; i < count; i += 1) {
    const color = palette[Math.floor(Math.random() * palette.length)]!;
    colors[i * 3] = color[0]!;
    colors[i * 3 + 1] = color[1]!;
    colors[i * 3 + 2] = color[2]!;
  }

  return colors;
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 600;
  const positions = useMemo(() => generateParticlePositions(count), []);
  const colors = useMemo(() => generateParticleColors(count), []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const elapsedTime = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = elapsedTime * 0.03;
    pointsRef.current.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        vertexColors
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CyberGrid() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const grid = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const gridSize = 20;
    const divisions = 20;
    const step = gridSize / divisions;
    const half = gridSize / 2;

    for (let i = 0; i <= divisions; i += 1) {
      const position = -half + i * step;
      vertices.push(-half, 0, position, half, 0, position);
      vertices.push(position, 0, -half, position, 0, half);
    }

    grid.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return grid;
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;

    const elapsedTime = state.clock.getElapsedTime();
    linesRef.current.position.y = -5 + Math.sin(elapsedTime * 0.5) * 0.3;
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        color="#00f0ff"
        transparent
        opacity={0.06}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

export function ThreeBackground() {
  return (
    <div className="cyber-three-bg">
      <Canvas
        camera={{ position: [0, 2, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField />
        <CyberGrid />
      </Canvas>
    </div>
  );
}
