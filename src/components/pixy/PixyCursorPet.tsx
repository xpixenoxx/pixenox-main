"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PixyCursorPet() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  const targetRotateX = useRef(0);
  const targetRotateY = useRef(0);
  const currentRotateX = useRef(0);
  const currentRotateY = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const animate = useCallback(() => {
    // Smooth lerp
    currentRotateX.current += (targetRotateX.current - currentRotateX.current) * 0.1;
    currentRotateY.current += (targetRotateY.current - currentRotateY.current) * 0.1;

    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(600px) rotateX(${currentRotateX.current.toFixed(2)}deg) rotateY(${currentRotateY.current.toFixed(2)}deg)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth || 1);
      const deltaY = (e.clientY - centerY) / (window.innerHeight || 1);

      // Smooth subtle 3D tilt: Y (left/right) max ±18deg, X (up/down) max ±14deg
      targetRotateY.current = Math.max(-18, Math.min(18, deltaX * 40));
      targetRotateX.current = Math.max(-14, Math.min(14, -deltaY * 30));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  if (!isMounted) return null;
  // Don't show on the full-screen Pixy experience page
  if (pathname === "/contact/pixy") return null;

  return (
    <aside
      ref={containerRef}
      aria-label="Pixy AI Companion"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 pointer-events-auto select-none"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
      }}
    >
      <Link
        href="/contact/pixy"
        className="group relative block focus:outline-none"
        aria-label="Talk to Pixy AI"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 8, scale: 0.92 }}
              animate={{ opacity: 1, x: -12, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.92 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: "absolute",
                right: "100%",
                top: "50%",
                transform: "translateY(-50%)",
                whiteSpace: "nowrap",
                borderRadius: "12px",
                border: "1px solid rgba(244, 63, 94, 0.4)",
                background: "rgba(15, 8, 18, 0.94)",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#fbcfe8",
                boxShadow: "0 8px 24px rgba(244, 63, 94, 0.3)",
                backdropFilter: "blur(12px)",
                pointerEvents: "none",
              }}
            >
              Talk to Pixy
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Radial Backlight Portal */}
        <div
          style={{
            position: "absolute",
            inset: "-28px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 45%, rgba(168, 85, 247, 0.52) 0%, rgba(244, 63, 94, 0.35) 40%, rgba(124, 58, 237, 0.16) 65%, transparent 75%)",
            filter: "blur(20px)",
            opacity: isHovered ? 1 : 0.78,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />

        {/* Floating Animated Avatar with Crisp Edge Contour */}
        <motion.div
          ref={cardRef}
          animate={{
            y: [0, -8, 0],
            scale: isHovered ? 1.08 : 1,
            filter: isHovered
              ? "drop-shadow(0 0 1.5px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 3px rgba(244, 63, 94, 0.95)) drop-shadow(0 0 16px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 28px rgba(244, 63, 94, 0.5))"
              : "drop-shadow(0 0 1px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 2px rgba(244, 63, 94, 0.85)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.55)) drop-shadow(0 0 20px rgba(244, 63, 94, 0.3))",
          }}
          transition={{
            y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.2, ease: "easeOut" },
            filter: { duration: 0.25 },
          }}
          style={{
            position: "relative",
            width: "58px",
            cursor: "pointer",
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pixy.png"
            alt="Pixy AI Companion"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
            }}
            draggable={false}
          />
        </motion.div>
      </Link>
    </aside>
  );
}
