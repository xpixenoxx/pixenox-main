"use client";

import { Suspense, useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import type { AvatarState } from "@/lib/pixy/types";

/* ------------------------------------------------------------------ */
/*  Animation configs keyed by avatar state                           */
/* ------------------------------------------------------------------ */

const STATE_FLOAT_AMPLITUDE: Record<AvatarState, number> = {
  idle: 0.06,
  listening: 0.04,
  thinking: 0.08,
  speaking: 0.06,
  success: 0.1,
};

const STATE_FLOAT_SPEED: Record<AvatarState, number> = {
  idle: 1.2,
  listening: 0.8,
  thinking: 2.0,
  speaking: 1.6,
  success: 2.4,
};

/* ------------------------------------------------------------------ */
/*  Shared mouse state (updated from window-level listener)           */
/* ------------------------------------------------------------------ */

// Normalized mouse coords: x ∈ [-1,1], y ∈ [-1,1]
const mouseNDC = { x: 0, y: 0 };
let lastMouseMoveTime = 0;
let lastKeyTime = 0;

/* ------------------------------------------------------------------ */
/*  Bone name matching helpers                                        */
/* ------------------------------------------------------------------ */

const HEAD_NAMES = [
  "head", "Head", "HEAD",
  "mixamorigHead", "Bip001_Head",
  "head_bone", "HeadBone", "head_jnt",
];

const EYE_NAMES = [
  "eye", "Eye", "EYE",
  "eye_l", "eye_r", "Eye_L", "Eye_R",
  "LeftEye", "RightEye", "leftEye", "rightEye",
  "mixamorigLeftEye", "mixamorigRightEye",
  "eye.L", "eye.R",
];

function nameMatches(objName: string, patterns: string[]): boolean {
  const lower = objName.toLowerCase();
  return patterns.some((p) => lower === p.toLowerCase() || lower.includes(p.toLowerCase()));
}

/* ------------------------------------------------------------------ */
/*  Inner scene component (runs inside <Canvas>)                      */
/* ------------------------------------------------------------------ */

interface PixyModelProps {
  state: AvatarState;
}

function PixyModel({ state }: PixyModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/pixy.glb");

  // Clone the scene to avoid shared-reference issues with React strict mode
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Compute the base offset — the bottom of the model's bounding box.
  // We position the model so the base sits at Y=0 (the pivot origin).
  // When we rotate the pivot group, the base barely moves while the
  // head (far from pivot) tilts/turns naturally — like a bobblehead.
  const baseOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    // The neck/base is roughly 12% up from the very bottom
    const height = box.max.y - box.min.y;
    return box.min.y + height * 0.12;
  }, [clonedScene]);

  // Find head and eye bones/objects in the model
  const { headBone, eyeBones } = useMemo(() => {
    let head: THREE.Object3D | null = null;
    const eyes: THREE.Object3D[] = [];

    clonedScene.traverse((child) => {
      if (!head && nameMatches(child.name, HEAD_NAMES)) {
        head = child;
      }
      if (nameMatches(child.name, EYE_NAMES)) {
        eyes.push(child);
      }
    });

    // Log found bones for debugging (only in dev)
    if (typeof window !== "undefined") {
      console.log("[Pixy3D] Head bone:", head?.name ?? "NOT FOUND (will use pivot-based head rotation)");
      console.log("[Pixy3D] Eye bones:", eyes.map((e) => e.name).join(", ") || "NONE");
      // Also log all bone names for reference
      const allNames: string[] = [];
      clonedScene.traverse((child) => {
        if (child.name) allNames.push(child.name);
      });
      console.log("[Pixy3D] All object names in model:", allNames.join(", "));
    }

    return { headBone: head, eyeBones: eyes };
  }, [clonedScene]);

  // Store original rotations so we apply deltas, not absolutes
  const headOriginal = useRef<THREE.Euler | null>(null);
  const eyeOriginals = useRef<Map<string, THREE.Euler>>(new Map());

  useEffect(() => {
    if (headBone) {
      headOriginal.current = headBone.rotation.clone();
    }
    eyeBones.forEach((eye) => {
      eyeOriginals.current.set(eye.uuid, eye.rotation.clone());
    });
  }, [headBone, eyeBones]);

  // Smoothed tracking values
  const smoothX = useRef(0);
  const smoothY = useRef(0);

  // Base Y position for the group — must match the JSX position prop
  const BASE_Y = -2.2;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const now = Date.now();

    // Gentle floating bob — add on top of base Y position
    const floatY = Math.sin(t * STATE_FLOAT_SPEED[state]) * STATE_FLOAT_AMPLITUDE[state];
    groupRef.current.position.y = BASE_Y + floatY;

    // Movement & Idle logic
    const timeSinceMouseMove = now - lastMouseMoveTime;
    const timeSinceLastKey = now - lastKeyTime;
    const isMouseMoving = timeSinceMouseMove < 150; // Active movement threshold
    const timeSinceLastActivity = Math.min(timeSinceMouseMove, timeSinceLastKey);
    const isUserActive = timeSinceLastActivity < 5000;

    let targetX = 0;
    let targetY = 0;

    if (isMouseMoving) {
      // 1) Track cursor if it's actively moving
      targetX = mouseNDC.x;
      targetY = mouseNDC.y;
    } else {
      if (state === "speaking" || state === "success") {
        // 2) Pixy is replying — make eye contact
        targetX = 0;
        targetY = 0;
      } else {
        // User's turn
        if (isUserActive) {
          // 3) User is typing or interacting — look left toward UI
          targetX = -0.8;
          targetY = 0.1;
        } else {
          // 3 note) Inactive for > 5 seconds — face the user
          targetX = 0;
          targetY = 0;
        }
      }
    }

    // Smooth interpolation toward target position (lerp for snappy organic feel)
    const lerpFactor = 0.12;
    smoothX.current += (targetX - smoothX.current) * lerpFactor;
    smoothY.current += (targetY - smoothY.current) * lerpFactor;

    const mx = smoothX.current;
    const my = smoothY.current;

    // Whole-body subtle rotation following cursor (always active)
    groupRef.current.rotation.y = mx * 0.15;  // subtle body turn toward cursor

    if (headBone && headOriginal.current) {
      // Head tracking — rotate head bone toward cursor
      const headYaw = mx * 0.6;    // max ~35° left/right
      const headPitch = my * 0.45;  // max ~26° up/down
      const headTilt = mx * 0.12;   // subtle head tilt

      headBone.rotation.set(
        headOriginal.current.x + headPitch,
        headOriginal.current.y + headYaw,
        headOriginal.current.z + headTilt
      );
    }

    if (eyeBones.length > 0) {
      // Eyes track faster and further than head for realism
      const eyeYaw = mx * 0.8;
      const eyePitch = my * 0.6;

      eyeBones.forEach((eye) => {
        const orig = eyeOriginals.current.get(eye.uuid);
        if (orig) {
          eye.rotation.set(
            orig.x + eyePitch,
            orig.y + eyeYaw,
            orig.z
          );
        }
      });
    }

    // Pivot-based head rotation: rotate around the base/neck so only the
    // head tilts while the base stays anchored in place.
    if (!headBone && pivotRef.current) {
      const headYaw = mx * 0.45;      // left/right (~25°)
      const headPitch = my * 0.25;    // up/down (~15°)
      const headTilt = -mx * 0.1;     // subtle roll

      pivotRef.current.rotation.y = headYaw;
      pivotRef.current.rotation.x = headPitch;
      pivotRef.current.rotation.z = headTilt;
    }
  });

  return (
    <group ref={groupRef} scale={4.0} position={[0, BASE_Y, 0]}>
      {/* Pivot group: rotates around Y=0, which is aligned to the base/neck */}
      <group ref={pivotRef}>
        {/* Offset the model so the base/neck sits at Y=0 (the pivot point) */}
        <group position={[0, -baseOffset, 0]}>
          <primitive object={clonedScene} />
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Mouse tracker — listens at window level, writes to mouseNDC       */
/* ------------------------------------------------------------------ */

function MouseTracker() {
  const { gl } = useThree();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to [-1, 1] across the full window
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = (e.clientY / window.innerHeight) * 2 - 1;
      lastMouseMoveTime = Date.now();
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      lastKeyTime = Date.now();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gl]);

  return null; // invisible helper component
}

