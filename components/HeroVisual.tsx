"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Points, PointMaterial, Text } from "@react-three/drei";
import * as THREE from "three";

function getPointer(state: any) {
  return state.pointer ?? state.mouse;
}

function damp(current: number, target: number, lambda: number, delta: number) {
  return THREE.MathUtils.damp(current, target, lambda, delta);
}

function AnimatedTorus({ rotation = [0, 0, 0], scale = 1 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const pointer = getPointer(state);
    meshRef.current.rotation.x = time * 0.1 + rotation[0];
    meshRef.current.rotation.y = time * 0.15 + rotation[1];
    meshRef.current.rotation.z = time * 0.05 + rotation[2];

    // Manipulate distortion and color based on mouse position
    if (materialRef.current) {
      const dist = Math.sqrt(pointer.x ** 2 + pointer.y ** 2);
      
      // Morphing logic: different distortion based on quadrant
      const morphX = pointer.x * 0.5;
      const targetDistort = 0.3 + (1 - dist) * 0.6 + Math.abs(morphX);
      const targetSpeed = 2 + (1 - dist) * 8;
      
      materialRef.current.distort = damp(materialRef.current.distort, targetDistort, 28, delta);
      materialRef.current.speed = damp(materialRef.current.speed, targetSpeed, 28, delta);

      // Color shifting logic: Teal to Purple/Blue based on mouse position
      const r = THREE.MathUtils.lerp(0.17, 0.4 + pointer.x * 0.2, 0.65);
      const g = THREE.MathUtils.lerp(0.83, 0.2 + pointer.y * 0.2, 0.65);
      const b = THREE.MathUtils.lerp(0.75, 0.9, 0.65);
      
      materialRef.current.color.setRGB(r, g, b);
    }

    // Subtle scale pulse based on mouse
    const targetScale = scale * (1 + (1 - Math.abs(pointer.x)) * 0.15);
    meshRef.current.scale.setScalar(damp(meshRef.current.scale.x, targetScale, 30, delta));
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.5, 0.4, 96, 16]} />
      <MeshDistortMaterial
        ref={materialRef}
        color="#2dd4bf"
        speed={2}
        distort={0.3}
        radius={1}
        wireframe
        opacity={0.15}
        transparent
      />
    </mesh>
  );
}

function Kaleidoscope() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const pointer = getPointer(state);
    // Rotate the entire kaleidoscope based on mouse
    const targetRotY = pointer.x * 0.9;
    const targetRotX = -pointer.y * 0.9;
    groupRef.current.rotation.y = damp(groupRef.current.rotation.y, targetRotY, 35, delta);
    groupRef.current.rotation.x = damp(groupRef.current.rotation.x, targetRotX, 35, delta);
  });

  return (
    <group ref={groupRef}>
      {/* Center piece */}
      <AnimatedTorus scale={1} />
      
      {/* Mirrored pieces for kaleidoscope effect */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, 0, angle]}>
            <group position={[3, 0, 0]}>
              <AnimatedTorus scale={0.5} rotation={[angle, angle * 0.5, 0]} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

function DataStream({ count = 50 }) {
  const lines = useMemo(() => {
    const l = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10;
      const height = Math.random() * 10 + 5;
      l.push({ x, z, height, speed: Math.random() * 0.02 + 0.01 });
    }
    return l;
  }, [count]);

  return (
    <group>
      {lines.map((line, i) => (
        <LineStream key={i} {...line} />
      ))}
    </group>
  );
}

function LineStream({ x, z, height, speed }: { x: number; z: number; height: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const isPurple = useMemo(() => Math.random() > 0.7, []);
  
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.position.y = ((state.clock.getElapsedTime() * speed * 100) % height) - height / 2;

    // React to mouse proximity
    const pointer = getPointer(state);
    const mouseX = (pointer.x * state.viewport.width) / 2;
    const mouseY = (pointer.y * state.viewport.height) / 2;
    const dx = ref.current.position.x - mouseX;
    const dy = ref.current.position.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 3) {
      const force = (3 - dist) / 3;
      ref.current.position.x += dx * force * 0.1;
      ref.current.scale.setScalar(1 + force * 2);
    } else {
      ref.current.position.x = damp(ref.current.position.x, x, 18, delta);
      ref.current.scale.setScalar(damp(ref.current.scale.x, 1, 18, delta));
    }
  });

  return (
    <mesh ref={ref} position={[x, 0, z]}>
      <boxGeometry args={[0.02, 1, 0.02]} />
      <meshBasicMaterial color={isPurple ? "#a855f7" : "#2dd4bf"} transparent opacity={isPurple ? 0.4 : 0.2} />
    </mesh>
  );
}

function ParticleCloud({ count = 2000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 25;
      p[i * 3 + 1] = (Math.random() - 0.5) * 25;
      p[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    
    // Subtle tilt based on mouse
    const pointer = getPointer(state);
    const x = (pointer.x * Math.PI) / 18;
    const y = (pointer.y * Math.PI) / 18;
    ref.current.rotation.x = damp(ref.current.rotation.x, y, 22, delta);
    ref.current.rotation.z = damp(ref.current.rotation.z, -x, 22, delta);
  });

  return (
    <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#a855f7"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const secondaryLightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (!lightRef.current || !secondaryLightRef.current) return;
    const pointer = getPointer(state);
    // Convert normalized mouse coordinates to world space
    const x = (pointer.x * state.viewport.width) / 2;
    const y = (pointer.y * state.viewport.height) / 2;
    
    // Primary Teal Light
    lightRef.current.position.set(x, y, 2);
    
    // Secondary Purple Light (mirrored for contrast)
    secondaryLightRef.current.position.set(-x, -y, 1);
  });

  return (
    <>
      <pointLight ref={lightRef} intensity={2} color="#2dd4bf" distance={10} />
      <pointLight ref={secondaryLightRef} intensity={1.5} color="#a855f7" distance={12} />
    </>
  );
}

export default function HeroVisual() {
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setEventSource(document.body);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-[#020617]/50 z-10" />
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        eventSource={eventSource ?? undefined}
        eventPrefix="client"
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#2dd4bf" />
        <MouseLight />
        <Kaleidoscope />
        <DataStream />
        <ParticleCloud />
      </Canvas>
    </div>
  );
}
