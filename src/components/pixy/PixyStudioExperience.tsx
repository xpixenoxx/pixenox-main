"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BUDGET_OPTIONS,
  LAUNCH_OPTIONS,
  MAIN_SEQUENCE,
  SERVICE_OPTIONS,
} from "@/lib/pixy/conversation";
import { getOfflineFallback } from "@/lib/pixy/fallback";
import {
  ChatRequestBody,
  EMPTY_FORM_DATA,
  FormData,
  StepId,
} from "@/lib/pixy/types";
import type { PixyEmotion, PixyGazeMode, PixyReactiveMood } from "./scene/springMath";
import type { PixyTouchZone } from "./scene/PixyStudioStage";
import { SpeechPlaybackHandle, usePixyAudio } from "./audio/usePixyAudio";
import { DialogueStack } from "./ui/DialogueStack";
import {
  InputFocusNDC,
  MinimalDualInput,
  MinimalProjectInput,
  MinimalSingleInput,
} from "./ui/MinimalInput";
import {
  BottomLinearProgress,
  CircularBackButton,
  PixyAutonomousGesture,
  StudioOptionPills,
  VerticalSoundToggle,
} from "./ui/StudioControls";

const PixyStudioStage = dynamic(
  () =>
    import("./scene/PixyStudioStage")
      .then((m) => m.PixyStudioStage)
      .catch(() =>
        // Retry once cleanly if Turbopack HMR invalidated a stale chunk (<script> Event rejection)
        import("./scene/PixyStudioStage").then((m) => m.PixyStudioStage)
      ),
  { ssr: false }
);

const STUDIO_INTRO_OPTIONS = [
  "Start a project",
  "Come work here",
  "Send a brief hello",
  "See how we operate",
];

const STUDIO_COMPLETE_OPTIONS = [
  "Explore Pixenox",
  "Pixenox Culture",
  "Start again",
];

/**
 * Rich conversational cue detectors that pair Groq's `tone` + `step` + sentence phrasing
 * to drive Pixy's full 3D AI-bot optics, expressions, AND autonomous robotic choreography!
 */
const WELCOMING_CUE_RE =
  /\b(hey|hello|welcome|systems online|connection established|signal locked|glad|nice to meet|pleasure to meet|good to have|standing by|pixy online|hi there)\b/i;
const WITTY_CUE_RE =
  /\b(smart move|smart pick|skip the formalities|skipped the brochure|zero small talk|plot twist|direct|peak performance|calibrated|restless at idle|builder energy|subroutine|between us|bold|sharp|impressive|locked|clever)\b/i;
const HURRAY_CUE_RE =
  /\b(locked in|routed to|extraordinary|boom|99\.9%|340%|12x|sub-100ms|celebrat|safely locked|we're in|let's go|ship|production-grade)\b/i;
const JOY_CUE_RE =
  /\b(energized|high-impact|velocity|amazing|awesome|perfect|excited|favorite|transform|energy|brilliant|momentum|trajectory|thrilled)\b/i;
const SASSY_CUE_RE =
  /\b(budget|investment|invoice|formalities|scope|calibrate scope|no pressure|surprise me|almost never)\b/i;
