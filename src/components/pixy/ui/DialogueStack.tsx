"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SpeechPlaybackHandle } from "../audio/usePixyAudio";

export interface DialogueStackProps {
  /** Previous line shown blurred & shifted above the active line */
  previousLine: string | null;
  /** Current line being typed out in the active slot */
  activeLine: string;
  /** Unique key per active utterance */
  lineKey: string;
  /** Whether Groq or Kokoro is preparing the utterance */
  isThinking: boolean;
  /** Hardware-clock speech playback handle (null while TTS buffer is preparing) */
  playbackHandle: SpeechPlaybackHandle | null;
  /** Called per revealed character so phonetic visemes animate even when muted */
  onCharacterTyped?: (char: string) => void;
  /** Called once the active line finishes typing */
  onTypingComplete?: () => void;
}

/**
 * Builds normalized [0..1] reveal thresholds for every character in `text`,
 * giving natural prosody pauses on commas, periods, question marks, and dashes
 * so text reveal matches Kokoro's spoken rhythm word-for-word!
 */
function buildNormalizedCharTimeline(text: string): number[] {
  const n = text.length;
  if (n === 0) return [];
  if (n === 1) return [0];

  const weights: number[] = [];
  for (let i = 0; i < n; i++) {
    const ch = text[i];
    if (/[.!?]/.test(ch)) weights.push(6.5);
    else if (/[,;:]/.test(ch)) weights.push(3.6);
    else if (ch === "—" || ch === "–" || ch === "-") weights.push(2.8);
    else if (ch === " ") weights.push(1.25);
    else weights.push(1.0);
  }

  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const thresholds: number[] = [];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    thresholds.push(acc / total);
    acc += weights[i];
  }
  return thresholds;
}

export function DialogueStack({
  previousLine,
  activeLine,
  lineKey,
  isThinking,
  playbackHandle,
  onCharacterTyped,
  onTypingComplete,
}: DialogueStackProps) {
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const onCompleteRef = useRef(onTypingComplete);
  const onCharRef = useRef(onCharacterTyped);
  useEffect(() => {
    onCompleteRef.current = onTypingComplete;
    onCharRef.current = onCharacterTyped;
  }, [onTypingComplete, onCharacterTyped]);

  const charTimeline = useMemo(
    () => buildNormalizedCharTimeline(activeLine),
    [activeLine]
  );

  useEffect(() => {
    if (isThinking || !activeLine || !playbackHandle) {
      setDisplayed("");
      setIsTyping(false);
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let lastCount = 0;

    setDisplayed("");
    setIsTyping(true);

    const len = activeLine.length;
    // In silent mode, pace at natural reading/speaking cadence (~38ms per char clamped 1.1s..3.8s)
    const silentDurationMs = Math.min(3800, Math.max(1050, len * 34));
    const silentStart = performance.now();

    const tick = () => {
      if (cancelled) return;

      let progress = 0;
      if (playbackHandle.mode === "audio" && playbackHandle.duration > 0.1) {
        // Lead hardware audio by ~3% so the word lands right as the phoneme hits your ear!
        progress = Math.min(1, playbackHandle.getProgress() * 1.04);
      } else {
        progress = Math.min(1, (performance.now() - silentStart) / silentDurationMs);
      }

      // Binary/linear advance to character count matching current progress
      let nextCount = lastCount;
      while (nextCount < len && charTimeline[nextCount] <= progress) {
        nextCount++;
      }

      if (nextCount > lastCount) {
        for (let k = lastCount; k < nextCount; k++) {
          onCharRef.current?.(activeLine[k]);
        }
        lastCount = nextCount;
        setDisplayed(activeLine.slice(0, nextCount));
      }

      if (nextCount >= len) {
        setIsTyping(false);
        onCompleteRef.current?.();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [activeLine, lineKey, isThinking, playbackHandle, charTimeline]);

  const showThinkingState = isThinking || (Boolean(activeLine) && !playbackHandle);

  return (
    <div className="relative flex w-full flex-col justify-end select-none">
      {/* SLOT 1: Previous Line — smoothly shifts upward & blurs into studio depth */}
      <div className="min-h-[2.4rem] sm:min-h-[3.1rem] overflow-hidden mb-2 sm:mb-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {previousLine && (
            <motion.p
              key={previousLine}
              initial={{ opacity: 0.85, y: 18, filter: "blur(0px)" }}
              animate={{ opacity: 0.38, y: 0, filter: "blur(4px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(9px)" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="pixy-dialogue-prev text-lg sm:text-[22px] lg:text-[25px] leading-[1.32] tracking-[-0.015em] text-white/80"
              aria-hidden="true"
            >
              {previousLine}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* SLOT 2: Active Prompt — crisp high-contrast editorial typography + solid blinking cursor block */}
      <div className="min-h-[4.2rem] sm:min-h-[5.4rem]" aria-live="polite">
        {showThinkingState ? (
          <div className="flex items-center gap-2.5 py-1">
            <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#d8b4fe]">
              Pixy is computing
            </span>
            <span className="pixy-cursor-block" aria-hidden="true" />
          </div>
        ) : (
          <p className="pixy-dialogue-active text-[22px] sm:text-[28px] lg:text-[32px] font-normal leading-[1.28] tracking-[-0.02em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]">
            <span>{displayed}</span>
            <span
              className={`pixy-cursor-block ${isTyping ? "is-typing" : ""}`}
              aria-hidden="true"
            />
          </p>
        )}
      </div>
    </div>
  );
}
