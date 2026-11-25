"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PixyVisemeFrame {
  /** Overall normalized speech energy 0..1 */
  energy: number;
  /** Open mid/low vowel "Ah / A / Ay" jaw-drop weight 0..1 */
  aa: number;
  /** Rounded back vowel / glide "Oh / Oo / U / W" 3D pucker weight 0..1 */
  oh: number;
  /** Spread front vowel / sibilant "Ee / I / S / Z / Sh" dental-slit weight 0..1 */
  ee: number;
  /** Bilabial lip-press seal "M / B / P" weight 0..1 */
  mbp: number;
  /** Labiodental lower-lip tuck "F / V" weight 0..1 */
  fv: number;
  /** Alveolar / dental tongue-tip flick "L / N / T / D / Th" weight 0..1 */
  th: number;
}

export interface SpeechPlaybackHandle {
  /** "audio" when real Web Audio buffer is playing; "silent" when muted / autoplay-locked / offline */
  mode: "audio" | "silent";
  /** Exact audio duration in seconds (0 in silent mode) */
  duration: number;
  /** Hardware-clock normalized playback progress 0..1 */
  getProgress: () => number;
  /** Resolves when audio playback finishes */
  done: Promise<void>;
}

export interface UsePixyAudioOptions {
  defaultEnabled?: boolean;
  stageElementRef?: React.RefObject<HTMLElement | null>;
}

interface PhonemeKeyframe {
  t: number; // normalized [0..1] within trimmed active speech span!
  aa: number;
  oh: number;
  ee: number;
  mbp: number;
  fv: number;
  th: number;
}

interface AcousticAnalysis {
  fps: number;
  speechStartSec: number;
  speechEndSec: number;
  /** Normalized syllable loudness 0..1 */
  amp: Float32Array;
  /** Zero-crossing rate 0..1 (high on fricatives/sibilants S, Sh, F, Th, T) */
  zcr: Float32Array;
  /** Low-frequency (<820 Hz) energy ratio 0..1 (high on rounded O, Oo, U, W; low on bright Ee, I) */
  lowRatio: Float32Array;
  /** Rapid inter-syllable consonant closure dip 0..1 */
  valleyDip: Float32Array;
}

