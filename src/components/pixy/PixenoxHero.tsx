"use client";

import React, { useEffect, useRef, useState } from "react";

function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // reset
    setDisplayed("");
    setDone(false);

    let currentIndex = 0;
    let isActive = true;

    const tick = () => {
      if (!isActive) return;
      if (currentIndex < text.length) {
        setDisplayed(text.substring(0, currentIndex + 1));
        currentIndex++;
        timeoutId = setTimeout(tick, speed);
      } else {
        setDone(true);
      }
    };

    timeoutId = setTimeout(tick, startDelay);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export function PixenoxHero() {
  const typeText = "Glad you stopped in. Good taste tends to find us. Now, what are we building?";
  const { displayed, done } = useTypewriter(typeText, 38, 600);

  const videoRef = useRef<HTMLVideoElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const seekTargetRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const onMouseMoveRef = useRef<((e: React.MouseEvent) => void) | null>(null);
  const onTouchMoveRef = useRef<((e: React.TouchEvent) => void) | null>(null);

  useEffect(() => {

    const handleMove = (clientX: number, clientY: number) => {
      if (!videoRef.current || !zoneRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const rect = zoneRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      let angle = Math.atan2(-deltaX, -deltaY);
      if (angle < 0) {
        angle += 2 * Math.PI;
      }

      const duration = videoRef.current.duration;
      if (!duration || isNaN(duration)) return;

      const targetTime = (angle / (2 * Math.PI)) * duration;

      seekTargetRef.current = targetTime;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        videoRef.current.currentTime = targetTime;
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
    if (!videoRef.current) return;

    if (seekTargetRef.current !== null) {
      if (Math.abs(videoRef.current.currentTime - seekTargetRef.current) > 0.05) {
        isSeekingRef.current = true;
        videoRef.current.currentTime = seekTargetRef.current;
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

  const [showPills, setShowPills] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowPills(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ fontFamily: 'var(--font-body)', minHeight: '100dvh', position: 'relative' }}>
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/hnmtoo7q/video/upload/v1790290112/Creature_rotating_head_naturally_20260925041737.mp4"
        muted
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
          pointerEvents: "none"
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
          <div className="max-w-xl pointer-events-none select-none mb-4">
            <p style={{ filter: 'blur(4px)', fontSize: 'clamp(18px, 4vw, 26px)', lineHeight: 1.3, fontWeight: 400, color: '#000', fontFamily: 'var(--font-heading)' }}>
              Hey there, meet A.R.I.A,<br />
              Pixenox's Adaptive Response Interface Agent
            </p>
          </div>

          <div className="pointer-events-none select-none">
            <p style={{ fontSize: 'clamp(18px, 4vw, 26px)', lineHeight: 1.35, fontWeight: 400, color: '#FFFFFF', fontFamily: 'var(--font-body)' }}>
              {displayed}
              {!done && <span className="custom-blinking-cursor"></span>}
            </p>
          </div>

          <div
            className="flex flex-wrap pointer-events-auto items-center"
            style={{
              opacity: showPills ? 1 : 0,
              transform: showPills ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease'
            }}
          >
            {["Pitch us an idea", "Come work here", "Send a brief hello", "See how we operate"].map((text) => (
              <button key={text} className="pill-action">
                {text}
              </button>
            ))}

            <button onClick={copyEmail} className="pill-contact group">
              <span>Contact</span>
              <span className="underline">hello@pixenox.com</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
