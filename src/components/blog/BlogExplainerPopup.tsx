"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";
import "./blog-bot.css";

/* ─────────────────────────────────────
   Paged Typewriter — shows ~3 lines
   of text, then clears and shows next
   ───────────────────────────────────── */
function PagedTypewriterText({ 
  text, 
  speed = 65, 
  isPaused = false 
}: { 
  text: string; 
  speed?: number;
  isPaused?: boolean;
}) {
  const WORDS_PER_PAGE = 20; // roughly 3 lines worth
  const PAUSE_BETWEEN_PAGES = 1500; // ms to show completed page before clearing

  // Split text into pages of words
  const allWords = useRef<string[]>([]);
  const pages = useRef<string[]>([]);
  
  if (allWords.current.join(" ") !== text) {
    allWords.current = text.split(/\s+/).filter(Boolean);
    pages.current = [];
    for (let i = 0; i < allWords.current.length; i += WORDS_PER_PAGE) {
      pages.current.push(allWords.current.slice(i, i + WORDS_PER_PAGE).join(" "));
    }
  }

  const [currentPage, setCurrentPage] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [isManualPaused, setIsManualPaused] = useState(false);

  const pageText = pages.current[currentPage] || "";
  
  // Pause the typewriter if out of view OR manually paused
  const effectivelyPaused = isPaused || isManualPaused;
  const { words, isComplete } = useTypewriter(pageText, speed, effectivelyPaused);

  // When a page finishes typing, pause, then move to next page
  useEffect(() => {
    if (!isComplete || fadingOut || allDone || effectivelyPaused) return;

    const timer = setTimeout(() => {
      if (currentPage >= pages.current.length - 1) {
        // Last page — stay visible
        setAllDone(true);
        return;
      }
      // Fade out current page
      setFadingOut(true);

      // After fade, show next page
      setTimeout(() => {
        setCurrentPage((p) => p + 1);
        setFadingOut(false);
      }, 600);
    }, PAUSE_BETWEEN_PAGES);

    return () => clearTimeout(timer);
  }, [isComplete, fadingOut, allDone, currentPage, effectivelyPaused]);

  const togglePause = () => {
    setIsManualPaused((p) => !p);
  };

  // Progress indicator
  const progress = pages.current.length > 1
    ? `${currentPage + 1} / ${pages.current.length}`
    : null;

  return (
    <div className="paged-tw">
      <div className={`paged-tw__content${fadingOut ? " paged-tw__content--fade" : ""}${allDone ? " paged-tw__content--done" : ""}`}>
        <span className={`tw-container${isComplete ? " tw-complete" : ""}`}>
          {words.map((w, i) => {
            if (w.status === "pending") return null;
            const displayed =
              w.status === "typing" ? w.text.slice(0, w.visibleChars) : w.text;
            return (
              <span key={`${currentPage}-${i}`} className={`tw-word tw-word--${w.status}`}>
                {displayed}
                {w.status === "typing" && !effectivelyPaused && <span className="tw-cursor" />}
              </span>
            );
          })}
        </span>
      </div>
      
      <div className="paged-tw__footer">
        {!allDone && (
          <button className="blog-bot-stop-btn" onClick={togglePause}>
            {isManualPaused ? (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop
              </>
            )}
          </button>
        )}
        {progress && (
          <div className="paged-tw__progress">{progress}</div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   BlogExplainerPopup
   Inline trigger next to blog title
   ───────────────────────────────────── */
export default function BlogExplainerPopup({ slug, source = "blog" }: { slug: string; source?: "blog" | "service" | "engineering" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isOutOfView, setIsOutOfView] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const fetchExplanation = useCallback(async () => {
    if (explanation) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/blog-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "explain", slug, source }),
      });
      const data = await res.json();
      if (data.answer) {
        setExplanation(data.answer);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [explanation, slug, source]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !explanation && !loading) {
      fetchExplanation();
    }
  };

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Pause when scrolled out of view
  useEffect(() => {
    if (!isOpen || !popupRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsOutOfView(!entry.isIntersecting);
      },
      { threshold: 0.1 } // 10% visible is enough to be considered "in view"
    );

    observer.observe(popupRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [isOpen]);

  const handleTerminate = () => {
    setIsOpen(false);
    setExplanation(null);
  };

  return (
    <div className={`blog-explainer-inline blog-explainer-inline--${source}`} ref={containerRef}>
      <button
        className={`blog-explainer-trigger${isOpen ? " blog-explainer-trigger--active" : ""}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={source === 'service' || source === 'engineering' ? "Explain this service" : "Explain this blog"}
      >
        <span>{source === 'service' || source === 'engineering' ? "Explain Service" : "Explain Blog"}</span>
      </button>

      {/* Popup panel — drops down */}
      <div
        ref={popupRef}
        className={`blog-explainer-popup${isOpen ? " blog-explainer-popup--open" : ""} blog-explainer-popup--${source}`}
        role="dialog"
        aria-label={source === 'service' || source === 'engineering' ? "Service explanation" : "Blog explanation"}
      >
        <div className="blog-explainer-popup__header">
          <div>
            <div className="blog-explainer-popup__label">{source === 'service' || source === 'engineering' ? "Service Explainer" : "Blog Explainer"}</div>
            <div className="blog-explainer-popup__title">Simplified explanation</div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {isOutOfView && !loading && explanation && (
              <div className="blog-explainer-popup__paused">Paused</div>
            )}
            <button 
              className="blog-explainer-popup__terminate" 
              onClick={handleTerminate}
              aria-label="Terminate explanation"
              title="Terminate and close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="blog-explainer-popup__body">
          {loading && (
            <div className="blog-explainer-popup__loading">
              <div className="blog-explainer-popup__spinner" />
              Generating explanation…
            </div>
          )}

          {error && !loading && (
            <p style={{ color: "rgba(255,100,100,0.8)" }}>
              Could not load explanation. Please try again.
            </p>
          )}

          {explanation && !loading && (
            <PagedTypewriterText 
              text={explanation} 
              speed={65} 
              isPaused={isOutOfView} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