function stripUnspokenChars(text: string): string {
  return text
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * High-resolution 120Hz acoustic formant, ZCR, syllable-valley, and onset/offset analyzer
 * operating directly on the decoded Kokoro 24kHz PCM buffer (< 1.5ms per sentence).
 */
function analyzeSpeechAudio(audioBuffer: AudioBuffer, fps = 120): AcousticAnalysis {
  const ch = audioBuffer.getChannelData(0);
  const sr = audioBuffer.sampleRate || 24000;
  const step = Math.max(1, Math.floor(sr / fps));
  const frames = Math.max(1, Math.ceil(ch.length / step));

  const rawRms = new Float32Array(frames);
  const zcr = new Float32Array(frames);
  const lowRatio = new Float32Array(frames);

  // 1-pole lowpass filter around ~820 Hz to separate rounded back-vowel F1/F2 from bright front F2!
  const alphaLow = 1 - Math.exp((-2 * Math.PI * 820) / sr);
  let lp = 0;

  for (let i = 0; i < frames; i++) {
    const start = i * step;
    const end = Math.min(ch.length, start + step);
    const len = Math.max(1, end - start);
    let sumSq = 0;
    let lowSq = 0;
    let crossings = 0;
    let prev = ch[start] || 0;

    for (let j = start; j < end; j++) {
      const s = ch[j];
      sumSq += s * s;
      lp += alphaLow * (s - lp);
      lowSq += lp * lp;
      if ((s >= 0 && prev < 0) || (s < 0 && prev >= 0)) {
        crossings += 1;
      }
      prev = s;
    }

    const totalRms = Math.sqrt(sumSq / len);
    const lRms = Math.sqrt(lowSq / len);
    rawRms[i] = totalRms;
    // Normalize ZCR against ~38% of Nyquist (typical peak sibilant ZCR at 24kHz)
    zcr[i] = Math.min(1, crossings / len / 0.38);
    lowRatio[i] = totalRms > 0.003 ? Math.min(1, lRms / totalRms) : 0.55;
  }

  // Normalize RMS by 92nd-percentile voiced peak
  const voiced = Array.from(rawRms)
    .filter((v) => v > 0.008)
    .sort((a, b) => a - b);
  const peak = voiced.length > 0 ? voiced[Math.floor(voiced.length * 0.92)] : 0.15;
  const normDenom = Math.max(0.035, peak);

  const amp = new Float32Array(frames);
  let firstActive = -1;
  let lastActive = -1;

  for (let i = 0; i < frames; i++) {
    const gated = Math.max(0, rawRms[i] - 0.009);
    const a = Math.min(1, Math.pow(gated / normDenom, 0.82));
    amp[i] = a;

    const isSpeech = a > 0.035 || (rawRms[i] > 0.006 && zcr[i] > 0.32);
    if (isSpeech) {
      if (firstActive === -1) firstActive = i;
      lastActive = i;
    }
  }

  // Detect rapid consonant constriction valleys between adjacent syllable peaks (±58ms window)
  const valleyDip = new Float32Array(frames);
  const win = Math.max(2, Math.round(fps * 0.058));
  for (let i = 0; i < frames; i++) {
    let maxBefore = 0;
    let maxAfter = 0;
    for (let k = Math.max(0, i - win); k < i; k++) {
      if (amp[k] > maxBefore) maxBefore = amp[k];
    }
    for (let k = i + 1; k <= Math.min(frames - 1, i + win); k++) {
      if (amp[k] > maxAfter) maxAfter = amp[k];
    }
    const surround = Math.min(maxBefore, maxAfter);
    if (surround > 0.16 && surround > amp[i]) {
      valleyDip[i] = Math.min(1, (surround - amp[i]) / Math.max(0.18, surround));
    }
  }

  const totalDur = Math.max(0.05, audioBuffer.duration);
  const speechStartSec =
    firstActive >= 0 ? Math.max(0, firstActive / fps - 0.025) : 0;
  const speechEndSec =
    lastActive >= 0
      ? Math.min(totalDur, Math.max(speechStartSec + 0.08, lastActive / fps + 0.035))
      : totalDur;

  return { fps, speechStartSec, speechEndSec, amp, zcr, lowRatio, valleyDip };
}

/**
 * English digraph & silent-'e' aware grapheme-to-viseme timeline builder.
 * Maps spoken phonemes cleanly onto [0..1] of the trimmed speech span [speechStartSec..speechEndSec].
 */
function buildDigraphPhonemeTimeline(text: string): PhonemeKeyframe[] {
  interface RawUnit {
    dur: number;
    aa: number;
    oh: number;
    ee: number;
    mbp: number;
    fv: number;
    th: number;
  }

  const units: RawUnit[] = [];
  const push = (
    dur: number,
    v: Partial<Omit<RawUnit, "dur">>
  ) => {
    units.push({
      dur,
      aa: v.aa ?? 0,
      oh: v.oh ?? 0,
      ee: v.ee ?? 0,
      mbp: v.mbp ?? 0,
      fv: v.fv ?? 0,
      th: v.th ?? 0,
    });
  };

  const lower = text.toLowerCase();
  const len = lower.length;
  let i = 0;

  // Helper: check if `i` is a silent word-final 'e' (e.g. "make", "like", "time", "before")
  const isSilentFinalE = (idx: number): boolean => {
    if (lower[idx] !== "e") return false;
    const nextCh = lower[idx + 1] ?? " ";
    if (/[a-z]/.test(nextCh)) return false;
    // Measure word length backwards
    let wStart = idx;
    while (wStart > 0 && /[a-z']/.test(lower[wStart - 1])) wStart--;
    const word = lower.slice(wStart, idx + 1);
    if (word.length <= 3 && !["are", "one", "use", "ice", "age", "eye"].includes(word)) {
      return false; // "the", "she", "we", "me", "be", "he" -> voiced vowel!
    }
    const prev = lower[idx - 1] ?? "";
    if ("aeiouy".includes(prev)) return false;
    return true;
  };

  while (i < len) {
    const ch = lower[i];
    const two = lower.slice(i, i + 2);
    const three = lower.slice(i, i + 3);

    // Punctuation & word pauses
    if (/[.!?]/.test(ch)) {
      push(5.2, {});
      i += 1;
      continue;
    }
    if (/[,;:]/.test(ch)) {
      push(3.2, {});
      i += 1;
      continue;
    }
    if (ch === "—" || ch === "–" || ch === "-") {
      push(2.2, {});
      i += 1;
      continue;
    }
    if (!/[a-z]/.test(ch)) {
      if (ch === " ") push(0.65, {});
      i += 1;
      continue;
    }

    // Silent trailing 'e'
    if (isSilentFinalE(i)) {
      i += 1;
      continue;
    }

    // 3-letter clusters
    if (three === "tch" || three === "dge") {
      push(1.1, { ee: 0.72, oh: 0.22 });
      i += 3;
      continue;
    }
    if (three === "igh") {
      push(0.95, { aa: 0.92 });
      push(0.65, { ee: 0.85 });
      i += 3;
      continue;
    }
    if (three === "ing") {
      push(0.9, { ee: 0.82, aa: 0.18 });
      push(0.7, { th: 0.45, aa: 0.22 });
      i += 3;
      continue;
    }

    // 2-letter vowel & consonant digraphs
    if (two === "oo" || two === "ew" || two === "ue" || two === "ui") {
      push(1.5, { oh: 0.98 });
      i += 2;
      continue;
    }
    if (two === "ou" || two === "ow") {
      push(0.85, { aa: 0.88 });
      push(0.85, { oh: 0.95 });
      i += 2;
      continue;
    }
    if (two === "oi" || two === "oy") {
      push(0.85, { oh: 0.90 });
      push(0.85, { ee: 0.88 });
      i += 2;
      continue;
    }
    if (two === "ai" || two === "ay" || two === "ey" || two === "ei") {
      push(0.8, { aa: 0.68, ee: 0.35 });
      push(0.8, { ee: 0.90 });
      i += 2;
      continue;
    }
    if (two === "ee" || two === "ea" || two === "ie") {
      push(1.45, { ee: 0.95, aa: 0.12 });
      i += 2;
      continue;
    }
    if (two === "au" || two === "aw" || two === "oa") {
      push(1.45, { oh: 0.88, aa: 0.45 });
      i += 2;
      continue;
    }
    if (two === "qu" || two === "wh") {
      push(1.2, { oh: 0.96 });
      i += 2;
      continue;
    }
    if (two === "sh" || two === "ch") {
      push(1.1, { ee: 0.72, oh: 0.28 });
      i += 2;
      continue;
    }
    if (two === "th") {
      push(1.05, { th: 0.98, aa: 0.14 });
      i += 2;
      continue;
    }
    if (two === "ph") {
      push(1.05, { fv: 0.98 });
      i += 2;
      continue;
    }
    if (two === "mm" || two === "bb" || two === "pp" || two === "mp" || two === "mb") {
      push(1.15, { mbp: 1.0 });
      i += 2;
      continue;
    }
    if (two === "ff" || two === "vv") {
      push(1.05, { fv: 0.98 });
      i += 2;
      continue;
    }
    if (two === "ll" || two === "nn" || two === "tt" || two === "dd") {
      push(0.95, { th: 0.90, aa: 0.15 });
      i += 2;
      continue;
    }
    if (two === "ss" || two === "zz" || two === "ce" || two === "ci") {
      if (two === "ce" && isSilentFinalE(i + 1)) {
        push(0.95, { ee: 0.68 });
        i += 2;
        continue;
      }
      if (two === "ss" || two === "zz") {
        push(0.95, { ee: 0.68 });
        i += 2;
        continue;
      }
    }
    if (two === "ck" || two === "ng") {
      push(0.85, { aa: 0.30, ee: 0.20 });
      i += 2;
      continue;
    }

    // Single letters (including magic-e long vowels like a_e, i_e, o_e, u_e!)
    const hasMagicE =
      i + 2 < len &&
      !"aeiouy".includes(lower[i + 1]) &&
      isSilentFinalE(i + 2);

    if (ch === "m" || ch === "b" || ch === "p") {
      push(1.05, { mbp: 1.0 });
    } else if (ch === "f" || ch === "v") {
      push(1.0, { fv: 0.96 });
    } else if (ch === "l" || ch === "n" || ch === "t" || ch === "d") {
      push(0.88, { th: 0.88, aa: 0.14 });
    } else if (ch === "w") {
      push(1.0, { oh: 0.96 });
    } else if (ch === "r") {
      push(0.85, { oh: 0.44, aa: 0.25 });
    } else if (ch === "s" || ch === "z" || ch === "x") {
      push(0.9, { ee: 0.68 });
    } else if (ch === "c") {
      const next = lower[i + 1] ?? "";
      if ("eiy".includes(next)) push(0.9, { ee: 0.68 });
      else push(0.8, { aa: 0.34, ee: 0.16 });
    } else if (ch === "a") {
      if (hasMagicE) {
        push(0.75, { aa: 0.68, ee: 0.35 });
        push(0.7, { ee: 0.88 });
      } else {
        push(1.35, { aa: 0.98 });
      }
    } else if (ch === "i") {
      if (hasMagicE) {
        push(0.8, { aa: 0.92 });
        push(0.65, { ee: 0.86 });
      } else {
        push(1.2, { ee: 0.84, aa: 0.26 });
      }
    } else if (ch === "o") {
      push(1.35, { oh: 0.94, aa: hasMagicE ? 0.12 : 0.28 });
    } else if (ch === "u") {
      if (hasMagicE) push(1.3, { oh: 0.95 });
      else push(1.2, { aa: 0.68, oh: 0.38 });
    } else if (ch === "e") {
      push(1.15, { ee: 0.82, aa: 0.28 });
    } else if (ch === "y") {
      push(1.0, { ee: 0.88, aa: 0.18 });
    } else {
      // k, g, h, j
      push(0.8, { aa: 0.36, ee: 0.18 });
    }

    i += 1;
  }

  const totalDur = units.reduce((acc, u) => acc + u.dur, 0) || 1;
  const frames: PhonemeKeyframe[] = [];
  let acc = 0;
  for (const u of units) {
    const midT = (acc + u.dur * 0.5) / totalDur;
    frames.push({
      t: midT,
      aa: u.aa,
      oh: u.oh,
      ee: u.ee,
      mbp: u.mbp,
      fv: u.fv,
      th: u.th,
    });
    acc += u.dur;
  }
  return frames;
}

function sampleFloatTrack(arr: Float32Array, progress01: number): number {
  if (arr.length === 0) return 0;
  const idxFloat = Math.max(0, Math.min(arr.length - 1, progress01 * (arr.length - 1)));
  const i0 = Math.floor(idxFloat);
  const i1 = Math.min(arr.length - 1, i0 + 1);
  const frac = idxFloat - i0;
  return arr[i0] * (1 - frac) + arr[i1] * frac;
}

function samplePhoneme(
  frames: PhonemeKeyframe[],
  progress: number
): Omit<PhonemeKeyframe, "t"> {
  if (frames.length === 0) {
    return { aa: 0, oh: 0, ee: 0, mbp: 0, fv: 0, th: 0 };
  }
  let lo = 0;
  let hi = frames.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid].t <= progress) lo = mid;
    else hi = mid - 1;
  }
  const f0 = frames[lo];
  const f1 = frames[Math.min(frames.length - 1, lo + 1)];
  const span = Math.max(0.0001, f1.t - f0.t);
  const u = Math.max(0, Math.min(1, (progress - f0.t) / span));
  // Smoothstep blend for vowels; crisp peak retention for rapid consonant closures (mbp, fv, th)
  const su = u * u * (3 - 2 * u);
  return {
    aa: f0.aa * (1 - su) + f1.aa * su,
    oh: f0.oh * (1 - su) + f1.oh * su,
    ee: f0.ee * (1 - su) + f1.ee * su,
    mbp: Math.max(f0.mbp * Math.max(0, 1 - u * 1.25), f1.mbp * Math.max(0, (u - 0.2) * 1.25)),
    fv: Math.max(f0.fv * Math.max(0, 1 - u * 1.2), f1.fv * Math.max(0, (u - 0.15) * 1.18)),
    th: f0.th * (1 - su) + f1.th * su,
  };
}

