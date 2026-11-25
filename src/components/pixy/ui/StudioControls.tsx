"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Copy, Volume2, VolumeX } from "lucide-react";

export type PixyAutonomousGesture =
  | "wave"
  | "wink"
  | "spin"
  | "hurray"
  | "vibe"
  | "nod"
  | "tickle";

/* ------------------------------------------------------------------ */
/*  1. Sharp High-Contrast Option Pills + Pill-Hover Gaze Target      */
/* ------------------------------------------------------------------ */

export function StudioOptionPills({
  options,
  onSelect,
  onHoverSfx,
  onPillHoverNDC,
  showCopyEmailPill = false,
  onCopyEmailSfx,
}: {
  options: string[];
  onSelect: (option: string) => void;
  onHoverSfx?: () => void;
  onPillHoverNDC?: (ndc: { x: number; y: number } | null) => void;
  showCopyEmailPill?: boolean;
  onCopyEmailSfx?: () => void;
}) {
  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    onHoverSfx?.();
    if (onPillHoverNDC && typeof window !== "undefined") {
      const r = e.currentTarget.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.5;
      onPillHoverNDC({
        x: (cx / (window.innerWidth || 1)) * 2 - 1,
        y: -((cy / (window.innerHeight || 1)) * 2 - 1),
      });
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2.5 sm:gap-3"
      onMouseLeave={() => onPillHoverNDC?.(null)}
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onMouseEnter={handleEnter}
          onClick={() => {
            onPillHoverNDC?.(null);
            onSelect(opt);
          }}
          className="pixy-studio-pill"
        >
          {opt}
        </button>
      ))}

      {showCopyEmailPill && <CopyEmailGhostPill onCopySfx={onCopyEmailSfx} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Copy-Email Ghost Pill (hello@pixenox.com)                      */
/* ------------------------------------------------------------------ */

export function CopyEmailGhostPill({ onCopySfx }: { onCopySfx?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("hello@pixenox.com");
    } catch {
      const el = document.createElement("textarea");
      el.value = "hello@pixenox.com";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    onCopySfx?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="pixy-ghost-email-pill group"
      aria-label="Copy hello@pixenox.com to clipboard"
    >
      <span className="text-white/65 group-hover:text-black/70 transition-none">
        {copied ? "Copied" : "Contact"}
      </span>
      <span className="font-medium underline decoration-white/40 underline-offset-4 group-hover:decoration-black/50 transition-none">
        hello@pixenox.com
      </span>
      {copied ? (
        <Check size={13} strokeWidth={2.5} className="shrink-0" />
      ) : (
        <Copy size={13} strokeWidth={2} className="shrink-0 opacity-80" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Bottom-Left Circular Back (←) Button                           */
/* ------------------------------------------------------------------ */

export function CircularBackButton({
  visible,
  onClick,
  onHoverSfx,
}: {
  visible: boolean;
  onClick: () => void;
  onHoverSfx?: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.84 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.84 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClick}
          onMouseEnter={onHoverSfx}
          aria-label="Previous step"
          title="Go back"
          className="fixed bottom-7 left-16 sm:bottom-8 sm:left-20 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-[#120e1e]/85 text-white backdrop-blur-xl transition-colors duration-75 hover:border-white hover:bg-white hover:text-[#0b0912] cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Bottom-Right Vertical Sliding Sound Toggle Pill                */
/* ------------------------------------------------------------------ */

export function VerticalSoundToggle({
  enabled,
  audioUnlocked = true,
  onToggle,
  onUnlock,
}: {
  enabled: boolean;
  audioUnlocked?: boolean;
  onToggle: () => void;
  onUnlock?: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-12 z-40 flex flex-col items-end sm:items-center gap-2">
      {enabled && !audioUnlocked && (
        <button
          type="button"
          onClick={onUnlock}
          className="mb-0.5 cursor-pointer rounded-full border border-[#a855f7]/60 bg-[#0d0916]/90 px-3 py-1 font-mono text-[10px] tracking-wider text-[#e9d5ff] shadow-[0_0_18px_rgba(168,85,247,0.32)] transition-colors hover:border-white hover:text-white animate-pulse select-none"
        >
          Tap anywhere for voice
        </button>
      )}
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 select-none">
        {enabled ? "Sound" : "Muted"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? "Mute Pixy audio" : "Enable Pixy audio"}
        onClick={onToggle}
        className={`relative flex h-[76px] w-11 flex-col items-center rounded-full border p-1.5 backdrop-blur-xl transition-colors duration-200 cursor-pointer ${enabled
          ? "border-[#8b5cf6]/60 bg-[#0f0d1c]/85 shadow-[0_0_28px_rgba(124,58,237,0.28)]"
          : "border-white/25 bg-[#0f0d1c]/80 hover:border-white/50"
          }`}
      >
        <span
          className={`mt-1.5 h-1 w-1 rounded-full transition-opacity ${enabled ? "opacity-0" : "bg-white/30 opacity-100"
            }`}
        />
        <span
          className={`mt-auto mb-1.5 h-1 w-1 rounded-full transition-opacity ${enabled ? "bg-[#8b5cf6]/60 opacity-100" : "opacity-0"
            }`}
        />

        <motion.div
          animate={{ y: enabled ? 0 : 32 }}
          transition={{ type: "spring", stiffness: 460, damping: 30 }}
          className={`absolute top-1.5 flex h-8 w-8 items-center justify-center rounded-full ${enabled
            ? "bg-white text-[#050507] shadow-[0_0_16px_rgba(139,92,246,0.65)]"
            : "bg-white/15 text-white/75"
            }`}
        >
          {enabled ? <Volume2 size={15} strokeWidth={2.3} /> : <VolumeX size={15} strokeWidth={2.1} />}
        </motion.div>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  5. Bottom-Edge Linear Progress Bar                                */
/* ------------------------------------------------------------------ */

export function BottomLinearProgress({ progress }: { progress: number }) {
  const clamped = Math.max(0.04, Math.min(1, progress));
  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 h-[2px] bg-white/[0.10]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      aria-label="Conversation progress"
    >
      <motion.div
        className="relative h-full origin-left bg-gradient-to-r from-[#7e22ce] via-[#c048b8] to-[#ffffff]"
        initial={{ scaleX: 0.08 }}
        animate={{ scaleX: clamped }}
        transition={{ type: "spring", stiffness: 120, damping: 24 }}
      >
        <span className="absolute right-0 top-1/2 h-1.5 w-8 -translate-y-1/2 rounded-full bg-[#d8b4fe] blur-[4px]" />
      </motion.div>
    </div>
  );
}
