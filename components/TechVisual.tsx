"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion, useSpring, useMotionValue } from "framer-motion";

function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const secondaryLightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (!lightRef.current || !secondaryLightRef.current) return;
    const x = (state.mouse.x * state.viewport.width) / 2;
    const y = (state.mouse.y * state.viewport.height) / 2;
    
    // Primary Teal Light
    lightRef.current.position.set(x, y, 2);
    
    // Secondary Purple Light (offset for contrast)
    secondaryLightRef.current.position.set(-x, -y, 1);
  });

  return (
    <>
      <pointLight ref={lightRef} intensity={2} color="#2dd4bf" distance={8} />
      <pointLight ref={secondaryLightRef} intensity={1.5} color="#a855f7" distance={10} />
    </>
  );
}

function FloatingCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;

    // React to mouse
    const dist = Math.sqrt(state.mouse.x ** 2 + state.mouse.y ** 2);
    if (materialRef.current) {
      // Morphing based on mouse position
      materialRef.current.distort = THREE.MathUtils.lerp(
        materialRef.current.distort, 
        0.4 + (1 - dist) * 0.5 + Math.abs(state.mouse.x) * 0.3, 
        0.15
      );

      // Color shifting: Teal to Purple/Indigo
      const r = THREE.MathUtils.lerp(0.17, 0.4 + state.mouse.x * 0.2, 0.15);
      const g = THREE.MathUtils.lerp(0.83, 0.2 + state.mouse.y * 0.2, 0.15);
      const b = THREE.MathUtils.lerp(0.75, 0.9, 0.15);
      materialRef.current.color.setRGB(r, g, b);
    }
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1 + (1 - dist) * 0.2, 0.15));
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          ref={materialRef}
          color="#2dd4bf"
          speed={3}
          distort={0.4}
          radius={1}
          wireframe
          opacity={0.3}
          transparent
        />
      </Sphere>
      <Sphere args={[0.8, 32, 32]}>
        <MeshDistortMaterial
          color="#2dd4bf"
          speed={5}
          distort={0.2}
          radius={0.8}
          emissive="#2dd4bf"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField({ count = 1000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#2dd4bf"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

export default function TechVisual() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 30);
    mouseY.set(y * 30);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="w-full h-[400px] relative group"
    >
      {/* Top and Bottom masks to ensure zero seams with the page background */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#020617] to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#020617] to-transparent z-20 pointer-events-none" />

      {/* Subtle radial glow instead of linear gradient to avoid side seams */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#2dd4bf" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0d9488" />
        <MouseLight />
        <FloatingCore />
        <ParticleField />
      </Canvas>
      
      {/* Overlay Text with motion */}
      <div className="absolute inset-0 flex items-center justify-between px-12 md:px-24 pointer-events-none">
        <motion.div 
          style={{ x: springX, y: springY }}
          className="flex flex-col items-start"
        >
          <div className="relative">
            <div className="absolute -inset-8 bg-purple-500/10 blur-2xl rounded-full" />
            <span className="relative z-10 text-[10px] uppercase tracking-[0.8em] text-purple-400/60 font-black">Neural</span>
            <div className="w-12 h-[1px] bg-purple-500/30 mt-2" />
          </div>
        </motion.div>
        
        <motion.div 
          style={{ x: springX, y: springY }}
          className="flex flex-col items-end"
        >
          <div className="relative">
            <div className="absolute -inset-8 bg-purple-500/10 blur-2xl rounded-full" />
            <span className="relative z-10 text-[10px] uppercase tracking-[0.8em] text-purple-400/60 font-black">Active</span>
            <div className="w-12 h-[1px] bg-purple-500/30 mt-2" />
          </div>
        </motion.div>
      </div>

      {/* Center HUD element */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          style={{ 
            x: useSpring(mouseX, { stiffness: 50, damping: 20 }), 
            y: useSpring(mouseY, { stiffness: 50, damping: 20 }),
            scale: useSpring(useMotionValue(1), { stiffness: 200, damping: 10 })
          }}
          className="relative"
        >
          <div className="absolute -inset-24 bg-purple-500/10 blur-[120px] rounded-full" />
          <div className="text-center space-y-1 relative z-10">
            <div className="text-[8px] uppercase tracking-[1em] text-purple-500/40 font-bold">
              Interface
            </div>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mx-auto" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
