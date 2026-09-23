"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import {
  BUDGET_OPTIONS,
  FINAL_OPTIONS,
  INTRO_ENTRANCE_LINE,
  INTRO_OPTIONS,
  LAUNCH_OPTIONS,
  SERVICE_OPTIONS,
  STEP_CONFIG,
} from "@/lib/pixy/conversation";
import { getOfflineFallback } from "@/lib/pixy/fallback";
import {
  AvatarState,
  ChatRequestBody,
  EMPTY_FORM_DATA,
  FormData,
  LanguageCode,
  StepId,
} from "@/lib/pixy/types";

import { AuroraBackground } from "./AuroraBackground";

// Dynamic import with SSR disabled — Three.js requires browser globals (window/document)
// that break server-side hydration if imported statically.
const Pixy3DModel = dynamic(
  () => import("./Pixy3DModel").then((mod) => mod.Pixy3DModel),
  { ssr: false }
);
import { PixyMessage } from "./PixyMessage";
import { ConversationStep } from "./ConversationStep";
import { LanguageSelector } from "./LanguageSelector";
import { VoicePermission } from "./VoicePermission";
import { VoiceSelector } from "./VoiceSelector";
import { OptionButtons } from "./OptionButtons";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";
import { CompanyDetails } from "./CompanyDetails";
import { CheckboxGroup } from "./CheckboxGroup";
import { FinalActions } from "./FinalActions";
import { Toast } from "./Toast";
import { ProjectDescription } from "./ProjectDescription";

const CAREERS_OPTIONS = ["Back to Start"];

/** Steps whose Pixy line never needs the AI — nothing to react to yet. */
const STATIC_STEPS = new Set<StepId>(["language", "voice", "voice_selection"]);

interface HistoryEntry {
  step: StepId;
  messages: string[];
  secondaryLine: string | null;
  formData: FormData;
}

