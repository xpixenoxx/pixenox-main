"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";
import "./blog-bot.css";

/* ─────────────────────────────────────
   Typewriter renderer
   ───────────────────────────────────── */
function TypewriterText({ text }: { text: string }) {
  const [isPaused, setIsPaused] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const { words, isComplete, stop } = useTypewriter(text, 65, isPaused);

  const togglePause = () => {
    setIsPaused((p) => !p);
  };

  const handleTerminate = () => {
    stop();
    setIsTerminated(true);
  };

  return (
    <div className="tw-wrapper">
      <span className={`tw-container${isComplete || isTerminated ? " tw-complete" : ""}`}>
        {words.map((w, i) => {
          if (w.status === "pending") return null;

          const displayed =
            w.status === "typing" ? w.text.slice(0, w.visibleChars) : w.text;

          return (
            <span key={i} className={`tw-word tw-word--${w.status}`}>
              {displayed}
              {w.status === "typing" && !isPaused && !isTerminated && <span className="tw-cursor" />}
            </span>
          );
        })}
      </span>
      
      {!isComplete && !isTerminated && (
        <div className="tw-controls">
          <button 
            className="blog-bot-stop-btn faq-stop-btn" 
            onClick={togglePause}
          >
            {isPaused ? (
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
          <button 
            className="blog-bot-terminate-btn faq-stop-btn" 
            onClick={handleTerminate}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Terminate
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   Message type
   ───────────────────────────────────── */
interface ChatMessage {
  role: "user" | "bot";
  text: string;
  id: number;
}

/* ─────────────────────────────────────
   BlogFaqBot
   "Any questions?" → Yes/No → Chat
   ───────────────────────────────────── */
export default function BlogFaqBot({ slug, source = "blog" }: { slug: string; source?: "blog" | "service" | "engineering" }) {
  const [phase, setPhase] = useState<"prompt" | "chat" | "dismissed">("prompt");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestBotId, setLatestBotId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat phase starts
  useEffect(() => {
    if (phase === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const userId = ++idCounter.current;
    const userMsg: ChatMessage = { role: "user", text: question, id: userId };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/blog-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "question", question, slug, source }),
      });
      const data = await res.json();
      const botId = ++idCounter.current;
      const botMsg: ChatMessage = {
        role: "bot",
        text: data.answer || "Sorry, I couldn't generate a response.",
        id: botId,
      };
      setMessages((prev) => [...prev, botMsg]);
      setLatestBotId(botId);
    } catch {
      const botId = ++idCounter.current;
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Something went wrong. Please try again.",
          id: botId,
        },
      ]);
      setLatestBotId(botId);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  if (phase === "dismissed") return null;

  return (
    <div className="blog-faq-bot">
      {phase === "prompt" && (
        <div className="blog-faq-bot__prompt">
          <p className="blog-faq-bot__prompt-text">
            Any questions about this {source === 'service' || source === 'engineering' ? 'service' : 'blog'}?
          </p>
          <div className="blog-faq-bot__buttons">
            <button
              className="blog-faq-bot__btn blog-faq-bot__btn--yes"
              onClick={() => setPhase("chat")}
            >
              Yes
            </button>
            <button
              className="blog-faq-bot__btn blog-faq-bot__btn--no"
              onClick={() => setPhase("dismissed")}
            >
              No
            </button>
          </div>
        </div>
      )}

      {phase === "chat" && (
        <div className="blog-faq-bot__chat">
          <div className="blog-faq-bot__header">
            <span className="blog-faq-bot__title">{source === 'service' || source === 'engineering' ? 'Service Q&A' : 'Blog Q&A'}</span>
            <button 
              className="blog-explainer-popup__terminate" 
              onClick={() => {
                setPhase("prompt");
                setMessages([]);
                setInput("");
              }}
              aria-label="Terminate chat"
              title="Terminate and close chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="blog-faq-bot__messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`blog-faq-bot__msg blog-faq-bot__msg--${msg.role}`}
              >
                {msg.role === "bot" && msg.id === latestBotId ? (
                  <TypewriterText text={msg.text} />
                ) : (
                  msg.text
                )}
              </div>
            ))}

            {loading && (
              <div className="blog-faq-bot__msg blog-faq-bot__msg--bot">
                <div className="blog-explainer-popup__loading">
                  <div className="blog-explainer-popup__spinner" />
                  Thinking…
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="blog-faq-bot__input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="blog-faq-bot__input"
              type="text"
              placeholder="Ask a question about this blog…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="blog-faq-bot__send"
              disabled={loading || !input.trim()}
              aria-label="Send question"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22 11 13 2 9z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
