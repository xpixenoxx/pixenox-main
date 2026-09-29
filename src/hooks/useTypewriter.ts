"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface TypewriterWord {
  text: string;
  status: "done" | "typing" | "pending";
  /** For the currently-typing word, how many chars are visible */
  visibleChars: number;
}

export interface UseTypewriterReturn {
  words: TypewriterWord[];
  isComplete: boolean;
  reset: () => void;
  stop: () => void;
}

export function useTypewriter(
  text: string,
  speed: number = 35,
  isPaused: boolean = false
): UseTypewriterReturn {
  const allWords = useRef<string[]>([]);
  const [wordIndex, setWordIndex] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Split text into words whenever it changes
  useEffect(() => {
    if (!text) {
      allWords.current = [];
      setWordIndex(-1);
      setCharIndex(0);
      setIsComplete(false);
      setIsStopped(false);
      return;
    }
    allWords.current = text.split(/\s+/).filter(Boolean);
    setWordIndex(0);
    setCharIndex(0);
    setIsComplete(false);
    setIsStopped(false);
  }, [text]);

  // Typing loop
  useEffect(() => {
    if (wordIndex < 0 || allWords.current.length === 0) return;
    if (isComplete || isStopped || isPaused) return;

    const words = allWords.current;

    if (wordIndex >= words.length) {
      setIsComplete(true);
      return;
    }

    const currentWord = words[wordIndex];

    if (charIndex < currentWord.length) {
      timerRef.current = setTimeout(() => {
        setCharIndex((c) => c + 1);
      }, speed);
    } else {
      // Word complete, move to next word after a brief pause
      timerRef.current = setTimeout(() => {
        setWordIndex((w) => w + 1);
        setCharIndex(0);
      }, speed * 3);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [wordIndex, charIndex, speed, isComplete, isStopped, isPaused]);

  const reset = useCallback(() => {
    setWordIndex(0);
    setCharIndex(0);
    setIsComplete(false);
    setIsStopped(false);
  }, []);

  const stop = useCallback(() => {
    setIsStopped(true);
    setIsComplete(true); // Treat as complete so styles settle (unblur, etc)
  }, []);

  // Build words array
  const words: TypewriterWord[] = allWords.current.map((word, i) => {
    if (i < wordIndex) {
      return { text: word, status: "done" as const, visibleChars: word.length };
    }
    if (i === wordIndex) {
      return {
        text: word,
        status: "typing" as const,
        visibleChars: Math.min(charIndex, word.length),
      };
    }
    return { text: word, status: "pending" as const, visibleChars: 0 };
  });

  return { words, isComplete, reset, stop };
}
