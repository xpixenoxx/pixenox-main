"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function PixenoxHero() {
  const [phase, setPhase] = useState<'intro' | 'wait' | 'main' | 'done'>('intro');
  const [introDisplayed, setIntroDisplayed] = useState("");
  const [mainDisplayed, setMainDisplayed] = useState("");
  const [showPills, setShowPills] = useState(false);

  const [conversationStep, setConversationStep] = useState<string>('intro');
  const [interactionType, setInteractionType] = useState<string>('buttons');
  const [currentOptions, setCurrentOptions] = useState<string[]>(["Start a project", "Come work here", "Send a brief hello", "See how we operate"]);
  const [inputValue, setInputValue] = useState("");
  const [contactForm, setContactForm] = useState({ email: '', phone: '' });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', services: '', launchTimeline: '' });
  const [hasPitched, setHasPitched] = useState(false);

  const [isMuted, setIsMuted] = useState(true);

  const typeMainTextRef = useRef<number>(0);

  const typeMainText = async (text: string, speed = 38) => {
    const runId = ++typeMainTextRef.current;

    setPhase('main');
    setMainDisplayed("");

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";

    for (let i = 1; i <= text.length; i++) {
      if (typeMainTextRef.current !== runId) return;

      for (let j = 0; j < 2; j++) {
        if (typeMainTextRef.current !== runId) return;
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        setMainDisplayed(text.substring(0, i - 1) + randomChar);
        await wait(15);
      }

      if (typeMainTextRef.current !== runId) return;
      setMainDisplayed(text.substring(0, i));
      await wait(speed);
    }

    if (typeMainTextRef.current !== runId) return;
    setPhase('done');
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const fetchGreeting = async () => {
      try {
        const res = await fetch('/api/pixy/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: 'intro', language: 'en', formData: {} })
        });
        const data = await res.json();
        if (data && data.messages && data.messages.length > 0) {
          return data.messages; // DO NOT join, properly return array for splitting!
        }
      } catch (err) {
        console.error("Failed to fetch initial greeting", err);
      }
      return [
        "Well, look who just showed up.",
        "I was starting to think you'd keep Pixy waiting. So, what are we building?"
      ];
    };

    const runSequence = async () => {
      // Begin fetching the dynamic greeting from Groq immediately to hide latency
      const dynamicGreetingPromise = fetchGreeting();

      const wait = (ms: number) => new Promise(r => { timeoutId = setTimeout(r, ms); });

      await wait(600);
      if (!isActive) return;

      setPhase('intro');

      const dynamicMessages = await dynamicGreetingPromise;
      if (!isActive) return;

      const m0 = dynamicMessages[0] || "Well, look who just showed up.";

      for (let i = 1; i <= m0.length; i++) {
        if (!isActive) return;
        setIntroDisplayed(m0.substring(0, i));
        await wait(38);
      }

      if (!isActive) return;
      setPhase('wait');
      await wait(500);

      if (!isActive) return;

      const m1 = dynamicMessages.slice(1).join(" ") || "Welcome to Pixenox. So, what are we building?";

      await typeMainText(m1, 38);

      await wait(400);
      if (!isActive) return;
      setShowPills(true);
    };

    runSequence();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const aiEngineeringVideoRef = useRef<HTMLVideoElement>(null);
  const pitchVideoRef = useRef<HTMLVideoElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const seekTargetRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const hasPitchedRef = useRef(false);
  const selectedServiceRef = useRef<string | null>(null);
  const onMouseMoveRef = useRef<((e: React.MouseEvent) => void) | null>(null);
  const onTouchMoveRef = useRef<((e: React.TouchEvent) => void) | null>(null);

  const [isPitchMode, setIsPitchMode] = useState(false);
  const isPitchModeRef = useRef(false);

  useEffect(() => {
    if (isPitchMode) {
      if (pitchVideoRef.current) {
        pitchVideoRef.current.currentTime = 0;
        const playPromise = pitchVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silently swallow harmless HMR/DOM interruptions safely
          });
        }
      }
    } else {
      pitchVideoRef.current?.pause();
    }
  }, [isPitchMode]);

  const advanceConversation = async (nextStep: string, inputVal?: string) => {
    setConversationStep(nextStep);
    setShowPills(false);

    if (!isPitchMode && !hasPitchedRef.current) {
      setIsPitchMode(true);
      isPitchModeRef.current = true;
    }

    const updatedFormData = { ...formData };
    if (conversationStep === 'name' && inputVal) updatedFormData.name = inputVal;
    if (conversationStep === 'services' && inputVal) {
      updatedFormData.services = inputVal;
      selectedServiceRef.current = inputVal;
    }
    if (conversationStep === 'contact' && inputVal) {
      try {
        const contactParsed = JSON.parse(inputVal);
        updatedFormData.email = contactParsed.email || '';
        updatedFormData.phone = contactParsed.phone || '';
      } catch (e) {}
    }
    if (conversationStep === 'launch' && inputVal) updatedFormData.launchTimeline = inputVal;
    setFormData(updatedFormData);

    if (nextStep === 'complete') {
      try {
        const payload = {
          name: updatedFormData.name || 'Anonymous',
          email: updatedFormData.email,
          mobile: updatedFormData.phone,
          services_interested: updatedFormData.services ? [updatedFormData.services] : [],
          message: `Launch Timeline: ${updatedFormData.launchTimeline}`
        };

        if (payload.email) {
          await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } catch (err) {
        console.error("Failed to submit lead", err);
      }
    }

    typeMainText("Connecting to Pixy neural net...", 10);

    try {
      const res = await fetch('/api/pixy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: nextStep,
          language: 'en',
          formData: updatedFormData,
          userInput: inputVal
        })
      });
      const data = await res.json();

      if (data && data.messages) {
        setInteractionType(data.component);

        if (nextStep === 'services') {
          setCurrentOptions(["AI Engineering", "Web & Platform Engineering", "Something Else"]);
        } else if (nextStep === 'launch') {
          setCurrentOptions(["Within 3 months", "3-6 months", "No rush"]);
        } else if (nextStep === 'complete') {
          setCurrentOptions(["Explore Pixenox"]);
        }

        await typeMainText(data.messages.join(' '), 10);
        setShowPills(true);
      }
    } catch (err) {
      console.error(err);
      await typeMainText("Connection stuttered. Refresh and let's try that again.", 10);
      setShowPills(true);
    }
  };

  useEffect(() => {

    const handleMove = (clientX: number, clientY: number) => {
      if (isPitchModeRef.current) return;
      
      const activeRef = selectedServiceRef.current === 'AI Engineering'
        ? aiEngineeringVideoRef
        : hasPitchedRef.current ? videoRef2 : videoRef;
        
      if (!activeRef.current || !zoneRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const rect = zoneRef.current.getBoundingClientRect();
      // Mathematically tie the target rotational pivot tracking completely to 
      // the exact 60% X visual position of the AI mascot's actual head. 
      // This stops violent horizontal 180-degree jumps across the mid-screen.
      const centerX = rect.left + (rect.width * 0.60);
      const centerY = rect.top + (rect.height * 0.50);

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      // Ensure the post-pitch videos act exclusively as a localized rotary knob over the character's head
      if (activeRef === videoRef2 || activeRef === aiEngineeringVideoRef) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const headRadius = rect.width * 0.75;
        
        if (distance > headRadius) {
          // Return early if the interaction is outside the localized circular knob area
          return;
        }
      }

      let angle = Math.atan2(-deltaX, -deltaY);
      if (angle < 0) {
        angle += 2 * Math.PI;
      }

      const duration = activeRef.current.duration;
      if (!duration || isNaN(duration)) return;

      const targetTime = (angle / (2 * Math.PI)) * duration;

      seekTargetRef.current = targetTime;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        activeRef.current.currentTime = targetTime;
      }
    };

    onMouseMoveRef.current = (e: React.MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    onTouchMoveRef.current = (e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
  }, []);

  const handleSeeked = () => {
    const activeRef = selectedServiceRef.current === 'AI Engineering'
      ? aiEngineeringVideoRef
      : hasPitchedRef.current ? videoRef2 : videoRef;
      
    if (!activeRef.current) return;

    if (seekTargetRef.current !== null) {
      if (Math.abs(activeRef.current.currentTime - seekTargetRef.current) > 0.05) {
        isSeekingRef.current = true;
        activeRef.current.currentTime = seekTargetRef.current;
      } else {
        isSeekingRef.current = false;
        seekTargetRef.current = null;
      }
    } else {
      isSeekingRef.current = false;
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("hello@pixenox.com");
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', minHeight: '100dvh', position: 'relative', overflowX: 'hidden' }}>
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/hnmtoo7q/video/upload/v1790290112/Creature_rotating_head_naturally_20260925041737.mp4"
        muted={isMuted}
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "70% center",
          pointerEvents: "none",
          opacity: hasPitched ? 0 : 1,
          transition: "opacity 0.5s ease"
        }}
      />

      <video
        ref={videoRef2}
        src="https://res.cloudinary.com/hnmtoo7q/video/upload/v1790582532/Head_rotating_anticlockwise_20260928130028.mp4"
        muted={isMuted}
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "70% center",
          pointerEvents: "none",
          opacity: hasPitched && formData.services !== 'AI Engineering' ? 1 : 0,
          transition: "opacity 0.5s ease"
        }}
      />

      <video
        ref={aiEngineeringVideoRef}
        src="https://res.cloudinary.com/hnmtoo7q/video/upload/v1790849520/Creature_rotating_head_with_holo__20260928161315.mp4"
        muted={isMuted}
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "70% center",
          pointerEvents: "none",
          opacity: formData.services === 'AI Engineering' ? 1 : 0,
          transition: "opacity 0.6s ease"
        }}
      />

      <video
        ref={pitchVideoRef}
        src="https://res.cloudinary.com/hnmtoo7q/video/upload/v1790581746/Creature_projects_holographic_sc__20260928131603.mp4"
        muted={isMuted}
        playsInline
        onEnded={() => {
          setHasPitched(true);
          hasPitchedRef.current = true;
          setIsPitchMode(false);
          isPitchModeRef.current = false;
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "70% center",
          pointerEvents: "none",
          opacity: isPitchMode ? 1 : 0,
          transition: "opacity 0.5s ease"
        }}
      />

      <div
        ref={zoneRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 5,
          opacity: 0,
          pointerEvents: "auto"
        }}
        onMouseMove={(e) => onMouseMoveRef.current?.(e)}
        onTouchMove={(e) => onTouchMoveRef.current?.(e)}
      />

      {/* Visual representation of the rotary interaction knob */}
      <div 
        className="pointer-events-none fixed z-[6] rounded-full transition-all duration-1000 ease-out flex items-center justify-center"
        style={{
          left: '60%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${hasPitched ? 1 : 0.8})`,
          width: 'max(100vh, 150vw)',
          height: 'max(100vh, 150vw)',
          border: '1px dashed rgba(59, 130, 246, 0.4)',
          backgroundColor: 'rgba(59, 130, 246, 0.02)',
          boxShadow: '0 0 50px rgba(59, 130, 246, 0.05) inset, 0 0 20px rgba(0,0,0,0.5)',
          opacity: hasPitched ? 1 : 0,
        }}
      />

      <div className="relative z-10 flex flex-col justify-end lg:justify-center min-h-dvh px-6 pb-20 sm:p-16 md:px-24 pointer-events-none">

        <style>{`
          .custom-hero-padding {
            padding: 0px 22.56px;
          }
          @media (min-width: 1024px) {
            .custom-hero-padding {
              padding-top: 0px;
              padding-bottom: 57.2px;
              padding-left: 51.424px;
              padding-right: 850.424px;
            }
          }
        `}</style>

        <div className="flex flex-col custom-hero-padding">
          <div className="max-w-xl pointer-events-none select-none mb-4" style={{
            transition: 'filter 0.5s ease, opacity 0.5s ease',
            opacity: phase === 'intro' ? 1 : 0.5,
            filter: phase === 'intro' ? 'blur(0px)' : 'blur(4px)'
          }}>
            <p style={{
              whiteSpace: 'pre-wrap',
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              color: phase === 'intro' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'var(--font-heading)',
              transition: 'color 0.5s ease'
            }}>
              {introDisplayed}
              {phase === 'intro' && <span className="custom-blinking-cursor"></span>}
            </p>
          </div>

          <div className="pointer-events-none select-none">
            <p style={{
              whiteSpace: 'pre-wrap',
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              fontWeight: 400,
              color: '#FFFFFF',
              fontFamily: 'var(--font-body)'
            }}>
              {mainDisplayed}
              {(phase === 'main' || phase === 'wait') && <span className="custom-blinking-cursor"></span>}
            </p>
          </div>

          <div
            className="flex flex-wrap pointer-events-auto items-center"
            style={{
              opacity: showPills ? 1 : 0,
              transform: showPills ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              margin: '20px 0px 0px'
            }}
          >
            {interactionType === 'buttons' && currentOptions.map((text) => (
              <button
                key={text}
                className="pill-action mr-3 mb-3"
                onClick={() => {
                  if (conversationStep === 'intro' && text === "Start a project") {
                    advanceConversation('name', text);
                  } else if (conversationStep === 'services') {
                    advanceConversation('launch', text);
                  } else if (conversationStep === 'launch') {
                    advanceConversation('complete', text);
                  }
                }}
              >
                {text}
              </button>
            ))}

            {interactionType === 'text' && (
              <form
                className="w-full flex items-center gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputValue.trim()) {
                    if (conversationStep === 'name') {
                      advanceConversation('contact', inputValue);
                    }
                    setInputValue("");
                  }
                }}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={conversationStep === 'name' ? "Enter your name..." : "Type here..."}
                  className="bg-transparent border-b border-white/40 text-white placeholder-white/40 text-lg outline-none pb-2 w-full max-w-sm"
                />
                <button type="submit" className="pill-action">
                  Continue
                </button>
              </form>
            )}

            {interactionType === 'contact' && (
              <form 
                className="w-full flex items-center gap-3" 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (contactForm.email.trim() && contactForm.phone.trim()) {
                    if (conversationStep === 'contact') {
                      advanceConversation('services', JSON.stringify(contactForm));
                    }
                  }
                }}
              >
                <input 
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="Email address..."
                  className="bg-transparent border-b border-white/40 text-white placeholder-white/40 text-lg outline-none pb-2 w-full max-w-[200px]"
                />
                <input 
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="Phone number..."
                  className="bg-transparent border-b border-white/40 text-white placeholder-white/40 text-lg outline-none pb-2 w-full max-w-[150px]"
                />
                <button type="submit" className="pill-action">
                  Continue
                </button>
              </form>
            )}

            {conversationStep === 'intro' && (
              <button onClick={copyEmail} className="pill-contact group ml-auto mb-3">
                <span>Contact</span>
                <span className="underline">hello@pixenox.com</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
        overflow: "hidden",
      }}>
        {/* Tracking wrapper that simulates object-fit: cover for a 16:9 video with object-position: 70% center */}
        <div style={{
          position: "absolute",
          left: "70%",
          top: "50%",
          transform: "translate(-70%, -50%)",
          width: "max(100vw, 177.777vh)",
          height: "max(100vh, 56.25vw)",
          pointerEvents: "none",
        }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              position: "absolute",
              right: "7.5%",
              bottom: "12.5%",
              zIndex: 50,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              width: "64px",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: "pointer",
              pointerEvents: "auto",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={26} opacity={0.8} /> : <Volume2 size={26} opacity={0.8} />}
          </button>
        </div>
      </div>
    </div>
  );
}