export function usePixyAudio({
  defaultEnabled = true,
  stageElementRef,
}: UsePixyAudioOptions = {}) {
  const [soundEnabled, setSoundEnabled] = useState(defaultEnabled);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const soundEnabledRef = useRef(defaultEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const visemeRef = useRef<PixyVisemeFrame>({
    energy: 0,
    aa: 0,
    oh: 0,
    ee: 0,
    mbp: 0,
    fv: 0,
    th: 0,
  });
  const energyRef = useRef(0);

  /** Synthetic viseme fallback used ONLY when Sound is muted or before user's first click */
  const syntheticVisemeRef = useRef<PixyVisemeFrame>({
    energy: 0,
    aa: 0,
    oh: 0,
    ee: 0,
    mbp: 0,
    fv: 0,
    th: 0,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  /** Active hardware-clocked acoustic + digraph phoneme lip-sync track */
  const activeLipTrackRef = useRef<{
    startCtxTime: number;
    duration: number;
    acoustic: AcousticAnalysis;
    phonemes: PhonemeKeyframe[];
  } | null>(null);

  const prefetchCacheRef = useRef<Map<string, ArrayBuffer>>(new Map());
  const inFlightMapRef = useRef<Map<string, Promise<ArrayBuffer | null>>>(new Map());
  const serialQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  const sessionCounterRef = useRef(0);
  const isPlayingRealAudioRef = useRef(false);
  const blockedLineRef = useRef<string | null>(null);

  const ensureAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return null;
      const ctx = new Ctx();
      const masterGain = ctx.createGain();
      masterGain.gain.value = 1.25;
      masterGain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;

      ctx.onstatechange = () => {
        if (ctx.state === "running") {
          setAudioUnlocked(true);
        }
      };
    }
    if (audioCtxRef.current.state === "running") {
      setAudioUnlocked(true);
    }
    return audioCtxRef.current;
  }, []);

  const stopSpeech = useCallback(() => {
    sessionCounterRef.current += 1;
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.onended = null;
        activeSourceRef.current.stop();
        activeSourceRef.current.disconnect();
      } catch {
        // Ignore
      }
      activeSourceRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
    activeLipTrackRef.current = null;
    isPlayingRealAudioRef.current = false;
  }, []);

  const fetchTtsBuffer = useCallback(async (clean: string): Promise<ArrayBuffer | null> => {
    const cached = prefetchCacheRef.current.get(clean);
    if (cached) return cached;

    const existingInFlight = inFlightMapRef.current.get(clean);
    if (existingInFlight) return existingInFlight;

    const jobPromise: Promise<ArrayBuffer | null> = serialQueueRef.current
      .catch(() => {})
      .then(async () => {
        const hit = prefetchCacheRef.current.get(clean);
        if (hit) return hit;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        try {
          const res = await fetch("/api/pixy/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: clean }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (!res.ok) return null;
          const buf = await res.arrayBuffer();
          if (buf.byteLength < 100) return null;

          if (prefetchCacheRef.current.size >= 14) {
            const oldest = prefetchCacheRef.current.keys().next().value;
            if (oldest) prefetchCacheRef.current.delete(oldest);
          }
          prefetchCacheRef.current.set(clean, buf);
          return buf;
        } catch {
          clearTimeout(timeoutId);
          return null;
        } finally {
          inFlightMapRef.current.delete(clean);
        }
      });

    inFlightMapRef.current.set(clean, jobPromise);
    serialQueueRef.current = jobPromise;
    return jobPromise;
  }, []);

  const playDecodedBuffer = useCallback(
    async (
      ctx: AudioContext,
      rawBuf: ArrayBuffer,
      cleanText: string,
      expectedSession: number
    ): Promise<SpeechPlaybackHandle> => {
      const silentHandle: SpeechPlaybackHandle = {
        mode: "silent",
        duration: 0,
        getProgress: () => 1,
        done: Promise.resolve(),
      };

      try {
        const audioBuffer = await ctx.decodeAudioData(rawBuf.slice(0));
        if (!soundEnabledRef.current || sessionCounterRef.current !== expectedSession) {
          return silentHandle;
        }

        const acoustic = analyzeSpeechAudio(audioBuffer, 120);
        const phonemes = buildDigraphPhonemeTimeline(cleanText);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(masterGainRef.current ?? ctx.destination);
        activeSourceRef.current = source;
        isPlayingRealAudioRef.current = true;

        const duration = Math.max(0.05, audioBuffer.duration);
        const startCtxTime = ctx.currentTime;

        activeLipTrackRef.current = {
          startCtxTime,
          duration,
          acoustic,
          phonemes,
        };

        const done = new Promise<void>((resolve) => {
          source.onended = () => {
            if (activeSourceRef.current === source) {
              activeSourceRef.current = null;
              activeLipTrackRef.current = null;
              isPlayingRealAudioRef.current = false;
            }
            resolve();
          };
        });

        source.start(0);

        const speechSpan = Math.max(0.08, acoustic.speechEndSec - acoustic.speechStartSec);
        return {
          mode: "audio",
          duration,
          getProgress: () => {
            if (!isPlayingRealAudioRef.current) return 1;
            const elapsed = ctx.currentTime - startCtxTime;
            // Lock DialogueStack text cursor to the actual trimmed speech span too!
            return Math.max(
              0,
              Math.min(1, (elapsed - acoustic.speechStartSec) / speechSpan)
            );
          },
          done,
        };
      } catch {
        activeLipTrackRef.current = null;
        isPlayingRealAudioRef.current = false;
        return silentHandle;
      }
    },
    []
  );

  const speakLine = useCallback(
    async (rawText: string): Promise<SpeechPlaybackHandle> => {
      stopSpeech();
      const mySession = sessionCounterRef.current;
      const clean = stripUnspokenChars(rawText);

      const silentHandle: SpeechPlaybackHandle = {
        mode: "silent",
        duration: 0,
        getProgress: () => 1,
        done: Promise.resolve(),
      };

      if (!clean || !soundEnabledRef.current) {
        return silentHandle;
      }

      const ctx = ensureAudioContext();
      if (!ctx) return silentHandle;

      if (ctx.state === "suspended") {
        const hasActivation =
          typeof navigator !== "undefined" &&
          (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
            .userActivation?.hasBeenActive;

        if (hasActivation) {
          try {
            await Promise.race([
              ctx.resume().catch(() => {}),
              new Promise((r) => setTimeout(r, 300)),
            ]);
          } catch {
            // Ignore
          }
        }
      }

      if (ctx.state !== "running") {
        blockedLineRef.current = clean;
        void fetchTtsBuffer(clean);
        return silentHandle;
      }

      const rawBuf = await fetchTtsBuffer(clean);
      if (!soundEnabledRef.current || sessionCounterRef.current !== mySession) {
        return silentHandle;
      }

      if (!rawBuf) {
        // Fallback to native Web Speech API if Kokoro TTS is ever unreachable so Pixy is NEVER silent!
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(clean);
            utter.lang = "en-US";
            utter.rate = 1.04;
            utter.pitch = 1.02;
            const voices = window.speechSynthesis.getVoices();
            const preferred =
              voices.find((v) => /Aria|Jenny|Zira|Samantha|Google US English/i.test(v.name)) ||
              voices.find((v) => v.lang.startsWith("en"));
            if (preferred) utter.voice = preferred;

            const estDur = Math.max(1.1, Math.min(5.0, clean.length * 0.055));
            const startMs = performance.now();
            const done = new Promise<void>((resolve) => {
              const safetyTimer = setTimeout(resolve, estDur * 1000 + 1200);
              utter.onend = () => {
                clearTimeout(safetyTimer);
                resolve();
              };
              utter.onerror = () => {
                clearTimeout(safetyTimer);
                resolve();
              };
            });
            window.speechSynthesis.speak(utter);
            blockedLineRef.current = null;
            setAudioUnlocked(true);
            return {
              mode: "silent", // Lets DialogueStack drive pulseSyllable lip-sync cleanly!
              duration: estDur,
              getProgress: () => Math.min(1, (performance.now() - startMs) / (estDur * 1000)),
              done,
            };
          } catch {
            return silentHandle;
          }
        }
        return silentHandle;
      }

      blockedLineRef.current = null;
      setAudioUnlocked(true);
      return playDecodedBuffer(ctx, rawBuf, clean, mySession);
    },
    [ensureAudioContext, fetchTtsBuffer, playDecodedBuffer, stopSpeech]
  );

  const unlockAudio = useCallback(
    (replayBlockedIfIdle = false) => {
      const ctx = ensureAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx
          .resume()
          .then(() => {
            setAudioUnlocked(true);
            if (
              replayBlockedIfIdle &&
              soundEnabledRef.current &&
              blockedLineRef.current &&
              !isPlayingRealAudioRef.current
            ) {
              const pending = blockedLineRef.current;
              blockedLineRef.current = null;
              const sess = sessionCounterRef.current;
              void fetchTtsBuffer(pending).then((buf) => {
                if (
                  buf &&
                  soundEnabledRef.current &&
                  !isPlayingRealAudioRef.current &&
                  sessionCounterRef.current === sess
                ) {
                  void playDecodedBuffer(ctx, buf, pending, sess);
                }
              });
            }
          })
          .catch(() => {});
      } else {
        setAudioUnlocked(true);
      }
    },
    [ensureAudioContext, fetchTtsBuffer, playDecodedBuffer]
  );

  useEffect(() => {
    const onGesture = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const clickedControl = Boolean(
        target?.closest("button, a, input, textarea, form")
      );
      unlockAudio(!clickedControl);
    };
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [unlockAudio]);

  /**
   * 60fps Hardware-Clocked Multi-Band Acoustic + Digraph Phoneme Lip-Sync Driver!
   */
  useEffect(() => {
    let raf = 0;

    const tick = () => {
      let tEnergy = 0;
      let tAa = 0;
      let tOh = 0;
      let tEe = 0;
      let tMbp = 0;
      let tFv = 0;
      let tTh = 0;

      const track = activeLipTrackRef.current;
      const ctx = audioCtxRef.current;

      if (
        isPlayingRealAudioRef.current &&
        track &&
        ctx &&
        soundEnabledRef.current
      ) {
        const elapsed = ctx.currentTime - track.startCtxTime;
        const rawProgress = Math.max(0, Math.min(1, elapsed / track.duration));
        const ac = track.acoustic;
        const speechSpan = Math.max(0.08, ac.speechEndSec - ac.speechStartSec);
        const speechProgress = Math.max(
          0,
          Math.min(1, (elapsed - ac.speechStartSec) / speechSpan)
        );

        const inSpeechWindow =
          elapsed >= ac.speechStartSec - 0.015 &&
          elapsed <= ac.speechEndSec + 0.025;

        if (inSpeechWindow) {
          const pcmAmp = sampleFloatTrack(ac.amp, rawProgress);
          const zcr = sampleFloatTrack(ac.zcr, rawProgress);
          const lowRatio = sampleFloatTrack(ac.lowRatio, rawProgress);
          const valley = sampleFloatTrack(ac.valleyDip, rawProgress);
          const ph = samplePhoneme(track.phonemes, speechProgress);

          tEnergy = pcmAmp;

          // 1) Crisp Bilabial Lip Press (M / B / P): seals mouth cleanly on consonant dips!
          if (ph.mbp > 0.28) {
            tMbp = Math.min(1, ph.mbp * (0.85 + valley * 0.45) * (1.15 - pcmAmp * 0.35));
          } else if (valley > 0.62 && zcr < 0.22 && ph.fv < 0.2 && ph.th < 0.2) {
            // Real acoustic bilabial/stop closure between loud syllables!
            tMbp = Math.min(0.75, (valley - 0.45) * 1.3);
          }

          // 2) Crisp Labiodental Tuck (F / V)
          if (ph.fv > 0.25 && tMbp < 0.4) {
            tFv = Math.min(1, ph.fv * (0.85 + zcr * 0.35));
          }

          // 3) Tongue-Tip Alveolar/Dental Flick (L / N / T / D / Th)
          if (ph.th > 0.25 && tMbp < 0.35 && tFv < 0.35 && (pcmAmp > 0.03 || zcr > 0.25)) {
            tTh = Math.min(1, ph.th * (0.55 + pcmAmp * 0.65));
          }

          // 4) Real Acoustic Formant + Digraph Co-Articulated Vowels!
          if (pcmAmp > 0.032 || (zcr > 0.36 && ph.ee > 0.3)) {
            // Syllable aperture modulates naturally with real loudness & dips at real consonant valleys!
            const jawEnv =
              Math.min(1, Math.pow(pcmAmp, 0.74) * 1.26) * (1 - valley * 0.68);

            // Acoustic formant cues from real 24kHz voice spectrum:
            const acOh =
              pcmAmp > 0.06 && zcr < 0.32
                ? Math.max(0, Math.min(0.9, (lowRatio - 0.56) * 2.5))
                : 0;
            const acEe =
              pcmAmp > 0.04 || zcr > 0.35
                ? Math.max(0, Math.min(0.9, (0.53 - lowRatio) * 1.9 + zcr * 0.42))
                : 0;
            const acAa =
              pcmAmp > 0.08 && zcr < 0.38
                ? Math.max(0, Math.min(1.0, pcmAmp * 1.05 - acOh * 0.45 - acEe * 0.35))
                : 0;

            const rawOh = ph.oh * 0.68 + acOh * 0.42;
            const rawEe = ph.ee * 0.65 + acEe * 0.42;
            // Guarantee every loud voiced vowel visibly opens the mouth even if text slightly leads/lags!
            const vowelSum = ph.aa + ph.oh + ph.ee;
            const fallbackVoicedAa = vowelSum < 0.35 && tMbp < 0.3 && tFv < 0.3 ? acAa * 0.85 : 0;
            const rawAa = Math.max(ph.aa * 0.72 + acAa * 0.38, fallbackVoicedAa);

            // Prevent simultaneous AA + OH + EE muddiness by sharpened winner-bias!
            tOh = Math.min(1, rawOh * (0.35 + jawEnv * 0.85));
            tEe = Math.min(1, rawEe * (0.30 + jawEnv * 0.82) * (1 - tOh * 0.55));
            tAa = Math.min(1, rawAa * jawEnv * (1 - tOh * 0.48) * (1 - tEe * 0.32));

            // Suppress open vowels cleanly during M/B/P lip-seal or F/V lower-lip tuck!
            const sealSuppress = Math.pow(Math.max(0, 1 - tMbp * 1.15), 2) * (1 - tFv * 0.82);
            tAa *= sealSuppress;
            tOh *= sealSuppress;
            tEe *= sealSuppress * (1 - tFv * 0.5);
            tTh *= Math.max(0, 1 - tMbp) * Math.max(0, 1 - tFv);
          }
        }
      } else {
        const sv = syntheticVisemeRef.current;
        tEnergy = sv.energy;
        tAa = sv.aa;
        tOh = sv.oh;
        tEe = sv.ee;
        tMbp = sv.mbp;
        tFv = sv.fv;
        tTh = sv.th;
        sv.energy *= 0.82;
        sv.aa *= 0.76;
        sv.oh *= 0.76;
        sv.ee *= 0.76;
        sv.mbp *= 0.72;
        sv.fv *= 0.74;
        sv.th *= 0.74;
      }

      const cur = visemeRef.current;
      const smooth = (prev: number, next: number, up: number, down: number) => {
        const k = next > prev ? up : down;
        const v = prev + (next - prev) * k;
        return v < 0.003 ? 0 : v;
      };

      // Snappy consonant attack (0.80) so M/B/P, F/V, and tongue flicks NEVER blur out,
      // paired with organic elastic jaw/lip release!
      cur.energy = smooth(cur.energy, tEnergy, 0.42, 0.24);
      cur.aa = smooth(cur.aa, tAa, 0.64, 0.42);
      cur.oh = smooth(cur.oh, tOh, 0.60, 0.38);
      cur.ee = smooth(cur.ee, tEe, 0.62, 0.40);
      cur.mbp = smooth(cur.mbp, tMbp, 0.82, 0.50);
      cur.fv = smooth(cur.fv, tFv, 0.78, 0.46);
      cur.th = smooth(cur.th, tTh, 0.74, 0.44);

      energyRef.current = cur.energy;

      if (stageElementRef?.current) {
        stageElementRef.current.style.setProperty(
          "--pixy-energy",
          cur.energy.toFixed(3)
        );
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stageElementRef]);

  /** Character-level phonetic fallback ONLY when muted / autoplay-locked during Pixy's own speech */
  const pulseSyllable = useCallback((char: string) => {
    if (isPlayingRealAudioRef.current && soundEnabledRef.current) return;
    const c = char.toLowerCase();
    const sv = syntheticVisemeRef.current;
    if (c === "a") {
      sv.energy = 0.68; sv.aa = 0.92; sv.oh = 0.05; sv.ee = 0.05; sv.mbp = 0; sv.fv = 0; sv.th = 0;
    } else if ("ouqw".includes(c)) {
      sv.energy = 0.64; sv.aa = 0.08; sv.oh = 0.94; sv.ee = 0; sv.mbp = 0; sv.fv = 0; sv.th = 0;
    } else if ("eisyz".includes(c)) {
      sv.energy = 0.58; sv.aa = 0.14; sv.oh = 0; sv.ee = 0.88; sv.mbp = 0; sv.fv = 0; sv.th = 0;
    } else if ("mbp".includes(c)) {
      sv.energy = 0.25; sv.aa = 0; sv.oh = 0; sv.ee = 0; sv.mbp = 0.98; sv.fv = 0; sv.th = 0;
    } else if ("fv".includes(c)) {
      sv.energy = 0.35; sv.aa = 0; sv.oh = 0; sv.ee = 0; sv.mbp = 0; sv.fv = 0.95; sv.th = 0;
    } else if ("lntd".includes(c)) {
      sv.energy = 0.48; sv.aa = 0.15; sv.oh = 0; sv.ee = 0; sv.mbp = 0; sv.fv = 0; sv.th = 0.92;
    } else if (/[a-z0-9]/.test(c)) {
      sv.energy = Math.max(sv.energy, 0.36);
      sv.aa = Math.max(sv.aa, 0.38);
    } else {
      sv.energy *= 0.2; sv.aa = 0; sv.oh = 0; sv.ee = 0; sv.mbp = 0.32; sv.fv = 0; sv.th = 0;
    }
  }, []);

  const playSfx = useCallback(
    (
      kind:
        | "hover"
        | "click"
        | "error"
        | "delight"
        | "copy"
        | "wink"
        | "giggle"
        | "purr"
        | "spin"
    ) => {
      if (!soundEnabledRef.current) return;
      const ctx = ensureAudioContext();
      if (!ctx || ctx.state !== "running") return;

      const now = ctx.currentTime;
      if (kind === "hover") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.035);
        gain.gain.setValueAtTime(0.016, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (kind === "click" || kind === "copy") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(kind === "copy" ? 880 : 520, now);
        osc.frequency.exponentialRampToValueAtTime(
          kind === "copy" ? 1320 : 780,
          now + 0.07
        );
        gain.gain.setValueAtTime(0.042, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.085);
      } else if (kind === "wink") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(1480, now + 0.11);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (kind === "giggle") {
        [660, 880, 784, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          const t0 = now + idx * 0.065;
          osc.frequency.setValueAtTime(freq, t0);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.12, t0 + 0.05);
          gain.gain.setValueAtTime(0.04, t0);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.065);
        });
      } else if (kind === "purr") {
        [330, 495].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(freq * 1.06, now + 0.22);
          gain.gain.setValueAtTime(0.022, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.26);
        });
      } else if (kind === "spin") {
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          const t0 = now + idx * 0.05;
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.032, t0);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.3);
        });
      } else if (kind === "error") {
        [240, 175].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          const t0 = now + idx * 0.11;
          osc.frequency.setValueAtTime(freq, t0);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.86, t0 + 0.09);
          gain.gain.setValueAtTime(0.06, t0);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.10);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.11);
        });
      } else if (kind === "delight") {
        [739.99, 932.33, 1108.73].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          const t0 = now + idx * 0.055;
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.04, t0);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.58);
        });
      }
    },
    [ensureAudioContext]
  );

  const prefetchLine = useCallback(
    (rawText: string) => {
      if (!soundEnabledRef.current) return;
      const clean = stripUnspokenChars(rawText);
      if (!clean || prefetchCacheRef.current.has(clean)) return;
      void fetchTtsBuffer(clean);
    },
    [fetchTtsBuffer]
  );

  const toggleSound = useCallback(() => {
    const ctx = ensureAudioContext();
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEnabledRef.current = next;
      if (!next) {
        stopSpeech();
      } else if (ctx) {
        ctx
          .resume()
          .then(() => {
            setAudioUnlocked(true);
            if (blockedLineRef.current && !isPlayingRealAudioRef.current) {
              const pending = blockedLineRef.current;
              blockedLineRef.current = null;
              const sess = sessionCounterRef.current;
              void fetchTtsBuffer(pending).then((buf) => {
                if (
                  buf &&
                  soundEnabledRef.current &&
                  !isPlayingRealAudioRef.current &&
                  sessionCounterRef.current === sess
                ) {
                  void playDecodedBuffer(ctx, buf, pending, sess);
                }
              });
            }
          })
          .catch(() => {});
      }
      return next;
    });
  }, [ensureAudioContext, fetchTtsBuffer, playDecodedBuffer, stopSpeech]);

  useEffect(() => {
    const cache = prefetchCacheRef.current;
    const inflight = inFlightMapRef.current;
    return () => {
      stopSpeech();
      cache.clear();
      inflight.clear();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [stopSpeech]);

  return {
    soundEnabled,
    audioUnlocked,
    setSoundEnabled,
    toggleSound,
    unlockAudio,
    energyRef,
    visemeRef,
    pulseSyllable,
    playSfx,
    speakLine,
    prefetchLine,
    stopSpeech,
  };
}
