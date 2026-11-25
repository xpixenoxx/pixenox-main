"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { PixyVisemeFrame } from "../audio/usePixyAudio";
import type { PixyAutonomousGesture } from "../ui/StudioControls";
import {
  clamp,
  createSpring1D,
  createSpring2D,
  PixyEmotion,
  PixyGazeMode,
  PixyReactiveMood,
  stepSpring1D,
  stepSpring2D,
} from "./springMath";

export type PixyTouchZone = "crown_pet" | "face_boop" | "belly_tickle";

export interface PixyStudioStageProps {
  mood: PixyReactiveMood;
  emotion?: PixyEmotion;
  gazeMode: PixyGazeMode;
  inputTargetNDC?: { x: number; y: number } | null;
  hoveredPillNDC?: { x: number; y: number } | null;
  errorBurstId: number;
  /** Autonomous context-driven AI-bot gesture pushed from conversation state */
  gestureEvent?: { id: number; kind: PixyAutonomousGesture } | null;
  typingNodId?: number;
  visemeRef: React.RefObject<PixyVisemeFrame>;
  onTouchZone?: (zone: PixyTouchZone) => void;
}

interface PointerState {
  x: number;
  y: number;
  active: boolean;
  lastMoveAt: number;
}

/**
 * Cohesive Pixenox Royal Amethyst & Imperial Violet Gem Palette
 * (Rich saturated jewel tones — never pale cyan/whitewashed, harmonized with Pixenox #2e1065/#8b5cf6 brand).
 */
const BOT_OPTIC_COLORS: Record<PixyEmotion, THREE.Color> = {
  welcoming: new THREE.Color("#a8329e"),
  flirty: new THREE.Color("#b833a8"),
  joy: new THREE.Color("#c038b5"),
  spin: new THREE.Color("#9d34b8"),
  hurray: new THREE.Color("#cc3ec0"),
  curious: new THREE.Color("#9333ea"),
  sassy: new THREE.Color("#a22cb0"),
  oops: new THREE.Color("#ef4444"),
  neutral: new THREE.Color("#a6329c"),
};

