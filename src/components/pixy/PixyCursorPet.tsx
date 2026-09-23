"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * PixyCursorPet — fixed-position avatar companion.
 *
 * The body stays anchored in the bottom-right corner of the viewport.
 * Only the head (upper ~55% of the image) subtly rotates toward the
 * cursor, giving a natural "looking at you" effect.
 *
 * Implementation: two stacked copies of the same image —
 *   1. Body layer (static, bottom portion visible)
 *   2. Head layer (top portion visible, rotates toward cursor)
 */
export function PixyCursorPet() {
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Head rotation values (updated via RAF, not React state, for performance)
  const headRotateX = useRef(0); // pitch (up/down)
  const headRotateY = useRef(0); // yaw (left/right)
  const headTilt = useRef(0);    // slight z-tilt
  const headRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  // Smoothed cursor position for interpolation
  const targetX = useRef(0);
  const targetY = useRef(0);
  const smoothX = useRef(0);
  const smoothY = useRef(0);

  // The percentage of the image height that is considered the "head"
  // The head takes roughly the top 55% of the pixy-avatar image
  const HEAD_SPLIT = 55; // %

  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    setIsMobile(mql.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mql.addEventListener("change", handleMediaChange);
    return () => mql.removeEventListener("change", handleMediaChange);
  }, []);

  // Animation loop: smoothly interpolate head rotation toward cursor
  const animate = useCallback(() => {
    const lerpFactor = 0.1;
    smoothX.current += (targetX.current - smoothX.current) * lerpFactor;
    smoothY.current += (targetY.current - smoothY.current) * lerpFactor;

    // Convert normalized [-1,1] coords to rotation angles
    // Yaw: left/right, max ±18°
    headRotateY.current = smoothX.current * 18;
    // Pitch: up/down, max ±12° (negative because CSS rotateX is inverted)
    headRotateX.current = -smoothY.current * 12;
    // Tilt: subtle z-axis roll based on horizontal position, max ±6°
    headTilt.current = -smoothX.current * 6;

    if (headRef.current) {
      headRef.current.style.transform =
        `rotateY(${headRotateY.current}deg) rotateX(${headRotateX.current}deg) rotateZ(${headTilt.current}deg)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize cursor position to [-1, 1]
      targetX.current = (e.clientX / window.innerWidth) * 2 - 1;
      targetY.current = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "input" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    // Start animation loop
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(rafId.current);
    };
  }, [isMobile, animate]);

  if (isMobile) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[9999] hidden sm:block"
    >
      <motion.div
        animate={{
          // Gentle breathing float on the whole container
          y: [0, -6, 0],
          scale: isClicking ? 0.9 : isHovering ? 1.08 : 1,
          filter: isHovering
            ? "brightness(1.2) drop-shadow(0 0 12px rgba(200, 100, 255, 0.4))"
            : "brightness(1) drop-shadow(0 0 8px rgba(200, 100, 255, 0.2))",
        }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
          scale: {
            duration: 0.15,
            ease: "easeOut",
          },
        }}
        className="relative"
        style={{ width: 56 }} /* w-14 equivalent for the avatar size */
      >
        {/* ---- Body layer (static, shows only the bottom portion) ---- */}
        <div
          className="absolute bottom-0 left-0 w-full overflow-hidden"
          style={{ height: `${100 - HEAD_SPLIT}%` }}
        >
          <img
            src="/pixy-avatar.png"
            alt=""
            aria-hidden="true"
            className="w-full h-auto max-w-none opacity-90"
            style={{
              /* Shift image up so only the body portion is visible */
              position: "absolute",
              bottom: 0,
              left: 0,
            }}
          />
        </div>

        {/* ---- Head layer (rotates toward cursor, shows only the top portion) ---- */}
        <div
          ref={headRef}
          className="relative w-full overflow-hidden"
          style={{
            height: `${HEAD_SPLIT}%`,
            /* Pivot at the neck (bottom-center of the head portion) */
            transformOrigin: "50% 100%",
            /* perspective for subtle 3D depth */
            perspective: 400,
            willChange: "transform",
          }}
        >
          <img
            src="/pixy-avatar.png"
            alt="Pixy Cursor Companion"
            className="w-full h-auto max-w-none opacity-90"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>

        {/* Invisible full-size image to establish container's natural aspect ratio */}
        <img
          src="/pixy-avatar.png"
          alt=""
          aria-hidden="true"
          className="w-full h-auto invisible"
        />
      </motion.div>
    </div>
  );
}
