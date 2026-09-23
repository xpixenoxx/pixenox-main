"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VoiceSelectorProps {
  onSelect: (voiceURI: string) => void;
  language: string;
}

export function VoiceSelector({ onSelect, language }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedURI, setSelectedURI] = useState<string>("");

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const allVoices = window.speechSynthesis.getVoices();
      const filtered = allVoices.filter(v => v.lang.startsWith(language) || v.lang.startsWith("en"));
      
      // Deduplicate voices by URI just in case
      const uniqueVoices = Array.from(new Map(filtered.map(v => [v.voiceURI, v])).values());
      
      setVoices(uniqueVoices);
      if (uniqueVoices.length > 0 && !selectedURI) {
        setSelectedURI(uniqueVoices[0].voiceURI);
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [language, selectedURI]);

  const handlePlay = (voice: SpeechSynthesisVoice) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Hello, I am pixy. How do I sound?");
    utterance.voice = voice;
    // Keep a reference on the window to prevent aggressive garbage collection in Chrome
    (window as any)._sampleUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col gap-4"
    >
      <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {voices.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">Loading voices...</p>
        ) : (
          voices.map((voice) => (
            <div
              key={voice.voiceURI}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                selectedURI === voice.voiceURI
                  ? "border-accent-gold bg-accent-gold/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => setSelectedURI(voice.voiceURI)}
            >
              <span className="text-sm font-medium text-text-primary">
                {voice.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay(voice);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/20 transition-colors"
                title="Play sample"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => onSelect(selectedURI)}
        disabled={!selectedURI}
        className="w-full rounded-full bg-white py-3 text-sm font-medium text-[#1A1A24] transition-all hover:bg-white/90 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
      >
        Continue
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}} />
    </motion.div>
  );
}