export function PixyExperience() {
  const router = useRouter();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [step, setStep] = useState<StepId>("intro");
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM_DATA);
  const [messages, setMessages] = useState<string[]>(STEP_CONFIG.intro.fallback(EMPTY_FORM_DATA));
  const [messageIndex, setMessageIndex] = useState(0);
  const [isMessageDone, setIsMessageDone] = useState(false);
  const [secondaryLine, setSecondaryLine] = useState<string | null>(null);
  const currentMessage = messages[messageIndex] || "";
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  
  // Transition to idle after 5 seconds of waiting for user input
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (avatarState === "listening") {
      timer = setTimeout(() => {
        setAvatarState("idle");
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [avatarState]);

  const [isThinking, setIsThinking] = useState(false);
  const [wakeUpProgress, setWakeUpProgress] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [ttsReady, setTtsReady] = useState<{ playing: boolean; duration: number }>({ playing: false, duration: 0 });
  const historyRef = useRef<HistoryEntry[]>([]);
  const [historyLength, setHistoryLength] = useState(0);
  const messageVersion = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const avatarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const presentLine = useCallback((nextStep: StepId, nextMessages: string[]) => {
    setStep(nextStep);
    setMessages(nextMessages);
    setMessageIndex(0);
    setIsMessageDone(false);
    setTtsReady({ playing: false, duration: 0 });
  }, []);

  const handleMessageComplete = useCallback(() => {
    setAvatarState(step === "complete" ? "success" : "listening");
    if (messageIndex < messages.length - 1) {
      sequenceTimer.current = setTimeout(() => {
        setMessageIndex((idx) => idx + 1);
        setIsMessageDone(false);
        setTtsReady({ playing: false, duration: 0 });
      }, 100);
    } else {
      setIsMessageDone(true);
      if (step === "careers_redirect") {
        // Auto-redirect to careers after the last message finishes
        setTimeout(() => {
          router.push("/careers");
        }, 1200);
      } else if (step === "explore") {
        // Auto-redirect to home after the last explore message finishes
        setTimeout(() => {
          router.push("/");
        }, 1200);
      }
    }
  }, [messageIndex, messages.length, step, router]);

  const handleMessageCompleteRef = useRef(handleMessageComplete);
  useEffect(() => {
    handleMessageCompleteRef.current = handleMessageComplete;
  }, [handleMessageComplete]);

  useEffect(() => {
    if (!hasInteracted) return;
    if (avatarTimer.current) clearTimeout(avatarTimer.current);
    if (sequenceTimer.current) clearTimeout(sequenceTimer.current);

    setAvatarState(step === "complete" ? "success" : "speaking");

    if (!voiceEnabled) {
      // When voice is off, wait for the text reveal animation to finish.
      // Text reveal takes roughly: stagger * charCount + 0.35s char anim.
      // Use a formula that mirrors PixyMessage's dynamic stagger logic.
      const chars = currentMessage.replace(/ /g, '').length;
      const stagger = Math.min(0.06, Math.max(0.018, 3.2 / Math.max(chars, 1)));
      const textRevealMs = (stagger * chars + 0.35) * 1000 + 200; // +200ms pause after reveal
      avatarTimer.current = setTimeout(() => {
        handleMessageComplete();
      }, Math.max(1200, textRevealMs));
    }

    return () => {
      if (avatarTimer.current) clearTimeout(avatarTimer.current);
      if (sequenceTimer.current) clearTimeout(sequenceTimer.current);
    };
  }, [messageIndex, messages, step, currentMessage.length, voiceEnabled, handleMessageComplete, hasInteracted]);

  useEffect(() => {
    return () => {
      if (avatarTimer.current) clearTimeout(avatarTimer.current);
      if (sequenceTimer.current) clearTimeout(sequenceTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      if (prefetchedTtsRef.current) {
        URL.revokeObjectURL(prefetchedTtsRef.current.url);
        prefetchedTtsRef.current = null;
      }
    };
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const prefetchedTtsRef = useRef<{ text: string; url: string } | null>(null);

  useEffect(() => {
    if (!hasInteracted) return;

    let fallbackTimer: ReturnType<typeof setTimeout>;
    let isCancelled = false;
    let hasAdvanced = false;
    const abortController = new AbortController();

    const safeAdvance = () => {
      if (isCancelled || hasAdvanced) return;
      hasAdvanced = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      handleMessageCompleteRef.current();
    };

    const stopCurrentAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onloadedmetadata = null;
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };

    if (voiceEnabled && !isThinking && currentMessage) {
      stopCurrentAudio();

      const cleanMessage = currentMessage.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
      if (!cleanMessage) {
        setTtsReady({ playing: true, duration: 0 });
        safeAdvance();
        return;
      }

      // Fallback timer sized to roughly the message's word count
      const wordCount = cleanMessage.split(/\s+/).length;
      const fallbackMs = Math.max(3000, wordCount * 600 + 6000);
      fallbackTimer = setTimeout(() => {
        console.warn("TTS fallback timer triggered");
        if (!isCancelled) setTtsReady({ playing: true, duration: 0 });
        safeAdvance();
      }, fallbackMs);

      // ---------- Check prefetch cache before fetching ----------
      const prefetched = prefetchedTtsRef.current;
      const havePrefetch = prefetched !== null && prefetched.text === cleanMessage;
      // Discard stale prefetch
      if (prefetched && !havePrefetch) {
        URL.revokeObjectURL(prefetched.url);
        prefetchedTtsRef.current = null;
      }

      const setupAudio = (url: string, owned: boolean) => {
        if (isCancelled) {
          if (owned) URL.revokeObjectURL(url);
          return;
        }
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => safeAdvance();
        audio.onerror = () => {
          console.warn("Audio playback error");
          setTtsReady({ playing: true, duration: 0 });
          safeAdvance();
        };

        audio.onloadedmetadata = () => {
          if (isCancelled) return;
          const duration = isFinite(audio.duration) ? audio.duration : 0;
          audio.play().then(() => {
            if (isCancelled) return;
            setTtsReady({ playing: true, duration });

            // ---------- Pre-fetch next message's TTS ----------
            const nextIdx = messageIndex + 1;
            if (nextIdx < messages.length) {
              const nextText = messages[nextIdx]
                .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
                .trim();
              if (nextText && (!prefetchedTtsRef.current || prefetchedTtsRef.current.text !== nextText)) {
                fetch("/api/pixy/tts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text: nextText }),
                }).then((r) => {
                  if (!r.ok) return;
                  return r.blob();
                }).then((blob) => {
                  if (!blob) return;
                  // Only store if nothing newer was prefetched
                  if (prefetchedTtsRef.current) {
                    URL.revokeObjectURL(prefetchedTtsRef.current.url);
                  }
                  prefetchedTtsRef.current = {
                    text: nextText,
                    url: URL.createObjectURL(blob),
                  };
                }).catch(() => {}); // best-effort; failures are fine
              }
            }
          }).catch(() => {
            console.warn("Audio autoplay blocked");
            setTtsReady({ playing: true, duration: 0 });
            safeAdvance();
          });
        };
      };

      if (havePrefetch) {
        // Use cached TTS — skip network entirely
        const url = prefetched!.url;
        prefetchedTtsRef.current = null;
        setupAudio(url, false);
      } else {
        (async () => {
          try {
            const res = await fetch("/api/pixy/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: cleanMessage }),
              signal: abortController.signal,
            });

            if (isCancelled) return;

            if (!res.ok) {
              console.warn("TTS fetch failed:", res.status);
              setTtsReady({ playing: true, duration: 0 });
              safeAdvance();
              return;
            }

            const blob = await res.blob();
            if (isCancelled) return;

            const url = URL.createObjectURL(blob);
            setupAudio(url, true);
          } catch (err: any) {
            if (err?.name === "AbortError") return;
            console.warn("TTS request error:", err);
            setTtsReady({ playing: true, duration: 0 });
            safeAdvance();
          }
        })();
      }
    } else if (isThinking || !voiceEnabled) {
      stopCurrentAudio();
    }

    return () => {
      isCancelled = true;
      abortController.abort();
      if (fallbackTimer) clearTimeout(fallbackTimer);
      stopCurrentAudio();
    };
  }, [currentMessage, voiceEnabled, isThinking, hasInteracted]);

  /**
   * Advances the conversation. The app decides `nextStep` and its
   * `component` (via STEP_CONFIG) — Groq is only ever asked how to phrase
   * the message for that step, and only for steps that actually need a
   * reaction to something the visitor just did.
   */
  const advance = useCallback(
    async (nextStep: StepId, updatedFormData: FormData, userInput?: string, skipHistory = false) => {
      if (!skipHistory) {
        historyRef.current.push({ step, messages, secondaryLine, formData });
        setHistoryLength(historyRef.current.length);
      }
      setSecondaryLine(null);

      if (STATIC_STEPS.has(nextStep)) {
        presentLine(nextStep, STEP_CONFIG[nextStep].fallback(updatedFormData, userInput));
        return;
      }

      setStep(nextStep);
      setIsThinking(true);
      setAvatarState("thinking");
      setMessages([]); // Clear previous text so it doesn't replay
      setMessageIndex(0);
      setIsMessageDone(false);
      const version = ++messageVersion.current;

      try {
        const body: ChatRequestBody = {
          step: nextStep,
          language,
          formData: updatedFormData,
          userInput,
          recentPixyResponses: historyRef.current.slice(-4).map(h => h.messages.join(" ")),
        };
        const res = await fetch("/api/pixy/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("bad status");
        const data = await res.json();
        if (messageVersion.current !== version) return; // stale response
        const textArray = Array.isArray(data.messages) && data.messages.length > 0
          ? data.messages
          : getOfflineFallback(nextStep, updatedFormData, userInput);
        setIsThinking(false);
        presentLine(nextStep, textArray);
      } catch {
        if (messageVersion.current !== version) return;
        setIsThinking(false);
        presentLine(nextStep, getOfflineFallback(nextStep, updatedFormData, userInput));
      }
    },
    [step, messages, secondaryLine, language, presentLine, formData]
  );

  const handleBack = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const previous = historyRef.current.pop();
    if (!previous) return;
    
    setHistoryLength(historyRef.current.length);
    setFormData(previous.formData);
    setMessages(previous.messages);
    setSecondaryLine(previous.secondaryLine);
    setStep(previous.step);
    // when going back, we usually want to show the final message of that sequence
    setMessageIndex(previous.messages.length - 1);
    setTtsReady({ playing: false, duration: 0 });
  }, []);

  const handleGlobalBack = useCallback(() => {
    if (messageIndex > 0) {
      if (avatarTimer.current) clearTimeout(avatarTimer.current);
      if (sequenceTimer.current) clearTimeout(sequenceTimer.current);
      setMessageIndex((prev) => prev - 1);
      setIsMessageDone(false);
      setTtsReady({ playing: false, duration: 0 });
    } else if (historyRef.current.length > 0) {
      handleBack();
    }
  }, [messageIndex, handleBack]);

  const resetAll = useCallback(() => {
    historyRef.current = [];
    setHistoryLength(0);
    setFormData(EMPTY_FORM_DATA);
    setSecondaryLine(null);
    advance("intro", EMPTY_FORM_DATA, undefined, true);
  }, [advance]);

  const updateForm = (patch: Partial<FormData>): FormData => {
    const next = { ...formData, ...patch };
    setFormData(next);
    return next;
  };

  // ---- step handlers -----------------------------------------------------

  const handleLanguage = (code: LanguageCode) => {
    setLanguage(code);
    advance("intro", formData);
  };

  const handleVoice = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    if (enabled) {
      advance("intro", formData);
    } else {
      advance("intro", formData);
    }
  };

  const handleVoiceSelection = (uri: string) => {
    setSelectedVoiceURI(uri);
    advance("intro", formData);
  };

  const handleIntroChoice = (choice: string) => {
    if (choice === INTRO_OPTIONS[0]) {
      if (wakeUpProgress !== null) return;
      
      let stepCount = 1;
      setWakeUpProgress("0.1");
      
      const interval = setInterval(() => {
        stepCount++;
        if (stepCount <= 9) {
          setWakeUpProgress(`0.${stepCount}`);
        } else if (stepCount === 10) {
          setWakeUpProgress("1.0");
        } else {
          clearInterval(interval);
          setWakeUpProgress(null);
          advance("name", formData, choice);
        }
      }, 100);
    } else if (choice === INTRO_OPTIONS[1]) {
      advance("careers_redirect", formData, choice);
    } else {
      advance("careers", formData, choice);
    }
  };

  const handleCareersAction = () => {
    resetAll();
  };

  const handleName = (name: string) => {
    const next = updateForm({ name });
    advance("services", next, name);
  };

  const handleServices = (service: string) => {
    const next = updateForm({ services: service });
    advance("company", next, service);
  };

  const handleCompany = (company: string, jobTitle: string) => {
    const next = updateForm({ company, jobTitle });
    advance("budget", next, `${jobTitle} at ${company}`);
  };

  const handleBudget = (budget: string) => {
    const next = updateForm({ budget });
    advance("launch", next, budget);
  };

  const handleLaunch = (launchTimeline: string) => {
    const next = updateForm({ launchTimeline });
    advance("project", next, launchTimeline);
  };

  const handleProject = (projectDescription: string, uploadedFile: { name: string; url?: string } | null) => {
    const next = updateForm({ projectDescription, uploadedFile });
    advance("email", next, projectDescription || (uploadedFile ? `Attached: ${uploadedFile.name}` : ""));
  };

  const handleEmail = (email: string) => {
    const next = updateForm({ email });
    // Prototype: no production backend yet — log safely for development.
    console.info("[Pixy prototype] lead captured", { ...next });
    advance("complete", next, email);
  };

  const handleFinalAction = (choice: string) => {
    if (choice === FINAL_OPTIONS[0]) {
      advance("explore", formData, choice);
    } else if (choice === FINAL_OPTIONS[1]) {
      advance("culture", formData, choice);
    } else if (choice === FINAL_OPTIONS[2]) {
      advance("careers_redirect", formData, choice);
    } else {
      resetAll();
    }
  };

  // ---- render --------------------------------------------------------------

  const showBack = !["language", "complete"].includes(step) && historyLength > 0;
  const isSequenceComplete = messageIndex === messages.length - 1 && isMessageDone;

  if (!hasInteracted) {
    return (
      <main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => {
          const unlock = new Audio(
            "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
          );
          unlock.volume = 0;
          unlock.play().catch(() => {});
          setHasInteracted(true);
        }}
      >
        <AuroraBackground />
        <p className="mt-8 font-speech text-xl text-white/50 animate-pulse tracking-widest">
          Tap anywhere to start
        </p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-start justify-center overflow-hidden px-6 pl-6 pb-10 pt-28 sm:pl-16 md:pl-24 lg:pl-32 sm:pb-16 sm:pt-32">
      <AuroraBackground />
      <Toast message={toast} />

      {(showBack || messageIndex > 0) && (
        <button
          onClick={handleGlobalBack}
          className="fixed left-6 top-28 sm:top-32 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Go back"
          title="Go back"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {step !== "language" && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <span className="text-xs font-medium text-white/50">Sound</span>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
              voiceEnabled ? "bg-[#ff7a8a]" : "bg-white/20"
            }`}
            aria-label={voiceEnabled ? "Mute voice" : "Enable voice"}
            title={voiceEnabled ? "Mute voice" : "Enable voice"}
          >
            <div
              className={`h-4 w-4 rounded-full bg-white transition-transform ${
                voiceEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      )}

      <div className="z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg shrink-0 lg:w-1/2 lg:max-w-xl"
        >
        <div className="relative rounded-[28px] p-6 sm:p-9">
          <div className="mt-6 space-y-1">
            <PixyMessage
              message={currentMessage}
              messageKey={`${step}-${messageIndex}-${currentMessage}`}
              paused={voiceEnabled && !ttsReady.playing}
              revealDuration={ttsReady.duration > 0 ? ttsReady.duration : undefined}
            />
            {secondaryLine && (
              <p className="text-left font-speech text-lg text-text-muted sm:text-xl">
                {secondaryLine}
              </p>
            )}
          </div>

          <div className="mt-24 sm:mt-28 min-h-[7rem] w-full">
            <ConversationStep stepKey={step}>
              {wakeUpProgress !== null ? (
                <div className="flex justify-start py-6 pl-2" aria-live="polite">
                  <span className="font-speech text-4xl font-light text-white/50 tracking-widest">
                    {wakeUpProgress}
                  </span>
                </div>
              ) : isThinking ? (
                <div className="flex justify-start py-6 pl-2" aria-live="polite">
                  <ThinkingTimer />
                </div>
              ) : isSequenceComplete ? (
                <StepRenderer
                  step={step}
                  formData={formData}
                  language={language}
                  onLanguage={handleLanguage}
                  onVoice={handleVoice}
                  onVoiceSelection={handleVoiceSelection}
                  onIntro={handleIntroChoice}
                  onCareers={handleCareersAction}
                  onName={handleName}
                  onCompany={handleCompany}
                  onProject={handleProject}
                  onServices={handleServices}
                  onBudget={handleBudget}
                  onLaunch={handleLaunch}
                  onEmail={handleEmail}
                  onFinal={handleFinalAction}
                />
              ) : null}
            </ConversationStep>
          </div>
        </div>
      </motion.div>

      {/* Right Column: 3D Pixy Model */}
      <div className="hidden w-full items-center justify-center lg:flex lg:w-1/2">
        <Pixy3DModel state={avatarState} />
      </div>

      </div>
    </main>
  );
}


