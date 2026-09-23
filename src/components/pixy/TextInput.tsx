"use client";

import { FormEvent, useState } from "react";
import { BackButton } from "./BackButton";

interface TextInputProps {
  label: string;
  placeholder: string;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onBack?: () => void;
  autoFocus?: boolean;
  type?: "text" | "email";
}

export function TextInput({
  label,
  placeholder,
  initialValue = "",
  onSubmit,
  onBack,
  autoFocus = true,
  type = "text",
}: TextInputProps) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);

  const isEmail = type === "email";
  const emailValid = !isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const hasValue = value.trim().length > 0;
  const canSubmit = hasValue && emailValid;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    onSubmit(value.trim());
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex w-full items-end border-b-2 border-white/20 pb-2 transition-colors focus-within:border-white/60">
          <input
            id="pixy-text-input"
            type={type === "email" ? "email" : "text"}
            inputMode={type === "email" ? "email" : "text"}
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={placeholder}
            className="w-full bg-transparent px-2 py-2 text-2xl text-text-primary placeholder:text-white/30 outline-none focus:outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
            aria-invalid={touched && !canSubmit}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white hover:text-[#1A1A24] active:scale-95 disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white"
            aria-label="Submit"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4 flex w-full items-center justify-between px-4">
          {onBack ? <BackButton onClick={onBack} /> : <span />}
          {touched && isEmail && hasValue && !emailValid && (
            <p className="text-sm text-accent-soft" role="alert">
              That email doesn&apos;t look quite right yet.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
