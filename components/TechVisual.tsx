"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion, useSpring, useMotionValue } from "framer-motion";

// Capital Ship - large wireframe geometry
function CapitalShip() {
  const meshRef = useRef<THREE.Group>(null);
  const position = useMemo(() => new THREE.Vector3(2, 0, 0), []);

  const geometry = useMemo(() => {
    // Build a capital ship shape: elongated box with wings
    const group = new THREE.Group();

    // Main hull
    const hull = new THREE.BoxGeometry(0.4, 0.3, 2);
    const hullMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(hull),
      new THREE.LineBasicMaterial({
        color: "#2dd4bf",
        opacity: 0.8,
        transparent: true,
      })
    );
    group.add(hullMesh);

    // Wings
    const wingGeom = new THREE.BoxGeometry(2, 0.1, 0.6);
    const wingMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(wingGeom),
      new THREE.LineBasicMaterial({
        color: "#2dd4bf",
        opacity: 0.7,
        transparent: true,
      })
    );
    wingMesh.position.z = 0.3;
    group.add(wingMesh);

    // Bridge tower
    const bridge = new THREE.BoxGeometry(0.3, 0.4, 0.3);
    const bridgeMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(bridge),
      new THREE.LineBasicMaterial({
        color: "#2dd4bf",
        opacity: 0.8,
        transparent: true,
      })
    );
    bridgeMesh.position.y = 0.35;
    bridgeMesh.position.z = -0.5;
    group.add(bridgeMesh);

    return group;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Gentle rotation
    meshRef.current.rotation.y =
      Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
    meshRef.current.rotation.x =
      Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
  });

  return <primitive ref={meshRef} object={geometry} position={position} />;
}

// Fighter Ship - small wireframe geometry
function FighterShip({
  position,
  speed,
  delay,
  onPositionUpdate,
  isRespawning,
  respawnProgress,
}: {
  position: [number, number, number];
  speed: number;
  delay: number;
  onPositionUpdate: (pos: THREE.Vector3) => void;
  isRespawning: boolean;
  respawnProgress: number;
}) {
  const meshRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const group = new THREE.Group();

    // Fighter body - elongated tetrahedron shape
    const body = new THREE.ConeGeometry(0.08, 0.4, 3);
    const bodyMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(body),
      new THREE.LineBasicMaterial({
        color: "#a855f7",
        opacity: 0.9,
        transparent: true,
      })
    );
    bodyMesh.rotation.x = Math.PI / 2;
    group.add(bodyMesh);

    // Wings
    const wing = new THREE.BoxGeometry(0.4, 0.02, 0.15);
    const wingMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(wing),
      new THREE.LineBasicMaterial({
        color: "#a855f7",
        opacity: 0.8,
        transparent: true,
      })
    );
    group.add(wingMesh);

    return group;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.getElapsedTime() * speed + delay;

    if (isRespawning) {
      // Flying in from left side
      const startX = -5;
      const targetX = position[0] + Math.cos(t) * 1.5;
      const targetY = position[1] + Math.sin(t * 0.7) * 0.8;
      const targetZ = position[2] + Math.sin(t) * 1.2;

      meshRef.current.position.x = THREE.MathUtils.lerp(
        startX,
        targetX,
        respawnProgress
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        0,
        targetY,
        respawnProgress
      );
      meshRef.current.position.z = THREE.MathUtils.lerp(
        0,
        targetZ,
        respawnProgress
      );
    } else {
      // Normal circular attack pattern around capital ship
      meshRef.current.position.x = position[0] + Math.cos(t) * 1.5;
      meshRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.8;
      meshRef.current.position.z = position[2] + Math.sin(t) * 1.2;
    }

    // Face movement direction
    meshRef.current.lookAt(2, 0, 0);

    // Update position for collision detection
    onPositionUpdate(meshRef.current.position.clone());
  });

  return <primitive ref={meshRef} object={geometry} />;
}

// Background starfield
function StarField({ count = 400 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
      />
    </Points>
  );
}