const CURIOUS_CUE_RE =
  /\b(curious|curiosity|listening|telemetry|what's the big|what are we building|what are we engineering|tell me|breakdown|architecture|ambitious|how|what kind)\b/i;

function resolveSentencePerformance(
  step: StepId,
  sentenceIndex: number,
  totalSentences: number,
  sentenceText: string,
  turnTone: string
): { emotion: PixyEmotion; gesture: PixyAutonomousGesture | null } {
  const isFirst = sentenceIndex === 0;
  const isLast = sentenceIndex === totalSentences - 1;

  // 1) INTRO: Precision Bot Salute Wave on opening sentence -> Crisp Optic-Shutter Wink on closing invite!
  if (step === "intro") {
    if (isFirst) {
      return {
        emotion: "welcoming",
        gesture: "wave",
      };
    }
    if (isLast) {
      return { emotion: "flirty", gesture: "wink" };
    }
    return { emotion: "joy", gesture: null };
  }

  // 2) COMPLETE & CAREERS_REDIRECT: Mecha Victory Fist-Pump -> 360° Anti-Gravity Hover-Spin -> Telemetry Vibe!
  if (step === "complete" || step === "careers_redirect") {
    if (sentenceIndex === 0) {
      return { emotion: "hurray", gesture: "hurray" };
    }
    if (sentenceIndex === 1) {
      return { emotion: "spin", gesture: "spin" };
    }
    return { emotion: "joy", gesture: "vibe" };
  }

  // 3) BUDGET: Analytical cocked-brow squint & dry wit!
  if (step === "budget") {
    return {
      emotion: isLast && WITTY_CUE_RE.test(sentenceText) ? "flirty" : "sassy",
      gesture: isLast && WITTY_CUE_RE.test(sentenceText) ? "wink" : null,
    };
  }

  // 4) Strong sentence-level keyword cues (highest specificity per spoken line!)
  if (HURRAY_CUE_RE.test(sentenceText)) {
    return {
      emotion: "hurray",
      gesture: isFirst ? "hurray" : "spin",
    };
  }
  if (SASSY_CUE_RE.test(sentenceText)) {
    return {
      emotion: "sassy",
      gesture: WITTY_CUE_RE.test(sentenceText) ? "wink" : null,
    };
  }
  if (WITTY_CUE_RE.test(sentenceText)) {
    return {
      emotion: "flirty",
      gesture: "wink",
    };
  }
  if (WELCOMING_CUE_RE.test(sentenceText)) {
    return {
      emotion: "welcoming",
      gesture: isFirst ? "wave" : null,
    };
  }
  if (JOY_CUE_RE.test(sentenceText)) {
    return {
      emotion: "joy",
      gesture: isFirst && (step === "launch" || step === "name") ? "vibe" : null,
    };
  }
  if (CURIOUS_CUE_RE.test(sentenceText) && isLast) {
    return {
      emotion: "curious",
      gesture: null,
    };
  }

  // 5) Step & Groq turn-tone fallbacks so EVERY step has vivid AI-bot life!
  if (turnTone === "hurray" || turnTone === "celebratory") {
    return isFirst
      ? { emotion: "hurray", gesture: "hurray" }
      : { emotion: "spin", gesture: "spin" };
  }
  if (turnTone === "witty" || turnTone === "flirty" || turnTone === "playful") {
    if (step === "email" || isLast) {
      return { emotion: "flirty", gesture: "wink" };
    }
    return { emotion: "joy", gesture: null };
  }
  if (turnTone === "welcoming" || turnTone === "warm") {
    return { emotion: "welcoming", gesture: isFirst && step === "services" ? "wave" : null };
  }
  if (turnTone === "joy" || turnTone === "encouraging") {
    return {
      emotion: "joy",
      gesture: isFirst && (step === "launch" || step === "project" || step === "culture") ? "vibe" : null,
    };
  }
  if (turnTone === "sassy") {
    return { emotion: "sassy", gesture: null };
  }
  if (turnTone === "curious" || step === "project" || step === "explore") {
    return { emotion: "curious", gesture: null };
  }
  if (step === "email") {
    return { emotion: "flirty", gesture: "wink" };
  }
  return { emotion: "welcoming", gesture: null };
}

interface HistorySnapshot {
  step: StepId;
  flowMode: "project" | "hello";
  messages: string[];
  turnTone: string;
  previousLine: string | null;
  formData: FormData;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function PixyStudioExperience() {
  const router = useRouter();
  const stageRootRef = useRef<HTMLDivElement>(null);

  const {
    soundEnabled,
    audioUnlocked,
    toggleSound,
    unlockAudio,
    visemeRef,
    pulseSyllable,
    playSfx,
    speakLine,
    prefetchLine,
    stopSpeech,
  } = usePixyAudio({ defaultEnabled: true, stageElementRef: stageRootRef });

  const [step, setStep] = useState<StepId>("intro");
  const [flowMode, setFlowMode] = useState<"project" | "hello">("project");
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM_DATA);

  const [messages, setMessages] = useState<string[]>([]);
  const [turnTone, setTurnTone] = useState<string>("welcoming");
  const [sentenceEmotion, setSentenceEmotion] = useState<PixyEmotion>("welcoming");
  const [msgIndex, setMsgIndex] = useState(0);
  const [previousLine, setPreviousLine] = useState<string | null>(null);
  const [playbackHandle, setPlaybackHandle] = useState<SpeechPlaybackHandle | null>(null);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isAudioDone, setIsAudioDone] = useState(false);
  const [isThinking, setIsThinking] = useState(true);

  // Interactive Gaze & Autonomous Gesture State (zero clutter buttons!)
  const [inputFocused, setInputFocused] = useState(false);
  const [inputTargetNDC, setInputTargetNDC] = useState<InputFocusNDC | null>(null);
  const [hoveredPillNDC, setHoveredPillNDC] = useState<{ x: number; y: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorBurstId, setErrorBurstId] = useState(0);
  const [gestureEvent, setGestureEvent] = useState<{
    id: number;
    kind: PixyAutonomousGesture;
  } | null>(null);
  const [typingNodId, setTypingNodId] = useState(0);
  const [errorMoodActive, setErrorMoodActive] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const historyRef = useRef<HistorySnapshot[]>([]);
  const [historyDepth, setHistoryDepth] = useState(0);
  const requestVersionRef = useRef(0);
  const recentResponsesRef = useRef<string[]>([]);
  const errorMoodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keystrokeCountRef = useRef(0);

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const fireGesture = useCallback((kind: PixyAutonomousGesture) => {
    setGestureEvent((prev) => ({ id: (prev?.id ?? 0) + 1, kind }));
  }, []);

  const handlePixyTouchZone = useCallback(
    (zone: PixyTouchZone) => {
      unlockAudio(false);
      if (zone === "crown_pet") {
        playSfx("purr");
      } else if (zone === "face_boop") {
        playSfx("wink");
      } else if (zone === "belly_tickle") {
        playSfx("spin");
      }
    },
    [playSfx, unlockAudio]
  );

  const handleUserKeystroke = useCallback(() => {
    keystrokeCountRef.current += 1;
    if (keystrokeCountRef.current % 9 === 0) {
      setTypingNodId((n) => n + 1);
    }
  }, []);

  const activeLine = messages[msgIndex] ?? "";
  const isSequenceReadyForControls =
    !isThinking &&
    messages.length > 0 &&
    msgIndex === messages.length - 1 &&
    isTypingDone &&
    isAudioDone;

  const triggerValidationError = useCallback(
    (msg: string) => {
      setValidationError(msg);
      setErrorBurstId((n) => n + 1);
      setErrorMoodActive(true);
      playSfx("error");
      if (errorMoodTimerRef.current) clearTimeout(errorMoodTimerRef.current);
      errorMoodTimerRef.current = setTimeout(() => {
        setErrorMoodActive(false);
      }, 950);
    },
    [playSfx]
  );

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  const handleInputFocusChange = useCallback(
    (focused: boolean, ndc: InputFocusNDC | null) => {
      setInputFocused(focused);
      setInputTargetNDC(ndc);
    },
    []
  );

  // Fetch initial dynamic AI-bot greeting from Groq ONCE cleanly
  useEffect(() => {
    let cancelled = false;
    const version = ++requestVersionRef.current;
    const fallbackIntro = [
      "Systems online — I'm Pixy, Pixenox's autonomous studio bot.",
      "Tell me what ambitious system we're engineering today.",
    ];

    (async () => {
      try {
        const res = await fetch("/api/pixy/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: "intro",
            language: "en",
            formData: EMPTY_FORM_DATA,
          } satisfies ChatRequestBody),
        });
        if (cancelled || requestVersionRef.current !== version) return;
        if (!res.ok) throw new Error("intro fetch failed");
        const data = await res.json();
        const introLines =
          Array.isArray(data.messages) && data.messages.length > 0
            ? data.messages
            : fallbackIntro;

        recentResponsesRef.current = [introLines.join(" ")];
        setTurnTone(typeof data.tone === "string" ? data.tone : "playful");
        setPreviousLine(null);
        setMessages(introLines);
        setMsgIndex(0);
        setIsThinking(false);
      } catch {
        if (cancelled || requestVersionRef.current !== version) return;
        setTurnTone("playful");
        setPreviousLine(null);
        setMessages(fallbackIntro);
        setMsgIndex(0);
        setIsThinking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Prepare & start Kokoro speech AND drive Pixy's contextual facial emotion + autonomous gesture!
  useEffect(() => {
    if (isThinking || !activeLine) {
      setPlaybackHandle(null);
      return;
    }

    let cancelled = false;
    let delayedGestureTimer: ReturnType<typeof setTimeout> | null = null;
    setPlaybackHandle(null);
    setIsTypingDone(false);
    setIsAudioDone(false);

    const perf = resolveSentencePerformance(
      step,
      msgIndex,
      messages.length,
      activeLine,
      turnTone
    );
    setSentenceEmotion(perf.emotion);

    speakLine(activeLine).then((handle) => {
      if (cancelled) return;
      setPlaybackHandle(handle);

      if (perf.gesture === "wink") {
        // Land the flirty wink ~35% into the spoken line while the flirty smirk & cocked brow are already active!
        const delayMs =
          handle.mode === "audio" && handle.duration > 0.6
            ? Math.min(1100, handle.duration * 350)
            : 400;
        delayedGestureTimer = setTimeout(() => {
          if (!cancelled) {
            playSfx("wink");
            fireGesture("wink");
          }
        }, delayMs);
      } else if (perf.gesture) {
        if (perf.gesture === "hurray") playSfx("delight");
        else if (perf.gesture === "spin") playSfx("spin");
        fireGesture(perf.gesture);
      }

      if (msgIndex + 1 < messages.length) {
        prefetchLine(messages[msgIndex + 1]);
      }

      handle.done.then(() => {
        if (!cancelled) {
          setIsAudioDone(true);
        }
      });
    });

    return () => {
      cancelled = true;
      if (delayedGestureTimer) clearTimeout(delayedGestureTimer);
    };
  }, [
    activeLine,
    msgIndex,
    messages,
    isThinking,
    step,
    turnTone,
    speakLine,
    prefetchLine,
    fireGesture,
    playSfx,
  ]);

  // Promote completed active sentence into blurred upper slot & advance to next sentence!
  useEffect(() => {
    if (isThinking || !activeLine) return;
    if (!isTypingDone || !isAudioDone) return;

    if (msgIndex < messages.length - 1) {
      const promoteTimer = setTimeout(() => {
        setPreviousLine(messages[msgIndex]);
        setMsgIndex((prev) => prev + 1);
      }, 220);
      return () => clearTimeout(promoteTimer);
    }

    if (step === "careers_redirect") {
      const t = setTimeout(() => router.push("/careers"), 1100);
      return () => clearTimeout(t);
    }
    if (step === "explore") {
      const t = setTimeout(() => router.push("/engineering"), 1200);
      return () => clearTimeout(t);
    }
  }, [isTypingDone, isAudioDone, isThinking, activeLine, msgIndex, messages, step, router]);

  const advanceToStep = useCallback(
    async (
      nextStep: StepId,
      nextFormData: FormData,
      userInput?: string,
      options?: { skipHistory?: boolean; nextFlowMode?: "project" | "hello" }
    ) => {
      unlockAudio(false);
      stopSpeech();
      clearValidationError();
      setHoveredPillNDC(null);
      setInputFocused(false);
      setInputTargetNDC(null);
      setPlaybackHandle(null);
      fireGesture("nod");

      if (options?.nextFlowMode) setFlowMode(options.nextFlowMode);

      if (!options?.skipHistory) {
        historyRef.current.push({
          step,
          flowMode,
          messages,
          turnTone,
          previousLine,
          formData,
        });
        setHistoryDepth(historyRef.current.length);
      }

      const lastActive = messages[msgIndex] || messages[messages.length - 1] || null;
      if (lastActive) setPreviousLine(lastActive);

      setStep(nextStep);
      setFormData(nextFormData);
      setIsThinking(true);
      setIsTypingDone(false);
      setIsAudioDone(false);

      const version = ++requestVersionRef.current;

      try {
        const body: ChatRequestBody = {
          step: nextStep,
          language: "en",
          formData: nextFormData,
          userInput,
          recentPixyResponses: recentResponsesRef.current.slice(-4),
        };
        const res = await fetch("/api/pixy/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Chat request failed");
        const data = await res.json();
        if (requestVersionRef.current !== version) return;

        const nextLines =
          Array.isArray(data.messages) && data.messages.length > 0
            ? data.messages
            : getOfflineFallback(nextStep, nextFormData, userInput);

        recentResponsesRef.current = [
          ...recentResponsesRef.current.slice(-3),
          nextLines.join(" "),
        ];

        prefetchLine(nextLines[0]);

        if (nextStep === "complete") {
          playSfx("delight");
        }

        setTurnTone(typeof data.tone === "string" ? data.tone : "playful");
        setMessages(nextLines);
        setMsgIndex(0);
        setIsThinking(false);
      } catch {
        if (requestVersionRef.current !== version) return;
        const fallbackLines = getOfflineFallback(nextStep, nextFormData, userInput);
        prefetchLine(fallbackLines[0]);
        if (nextStep === "complete") {
          playSfx("delight");
        }
        setTurnTone("playful");
        setMessages(fallbackLines);
        setMsgIndex(0);
        setIsThinking(false);
      }
    },
    [
      clearValidationError,
      fireGesture,
      flowMode,
      formData,
      messages,
      msgIndex,
      playSfx,
      prefetchLine,
      previousLine,
      step,
      stopSpeech,
      turnTone,
      unlockAudio,
    ]
  );

  const handleBack = useCallback(() => {
    playSfx("click");
    stopSpeech();
    clearValidationError();
    setHoveredPillNDC(null);
    requestVersionRef.current += 1;

    const snap = historyRef.current.pop();
    if (!snap) return;
    setHistoryDepth(historyRef.current.length);
    setStep(snap.step);
    setFlowMode(snap.flowMode);
    setFormData(snap.formData);
    setTurnTone(snap.turnTone);
    setMessages(snap.messages);
    const lastIdx = Math.max(0, snap.messages.length - 1);
    setMsgIndex(lastIdx);
    setPreviousLine(
      lastIdx > 0 ? snap.messages[lastIdx - 1] : snap.previousLine
    );
    setIsThinking(false);
  }, [clearValidationError, playSfx, stopSpeech]);

  const submitLeadAndComplete = useCallback(
    async (email: string, phone: string) => {
      playSfx("click");
      const updated: FormData = { ...formData, email, phone };
      setSubmissionStatus("Syncing with Pixenox…");

      const compiledLines = [
        updated.company ? `Company: ${updated.company}` : null,
        updated.jobTitle ? `Role: ${updated.jobTitle}` : null,
        updated.budget ? `Budget: ${updated.budget}` : null,
        updated.launchTimeline ? `Timeline: ${updated.launchTimeline}` : null,
        updated.projectDescription
          ? `Brief: ${updated.projectDescription}`
          : "Brief: Direct studio inquiry via Pixy",
        updated.uploadedFile ? `Attachment: ${updated.uploadedFile.name}` : null,
      ].filter(Boolean);

      advanceToStep("complete", updated, email);

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updated.name || "Visitor",
            email: updated.email,
            mobile: updated.phone || undefined,
            services_interested: updated.services ? [updated.services] : [],
            message: compiledLines.join("\n"),
          }),
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          setSubmissionStatus(errJson.error || "Saved locally — reach us at hello@pixenox.com");
        } else {
          setSubmissionStatus(null);
        }
      } catch {
        setSubmissionStatus("Offline — copy hello@pixenox.com below");
      }
    },
    [advanceToStep, formData, playSfx]
  );

  const isActivelySpeaking =
    !isThinking &&
    Boolean(playbackHandle) &&
    (!isTypingDone || !isAudioDone);

  const reactiveMood: PixyReactiveMood = useMemo(() => {
    if (errorMoodActive) return "error";
    if (isThinking) return "thinking";
    if (step === "complete") return "delighted";
    if (step === "budget") return "budget";
    if (isActivelySpeaking) return "speaking";
    if (inputFocused) return "listening";
    return "idle";
  }, [errorMoodActive, inputFocused, isActivelySpeaking, isThinking, step]);

  const activeEmotion: PixyEmotion = useMemo(() => {
    if (errorMoodActive) return "oops";
    if (isThinking) return "curious";
    if (step === "budget" && !isActivelySpeaking) return "sassy";
    if (inputFocused && step === "project") return "curious";
    if (inputFocused && step === "email") return "flirty";
    return sentenceEmotion;
  }, [errorMoodActive, inputFocused, isActivelySpeaking, isThinking, sentenceEmotion, step]);

  const gazeMode: PixyGazeMode = useMemo(() => {
    if (isActivelySpeaking) return "camera";
    if (inputFocused) return "input";
    return "cursor";
  }, [inputFocused, isActivelySpeaking]);

  const progressRatio = useMemo(() => {
    if (step === "complete") return 1;
    if (flowMode === "hello") {
      const helloSeq: StepId[] = ["intro", "name", "project", "email", "complete"];
      const idx = helloSeq.indexOf(step);
      return idx === -1 ? 0.12 : (idx + 1) / helloSeq.length;
    }
    const idx = MAIN_SEQUENCE.indexOf(step);
    if (idx === -1) return 0.12;
    return (idx + 1) / MAIN_SEQUENCE.length;
  }, [flowMode, step]);

  const spotlightMoodAttr =
    reactiveMood === "error"
      ? "error"
      : reactiveMood === "thinking"
        ? "thinking"
        : reactiveMood === "delighted"
          ? "delighted"
          : reactiveMood === "budget"
            ? "budget"
            : "default";

  return (
    <section
      ref={stageRootRef}
      data-mood={spotlightMoodAttr}
      style={{ "--pixy-energy": "0" } as React.CSSProperties}
      className="pixy-studio-root fixed inset-0 z-[15] h-dvh w-screen overflow-hidden text-white"
    >
      {/* Layer 0: Architectural Mist-Lavender & Smoked-Slate Studio Room */}
      <div className="pixy-studio-backdrop pointer-events-none absolute inset-0 z-0" />
      <div className="pixy-studio-portal pointer-events-none absolute inset-0 z-[1]" />
      <div className="pixy-studio-spotlight pointer-events-none absolute inset-0 z-[1]" />
      <div className="pixy-studio-floor pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[26vh]" />

      {/* Layer 1: Autonomous & Touch-Responsive 3D Pixy with Full Emotional Expressions */}
      <PixyStudioStage
        mood={reactiveMood}
        emotion={activeEmotion}
        gazeMode={gazeMode}
        inputTargetNDC={inputTargetNDC}
        hoveredPillNDC={hoveredPillNDC}
        errorBurstId={errorBurstId}
        gestureEvent={gestureEvent}
        typingNodId={typingNodId}
        visemeRef={visemeRef}
        onTouchZone={handlePixyTouchZone}
      />

      {/* Layer 2: Left-Anchored Two-Slot Editorial Dialogue & Minimal Controls */}
      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-end lg:justify-center px-6 pb-24 pt-24 sm:px-12 md:px-16 lg:px-[56px] lg:pb-14">
        <div className="w-full max-w-[600px] lg:max-w-[545px] xl:max-w-[600px]">
          <DialogueStack
            previousLine={previousLine}
            activeLine={activeLine}
            lineKey={`${step}-${msgIndex}-${activeLine}`}
            isThinking={isThinking}
            playbackHandle={playbackHandle}
            onCharacterTyped={pulseSyllable}
            onTypingComplete={() => setIsTypingDone(true)}
          />

          <div className="pointer-events-auto mt-7 sm:mt-8 min-h-[96px]">
            <AnimatePresence mode="wait">
              {isSequenceReadyForControls && (
                <motion.div
                  key={`${step}-${flowMode}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step === "intro" && (
                    <StudioOptionPills
                      options={STUDIO_INTRO_OPTIONS}
                      showCopyEmailPill
                      onHoverSfx={() => playSfx("hover")}
                      onPillHoverNDC={setHoveredPillNDC}
                      onCopyEmailSfx={() => {
                        playSfx("copy");
                        fireGesture("wink");
                      }}
                      onSelect={(choice) => {
                        playSfx("click");
                        if (choice === "Start a project") {
                          advanceToStep("name", formData, choice, {
                            nextFlowMode: "project",
                          });
                        } else if (choice === "Send a brief hello") {
                          advanceToStep("name", formData, choice, {
                            nextFlowMode: "hello",
                          });
                        } else if (choice === "Come work here") {
                          advanceToStep("careers_redirect", formData, choice);
                        } else if (choice === "See how we operate") {
                          advanceToStep("explore", formData, choice);
                        }
                      }}
                    />
                  )}

                  {step === "name" && (
                    <MinimalSingleInput
                      placeholder="Your first name or full name…"
                      initialValue={formData.name}
                      errorMessage={validationError}
                      onFocusChange={handleInputFocusChange}
                      onTypingPulse={handleUserKeystroke}
                      onValidationError={triggerValidationError}
                      onClearError={clearValidationError}
                      onHoverSfx={() => playSfx("hover")}
                      validate={(val) => {
                        if (!val) return "Tell Pixy your name first";
                        if (val.length < 2) return "At least 2 characters, don't be shy";
                        return null;
                      }}
                      onSubmit={(name) => {
                        playSfx("click");
                        const next = { ...formData, name };
                        advanceToStep(
                          flowMode === "hello" ? "project" : "services",
                          next,
                          name
                        );
                      }}
                    />
                  )}

                  {step === "services" && (
                    <StudioOptionPills
                      options={SERVICE_OPTIONS}
                      onHoverSfx={() => playSfx("hover")}
                      onPillHoverNDC={setHoveredPillNDC}
                      onSelect={(service) => {
                        playSfx("click");
                        const next = { ...formData, services: service };
                        advanceToStep("company", next, service);
                      }}
                    />
                  )}

                  {step === "company" && (
                    <MinimalDualInput
                      firstPlaceholder="Company or venture…"
                      secondPlaceholder="Your role…"
                      initialFirst={formData.company}
                      initialSecond={formData.jobTitle}
                      errorMessage={validationError}
                      onFocusChange={handleInputFocusChange}
                      onTypingPulse={handleUserKeystroke}
                      onValidationError={triggerValidationError}
                      onClearError={clearValidationError}
                      onHoverSfx={() => playSfx("hover")}
                      validate={(comp, role) => {
                        if (!comp) return "Company or project name required";
                        if (!role) return "Let Pixy know your role too";
                        return null;
                      }}
                      onSubmit={(company, jobTitle) => {
                        playSfx("click");
                        const next = { ...formData, company, jobTitle };
                        advanceToStep("budget", next, `${jobTitle} at ${company}`);
                      }}
                    />
                  )}

                  {step === "budget" && (
                    <StudioOptionPills
                      options={BUDGET_OPTIONS}
                      onHoverSfx={() => playSfx("hover")}
                      onPillHoverNDC={setHoveredPillNDC}
                      onSelect={(budget) => {
                        playSfx("click");
                        const next = { ...formData, budget };
                        advanceToStep("launch", next, budget);
                      }}
                    />
                  )}

                  {step === "launch" && (
                    <StudioOptionPills
                      options={LAUNCH_OPTIONS}
                      onHoverSfx={() => playSfx("hover")}
                      onPillHoverNDC={setHoveredPillNDC}
                      onSelect={(launchTimeline) => {
                        playSfx("click");
                        const next = { ...formData, launchTimeline };
                        advanceToStep("project", next, launchTimeline);
                      }}
                    />
                  )}

                  {step === "project" && (
                    <MinimalProjectInput
                      placeholder="What are we building together? Share your idea or challenge…"
                      initialValue={formData.projectDescription}
                      initialFile={formData.uploadedFile}
                      errorMessage={validationError}
                      onFocusChange={handleInputFocusChange}
                      onTypingPulse={handleUserKeystroke}
                      onValidationError={triggerValidationError}
                      onClearError={clearValidationError}
                      onHoverSfx={() => playSfx("hover")}
                      onSubmit={(projectDescription, uploadedFile) => {
                        playSfx("click");
                        const next = { ...formData, projectDescription, uploadedFile };
                        advanceToStep(
                          "email",
                          next,
                          projectDescription || `Attached: ${uploadedFile?.name ?? "brief"}`
                        );
                      }}
                    />
                  )}

                  {step === "email" && (
                    <MinimalDualInput
                      firstPlaceholder="you@company.com"
                      secondPlaceholder="Phone (optional)"
                      firstType="email"
                      secondType="tel"
                      initialFirst={formData.email}
                      initialSecond={formData.phone}
                      submitLabel="Send to Pixenox"
                      errorMessage={validationError}
                      onFocusChange={handleInputFocusChange}
                      onTypingPulse={handleUserKeystroke}
                      onValidationError={triggerValidationError}
                      onClearError={clearValidationError}
                      onHoverSfx={() => playSfx("hover")}
                      validate={(email, phone) => {
                        if (!email) return "Email address required";
                        if (!EMAIL_REGEX.test(email))
                          return "Enter a valid email (e.g. name@domain.com)";
                        if (phone && phone.replace(/[\s+()-]/g, "").length < 7)
                          return "Phone number looks incomplete";
                        return null;
                      }}
                      onSubmit={submitLeadAndComplete}
                    />
                  )}

                  {(step === "complete" || step === "culture") && (
                    <div className="space-y-3">
                      <StudioOptionPills
                        options={STUDIO_COMPLETE_OPTIONS}
                        showCopyEmailPill
                        onHoverSfx={() => playSfx("hover")}
                        onPillHoverNDC={setHoveredPillNDC}
                        onCopyEmailSfx={() => {
                          playSfx("copy");
                          fireGesture("wink");
                        }}
                        onSelect={(choice) => {
                          playSfx("click");
                          if (choice === "Explore Pixenox") {
                            router.push("/");
                          } else if (choice === "Pixenox Culture") {
                            advanceToStep("culture", formData, choice);
                          } else {
                            historyRef.current = [];
                            setHistoryDepth(0);
                            setFormData(EMPTY_FORM_DATA);
                            setSubmissionStatus(null);
                            advanceToStep("intro", EMPTY_FORM_DATA, undefined, {
                              skipHistory: true,
                              nextFlowMode: "project",
                            });
                          }
                        }}
                      />
                      {submissionStatus && (
                        <p className="text-xs text-white/60">{submissionStatus}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Layer 3: Clean Locomotive Studio Perimeter Chrome ONLY */}
      <CircularBackButton
        visible={historyDepth > 0 && step !== "careers_redirect"}
        onClick={handleBack}
        onHoverSfx={() => playSfx("hover")}
      />

      <VerticalSoundToggle
        enabled={soundEnabled}
        audioUnlocked={audioUnlocked}
        onToggle={toggleSound}
        onUnlock={() => unlockAudio(true)}
      />

      <BottomLinearProgress progress={progressRatio} />
    </section>
  );
}
