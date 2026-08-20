import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function AuroraField({ count, color, size, opacity }: { count: number; color: string; size: number; opacity: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi) - 5;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.02;
    ref.current.rotation.x = Math.sin(t * 0.05) * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function CoreOrb({ score }: { score: number | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<any>(null);

  const targetColor = useMemo(() => {
    if (score === null) return new THREE.Color("#7c6df2");
    if (score >= 70) return new THREE.Color("#4ee7b8");
    if (score >= 45) return new THREE.Color("#f2b84e");
    return new THREE.Color("#f25e7a");
  }, [score]);

  const currentColor = useRef(new THREE.Color("#7c6df2"));

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const intensity = 0.3 + ((score ?? 20) / 100) * 0.9;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (0.12 + intensity * 0.25);
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
      const s = 1 + Math.sin(t * 0.8) * 0.03;
      groupRef.current.scale.set(s, s, s);
    }
    if (matRef.current) {
      currentColor.current.lerp(targetColor, delta * 1.5);
      matRef.current.color = currentColor.current;
      matRef.current.distort = 0.35 + Math.sin(t * 0.6) * 0.08 + intensity * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.2, -2]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.7, 128, 128]} />
        <MeshDistortMaterial ref={matRef} color="#7c6df2" speed={1.6} distort={0.4} radius={1} roughness={0.15} metalness={0.3} transparent opacity={0.92} />
      </mesh>
      <pointLight color="#f2b84e" intensity={3.2} distance={10} position={[2, 1, 2]} />
      <pointLight color="#7c6df2" intensity={2.4} distance={10} position={[-2, -1, 1]} />
    </group>
  );
}

function OrbitRings({ score }: { score: number | null }) {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    const speed = 0.15 + ((score ?? 0) / 100) * 0.4;
    if (r1.current) r1.current.rotation.z += speed * delta;
    if (r2.current) r2.current.rotation.z -= speed * 0.7 * delta;
    if (r3.current) r3.current.rotation.x += speed * 0.5 * delta;
  });
  return (
    <group position={[0, 0.2, -2]}>
      <mesh ref={r1} rotation={[Math.PI / 2.4, 0.3, 0]}>
        <torusGeometry args={[2.6, 0.006, 8, 128]} />
        <meshBasicMaterial color="#9fe8d4" transparent opacity={0.35} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 1.6, 0.7, 0.2]}>
        <torusGeometry args={[3.1, 0.005, 8, 128]} />
        <meshBasicMaterial color="#f2b84e" transparent opacity={0.22} />
      </mesh>
      <mesh ref={r3} rotation={[0.4, Math.PI / 3, 0]}>
        <torusGeometry args={[3.6, 0.004, 8, 128]} />
        <meshBasicMaterial color="#c9b6ff" transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

function CameraRig({ scrollT }: { scrollT: React.MutableRefObject<number> }) {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.02;
    camera.position.y += (-pointer.y * 0.8 - camera.position.y) * 0.02;
    camera.position.z = 8.5 - scrollT.current * 3;
    camera.lookAt(0, 0.2, -2);
  });
  return null;
}

export default function Scene3D({ score }: { score: number | null }) {
  const scrollT = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight || 1;
      scrollT.current = Math.min(Math.max(window.scrollY / max, 0), 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  if (reducedMotion) return <div className="bg-scene bg-scene-static" aria-hidden="true" />;

  return (
    <div className="bg-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 8.5], fov: 55 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <AuroraField count={500} color="#9fe8d4" size={0.05} opacity={0.5} />
        <AuroraField count={300} color="#c9b6ff" size={0.06} opacity={0.4} />
        <AuroraField count={180} color="#f2b84e" size={0.07} opacity={0.35} />
        <CoreOrb score={score} />
        <OrbitRings score={score} />
        <CameraRig scrollT={scrollT} />
      </Canvas>
    </div>
  );
}
