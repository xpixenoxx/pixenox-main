"use client";

import { motion } from "framer-motion";
import type { AvatarState } from "@/lib/pixy/types";

interface PixyAvatarProps {
  state: AvatarState;
  /**
   * Later, drop in a real Pixy asset without touching any conversation
   * logic: pass an image or video src here and it renders inside the same
   * orb frame, masked to the same shape, driven by the same `state`.
   */
  videoSrc?: string;
  imageSrc?: string;
  size?: number;
}

const STATE_COPY: Record<AvatarState, string> = {
  idle: "Pixy, idle",
  listening: "Pixy is listening",
  thinking: "Pixy is thinking",
  speaking: "Pixy is speaking",
  success: "Pixy is delighted",
};

const CORE_SCALE: Record<AvatarState, number[]> = {
  idle: [1, 1.04, 1],
  listening: [1, 1.08, 1],
  thinking: [1, 1.02, 1.06, 1.02, 1],
  speaking: [1, 1.1, 0.98, 1.06, 1],
  success: [1, 1.18, 1],
};

const RING_SPEED: Record<AvatarState, number> = {
  idle: 6,
  listening: 3.2,
  thinking: 2,
  speaking: 1.4,
  success: 1,
};

export function PixyAvatar({ state, videoSrc, imageSrc, size = 168 }: PixyAvatarProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={STATE_COPY[state]}
    >
      {/* Outer breathing ring — encodes state through motion speed, not shape */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, var(--bg-glow-coral), var(--bg-glow-violet), var(--bg-glow-gold), var(--bg-glow-coral))",
          filter: "blur(18px)",
          opacity: 0.55,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: RING_SPEED[state] * 6, repeat: Infinity, ease: "linear" }}
      />

      {/* Glass shell */}
      <div
        className="absolute inset-[10%] rounded-full"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02))",
          border: "1px solid var(--surface-border)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Living core */}
      <motion.div
        className="absolute inset-[22%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #ffe6c9 0%, var(--bg-glow-coral) 42%, var(--bg-glow-violet) 100%)",
          boxShadow: "0 0 40px 6px rgba(255,122,138,0.35)",
        }}
        animate={{ scale: CORE_SCALE[state] }}
        transition={{
          duration: RING_SPEED[state],
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Optional future real-asset layer */}
      {videoSrc ? (
        <video
          className="absolute inset-[8%] rounded-full object-cover"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="absolute inset-[8%] rounded-full object-cover"
          src={imageSrc}
          alt=""
        />
      ) : null}
    </div>
  );
}
