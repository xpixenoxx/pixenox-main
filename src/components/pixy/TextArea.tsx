"use client";

import { FormEvent, useState } from "react";
import { BackButton } from "./BackButton";

interface TextAreaProps {
  label: string;
  placeholder: string;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onBack?: () => void;
}

export function TextArea({ label, placeholder, initialValue = "", onSubmit, onBack }: TextAreaProps) {
  const [value, setValue] = useState(initialValue);
  const canSubmit = value.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-left">
        <label htmlFor="pixy-textarea" className="mb-2 block text-sm font-medium text-text-muted">
          {label}
        </label>
        <textarea
          id="pixy-textarea"
          autoFocus
          rows={4}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-base text-text-primary placeholder:text-text-faint outline-none transition-colors focus:border-accent-gold/60"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        {onBack ? <BackButton onClick={onBack} /> : <span />}
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--bg-glow-violet)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(255,122,138,0.6)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
