import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ── Particle field: floating dots that drift slowly ─────────── */
function ParticleField({ count = 200 }) {
  const meshRef = useRef();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      scales[i] = Math.random() * 0.5 + 0.2;
    }
    return { positions, scales };
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#00f0ff"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ── Glowing core orb ────────────────────────────────────────── */
function GlowOrb() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.2}>
      <Sphere ref={meshRef} args={[1.6, 64, 64]}>
        <MeshDistortMaterial
          color="#0a0a2e"
          emissive="#00f0ff"
          emissiveIntensity={0.15}
          roughness={0.2}
          metalness={0.8}
          distort={0.35}
          speed={1.8}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </Float>
  );
}

/* ── Orbiting rings ──────────────────────────────────────────── */
function OrbitalRing({ radius = 2.5, color = '#00f0ff', speed = 0.3, tilt = 0 }) {
  const ringRef = useRef();

  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * speed;
    }
  });

  return (
    <group rotation={[tilt, 0, tilt * 0.5]}>
      <line ref={ringRef} geometry={geometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </line>
    </group>
  );
}

/* ── Small node dots orbiting ────────────────────────────────── */
function OrbitingNode({ radius = 2.5, speed = 0.5, tilt = 0, color = '#00f0ff' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed;
      meshRef.current.position.x = Math.cos(t) * radius;
      meshRef.current.position.z = Math.sin(t) * radius;
    }
  });

  return (
    <group rotation={[tilt, 0, tilt * 0.5]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/* ── Main Three.js Scene ─────────────────────────────────────── */
export default function ThreeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#00f0ff" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#a855f7" />
      <pointLight position={[0, 3, -5]} intensity={0.3} color="#f472b6" />

      {/* Core glowing orb */}
      <GlowOrb />

      {/* Orbital rings */}
      <OrbitalRing radius={2.4} color="#00f0ff" speed={0.2} tilt={0.4} />
      <OrbitalRing radius={2.8} color="#a855f7" speed={-0.15} tilt={-0.6} />
      <OrbitalRing radius={3.2} color="#f472b6" speed={0.1} tilt={0.8} />

      {/* Orbiting nodes */}
      <OrbitingNode radius={2.4} speed={0.4} tilt={0.4} color="#00f0ff" />
      <OrbitingNode radius={2.8} speed={-0.3} tilt={-0.6} color="#a855f7" />
      <OrbitingNode radius={3.2} speed={0.2} tilt={0.8} color="#f472b6" />

      {/* Particle field background */}
      <ParticleField count={250} />
    </Canvas>
  );
}