// Laser beam (from capital ship)
function Laser({
  start,
  end,
  color,
  spawnTime,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  spawnTime: number;
}) {
  const opacityRef = useRef(1);
  const materialRef = useRef<THREE.LineBasicMaterial | null>(null);

  useFrame((state) => {
    const age = state.clock.getElapsedTime() - spawnTime;
    // Fade out after 0.3 seconds
    if (age > 0.3) {
      opacityRef.current = Math.max(0, 1 - (age - 0.3) * 5);
      if (materialRef.current) {
        materialRef.current.opacity = opacityRef.current;
      }
    }
  });

  const lineObj = useMemo(() => {
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      opacity: 1,
      transparent: true,
    });
    materialRef.current = material;
    return new THREE.Line(geometry, material);
  }, [start, end, color]);

  if (opacityRef.current <= 0) return null;

  return <primitive object={lineObj} />;
}

// Bullet projectile (from fighters)
function Bullet({
  start,
  direction,
  color,
  spawnTime,
}: {
  start: THREE.Vector3;
  direction: THREE.Vector3;
  color: string;
  spawnTime: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const posRef = useRef(start.clone());
  const [opacity, setOpacity] = useState(1);

  useFrame((state) => {
    const age = state.clock.getElapsedTime() - spawnTime;

    // Move bullet forward
    posRef.current.add(direction.clone().multiplyScalar(0.1));

    if (meshRef.current) {
      meshRef.current.position.copy(posRef.current);
    }

    // Check if hit capital ship (position [2, 0, 0])
    const distToCapital = posRef.current.distanceTo(new THREE.Vector3(2, 0, 0));
    if (distToCapital < 0.8) {
      setOpacity(0);
    }

    // Fade out after 1.5 seconds or after traveling far
    if (age > 1.5 || posRef.current.length() > 10) {
      setOpacity(0);
    }
  });

  if (opacity <= 0) return null;

  return (
    <mesh ref={meshRef} position={posRef.current}>
      <sphereGeometry args={[0.03, 4, 4]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent />
    </mesh>
  );
}

// Explosion effect
function Explosion({
  position,
  spawnTime,
}: {
  position: THREE.Vector3;
  spawnTime: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const opacityRef = useRef(1);

  useFrame((state) => {
    if (!meshRef.current) return;
    const age = state.clock.getElapsedTime() - spawnTime;
    // Expand and fade
    const scale = 0.1 + age * 1.5;
    meshRef.current.scale.setScalar(scale);
    opacityRef.current = Math.max(0, 1 - age * 2);
    if (meshRef.current.material && "opacity" in meshRef.current.material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
        opacityRef.current;
    }
  });

  if (opacityRef.current <= 0) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color="#ff6b00"
        wireframe
        transparent
        opacity={opacityRef.current}
      />
    </mesh>
  );
}

// Battle coordinator
function BattleScene({
  fighterPositions,
  fighterHealth,
  respawningFighters,
  onFighterHit,
}: {
  fighterPositions: THREE.Vector3[];
  fighterHealth: number[];
  respawningFighters: boolean[];
  onFighterHit: (index: number) => void;
}) {
  const [lasers, setLasers] = useState<
    Array<{
      id: number;
      start: THREE.Vector3;
      end: THREE.Vector3;
      color: string;
      spawnTime: number;
      targetIndex: number;
    }>
  >([]);
  const [bullets, setBullets] = useState<
    Array<{
      id: number;
      start: THREE.Vector3;
      direction: THREE.Vector3;
      color: string;
      spawnTime: number;
    }>
  >([]);
  const [explosions, setExplosions] = useState<
    Array<{ id: number; position: THREE.Vector3; spawnTime: number }>
  >([]);

  const capitalPos = useMemo(() => new THREE.Vector3(2, 0, 0), []);
  const lastCapitalLaserTime = useRef(0);
  const lastBulletTime = useRef(0);
  const laserIdCounter = useRef(0);
  const bulletIdCounter = useRef(0);
  const explosionIdCounter = useRef(0);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Get active fighters (alive and not respawning)
    const activeFighterIndices = fighterPositions
      .map((_, idx) => idx)
      .filter((idx) => fighterHealth[idx] > 0 && !respawningFighters[idx]);

    // Capital ship shoots teal lasers at fighters every 1-1.5 seconds
    if (t - lastCapitalLaserTime.current > 1 + Math.random() * 0.5) {
      lastCapitalLaserTime.current = t;

      if (activeFighterIndices.length > 0) {
        // Pick random active fighter to target
        const targetIndex =
          activeFighterIndices[
            Math.floor(Math.random() * activeFighterIndices.length)
          ];
        const target = fighterPositions[targetIndex];

        const newLaser = {
          id: laserIdCounter.current++,
          start: capitalPos.clone(),
          end: target.clone(),
          color: "#2dd4bf",
          spawnTime: t,
          targetIndex,
        };

        // Use pooling: limit lasers to max 20
        setLasers((prev) => {
          const newArray = [...prev, newLaser];
          return newArray.length > 20 ? newArray.slice(-20) : newArray;
        });

        // Hit fighter - explosion only if destroyed
        setTimeout(() => {
          onFighterHit(targetIndex);
          // Only show explosion if fighter is destroyed (health <= 0)
          if (fighterHealth[targetIndex] <= 1) {
            setExplosions((prev) => {
              const newExp = {
                id: explosionIdCounter.current++,
                position: target.clone(),
                spawnTime: state.clock.getElapsedTime(),
              };
              // Limit explosions to max 10
              const newArray = [...prev, newExp];
              return newArray.length > 10 ? newArray.slice(-10) : newArray;
            });
          }
        }, 50);
      }
    }

    // Fighters shoot purple bullets every 0.4-0.8 seconds
    if (t - lastBulletTime.current > 0.4 + Math.random() * 0.4) {
      lastBulletTime.current = t;

      if (activeFighterIndices.length > 0) {
        // Pick random active fighter to shoot from
        const shooterIndex =
          activeFighterIndices[
            Math.floor(Math.random() * activeFighterIndices.length)
          ];
        const shooterPos = fighterPositions[shooterIndex];
        const direction = capitalPos.clone().sub(shooterPos).normalize();

        const newBullet = {
          id: bulletIdCounter.current++,
          start: shooterPos.clone(),
          direction,
          color: "#a855f7",
          spawnTime: t,
        };

        // Use pooling: limit bullets to max 15
        setBullets((prev) => {
          const newArray = [...prev, newBullet];
          return newArray.length > 15 ? newArray.slice(-15) : newArray;
        });
      }
    }

    // Batch cleanup updates into single frame
    const shouldCleanup = t % 0.1 < 0.016; // Clean up every ~6 frames instead of every frame
    if (shouldCleanup) {
      setLasers((prev) => prev.filter((laser) => t - laser.spawnTime < 0.6));
      setBullets((prev) => prev.filter((bullet) => t - bullet.spawnTime < 1.5));
      setExplosions((prev) => prev.filter((exp) => t - exp.spawnTime < 0.4));
    }
  });

  return (
    <>
      {lasers.map((laser) => (
        <Laser key={laser.id} {...laser} />
      ))}
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} {...bullet} />
      ))}
      {explosions.map((exp) => (
        <Explosion key={exp.id} {...exp} />
      ))}
    </>
  );
}