function PointerListener({ pointerRef }: { pointerRef: React.MutableRefObject<PointerState> }) {
  useEffect(() => {
    const update = (clientX: number, clientY: number) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = (clientX / w) * 2 - 1;
      const ny = -((clientY / h) * 2 - 1);
      if (
        Math.abs(nx - pointerRef.current.x) > 0.003 ||
        Math.abs(ny - pointerRef.current.y) > 0.003
      ) {
        pointerRef.current.x = nx;
        pointerRef.current.y = ny;
        pointerRef.current.active = true;
        pointerRef.current.lastMoveAt = performance.now();
      }
    };

    const onPointerMove = (e: PointerEvent) => update(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        update(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [pointerRef]);

  return null;
}

interface RiggedPixyActorProps extends PixyStudioStageProps {
  pointerRef: React.MutableRefObject<PointerState>;
  reducedMotion: boolean;
}

const ERROR_DURATION_MS = 860;
const WINK_DURATION_MS = 460; // Snappy robotic optic-shutter wink!

function evalWinkCurve(phase01: number): number {
  if (phase01 <= 0 || phase01 >= 1) return 0;
  if (phase01 < 0.16) {
    const u = phase01 / 0.16;
    return u * u * (3 - 2 * u);
  }
  if (phase01 < 0.64) {
    return 1.0;
  }
  const u = (1.0 - phase01) / 0.36;
  return u * u * (3 - 2 * u);
}

function RiggedPixyActor({
  mood,
  emotion = "welcoming",
  gazeMode,
  inputTargetNDC,
  hoveredPillNDC,
  errorBurstId,
  gestureEvent,
  typingNodId = 0,
  visemeRef,
  onTouchZone,
  pointerRef,
  reducedMotion,
}: RiggedPixyActorProps) {
  const { scene } = useGLTF("/models/pixy-studio.glb?v=9", false, false);
  const { size } = useThree();

  // Bold, commanding hero scale on stage (~86% viewport height, cleanly clearing top nav & grounded on floor!)
  const isMobile = size.width < 1024;
  const stageX = isMobile ? 0 : 1.28;
  const stageY = isMobile ? 0.34 : -0.06;
  const actorScale = isMobile ? 2.26 : 2.98;

  const rootGroupRef = useRef<THREE.Group>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  const {
    clonedScene,
    bones,
    restQuats,
    invRestQuats,
    browsMesh,
    browsMorphs,
    eyelidMesh,
    eyelidMorphs,
    lipsMesh,
    lipsMorphs,
    cavityMesh,
    cavityMorphs,
    tongueMesh,
    tongueMorphs,
    teethMesh,
    teethMorphs,
    gemUniforms,
    tongueMaterial,
  } = useMemo(() => {
    const cloned = cloneSkeleton(scene) as THREE.Group;

    const boneMap: Record<string, THREE.Bone> = {};
    const quats: Record<string, THREE.Quaternion> = {};
    const invQuats: Record<string, THREE.Quaternion> = {};

    let brows: THREE.Mesh | null = null;
    let lids: THREE.Mesh | null = null;
    let lips: THREE.Mesh | null = null;
    let cavity: THREE.Mesh | null = null;
    let tongue: THREE.Mesh | null = null;
    let teeth: THREE.Mesh | null = null;

    const browDict: Record<string, number> = {};
    const lidDict: Record<string, number> = {};
    const lipDict: Record<string, number> = {};
    const cavDict: Record<string, number> = {};
    const tongueDict: Record<string, number> = {};
    const teethDict: Record<string, number> = {};

    // Placeholder 1x1 black texture swapped seamlessly once /logo.jpg decodes (no Suspense error risk!)
    const placeholderLogoTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    placeholderLogoTex.needsUpdate = true;

    // Shared reactive uniforms for Pixy's Faceted Crystal Gem Eyes & Backlit Chest Pixenox Emblem
    const sharedGemUniforms = {
      uGemTint: { value: new THREE.Color("#a8329e") },
      uGemBoost: { value: 1.0 },
      uPupilScale: { value: 1.0 },
      uChestLogoTex: { value: placeholderLogoTex as THREE.Texture },
      uChestLogoBoost: { value: 1.0 },
    };

    if (typeof window !== "undefined") {
      const texLoader = new THREE.TextureLoader();
      texLoader.load("/logo.jpg", (tex) => {
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        sharedGemUniforms.uChestLogoTex.value = tex;
      });
    }

    // Silky Smoked-Amethyst Obsidian Ceramic Chassis + Conformal Backlit Pixenox Chest Emblem!
    const obsidianMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#11071a"),
      roughness: 0.21,
      metalness: 0.22,
      ior: 1.56,
      clearcoat: 0.85,
      clearcoatRoughness: 0.14,
      sheen: 0.65,
      sheenRoughness: 0.32,
      sheenColor: new THREE.Color("#5b21b6"),
      specularIntensity: 0.9,
      specularColor: new THREE.Color("#e9d5ff"),
      envMapIntensity: 0.68,
    });

    obsidianMat.onBeforeCompile = (shader) => {
      shader.uniforms.uChestLogoTex = sharedGemUniforms.uChestLogoTex;
      shader.uniforms.uChestLogoBoost = sharedGemUniforms.uChestLogoBoost;
      shader.uniforms.uChestGlowTint = sharedGemUniforms.uGemTint;

      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec3 vBodyBindPos;`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           vBodyBindPos = position;`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec3 vBodyBindPos;
           uniform sampler2D uChestLogoTex;
           uniform float uChestLogoBoost;
           uniform vec3 uChestGlowTint;`
        )
        .replace(
          "#include <dithering_fragment>",
          `// 1) Continuous view-space Fresnel silhouette rim so horns, cheeks, arms & hands read with silky luxury!
           vec3 viewDirFrag = normalize(vViewPosition);
           float ndv = clamp(dot(normal, viewDirFrag), 0.0, 1.0);
           float rimSoft = pow(1.0 - ndv, 2.8);
           float rimSharp = pow(1.0 - ndv, 5.5);
           vec3 plumRim = vec3(0.26, 0.09, 0.42) * rimSoft * 0.55;
           vec3 pearlRim = vec3(0.78, 0.66, 0.94) * rimSharp * 0.48;
           gl_FragColor.rgb += plumRim + pearlRim;

           // 2) Crisp, High-Contrast Conformal Pixenox Emblem on Front Chest (moves 100% with Spine skinning!)
           float chestFrontMask =
             smoothstep(0.035, 0.068, vBodyBindPos.z) *
             (1.0 - smoothstep(0.072, 0.095, abs(vBodyBindPos.x))) *
             smoothstep(-0.265, -0.240, vBodyBindPos.y) *
             (1.0 - smoothstep(-0.095, -0.075, vBodyBindPos.y));

           if (chestFrontMask > 0.001) {
             vec2 chestUV = vec2(
               vBodyBindPos.x / 0.192 + 0.502,
               (vBodyBindPos.y + 0.172) / 0.192 + 0.531
             );
             if (chestUV.x > 0.04 && chestUV.x < 0.96 && chestUV.y > 0.04 && chestUV.y < 0.96) {
               float rawLogo = texture2D(uChestLogoTex, chestUV).r;
               float logoStroke = smoothstep(0.30, 0.66, rawLogo) * chestFrontMask;

               // Soft 4-tap backlit royal-amethyst halo framing the crisp platinum-white Pixenox mark
               float h1 = texture2D(uChestLogoTex, chestUV + vec2(0.014, 0.0)).r;
               float h2 = texture2D(uChestLogoTex, chestUV - vec2(0.014, 0.0)).r;
               float h3 = texture2D(uChestLogoTex, chestUV + vec2(0.0, 0.014)).r;
               float h4 = texture2D(uChestLogoTex, chestUV - vec2(0.0, 0.014)).r;
               float haloRing = clamp((h1 + h2 + h3 + h4) * 0.28 - logoStroke * 0.65, 0.0, 1.0) * chestFrontMask;

               vec3 haloGlow = mix(vec3(0.58, 0.22, 0.92), uChestGlowTint, 0.45) * haloRing * 0.46 * uChestLogoBoost;
               gl_FragColor.rgb += haloGlow;
               gl_FragColor.rgb = mix(
                 gl_FragColor.rgb,
                 vec3(0.98, 0.97, 1.0),
                 clamp(logoStroke * 0.96, 0.0, 1.0)
               );
             }
           }
           #include <dithering_fragment>`
        );
    };

    // Clean Recessed Orbital Socket / Eyelid Material (no messy specular blotches around the eyes!)
    const eyelidObsidianMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0c0414"),
      roughness: 0.32,
      metalness: 0.14,
      ior: 1.5,
      clearcoat: 0.35,
      clearcoatRoughness: 0.28,
      envMapIntensity: 0.32,
    });

    // Crisp Carved Obsidian-Plum Smile Rim (clean silver-lavender lip edge, zero muddy blotches!)
    const lipCarbonMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#13071e"),
      roughness: 0.16,
      metalness: 0.35,
      ior: 1.56,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      specularColor: new THREE.Color("#f3e8ff"),
      envMapIntensity: 0.85,
    });

    const crystalGemEyeMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#060109"),
      roughness: 0.03,
      metalness: 0.02,
      ior: 1.77, // Corundum / Sapphire-Amethyst crystal refractive index
      clearcoat: 0.92,
      clearcoatRoughness: 0.02,
      envMapIntensity: 0.20,
    });

    crystalGemEyeMat.onBeforeCompile = (shader) => {
      shader.uniforms.uGemTint = sharedGemUniforms.uGemTint;
      shader.uniforms.uGemBoost = sharedGemUniforms.uGemBoost;
      shader.uniforms.uPupilScale = sharedGemUniforms.uPupilScale;

      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec3 vGemLocalPos;`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           float eyeSign = position.x >= 0.0 ? 1.0 : -1.0;
           vGemLocalPos = vec3(
             (position.x - eyeSign * 0.1058) / 0.0397,
             (position.y - 0.1500) / 0.0450,
             (position.z - 0.1423) / 0.0288
           );`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec3 vGemLocalPos;
           uniform vec3 uGemTint;
           uniform float uGemBoost;
           uniform float uPupilScale;`
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
           vec2 gp = vGemLocalPos.xy;
           float gr = length(gp);

           // Nearest-seed Voronoi over a true 10-fold Brilliant-Cut Gemstone lattice:
           // Seed 0 = central octagonal dark-velvet pupil table;
           // Seeds 1..10 = inner star facets; Seeds 11..20 = outer staggered kite/bezel facets.
           float d1 = (gr / max(0.75, uPupilScale)) * 1.02;
           float d2 = 99.0;
           vec2 bestSeed = vec2(0.0);
           float bestId = 0.0;

           for (int i = 0; i < 10; i++) {
             float fi = float(i);
             float a1 = fi * 0.62831853;
             vec2 s1 = vec2(cos(a1), sin(a1)) * 0.50;
             float dist1 = length(gp - s1);
             if (dist1 < d1) {
               d2 = d1;
               d1 = dist1;
               bestSeed = s1;
               bestId = fi + 1.0;
             } else if (dist1 < d2) {
               d2 = dist1;
             }

             float a2 = (fi + 0.5) * 0.62831853;
             vec2 s2 = vec2(cos(a2), sin(a2)) * 0.77;
             float dist2 = length(gp - s2);
             if (dist2 < d1) {
               d2 = d1;
               d1 = dist2;
               bestSeed = s2;
               bestId = fi + 11.0;
             } else if (dist2 < d2) {
               d2 = dist2;
             }
           }

           float edgeBevel = smoothstep(0.0, 0.026, d2 - d1);
           float socketMask = 1.0 - smoothstep(0.84, 0.96, gr);

           // Keep jewel color deeply saturated in linear space so ACES never washes it out to pale white/blue!
           vec3 richGem = pow(clamp(uGemTint, 0.01, 1.0), vec3(1.18));

           vec3 gemRadiance = vec3(0.0);
           if (bestId < 0.5) {
             // Deep velvet-plum octagonal pupil center (#260622)
             float coreGrad = smoothstep(0.34, 0.0, gr);
             vec3 pupilDark = mix(vec3(0.032, 0.002, 0.030), vec3(0.005, 0.0004, 0.008), coreGrad);
             float tableEdge = (1.0 - smoothstep(0.0, 0.028, d2 - d1)) * 0.16;
             gemRadiance = pupilDark + richGem * tableEdge;
           } else {
             // Flat-shaded polygonal crystal facet normal -> crisp cut-amethyst facets!
             float facetHash = fract(sin(bestId * 127.1) * 43758.5453);
             float tilt = bestId > 10.5 ? 1.55 : 1.15;
             vec3 fNorm = normalize(vec3(bestSeed * tilt, 0.68));

             // Sharp diamond-cut white-lilac glint ONLY on the 2 upper-left / side catchlight facets!
             float specTopLeft = pow(max(0.0, dot(fNorm, normalize(vec3(-0.38, 0.66, 0.64)))), 22.0);
             float specSide = pow(max(0.0, dot(fNorm, normalize(vec3(0.66, 0.22, 0.72)))), 26.0) * 0.65;
             float diamondGlint = clamp(specTopLeft * 1.25 + specSide, 0.0, 0.92);

             // Rich deep-amethyst to vivid-orchid internal caustic glow (clamped below blowout!)
             float lowerCaustic = pow(max(0.0, dot(fNorm, normalize(vec3(0.04, -0.72, 0.69)))), 1.8);
             float facetLuma = 0.24 + 0.48 * lowerCaustic + 0.28 * facetHash;

             vec3 deepFacet = richGem * 0.12;
             vec3 midFacet = richGem * 0.46;
             vec3 vividFacet = mix(richGem * 0.82, vec3(0.72, 0.24, 0.78), 0.30);

             vec3 facetCol = mix(deepFacet, midFacet, smoothstep(0.20, 0.56, facetLuma));
             facetCol = mix(facetCol, vividFacet, smoothstep(0.54, 0.92, facetLuma));

             // Subtle crystal ridge definition + crisp top-left diamond facet reflection
             float ridgeLine = (1.0 - edgeBevel) * 0.14;
             facetCol *= (0.88 + 0.12 * edgeBevel);
             facetCol += richGem * ridgeLine;
             facetCol = mix(facetCol, vec3(0.95, 0.86, 0.99), diamondGlint);

             gemRadiance = facetCol * uGemBoost;
           }

           diffuseColor.rgb = vec3(0.005, 0.001, 0.008);
           totalEmissiveRadiance += gemRadiance * socketMask;`
        );
    };

    const cavityMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#050208"),
      emissive: new THREE.Color("#000000"),
      emissiveIntensity: 0.0,
      roughness: 0.95,
    });

    // Deep Amethyst-Orchid Vocal Core inside mouth when speaking
    const tMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#7e22ce"),
      emissive: new THREE.Color("#a855f7"),
      emissiveIntensity: 0.85,
      roughness: 0.25,
    });

    // Crisp Lilac-Silver vocal bar / teeth gleam
    const thMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f3e8ff"),
      emissive: new THREE.Color("#d8b4fe"),
      emissiveIntensity: 0.55,
      roughness: 0.14,
    });

    cloned.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) {
        const b = obj as THREE.Bone;
        boneMap[b.name] = b;
        quats[b.name] = b.quaternion.clone();
        invQuats[b.name] = b.quaternion.clone().invert();
      }
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;

        if (mesh.name.includes("Pixy_Body")) {
          mesh.material = obsidianMat;
        } else if (mesh.name.includes("Pixy_Brows")) {
          // Hide floating sticker brow strips so Pixy's head has the exact seamless liquid-chrome crown of Image 2
          mesh.visible = false;
          brows = mesh;
          if (mesh.morphTargetDictionary) {
            Object.entries(mesh.morphTargetDictionary).forEach(([k, idx]) => {
              browDict[k] = idx;
            });
          }
        } else if (mesh.name.includes("Pixy_Eyelids")) {
          mesh.material = eyelidObsidianMat;
          lids = mesh;
          if (mesh.morphTargetDictionary) {
            Object.entries(mesh.morphTargetDictionary).forEach(([k, idx]) => {
              lidDict[k] = idx;
            });
          }
        } else if (mesh.name.includes("Pixy_Lips")) {
          mesh.material = lipCarbonMat;
          lips = mesh;
          if (mesh.morphTargetDictionary) {
            Object.entries(mesh.morphTargetDictionary).forEach(([k, idx]) => {
              lipDict[k] = idx;
            });
          }
        } else if (mesh.name.includes("Pixy_Tongue")) {
          mesh.material = tMat;
          tongue = mesh;
          if (mesh.morphTargetDictionary) {
            Object.entries(mesh.morphTargetDictionary).forEach(([k, idx]) => {
              tongueDict[k] = idx;
            });
          }
        } else if (mesh.name.includes("Pixy_Teeth")) {
          mesh.material = thMat;
          teeth = mesh;
          if (mesh.morphTargetDictionary) {
            Object.entries(mesh.morphTargetDictionary).forEach(([k, idx]) => {
              teethDict[k] = idx;
            });
          }
        } else if (mesh.name.includes("Pixy_MouthCavity")) {
          mesh.material = cavityMat;
          cavity = mesh;
          if (mesh.morphTargetDictionary) {
            Object.entries(mesh.morphTargetDictionary).forEach(([k, idx]) => {
              cavDict[k] = idx;
            });
          }
        } else if (mesh.name.includes("Pixy_Eyeball")) {
          mesh.material = crystalGemEyeMat;
        } else if (mesh.name.includes("Pixy_Iris") || mesh.name.includes("Pixy_Catchlight")) {
          // Superseded by full-socket Brilliant-Cut Crystal Gemstone shader on Pixy_Eyeball_L/R
          mesh.visible = false;
        }
      }
    });

    return {
      clonedScene: cloned,
      bones: boneMap,
      restQuats: quats,
      invRestQuats: invQuats,
      browsMesh: brows as THREE.Mesh | null,
      browsMorphs: browDict,
      eyelidMesh: lids as THREE.Mesh | null,
      eyelidMorphs: lidDict,
      lipsMesh: lips as THREE.Mesh | null,
      lipsMorphs: lipDict,
      cavityMesh: cavity as THREE.Mesh | null,
      cavityMorphs: cavDict,
      tongueMesh: tongue as THREE.Mesh | null,
      tongueMorphs: tongueDict,
      teethMesh: teeth as THREE.Mesh | null,
      teethMorphs: teethDict,
      gemUniforms: sharedGemUniforms,
      tongueMaterial: tMat,
    };
  }, [scene]);

  // Snappy precision servo springs (fast, clean robotic lock-in with zero wobble!)
  const eyeSpring = useRef(createSpring2D(0, 0));
  const headSpring = useRef(createSpring2D(0, 0));
  const torsoSpring = useRef(createSpring2D(0, 0));
  const headRollSpring = useRef(createSpring1D(0));
  const torsoBankSpring = useRef(createSpring1D(0));
  const torsoYawSpring = useRef(createSpring1D(0));
  const spinSpring = useRef(createSpring1D(0));
  const spinTargetRef = useRef(0);
  const irisScaleSpring = useRef(createSpring1D(1.0));

  const browSprings = useRef({
    welcome: createSpring1D(0.45),
    joy: createSpring1D(0),
    hurray: createSpring1D(0),
    flirtyR: createSpring1D(0),
    flirtyL: createSpring1D(0),
    curious: createSpring1D(0),
    sassy: createSpring1D(0),
    worried: createSpring1D(0),
  });

  const lidSprings = useRef({
    squint: createSpring1D(0),
    happyCrescent: createSpring1D(0),
    wide: createSpring1D(0),
    opticFocus: createSpring1D(0),
    welcomeWarm: createSpring1D(0.45),
    joySparkle: createSpring1D(0),
    hurrayStar: createSpring1D(0),
    worriedLid: createSpring1D(0),
  });

  const mouthSprings = useRef({
    smile: createSpring1D(0.15),
    smileCorners: createSpring1D(0.4),
    smirkCornerR: createSpring1D(0),
    smirkCornerL: createSpring1D(0),
    welcome: createSpring1D(0.45),
    wittyR: createSpring1D(0),
    wittyL: createSpring1D(0),
    joyGrin: createSpring1D(0),
    hurray: createSpring1D(0),
    curiousOoh: createSpring1D(0),
    worriedOops: createSpring1D(0),
  });

  const smoothSpeechPresence = useRef(0);

  // Neutral balanced AI-bot arm stance (comfortable symmetric arms clear of torso, zero hip-sass!)
  const uaLSpring = useRef({ x: createSpring1D(0), y: createSpring1D(-0.14), z: createSpring1D(-0.56) });
  const faLSpring = useRef({ x: createSpring1D(0), y: createSpring1D(-0.28), z: createSpring1D(0.10) });
  const hdLSpring = useRef({ x: createSpring1D(0), y: createSpring1D(-0.10), z: createSpring1D(0.04) });

  const uaRSpring = useRef({ x: createSpring1D(0), y: createSpring1D(0.14), z: createSpring1D(0.56) });
  const faRSpring = useRef({ x: createSpring1D(0), y: createSpring1D(0.28), z: createSpring1D(-0.10) });
  const hdRSpring = useRef({ x: createSpring1D(0), y: createSpring1D(0.10), z: createSpring1D(-0.04) });

  // Autonomous AI-Bot Action Timers
  const waveUntilRef = useRef(0);
  const winkStartRef = useRef(-99999);
  const winkSideRef = useRef<"L" | "R">("R");
  const browSideRef = useRef<"L" | "R">("R");
  const hurrayUntilRef = useRef(0);
  const hoverSpinUntilRef = useRef(0);
  const vibeUntilRef = useRef(0);
  const hoverHopUntilRef = useRef(0);
  const nodUntilRef = useRef(0);
  const sensorPerkUntilRef = useRef(0);
  const lastPerkSoundAtRef = useRef(0);
  const isHoveringPixyRef = useRef(false);

  const lastEmotionRef = useRef<PixyEmotion>(emotion);
  useEffect(() => {
    if (emotion !== lastEmotionRef.current) {
      if (emotion === "flirty" || emotion === "sassy") {
        browSideRef.current = browSideRef.current === "R" ? "L" : "R";
      }
      lastEmotionRef.current = emotion;
    }
  }, [emotion]);

  const lastGestureIdRef = useRef(0);
  useEffect(() => {
    if (!gestureEvent || gestureEvent.id === lastGestureIdRef.current) return;
    lastGestureIdRef.current = gestureEvent.id;
    const now = performance.now();

    if (gestureEvent.kind === "wave") {
      // Bot Salute + Precision Greeting Wave + Affirmation Nod
      waveUntilRef.current = now + 2200;
      nodUntilRef.current = now + 560;
    } else if (gestureEvent.kind === "wink") {
      // Crisp Optic Shutter Wink + Servo Nod
      winkSideRef.current = browSideRef.current;
      winkStartRef.current = now;
      nodUntilRef.current = now + 520;
    } else if (gestureEvent.kind === "hurray") {
      // AI Bot Power-Up & Mecha Victory Boost!
      hurrayUntilRef.current = now + 2400;
    } else if (gestureEvent.kind === "spin") {
      // 360° Anti-Gravity Hover-Turn
      spinTargetRef.current += Math.PI * 2;
      hoverSpinUntilRef.current = now + 1750;
    } else if (gestureEvent.kind === "vibe") {
      // Bot Telemetry Rhythm Pulse
      vibeUntilRef.current = now + 2300;
    } else if (gestureEvent.kind === "tickle") {
      hoverHopUntilRef.current = now + 1150;
    } else if (gestureEvent.kind === "nod") {
      nodUntilRef.current = now + 560;
    }
  }, [gestureEvent]);

  const lastTypingNodRef = useRef(typingNodId);
  useEffect(() => {
    if (typingNodId !== lastTypingNodRef.current) {
      lastTypingNodRef.current = typingNodId;
      nodUntilRef.current = performance.now() + 460;
    }
  }, [typingNodId]);

  const errorStartRef = useRef(-99999);
  const lastSeenErrorId = useRef(errorBurstId);
  useEffect(() => {
    if (errorBurstId !== lastSeenErrorId.current) {
      lastSeenErrorId.current = errorBurstId;
      errorStartRef.current = performance.now();
    }
  }, [errorBurstId]);

  const blinkState = useRef({
    nextBlinkAt: 2.6,
    blinkProgress: -1,
    doubleBlinkQueued: false,
  });
  const idleScanner = useRef({
    nextScanAt: 5.5,
    scanYawOffset: 0,
    scanPitchOffset: 0,
  });

  const scratchEuler = useMemo(() => new THREE.Euler(0, 0, 0, "YXZ"), []);
  const scratchQuat = useMemo(() => new THREE.Quaternion(), []);
  const scratchLocalQuat = useMemo(() => new THREE.Quaternion(), []);
  const currentGlowColor = useRef(new THREE.Color("#8b5cf6"));

  const headScreenAnchorNDC = useMemo(
    () => ({ x: isMobile ? 0.0 : 0.32, y: isMobile ? 0.24 : 0.08 }),
    [isMobile]
  );

  // Direct AI-Bot Sensor Interactions on Pixy
  const handlePixyPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!rootGroupRef.current) return;
    const localY = (e.point.y - stageY) / actorScale;
    if (localY > 0.18) {
      const now = performance.now();
      sensorPerkUntilRef.current = now + 480;
      if (now - lastPerkSoundAtRef.current > 2200) {
        lastPerkSoundAtRef.current = now;
        onTouchZone?.("crown_pet");
      }
    }
  };

  const handlePixyClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const localY = (e.point.y - stageY) / actorScale;
    const now = performance.now();
    if (localY > -0.04) {
      browSideRef.current = browSideRef.current === "R" ? "L" : "R";
      winkSideRef.current = browSideRef.current;
      winkStartRef.current = now;
      nodUntilRef.current = now + 500;
      onTouchZone?.("face_boop");
    } else {
      spinTargetRef.current += Math.PI * 2;
      hoverSpinUntilRef.current = now + 1750;
      hoverHopUntilRef.current = now + 1150;
      onTouchZone?.("belly_tickle");
    }
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const now = performance.now();
    const vf = visemeRef.current ?? {
      energy: 0,
      aa: 0,
      oh: 0,
      ee: 0,
      mbp: 0,
      fv: 0,
      th: 0,
    };
    const audioEnergy = vf.energy;

    const targetPresence = mood === "speaking" || audioEnergy > 0.03 ? 1.0 : 0.0;
    smoothSpeechPresence.current +=
      (targetPresence - smoothSpeechPresence.current) * Math.min(1, dt * 6.5);
    const spPresence = smoothSpeechPresence.current;

    const errorElapsed = now - errorStartRef.current;
    const inErrorBurst = errorElapsed >= 0 && errorElapsed < ERROR_DURATION_MS;
    const errorPhase = inErrorBurst ? errorElapsed / ERROR_DURATION_MS : 0;
    const errorEnvelope = inErrorBurst ? Math.sin(errorPhase * Math.PI) : 0;

    const winkElapsed = now - winkStartRef.current;
    const isWinking = !inErrorBurst && winkElapsed >= 0 && winkElapsed < WINK_DURATION_MS;
    const winkCurve = isWinking ? evalWinkCurve(winkElapsed / WINK_DURATION_MS) : 0;

    const isHurray = now < hurrayUntilRef.current && !inErrorBurst;
    const isHoverSpin = now < hoverSpinUntilRef.current && !inErrorBurst;
    const isVibing = now < vibeUntilRef.current && !inErrorBurst && !isHurray;
    const isHoverHop = now < hoverHopUntilRef.current && !inErrorBurst;
    const isSensorPerked = now < sensorPerkUntilRef.current && !inErrorBurst;
    const isWaving =
      now < waveUntilRef.current &&
      !inErrorBurst &&
      !isHurray &&
      !isVibing &&
      !isHoverHop &&
      mood !== "thinking";
    const isNodding = now < nodUntilRef.current && !inErrorBurst;

    const liveEmotion: PixyEmotion = inErrorBurst
      ? "oops"
      : isHurray
        ? "hurray"
        : isHoverSpin
          ? "spin"
          : isHoverHop || isSensorPerked
            ? "joy"
            : mood === "thinking"
              ? "curious"
              : mood === "budget"
                ? "sassy"
                : emotion;

    // Autonomous Bot Idle Micro-Scanner (crisp discrete look-checks like Astro Bot / Vector!)
    const scan = idleScanner.current;
    if (t >= scan.nextScanAt) {
      scan.nextScanAt = t + 3.8 + Math.random() * 3.5;
      const presets = [-0.18, -0.06, 0.0, 0.12];
      scan.scanYawOffset = presets[Math.floor(Math.random() * presets.length)];
      scan.scanPitchOffset = (Math.random() - 0.45) * 0.10;
    }

    // -------------------------------------------------------
    // 1. PRECISION SERVO GAZE & BOT HEAD-TILT LOCK
    // -------------------------------------------------------
    let targetGazeX = 0;
    let targetGazeY = 0;
    let targetRoll = 0;
    let torsoForwardLean = 0;

    const pointerFresh =
      pointerRef.current.active && now - pointerRef.current.lastMoveAt < 4500;

    if (isSensorPerked) {
      targetGazeX = clamp((pointerRef.current.x - headScreenAnchorNDC.x) * 0.45, -0.4, 0.4);
      targetGazeY = 0.12;
      targetRoll = 0.10;
    } else if (isHurray) {
      targetGazeX = 0.0;
      targetGazeY = 0.12;
      targetRoll = 0.0;
      torsoForwardLean = -0.05;
    } else if (mood === "thinking") {
      // Quantized stepped AI Radar / Telemetry Scan!
      const stepScan = Math.round(Math.sin(t * 2.4) * 1.6) * 0.16;
      targetGazeX = -0.10 + stepScan;
      targetGazeY = 0.16;
      targetRoll = 0.15;
    } else if (hoveredPillNDC) {
      targetGazeX = clamp((hoveredPillNDC.x - headScreenAnchorNDC.x) * 0.78, -0.65, 0.55);
      targetGazeY = clamp((hoveredPillNDC.y - headScreenAnchorNDC.y) * 0.85, -0.52, 0.52);
      targetRoll = -0.07;
      torsoForwardLean = 0.055;
    } else if (
      gazeMode === "camera" ||
      mood === "speaking" ||
      mood === "delighted" ||
      isWaving ||
      isWinking
    ) {
      targetGazeX = pointerFresh
        ? clamp((pointerRef.current.x - headScreenAnchorNDC.x) * 0.22, -0.30, 0.30)
        : -0.05;
      targetGazeY = pointerFresh
        ? clamp((pointerRef.current.y - headScreenAnchorNDC.y) * 0.18, -0.22, 0.22)
        : 0.02;

      // Subtle analytical bot head-cock (clean & mechanical, never girly!)
      targetRoll =
        liveEmotion === "curious"
          ? 0.13
          : liveEmotion === "sassy" || liveEmotion === "flirty"
            ? (browSideRef.current === "R" ? -0.08 : 0.08)
            : isWaving
              ? 0.07
              : 0;
    } else if (gazeMode === "input") {
      const ix = inputTargetNDC?.x ?? (isMobile ? 0 : -0.42);
      const iy = inputTargetNDC?.y ?? (isMobile ? -0.32 : -0.10);
      targetGazeX = clamp((ix - headScreenAnchorNDC.x) * 0.68, -0.58, 0.50);
      targetGazeY = clamp((iy - headScreenAnchorNDC.y) * 0.80, -0.50, 0.50);
      targetRoll = -0.06;
      torsoForwardLean = 0.05;
    } else if (pointerFresh && !reducedMotion) {
      targetGazeX = clamp((pointerRef.current.x - headScreenAnchorNDC.x) * 0.84, -0.74, 0.74);
      targetGazeY = clamp((pointerRef.current.y - headScreenAnchorNDC.y) * 0.84, -0.60, 0.60);
      targetRoll = -targetGazeX * 0.08;
      if (isHoveringPixyRef.current) torsoForwardLean = 0.04;
    } else {
      targetGazeX = scan.scanYawOffset;
      targetGazeY = scan.scanPitchOffset;
      targetRoll = scan.scanYawOffset * -0.25;
    }

    if (isVibing) targetRoll = Math.sin(t * 5.6) * 0.08;

    // Snappier critically damped bot servo tracking!
    const eyePos = stepSpring2D(eyeSpring.current, targetGazeX, targetGazeY, 225, 30, dt);
    const headPos = stepSpring2D(headSpring.current, targetGazeX, targetGazeY, 90, 19, dt);
    const torsoPos = stepSpring2D(torsoSpring.current, targetGazeX, targetGazeY, 36, 12, dt);
    const rollVal = stepSpring1D(headRollSpring.current, targetRoll, 81, 18, dt);
    const spinYaw = stepSpring1D(spinSpring.current, spinTargetRef.current, 64, 16, dt);

    const errorHeadShakeYaw =
      inErrorBurst && !reducedMotion
        ? Math.sin(errorPhase * Math.PI * 6.0) * errorEnvelope * 0.38
        : 0;
    const errorHeadDipPitch =
      inErrorBurst && !reducedMotion ? errorEnvelope * 0.10 : 0;

    const nodPhase = isNodding ? 1 - (nodUntilRef.current - now) / 560 : 0;
    const nodPitch = isNodding ? Math.sin(clamp(nodPhase, 0, 1) * Math.PI * 2) * 0.14 : 0;

    // -------------------------------------------------------
    // 2. ANTI-GRAVITY BOT HOVER, POWER-UP LIFT & BALANCED STANCE (ZERO HIP-POP!)
    // -------------------------------------------------------
    if (rootGroupRef.current) {
      // Smooth anti-gravity hover float — gentle, not shaky
      let hoverY = Math.sin(t * 1.35) * 0.008;
      if (isHurray) {
        hoverY = 0.055 + Math.sin(t * 7.2) * 0.025; // Power-Up anti-gravity hover boost!
      } else if (isHoverSpin || isHoverHop) {
        hoverY = 0.045 + Math.sin(t * 5.4) * 0.018;
      } else if (isVibing) {
        hoverY = Math.abs(Math.sin(t * 5.6)) * 0.030;
      }

      rootGroupRef.current.position.set(stageX, stageY + (reducedMotion ? 0 : hoverY), 0);
      rootGroupRef.current.rotation.y = reducedMotion ? 0 : spinYaw;
      // No per-frame scale pulse — it causes visible micro-jitter on the body
      rootGroupRef.current.scale.setScalar(actorScale);
    }

    const applyParentSpaceDelta = (
      boneName: string,
      pitchX: number,
      yawY: number,
      rollZ: number
    ) => {
      const b = bones[boneName];
      const rq = restQuats[boneName];
      if (!b || !rq) return;
      scratchEuler.set(pitchX, yawY, rollZ, "YXZ");
      scratchQuat.setFromEuler(scratchEuler);
      b.quaternion.copy(scratchQuat).multiply(rq);
    };

    const applyCharSpaceChildDelta = (
      boneName: string,
      parentBoneName: string,
      pitchX: number,
      yawY: number,
      rollZ: number
    ) => {
      const b = bones[boneName];
      const rq = restQuats[boneName];
      const parentRq = restQuats[parentBoneName];
      const parentInvRq = invRestQuats[parentBoneName];
      if (!b || !rq || !parentRq || !parentInvRq) return;

      scratchEuler.set(pitchX, yawY, rollZ, "YXZ");
      scratchQuat.setFromEuler(scratchEuler);
      scratchLocalQuat
        .copy(parentInvRq)
        .multiply(scratchQuat)
        .multiply(parentRq)
        .multiply(rq);
      b.quaternion.copy(scratchLocalQuat);
    };

    // Pure aerodynamic bot banking (zero girly hip-cocking!)
    const spinVelocityBank = clamp(-spinSpring.current.velocity * 0.022, -0.14, 0.14);
    const targetBank = isVibing ? Math.sin(t * 5.6) * 0.05 : spinVelocityBank;
    const targetTorsoYaw = isVibing ? Math.cos(t * 5.6) * 0.08 : 0;

    const torsoBank = stepSpring1D(torsoBankSpring.current, reducedMotion ? 0 : targetBank, 64, 16, dt);
    const torsoYaw = stepSpring1D(torsoYawSpring.current, reducedMotion ? 0 : targetTorsoYaw, 64, 16, dt);

    const stageConvoYaw = isMobile ? 0 : -0.15;
    applyParentSpaceDelta("Hips", 0, stageConvoYaw + torsoYaw, torsoBank);
    applyParentSpaceDelta("Leg_L", isHurray || isHoverSpin ? 0.08 : 0, 0, -torsoBank * 0.5);
    applyParentSpaceDelta("Leg_R", isHurray || isHoverSpin ? 0.08 : 0, 0, -torsoBank * 0.5);

    const spineForwardPitch = torsoForwardLean - torsoPos.y * 0.04;
    applyParentSpaceDelta(
      "Spine",
      spineForwardPitch,
      torsoPos.x * 0.14 + (mood === "thinking" ? 0.05 : 0),
      -torsoPos.x * 0.025
    );

    const speechJawFollow = clamp(vf.aa * 0.022, 0, 0.022);
    const totalHeadYaw = headPos.x * 0.46 + errorHeadShakeYaw;
    const totalHeadPitch = -headPos.y * 0.30 + errorHeadDipPitch + nodPitch + speechJawFollow;
    applyParentSpaceDelta("Neck", totalHeadPitch * 0.32, totalHeadYaw * 0.32, rollVal * 0.35);
    applyParentSpaceDelta("Head", totalHeadPitch * 0.68, totalHeadYaw * 0.68, rollVal * 0.65);

    const eyeExtraYaw = clamp((eyePos.x - headPos.x * 0.45) * 0.38, -0.32, 0.32);
    const eyeExtraPitch = clamp(-(eyePos.y - headPos.y * 0.45) * 0.28, -0.24, 0.24);
    applyParentSpaceDelta("Eye_L", eyeExtraPitch, eyeExtraYaw, 0);
    applyParentSpaceDelta("Eye_R", eyeExtraPitch, eyeExtraYaw, 0);

    // Dynamic Crystal Pupil Aperture Zoom (driven cleanly in shader so eyelids never Z-fight!)
    const targetIrisScale =
      liveEmotion === "hurray"
        ? 1.12
        : liveEmotion === "joy" || liveEmotion === "spin"
          ? 1.07
          : liveEmotion === "curious"
            ? 0.90 // crisp analytical optical zoom-focus!
            : 1.0;
    const irisScale = stepSpring1D(irisScaleSpring.current, targetIrisScale, 110, 21, dt);
    gemUniforms.uPupilScale.value = irisScale;

    // -------------------------------------------------------
    // 3. PRECISION AI-BOT ARM CHOREOGRAPHY (ZERO HAND-ON-HIP / GIRL ACTIONS!)
    // -------------------------------------------------------
    // Balanced neutral bot ready-stance: symmetric arms comfortably alongside chassis
    let tUaL = { x: 0.0, y: -0.15, z: -0.56 };
    let tFaL = { x: 0.0, y: -0.30, z: 0.12 };
    let tHdL = { x: 0.0, y: -0.10, z: 0.05 };

    let tUaR = { x: 0.0, y: 0.15, z: 0.56 };
    let tFaR = { x: 0.0, y: 0.30, z: -0.12 };
    let tHdR = { x: 0.0, y: 0.10, z: -0.05 };

    if (!reducedMotion) {
      if (inErrorBurst) {
        // Clean robotic "Halt / Invalid Input" palm-stop signal
        const wag = Math.sin(errorPhase * Math.PI * 6.0) * errorEnvelope;
        tUaR = { x: 0.12, y: 0.58 * errorEnvelope + 0.15, z: 0.22 };
        tFaR = { x: 0.15, y: 0.68 * errorEnvelope + 0.25, z: -0.92 * errorEnvelope + wag * 0.26 };
        tHdR = { x: 0.0, y: wag * 0.22, z: wag * 0.32 };

        tUaL = { x: 0.0, y: -0.22, z: -0.48 };
        tFaL = { x: 0.0, y: -0.38, z: 0.22 };
      } else if (isHurray) {
        // Mecha / Astro-Bot Twin Victory Fist-Pump!
        const pump = Math.sin(t * 8.6);
        tUaL = { x: -0.14, y: -0.22, z: 0.48 + pump * 0.12 };
        tFaL = { x: -0.12, y: -0.28, z: 0.96 + pump * 0.18 };
        tHdL = { x: 0.0, y: 0.0, z: 0.12 };

        tUaR = { x: -0.14, y: 0.22, z: -0.48 - pump * 0.12 };
        tFaR = { x: -0.12, y: 0.28, z: -0.96 - pump * 0.18 };
        tHdR = { x: 0.0, y: 0.0, z: -0.12 };
      } else if (isHoverSpin) {
        // Aerodynamic Hover-Jet Stabilizer Posture during 360° spin!
        tUaL = { x: 0.22, y: 0.10, z: -0.36 };
        tFaL = { x: 0.15, y: -0.22, z: 0.18 };
        tHdL = { x: 0.0, y: 0.0, z: -0.12 };

        tUaR = { x: 0.22, y: -0.10, z: 0.36 };
        tFaR = { x: 0.15, y: 0.22, z: -0.18 };
        tHdR = { x: 0.0, y: 0.0, z: 0.12 };
      } else if (isVibing) {
        // Crisp AI-Bot Dual Forearm Telemetry Sync Pulse!
        const pulse = Math.sin(t * 5.6);
        tUaL = { x: 0.08, y: -0.36, z: -0.34 + pulse * 0.14 };
        tFaL = { x: 0.0, y: -0.62, z: 0.68 - pulse * 0.22 };
        tHdL = { x: 0.0, y: -0.12, z: pulse * 0.18 };

        tUaR = { x: 0.08, y: 0.36, z: 0.34 + pulse * 0.14 };
        tFaR = { x: 0.0, y: 0.62, z: -0.68 - pulse * 0.22 };
        tHdR = { x: 0.0, y: 0.12, z: pulse * 0.18 };
      } else if (isWaving) {
        // Precision AI-Bot Salute & Friendly Greeting Wave!
        const waveOsc = Math.sin(t * 8.2);
        tUaR = { x: -0.22, y: 0.26, z: -0.18 };
        tFaR = { x: -0.18, y: 0.30, z: -1.16 + waveOsc * 0.30 };
        tHdR = { x: 0.0, y: 0.08, z: waveOsc * 0.26 };

        tUaL = { x: 0.0, y: -0.18, z: -0.52 };
        tFaL = { x: 0.0, y: -0.34, z: 0.18 };
      } else if (isWinking) {
        // Crisp Bot Affirmation Gesture (clean open-hand acknowledgement — ZERO hip sass!)
        tUaR = { x: -0.12, y: 0.38 * winkCurve + 0.16, z: 0.32 - 0.18 * winkCurve };
        tFaR = { x: -0.10, y: 0.55 * winkCurve + 0.30, z: -0.68 * winkCurve - 0.14 };
        tHdR = { x: 0.0, y: 0.14, z: -0.16 * winkCurve };

        tUaL = { x: 0.0, y: -0.16, z: -0.54 };
        tFaL = { x: 0.0, y: -0.32, z: 0.14 };
      } else if (mood === "thinking") {
        // AI Bot Wrist-Holo Telemetry Check while scanning!
        tUaR = { x: 0.08, y: 0.52, z: 0.34 };
        tFaR = { x: 0.16, y: 0.82, z: -0.78 };
        tHdR = { x: 0.25, y: 0.18, z: -0.15 };

        tUaL = { x: 0.0, y: -0.18, z: -0.52 };
        tFaL = { x: 0.0, y: -0.36, z: 0.18 };
      } else if (hoveredPillNDC) {
        // Holographic UI Presenter Gesture toward the hovered option pill on the left!
        tUaL = { x: 0.22, y: -0.46, z: -0.26 };
        tFaL = { x: 0.26, y: -0.56, z: 0.54 };
        tHdL = { x: 0.22, y: -0.20, z: 0.18 };

        tUaR = { x: 0.0, y: 0.16, z: 0.54 };
        tFaR = { x: 0.0, y: 0.32, z: -0.14 };
      } else if (spPresence > 0.05) {
        // Articulated AI Presenter Speech Gestures (clean, confident, balanced!)
        const arcA = Math.sin(t * 1.65);
        const arcB = Math.cos(t * 1.25 + 0.9);
        const p = spPresence;

        tUaR = {
          x: -0.12 * p,
          y: 0.15 + p * (0.32 + 0.12 * arcA),
          z: 0.56 + p * (-0.28 - 0.12 * Math.max(0, arcA)),
        };
        tFaR = {
          x: -0.16 * p,
          y: 0.30 + p * (0.38 + 0.14 * arcB),
          z: -0.12 + p * (-0.56 - 0.18 * arcB),
        };
        tHdR = {
          x: 0.0,
          y: 0.10 + p * (0.12 + 0.08 * arcA),
          z: -0.05 + p * (-0.14 + 0.16 * arcA),
        };

        tUaL = {
          x: 0.12 * p,
          y: -0.15 + p * (-0.30 + 0.10 * arcA),
          z: -0.56 + p * (0.24 + 0.10 * Math.max(0, -arcA)),
        };
        tFaL = {
          x: 0.16 * p,
          y: -0.30 + p * (-0.34 - 0.12 * arcB),
          z: 0.12 + p * (0.50 - 0.16 * arcA),
        };
        tHdL = {
          x: 0.0,
          y: -0.10 + p * (-0.10 - 0.08 * arcB),
          z: 0.05 + p * (0.14 - 0.16 * arcB),
        };
      } else {
        // Calm stabilized bot hover idle
        const hoverArm = Math.sin(t * 1.65) * 0.025;
        tUaL = { x: 0.0, y: -0.15, z: -0.55 + hoverArm };
        tFaL = { x: 0.0, y: -0.30, z: 0.14 };
        tHdL = { x: 0.0, y: -0.10, z: 0.05 };

        tUaR = { x: 0.0, y: 0.15, z: 0.55 - hoverArm };
        tFaR = { x: 0.0, y: 0.30, z: -0.14 };
        tHdR = { x: 0.0, y: 0.10, z: -0.05 };
      }
    }

    const stepArm3 = (
      sp: { x: ReturnType<typeof createSpring1D>; y: ReturnType<typeof createSpring1D>; z: ReturnType<typeof createSpring1D> },
      tgt: { x: number; y: number; z: number },
      stiff: number,
      damp: number
    ) => ({
      x: stepSpring1D(sp.x, tgt.x, stiff, damp, dt),
      y: stepSpring1D(sp.y, tgt.y, stiff, damp, dt),
      z: stepSpring1D(sp.z, tgt.z, stiff, damp, dt),
    });

    const uaL = stepArm3(uaLSpring.current, tUaL, 64, 16);
    const faL = stepArm3(faLSpring.current, tFaL, 81, 18);
    const hdL = stepArm3(hdLSpring.current, tHdL, 100, 20);

    const uaR = stepArm3(uaRSpring.current, tUaR, 64, 16);
    const faR = stepArm3(faRSpring.current, tFaR, 81, 18);
    const hdR = stepArm3(hdRSpring.current, tHdR, 100, 20);

    applyParentSpaceDelta("UpperArm_L", uaL.x, uaL.y, uaL.z);
    applyCharSpaceChildDelta("Forearm_L", "UpperArm_L", faL.x, faL.y, faL.z);
    applyCharSpaceChildDelta("Hand_L", "Forearm_L", hdL.x, hdL.y, hdL.z);

    applyParentSpaceDelta("UpperArm_R", uaR.x, uaR.y, uaR.z);
    applyCharSpaceChildDelta("Forearm_R", "UpperArm_R", faR.x, faR.y, faR.z);
    applyCharSpaceChildDelta("Hand_R", "Forearm_R", hdR.x, hdR.y, hdR.z);

    // -------------------------------------------------------
    // 4. EXPRESSIVE BOT BROW INDICATORS (`Pixy_Brows`)
    // -------------------------------------------------------
    const prosodyBrowBeat = audioEnergy * 0.14;
    const bsRef = browSprings.current;
    const wBrowWelcome = stepSpring1D(
      bsRef.welcome,
      (liveEmotion === "welcoming" ? 0.85 : liveEmotion === "neutral" ? 0.25 : 0) + prosodyBrowBeat,
      110,
      21,
      dt
    );
    const wBrowJoy = stepSpring1D(
      bsRef.joy,
      liveEmotion === "joy" || liveEmotion === "spin" ? 0.90 + prosodyBrowBeat * 0.4 : 0,
      110,
      21,
      dt
    );
    const wBrowHurray = stepSpring1D(
      bsRef.hurray,
      liveEmotion === "hurray" ? 1.0 : 0,
      125,
      22.4,
      dt
    );
    const wBrowFlirtR = stepSpring1D(
      bsRef.flirtyR,
      liveEmotion === "flirty" && browSideRef.current === "R" ? 0.88 : 0,
      115,
      21.4,
      dt
    );
    const wBrowFlirtL = stepSpring1D(
      bsRef.flirtyL,
      liveEmotion === "flirty" && browSideRef.current === "L" ? 0.88 : 0,
      115,
      21.4,
      dt
    );
    const wBrowCurious = stepSpring1D(
      bsRef.curious,
      liveEmotion === "curious" ? 0.95 : 0,
      110,
      21,
      dt
    );
    const wBrowSassy = stepSpring1D(
      bsRef.sassy,
      liveEmotion === "sassy" ? 0.88 : 0,
      110,
      21,
      dt
    );
    const wBrowWorried = stepSpring1D(
      bsRef.worried,
      liveEmotion === "oops" ? 1.0 : 0,
      135,
      23.2,
      dt
    );

    if (browsMesh?.morphTargetInfluences) {
      const bi = browsMesh.morphTargetInfluences;
      if (browsMorphs.brow_welcome !== undefined) bi[browsMorphs.brow_welcome] = clamp(wBrowWelcome, 0, 1);
      if (browsMorphs.brow_joy !== undefined) bi[browsMorphs.brow_joy] = clamp(wBrowJoy, 0, 1);
      if (browsMorphs.brow_hurray !== undefined) bi[browsMorphs.brow_hurray] = clamp(wBrowHurray, 0, 1);
      if (browsMorphs.brow_flirty_R !== undefined) bi[browsMorphs.brow_flirty_R] = clamp(wBrowFlirtR, 0, 1);
      if (browsMorphs.brow_flirty_L !== undefined) bi[browsMorphs.brow_flirty_L] = clamp(wBrowFlirtL, 0, 1);
      if (browsMorphs.brow_curious !== undefined) bi[browsMorphs.brow_curious] = clamp(wBrowCurious, 0, 1);
      if (browsMorphs.brow_sassy !== undefined) bi[browsMorphs.brow_sassy] = clamp(wBrowSassy, 0, 1);
      if (browsMorphs.brow_worried !== undefined) bi[browsMorphs.brow_worried] = clamp(wBrowWorried, 0, 1);
    }

    // -------------------------------------------------------
    // 5. SLEEK BOT OPTIC SHUTTER EYELIDS (`Pixy_Eyelids`)
    // -------------------------------------------------------
    const bl = blinkState.current;
    if (
      bl.blinkProgress < 0 &&
      t >= bl.nextBlinkAt &&
      !isSensorPerked &&
      !isHoverHop &&
      !isHoverSpin &&
      !isWinking &&
      !inErrorBurst
    ) {
      bl.blinkProgress = 0;
    }
    let blinkWeight = 0;
    if (bl.blinkProgress >= 0) {
      bl.blinkProgress += dt / 0.13; // crisp mechanical shutter blink!
      if (bl.blinkProgress >= 1) {
        bl.blinkProgress = -1;
        if (bl.doubleBlinkQueued) {
          bl.doubleBlinkQueued = false;
          bl.nextBlinkAt = t + 0.10;
        } else {
          bl.doubleBlinkQueued = Math.random() < 0.20;
          bl.nextBlinkAt = t + 3.0 + Math.random() * 3.2;
        }
      } else {
        blinkWeight = Math.sin(bl.blinkProgress * Math.PI);
      }
    }

    const wWinkL = isWinking && winkSideRef.current === "L" ? winkCurve : 0;
    const wWinkR = isWinking && winkSideRef.current === "R" ? winkCurve : 0;
    const activeWinkMax = Math.max(wWinkL, wWinkR);

    const ls = lidSprings.current;
    const tgtHappyCrescent = isSensorPerked || isHoverHop || isHoverSpin ? 1.0 : 0.0;
    const wHappyCrescent = stepSpring1D(
      ls.happyCrescent,
      tgtHappyCrescent * (1 - activeWinkMax),
      125,
      22.4,
      dt
    );
    const openEyeMask = (1 - activeWinkMax) * (1 - wHappyCrescent);

    const wSquint = stepSpring1D(
      ls.squint,
      (liveEmotion === "sassy" ? 0.65 : liveEmotion === "curious" && mood === "thinking" ? 0.34 : 0) *
      openEyeMask,
      115,
      21.4,
      dt
    );
    const wOpticFocus = stepSpring1D(
      ls.opticFocus,
      (liveEmotion === "flirty" ? 0.45 : 0) * openEyeMask,
      110,
      21,
      dt
    );
    const wWelcomeWarm = stepSpring1D(
      ls.welcomeWarm,
      (liveEmotion === "welcoming" ? 0.80 : 0) * openEyeMask,
      100,
      20,
      dt
    );
    const wJoySparkle = stepSpring1D(
      ls.joySparkle,
      (liveEmotion === "joy" ? 0.88 : 0) * openEyeMask,
      105,
      20.5,
      dt
    );
    const wHurrayStar = stepSpring1D(
      ls.hurrayStar,
      (liveEmotion === "hurray" ? 1.0 : 0) * openEyeMask,
      120,
      22,
      dt
    );
    const wWorriedLid = stepSpring1D(
      ls.worriedLid,
      (liveEmotion === "oops" ? 0.95 : 0) * openEyeMask,
      130,
      22.8,
      dt
    );
    const wWide = stepSpring1D(
      ls.wide,
      activeWinkMax > 0.2
        ? 0.30 * activeWinkMax
        : hoveredPillNDC
          ? 0.28
          : liveEmotion === "curious" && mood !== "thinking"
            ? 0.28
            : 0,
      125,
      22.4,
      dt
    );

    const effBlink = clamp(
      blinkWeight * (1 - wHappyCrescent) * (1 - activeWinkMax) * (1 - wSquint * 0.45),
      0,
      1
    );

    if (eyelidMesh?.morphTargetInfluences) {
      const inf = eyelidMesh.morphTargetInfluences;
      if (eyelidMorphs.blink !== undefined) inf[eyelidMorphs.blink] = effBlink;
      if (eyelidMorphs.wink_L !== undefined) inf[eyelidMorphs.wink_L] = clamp(wWinkL, 0, 1);
      if (eyelidMorphs.wink_R !== undefined) inf[eyelidMorphs.wink_R] = clamp(wWinkR, 0, 1);
      if (eyelidMorphs.squint_budget !== undefined) inf[eyelidMorphs.squint_budget] = clamp(wSquint, 0, 1);
      if (eyelidMorphs.happy_delight !== undefined) inf[eyelidMorphs.happy_delight] = clamp(wHappyCrescent, 0, 1);
      if (eyelidMorphs.wide_alert !== undefined) inf[eyelidMorphs.wide_alert] = clamp(wWide, 0, 1);
      if (eyelidMorphs.flirty_smize !== undefined) inf[eyelidMorphs.flirty_smize] = clamp(wOpticFocus, 0, 1);
      if (eyelidMorphs.welcome_warm !== undefined) inf[eyelidMorphs.welcome_warm] = clamp(wWelcomeWarm, 0, 1);
      if (eyelidMorphs.joy_sparkle !== undefined) inf[eyelidMorphs.joy_sparkle] = clamp(wJoySparkle, 0, 1);
      if (eyelidMorphs.hurray_star !== undefined) inf[eyelidMorphs.hurray_star] = clamp(wHurrayStar, 0, 1);
      if (eyelidMorphs.worried_lid !== undefined) inf[eyelidMorphs.worried_lid] = clamp(wWorriedLid, 0, 1);
    }

    // -------------------------------------------------------
    // 6. FACS 6-VISEME SPEECH ARTICULATION + CLEAN BOT EXPRESSIONS
    // -------------------------------------------------------
    const ms = mouthSprings.current;
    const finalAa = clamp(vf.aa, 0, 1);
    const finalOh = clamp(vf.oh, 0, 1);
    const finalEe = clamp(vf.ee, 0, 1);
    const finalMbp = clamp(vf.mbp, 0, 1);
    const finalFv = clamp(vf.fv, 0, 1);
    const finalTh = clamp(vf.th, 0, 1);

    const activeVisemeDrive = clamp(
      finalAa + finalOh + finalEe + finalMbp + finalFv + finalTh,
      0,
      1
    );
    const speakingMask = clamp(
      Math.max(mood === "speaking" ? 0.92 : 0, spPresence * 1.15, activeVisemeDrive),
      0,
      1
    );
    const nonSpeakingMask = Math.pow(Math.max(0, 1 - speakingMask), 1.35);

    const puckerRelax = 1 - finalOh * 0.78;
    const wantHappyCorners =
      liveEmotion === "welcoming" ||
      liveEmotion === "joy" ||
      liveEmotion === "spin" ||
      liveEmotion === "hurray";
    const wantWittyCorners = liveEmotion === "flirty" || liveEmotion === "sassy";

    const wSmileCorners = stepSpring1D(
      ms.smileCorners,
      wantHappyCorners ? speakingMask * 0.82 * puckerRelax : 0,
      115,
      21.4,
      dt
    );
    const wSmirkCornerR = stepSpring1D(
      ms.smirkCornerR,
      wantWittyCorners && browSideRef.current === "R"
        ? speakingMask * 0.85 * puckerRelax
        : 0,
      115,
      21.4,
      dt
    );
    const wSmirkCornerL = stepSpring1D(
      ms.smirkCornerL,
      wantWittyCorners && browSideRef.current === "L"
        ? speakingMask * 0.85 * puckerRelax
        : 0,
      115,
      21.4,
      dt
    );

    const wMouthWelcome = stepSpring1D(
      ms.welcome,
      liveEmotion === "welcoming" ? 0.85 * nonSpeakingMask : 0,
      100,
      20,
      dt
    );
    const wMouthWittyR = stepSpring1D(
      ms.wittyR,
      wantWittyCorners && browSideRef.current === "R" ? 0.82 * nonSpeakingMask : 0,
      105,
      20.5,
      dt
    );
    const wMouthWittyL = stepSpring1D(
      ms.wittyL,
      wantWittyCorners && browSideRef.current === "L" ? 0.82 * nonSpeakingMask : 0,
      105,
      20.5,
      dt
    );
    const wMouthJoy = stepSpring1D(
      ms.joyGrin,
      liveEmotion === "joy" || liveEmotion === "spin" ? 0.80 * nonSpeakingMask : 0,
      105,
      20.5,
      dt
    );
    const wMouthHurray = stepSpring1D(
      ms.hurray,
      liveEmotion === "hurray" ? 0.92 * nonSpeakingMask : 0,
      115,
      21.4,
      dt
    );
    const wMouthCurious = stepSpring1D(
      ms.curiousOoh,
      liveEmotion === "curious" ? (mood === "thinking" ? 0.72 : 0.35) * nonSpeakingMask : 0,
      100,
      20,
      dt
    );
    const wMouthWorried = stepSpring1D(
      ms.worriedOops,
      liveEmotion === "oops" ? 0.92 * nonSpeakingMask : 0,
      125,
      22.4,
      dt
    );
    const wBaseSmile = stepSpring1D(
      ms.smile,
      liveEmotion === "neutral"
        ? 0.32 * nonSpeakingMask
        : isSensorPerked
          ? 0.82 * nonSpeakingMask
          : 0,
      90,
      19,
      dt
    );

    const applyMouthMorphs = (
      mesh: THREE.Mesh | null,
      dict: Record<string, number>
    ) => {
      if (!mesh?.morphTargetInfluences) return;
      const inf = mesh.morphTargetInfluences;
      if (dict.mouth_smile !== undefined) inf[dict.mouth_smile] = clamp(wBaseSmile, 0, 1);
      if (dict.smile_corners !== undefined) inf[dict.smile_corners] = clamp(wSmileCorners, 0, 1);
      if (dict.smirk_corner_R !== undefined) inf[dict.smirk_corner_R] = clamp(wSmirkCornerR, 0, 1);
      if (dict.smirk_corner_L !== undefined) inf[dict.smirk_corner_L] = clamp(wSmirkCornerL, 0, 1);
      if (dict.mouth_welcome !== undefined) inf[dict.mouth_welcome] = clamp(wMouthWelcome, 0, 1);
      if (dict.mouth_flirty_R !== undefined) inf[dict.mouth_flirty_R] = clamp(wMouthWittyR, 0, 1);
      if (dict.mouth_flirty_L !== undefined) inf[dict.mouth_flirty_L] = clamp(wMouthWittyL, 0, 1);
      if (dict.mouth_joy_grin !== undefined) inf[dict.mouth_joy_grin] = clamp(wMouthJoy, 0, 1);
      if (dict.mouth_hurray !== undefined) inf[dict.mouth_hurray] = clamp(wMouthHurray, 0, 1);
      if (dict.mouth_curious_ooh !== undefined) inf[dict.mouth_curious_ooh] = clamp(wMouthCurious, 0, 1);
      if (dict.mouth_worried_oops !== undefined) inf[dict.mouth_worried_oops] = clamp(wMouthWorried, 0, 1);
      if (dict.viseme_aa !== undefined) inf[dict.viseme_aa] = finalAa;
      if (dict.viseme_oh !== undefined) inf[dict.viseme_oh] = finalOh;
      if (dict.viseme_ee !== undefined) inf[dict.viseme_ee] = finalEe;
      if (dict.viseme_mbp !== undefined) inf[dict.viseme_mbp] = finalMbp;
      if (dict.viseme_fv !== undefined) inf[dict.viseme_fv] = finalFv;
      if (dict.viseme_th_l !== undefined) inf[dict.viseme_th_l] = finalTh;
    };

    applyMouthMorphs(lipsMesh, lipsMorphs);
    applyMouthMorphs(cavityMesh, cavityMorphs);
    applyMouthMorphs(tongueMesh, tongueMorphs);
    applyMouthMorphs(teethMesh, teethMorphs);

    // -------------------------------------------------------
    // 7. FACETED AMETHYST-ORCHID GEMSTONE EYE & CHROME RIM AURA
    // -------------------------------------------------------
    currentGlowColor.current.lerp(
      BOT_OPTIC_COLORS[liveEmotion],
      inErrorBurst ? 0.35 : 0.12
    );

    const scanPulse = mood === "thinking" ? 0.14 + 0.10 * Math.sin(t * 5.2) : 0;
    const powerBoost =
      liveEmotion === "hurray"
        ? 0.24 + 0.10 * Math.sin(t * 7.8)
        : liveEmotion === "joy" || liveEmotion === "spin" || isSensorPerked
          ? 0.16 + 0.06 * Math.sin(t * 4.5)
          : 0;
    const errorBoost = inErrorBurst ? 0.45 * errorEnvelope : 0;

    gemUniforms.uGemTint.value.copy(currentGlowColor.current);
    // Keep gem boost controlled (0.95..1.35) so crystal eyes stay rich royal amethyst-orchid, NEVER bleached white!
    gemUniforms.uGemBoost.value =
      0.96 + audioEnergy * 0.34 + scanPulse + powerBoost + errorBoost;
    // Subtle audio & power-reactive chest emblem halo pulse!
    gemUniforms.uChestLogoBoost.value =
      1.0 + audioEnergy * 0.45 + scanPulse * 0.6 + powerBoost * 0.7;

    tongueMaterial.emissive.copy(currentGlowColor.current);
    tongueMaterial.emissiveIntensity = 0.85 + audioEnergy * 1.35;

    if (rimLightRef.current) {
      rimLightRef.current.color.set(inErrorBurst ? "#ef4444" : "#c084fc");
      rimLightRef.current.intensity =
        3.2 + audioEnergy * 1.8 + powerBoost * 1.6 + errorBoost * 2.0;
      rimLightRef.current.position.set(stageX + 0.9, stageY + 1.25, -2.4);
    }
  });

  return (
    <>
      <pointLight ref={rimLightRef} distance={9.0} decay={1.75} />

      <group
        ref={rootGroupRef}
        position={[stageX, stageY, 0]}
        scale={actorScale}
        onPointerMove={handlePixyPointerMove}
        onClick={handlePixyClick}
        onPointerOver={() => {
          isHoveringPixyRef.current = true;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          isHoveringPixyRef.current = false;
          document.body.style.cursor = "";
        }}
      >
        <primitive object={clonedScene} />
      </group>

      <ContactShadows
        position={[stageX, stageY - actorScale * 0.498, 0]}
        frames={1}
        resolution={256}
        opacity={0.78}
        scale={isMobile ? 4.4 : 5.8}
        blur={1.8}
        far={3.0}
        color="#07030c"
      />
    </>
  );
}