/* ------------------------------------------------------------------ */
/*  3D Canvas scene                                                   */
/* ------------------------------------------------------------------ */

function Pixy3DCanvas({ state }: { state: AvatarState }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 5.5], fov: 55 }}
      style={{ background: "transparent" }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        // Force the canvas element to be transparent
        gl.setClearColor(0x000000, 0);
        gl.domElement.style.background = "transparent";
      }}
    >
      {/* Mouse tracking helper */}
      <MouseTracker />

      {/* Lighting — tuned to reveal subtle surface details and separate from dark background */}
      <ambientLight intensity={1.5} />

      {/* Main key light — top right, warm */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={2.5}
        castShadow
        color="#fff5ee"
      />

      {/* Fill light — left side, cool violet */}
      <directionalLight
        position={[-3, 2, -2]}
        intensity={1.5}
        color="#c4b5fd"
      />

      {/* Front face light — catches the mouth/lip line indent on glossy surface */}
      <directionalLight
        position={[0, 0.5, 4]}
        intensity={2.0}
        color="#e8dff5"
      />

      {/* Strong back/rim light to separate the dark character from the dark background */}
      <pointLight position={[0, 2, -4]} intensity={3.5} color="#a855f7" />
      <directionalLight position={[0, 0, -5]} intensity={2.5} color="#ff7a8a" />

      {/* Under-chin fill — highlights the smile curve from below */}
      <pointLight position={[0, -0.3, 2.5]} intensity={1.2} color="#ffffff" />

      {/* Rim lights for glow effect */}
      <pointLight position={[0, -2, 3]} intensity={1.5} color="#ff7a8a" />
      <pointLight position={[2, 3, -1]} intensity={1.0} color="#f2c879" />

      {/* Environment for reflections — inline lights instead of HDR preset to avoid CDN fetch failures */}
      <Environment>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2.0} />
        <directionalLight position={[-5, 3, -3]} intensity={1.5} color="#c4b5fd" />
      </Environment>

      {/* The 3D Pixy model with cursor tracking */}
      <Suspense fallback={null}>
        <PixyModel state={state} />
      </Suspense>

      {/* Subtle ground shadow */}
      <ContactShadows
        position={[0, -2.4, 0]}
        opacity={0.3}
        scale={6}
        blur={2.5}
        far={4}
      />

      {/* Disable OrbitControls so cursor tracking works without interference */}
      <OrbitControls
        enabled={false}
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
      />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Public component                                                  */
/* ------------------------------------------------------------------ */

interface Pixy3DModelProps {
  state: AvatarState;
}

export function Pixy3DModel({ state }: Pixy3DModelProps) {
  const [modelExists, setModelExists] = useState<boolean | null>(null);

  // Check if the GLB file actually exists before mounting the Canvas
  useEffect(() => {
    fetch("/models/pixy.glb", { method: "HEAD" })
      .then((res) => setModelExists(res.ok))
      .catch(() => setModelExists(false));
  }, []);

  // Still checking — show nothing (no sphere)
  if (modelExists === null) {
    return null;
  }

  // GLB not found — fall back to the 2D image
  if (!modelExists) {
    return (
      <motion.img
        src="/pixy-avatar.png"
        alt="Pixy"
        className="w-auto max-w-full max-h-[60vh] object-contain drop-shadow-2xl lg:max-h-[75vh]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      />
    );
  }

  // GLB exists — render the 3D scene
  return (
    <motion.div
      className="h-[80vh] w-full lg:h-[90vh]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    >
      <Suspense fallback={null}>
        <Pixy3DCanvas state={state} />
      </Suspense>
    </motion.div>
  );
}