function ThinkingTimer() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setTime(Date.now() - start);
    }, 10);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-start pt-2">
      <span className="font-mono text-2xl font-light tracking-wider text-white/50">
        {(time / 1000).toFixed(2)}
      </span>
    </div>
  );
}

interface RenderStepArgs {
  step: StepId;
  formData: FormData;
  language: string;
  onBack?: () => void;
  onLanguage: (code: LanguageCode) => void;
  onVoice: (enabled: boolean) => void;
  onVoiceSelection: (uri: string) => void;
  onIntro: (choice: string) => void;
  onCareers: () => void;
  onName: (name: string) => void;
  onCompany: (company: string, jobTitle: string) => void;
  onProject: (description: string, file: { name: string; url?: string } | null) => void;
  onServices: (service: string) => void;
  onBudget: (budget: string) => void;
  onLaunch: (timeline: string) => void;
  onEmail: (email: string) => void;
  onFinal: (choice: string) => void;
}

function StepRenderer(args: RenderStepArgs) {
  const { step, formData } = args;

  switch (step) {
    case "language":
      return <LanguageSelector onSelect={args.onLanguage} />;
    case "voice":
      return <VoicePermission onSelect={args.onVoice} />;
    case "voice_selection":
      return <VoiceSelector onSelect={args.onVoiceSelection} language={args.language} />;
    case "intro":
      return <OptionButtons variant="large" options={INTRO_OPTIONS} onSelect={args.onIntro} onBack={args.onBack} />;
    case "careers":
      return <FinalActions options={CAREERS_OPTIONS} onSelect={args.onCareers} />;
    case "name":
      return (
        <TextInput
          label="Your name"
          placeholder="Enter your name…"
          initialValue={formData.name}
          onSubmit={args.onName}
          onBack={args.onBack}
        />
      );
    case "company":
      return (
        <CompanyDetails
          initialCompany={formData.company}
          initialJobTitle={formData.jobTitle}
          onSubmit={args.onCompany}
          onBack={args.onBack}
        />
      );
    case "project":
      return (
        <ProjectDescription
          label="Tell us a little about your project."
          placeholder="Share your idea, requirements, goals, or challenges..."
          initialValue={formData.projectDescription}
          initialFile={formData.uploadedFile}
          onSubmit={args.onProject}
          onBack={args.onBack}
        />
      );
    case "services":
      return (
        <OptionButtons
          options={SERVICE_OPTIONS}
          onSelect={args.onServices}
          onBack={args.onBack}
        />
      );
    case "budget":
      return <OptionButtons options={BUDGET_OPTIONS} onSelect={args.onBudget} onBack={args.onBack} />;
    case "launch":
      return <OptionButtons options={LAUNCH_OPTIONS} onSelect={args.onLaunch} onBack={args.onBack} />;
    case "email":
      return (
        <TextInput
          type="email"
          label="Your email"
          placeholder="you@example.com"
          initialValue={formData.email}
          onSubmit={args.onEmail}
          onBack={args.onBack}
        />
      );
    case "complete":
      return <FinalActions options={FINAL_OPTIONS} onSelect={args.onFinal} />;
    case "culture":
      return <FinalActions options={[FINAL_OPTIONS[0], FINAL_OPTIONS[2], FINAL_OPTIONS[3]]} onSelect={args.onFinal} />;
    default:
      return null;
  }
}