export function PixyStudioStage(props: PixyStudioStageProps) {
  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    active: false,
    lastMoveAt: 0,
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);

    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }

    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!webglSupported) {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[12%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pixy.png"
          alt="Pixy AI"
          className="max-h-[68vh] w-auto object-contain drop-shadow-[0_0_48px_rgba(168,85,247,0.4)]"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[2]">
      <Canvas
        dpr={[2, 2]}
        camera={{ position: [0, 0.06, 5.35], fov: 36 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <PointerListener pointerRef={pointerRef} />

        {/* Silky Smoked-Amethyst & Pearl-Lavender Studio Rig (soft round domes = ZERO rectangular barcode stripes!) */}
        <ambientLight color="#211033" intensity={0.42} />
        <directionalLight position={[0.8, 5.8, -0.4]} intensity={1.85} color="#f5ecff" />
        <directionalLight position={[-4.6, 2.0, -1.5]} intensity={2.15} color="#e9d5ff" />
        <directionalLight position={[4.8, 2.0, -1.5]} intensity={2.35} color="#d8b4fe" />

        <Environment resolution={256} environmentIntensity={0.62}>
          {/* Overhead Soft Circular Dome — smooth velvety plum-silver crown & horn sheen */}
          <Lightformer
            form="circle"
            intensity={2.2}
            color="#e9d5ff"
            scale={[6.5, 6.5, 1]}
            position={[1.1, 6.0, -1.0]}
            target={[1.1, 0.1, 0]}
          />
          {/* Left Soft Circular Rim Diffuser — smooth organic contour along left cheek & arm */}
          <Lightformer
            form="circle"
            intensity={2.4}
            color="#f3e8ff"
            scale={[5.5, 7.5, 1]}
            position={[-5.2, 1.2, -0.6]}
            target={[1.1, 0.0, 0]}
          />
          {/* Right Soft Circular Rim Diffuser — smooth organic contour along right cheek & arm */}
          <Lightformer
            form="circle"
            intensity={2.5}
            color="#d8b4fe"
            scale={[5.5, 7.5, 1]}
            position={[6.6, 1.2, -0.6]}
            target={[1.2, 0.0, 0]}
          />
          {/* Warm Royal-Amethyst Under-Wrap Diffusers — rich velvet purple depth without hard stripes */}
          <Lightformer
            form="circle"
            intensity={1.8}
            color="#9333ea"
            scale={[5.0, 5.0, 1]}
            position={[1.2, -3.4, -1.2]}
            target={[1.1, -0.1, 0]}
          />
        </Environment>

        <Suspense fallback={null}>
          <RiggedPixyActor
            {...props}
            pointerRef={pointerRef}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/pixy-studio.glb?v=9", false, false);