export default function TechVisual() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [fighterPositions, setFighterPositions] = useState<THREE.Vector3[]>([]);
  const [fighterHealth, setFighterHealth] = useState<number[]>([3, 3, 3, 3, 3]);
  const [respawningFighters, setRespawningFighters] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [respawnProgress, setRespawnProgress] = useState<number[]>([
    1, 1, 1, 1, 1,
  ]);
  const [fighters, setFighters] = useState([
    { id: 0, speed: 0.8, delay: 0 },
    { id: 1, speed: 0.9, delay: 2 },
    { id: 2, speed: 0.85, delay: 4 },
    { id: 3, speed: 0.95, delay: 1 },
    { id: 4, speed: 0.75, delay: 3 },
  ]);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 20);
    mouseY.set(y * 20);
  };

  const updateFighterPosition = (index: number) => (pos: THREE.Vector3) => {
    setFighterPositions((prev) => {
      const newPositions = [...prev];
      newPositions[index] = pos;
      return newPositions;
    });
  };

  const handleFighterHit = (index: number) => {
    setFighterHealth((prev) => {
      const newHealth = [...prev];
      newHealth[index] = Math.max(0, newHealth[index] - 1);

      // If destroyed, start respawn sequence
      if (newHealth[index] === 0) {
        setRespawningFighters((prevResp) => {
          const newResp = [...prevResp];
          newResp[index] = true;
          return newResp;
        });

        // Respawn after 2 seconds
        setTimeout(() => {
          setRespawnProgress((prevProg) => {
            const newProg = [...prevProg];
            newProg[index] = 0;
            return newProg;
          });

          // Animate respawn progress over 1.5 seconds
          const startTime = Date.now();
          const duration = 1500;

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setRespawnProgress((prevProg) => {
              const newProg = [...prevProg];
              newProg[index] = progress;
              return newProg;
            });

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Respawn complete
              setRespawningFighters((prevResp) => {
                const newResp = [...prevResp];
                newResp[index] = false;
                return newResp;
              });

              // Restore health and randomize parameters
              setFighterHealth((prevHealth) => {
                const newHealth = [...prevHealth];
                newHealth[index] = 3;
                return newHealth;
              });

              setFighters((prev) => {
                const newFighters = [...prev];
                newFighters[index] = {
                  id: newFighters[index].id,
                  speed: 0.7 + Math.random() * 0.3,
                  delay: Math.random() * 5,
                };
                return newFighters;
              });
            }
          };

          animate();
        }, 2000);
      }

      return newHealth;
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-full h-[400px] relative group techvisual-fade"
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_70%)] pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.75]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#2dd4bf" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#a855f7" />

        <CapitalShip />

        {/* Fighter squadron */}
        {fighters.map(
          (fighter, index) =>
            fighterHealth[index] > 0 && (
              <FighterShip
                key={fighter.id}
                position={[-2, 0, 0]}
                speed={fighter.speed}
                delay={fighter.delay}
                onPositionUpdate={updateFighterPosition(index)}
                isRespawning={respawningFighters[index]}
                respawnProgress={respawnProgress[index]}
              />
            )
        )}

        <BattleScene
          fighterPositions={fighterPositions}
          fighterHealth={fighterHealth}
          respawningFighters={respawningFighters}
          onFighterHit={handleFighterHit}
        />
        <StarField />
      </Canvas>

      {/* Text overlay - repositioned to not overlap scene center */}
      <div className="absolute inset-0 flex items-start justify-between px-12 md:px-24 pt-8 pointer-events-none">
        <motion.div
          style={{ x: springX, y: springY }}
          className="flex flex-col items-start"
        >
          <div className="relative">
            <div className="absolute -inset-8 bg-teal-500/10 blur-2xl rounded-full" />
            <span className="relative z-10 text-[10px] uppercase tracking-[0.8em] text-teal-400/60 font-black">
              Vector
            </span>
            <div className="w-12 h-[1px] bg-teal-500/30 mt-2" />
          </div>
        </motion.div>

        <motion.div
          style={{ x: springX, y: springY }}
          className="flex flex-col items-end"
        >
          <div className="relative">
            <div className="absolute -inset-8 bg-purple-500/10 blur-2xl rounded-full" />
            <span className="relative z-10 text-[10px] uppercase tracking-[0.8em] text-purple-400/60 font-black">
              Combat
            </span>
            <div className="w-12 h-[1px] bg-purple-500/30 mt-2" />
          </div>
        </motion.div>
      </div>

      {/* Bottom label - moved outside battle zone */}
      <div className="absolute bottom-8 inset-x-0 flex items-center justify-center pointer-events-none">
        <motion.div
          style={{
            x: springX,
            y: springY,
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
