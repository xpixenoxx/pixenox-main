"use client";

import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface PixyMessageProps {
  message: string;
  messageKey: string;
  /** When true, characters stay hidden until audio begins playing. */
  paused?: boolean;
  /** Actual audio duration (seconds). When provided, the reveal is
   *  distributed across this duration with punctuation-aware weighting.
   *  When omitted, the original fixed-duration stagger is used. */
  revealDuration?: number;
}

/**
 * Target duration (seconds) for the entire text to finish revealing.
 * This is tuned to roughly match average TTS speech rate.
 */
const TARGET_REVEAL_S = 3.2;
const MIN_STAGGER = 0.018; // fastest per-char delay (very long messages)
const MAX_STAGGER = 0.06;  // slowest per-char delay (very short messages)
const CHAR_TRANSITION_S = 0.35;

/* ------------------------------------------------------------------ */
/*  Delay computation                                                  */
/* ------------------------------------------------------------------ */

/** Weight for the pause AFTER a character based on punctuation type. */
function punctuationWeight(ch: string): number {
  if (/[.!?]/.test(ch)) return 5;   // sentence-ending → long pause
  if (/[,;:]/.test(ch))  return 3;   // clause-level → medium pause
  if (/[…–—]/.test(ch))  return 2;   // dash/ellipsis → slight pause
  return 1;
}

/**
 * Builds per-character cumulative delay arrays.
 *
 * When `audioDuration` is provided the total reveal is stretched to match
 * the audio, with extra weight on gaps after punctuation so text pauses
 * where speech naturally pauses.
 *
 * When `audioDuration` is undefined the original uniform-stagger logic
 * (with MIN/MAX clamping) is preserved exactly.
 */
function computeCharDelays(
  words: string[],
  audioDuration: number | undefined,
): number[] {
  const flat: string[] = [];
  for (const w of words) for (const ch of w) flat.push(ch);
  if (flat.length === 0) return [];
  if (flat.length === 1) return [0];

  /* ---- voice-off path: original uniform stagger with clamping ---- */
  if (audioDuration === undefined) {
    const stagger = Math.min(
      MAX_STAGGER,
      Math.max(MIN_STAGGER, TARGET_REVEAL_S / Math.max(flat.length, 1)),
    );
    return flat.map((_, i) => i * stagger);
  }

  /* ---- voice-on path: punctuation-weighted distribution ---------- */
  // Gap weights: weight[i] controls how long after char i before char i+1.
  // The last character has no following gap.
  const gapWeights = flat.slice(0, -1).map((ch) => punctuationWeight(ch));
  const totalWeight = gapWeights.reduce((a, b) => a + b, 0) || 1;

  // Budget = total duration minus one character's transition time so the
  // last character finishes fading in right as the audio ends.
  const staggerBudget = Math.max(0, audioDuration - CHAR_TRANSITION_S);

  const delays: number[] = [0];
  let cumulative = 0;
  for (const w of gapWeights) {
    cumulative += (w / totalWeight) * staggerBudget;
    delays.push(cumulative);
  }
  return delays;
}

/* ------------------------------------------------------------------ */
/*  Framer-motion variants                                             */
/* ------------------------------------------------------------------ */

const charVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(6px)",
  },
  show: (delay: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: CHAR_TRANSITION_S,
      ease: "easeOut" as const,
      delay,
    },
  }),
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PixyMessage({
  message,
  messageKey,
  paused = false,
  revealDuration,
}: PixyMessageProps) {
  const words = useMemo(() => message.split(" "), [message]);

  const delays = useMemo(
    () => computeCharDelays(words, revealDuration),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [words, revealDuration],
  );

  const containerVar = useMemo(
    () => ({
      hidden: { opacity: 1 },
      show: { opacity: 1 },
      exit: {
        opacity: 0,
        y: -8,
        transition: { duration: 0.35, ease: "easeOut" as const },
      },
    }),
    [],
  );

  let flatIdx = 0;

  return (
    <div className="relative min-h-[4.5rem] px-2 text-center sm:min-h-[3.75rem]">
      <AnimatePresence mode="wait">
        <motion.p
          key={messageKey}
          variants={containerVar}
          initial="hidden"
          animate={paused ? "hidden" : "show"}
          exit="exit"
          className="font-speech text-2xl font-bold tracking-tight leading-snug text-text-primary sm:text-4xl"
        >
          {words.map((word, wIdx) => {
            return (
              <React.Fragment key={wIdx}>
                {/* Wrapping each word ensures we never break mid-word and cause layout shifts */}
                <span className="inline-block whitespace-nowrap">
                  {word.split("").map((char, cIdx) => {
                    const d = delays[flatIdx] ?? 0;
                    flatIdx++;
                    return (
                      <motion.span
                        key={cIdx}
                        custom={d}
                        variants={charVariants}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                </span>
                {wIdx !== words.length - 1 && " "}
              </React.Fragment>
            );
          })}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
