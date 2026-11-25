"use client";

import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, X } from "lucide-react";

export interface InputFocusNDC {
  x: number;
  y: number;
}

interface BaseInputCallbacks {
  onFocusChange: (focused: boolean, ndc: InputFocusNDC | null) => void;
  onTypingPulse: () => void;
  onValidationError: (message: string) => void;
  onClearError: () => void;
  errorMessage: string | null;
  onHoverSfx?: () => void;
}

function computeElementNDC(el: HTMLElement | null): InputFocusNDC | null {
  if (!el || typeof window === "undefined") return null;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + Math.min(rect.width * 0.35, 160);
  const cy = rect.top + rect.height * 0.5;
  return {
    x: (cx / (window.innerWidth || 1)) * 2 - 1,
    y: -((cy / (window.innerHeight || 1)) * 2 - 1),
  };
}

function CrimsonValidationBadge({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          role="alert"
          className="inline-flex items-center gap-2 rounded-full border border-[#ef4444]/65 bg-[#ef4444]/15 px-3 py-1 text-xs font-medium tracking-wide text-[#fca5a5] backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Single Underline Input (Name)                                  */
/* ------------------------------------------------------------------ */

export function MinimalSingleInput({
  placeholder,
  initialValue = "",
  validate,
  onSubmit,
  onFocusChange,
  onTypingPulse,
  onValidationError,
  onClearError,
  errorMessage,
  onHoverSfx,
}: BaseInputCallbacks & {
  placeholder: string;
  initialValue?: string;
  validate: (val: string) => string | null;
  onSubmit: (val: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const reportFocus = useCallback(
    (focused: boolean) => {
      onFocusChange(focused, focused ? computeElementNDC(inputRef.current) : null);
    },
    [onFocusChange]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
    return () => {
      clearTimeout(t);
      onFocusChange(false, null);
    };
  }, [onFocusChange]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = validate(value.trim());
    if (err) {
      onValidationError(err);
      inputRef.current?.focus();
      return;
    }
    onClearError();
    onFocusChange(false, null);
    onSubmit(value.trim());
  };

  const hasError = Boolean(errorMessage);

  return (
    <form noValidate onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3.5">
        <div
          className={`relative flex-1 border-b pb-2.5 transition-colors duration-150 ${
            hasError
              ? "border-[#ef4444]"
              : "border-white/35 focus-within:border-white"
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onFocus={() => reportFocus(true)}
            onBlur={() => reportFocus(false)}
            onChange={(e) => {
              setValue(e.target.value);
              if (errorMessage) onClearError();
              onTypingPulse();
              reportFocus(true);
            }}
            placeholder={placeholder}
            aria-invalid={hasError}
            className="w-full bg-transparent text-lg sm:text-xl text-white placeholder:text-white/35 outline-none"
          />
        </div>
        <button
          type="submit"
          onMouseEnter={onHoverSfx}
          className="pixy-studio-pill self-start sm:self-auto shrink-0"
        >
          Continue
        </button>
      </div>
      <div className="mt-3 min-h-[28px]">
        <CrimsonValidationBadge message={errorMessage} />
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Dual Underline Input (Company + Role OR Email + Optional Phone)*/
/* ------------------------------------------------------------------ */

export function MinimalDualInput({
  firstPlaceholder,
  secondPlaceholder,
  firstType = "text",
  secondType = "text",
  initialFirst = "",
  initialSecond = "",
  submitLabel = "Continue",
  validate,
  onSubmit,
  onFocusChange,
  onTypingPulse,
  onValidationError,
  onClearError,
  errorMessage,
  onHoverSfx,
}: BaseInputCallbacks & {
  firstPlaceholder: string;
  secondPlaceholder: string;
  firstType?: "text" | "email";
  secondType?: "text" | "tel";
  initialFirst?: string;
  initialSecond?: string;
  submitLabel?: string;
  validate: (first: string, second: string) => string | null;
  onSubmit: (first: string, second: string) => void;
}) {
  const [first, setFirst] = useState(initialFirst);
  const [second, setSecond] = useState(initialSecond);
  const firstRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => firstRef.current?.focus(), 80);
    return () => {
      clearTimeout(t);
      onFocusChange(false, null);
    };
  }, [onFocusChange]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = validate(first.trim(), second.trim());
    if (err) {
      onValidationError(err);
      return;
    }
    onClearError();
    onFocusChange(false, null);
    onSubmit(first.trim(), second.trim());
  };

  const hasError = Boolean(errorMessage);

  return (
    <form noValidate onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3.5">
        <div
          className={`flex-1 border-b pb-2.5 transition-colors duration-150 ${
            hasError
              ? "border-[#ef4444]"
              : "border-white/35 focus-within:border-white"
          }`}
        >
          <input
            ref={firstRef}
            type={firstType}
            value={first}
            onFocus={() => onFocusChange(true, computeElementNDC(firstRef.current))}
            onBlur={() => onFocusChange(false, null)}
            onChange={(e) => {
              setFirst(e.target.value);
              if (errorMessage) onClearError();
              onTypingPulse();
              onFocusChange(true, computeElementNDC(firstRef.current));
            }}
            placeholder={firstPlaceholder}
            aria-invalid={hasError}
            className="w-full bg-transparent text-base sm:text-lg text-white placeholder:text-white/35 outline-none"
          />
        </div>

        <div
          className={`flex-1 border-b pb-2.5 transition-colors duration-150 ${
            hasError && second.trim().length === 0 && secondType === "text"
              ? "border-[#ef4444]"
              : "border-white/35 focus-within:border-white"
          }`}
        >
          <input
            ref={secondRef}
            type={secondType}
            value={second}
            onFocus={() => onFocusChange(true, computeElementNDC(secondRef.current))}
            onBlur={() => onFocusChange(false, null)}
            onChange={(e) => {
              setSecond(e.target.value);
              if (errorMessage) onClearError();
              onTypingPulse();
              onFocusChange(true, computeElementNDC(secondRef.current));
            }}
            placeholder={secondPlaceholder}
            className="w-full bg-transparent text-base sm:text-lg text-white placeholder:text-white/35 outline-none"
          />
        </div>

        <button
          type="submit"
          onMouseEnter={onHoverSfx}
          className="pixy-studio-pill self-start sm:self-auto shrink-0"
        >
          {submitLabel}
        </button>
      </div>
      <div className="mt-3 min-h-[28px]">
        <CrimsonValidationBadge message={errorMessage} />
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Minimal Underline Project Brief Input (Zero Page Scroll)       */
/* ------------------------------------------------------------------ */

export function MinimalProjectInput({
  placeholder,
  initialValue = "",
  initialFile = null,
  onSubmit,
  onFocusChange,
  onTypingPulse,
  onValidationError,
  onClearError,
  errorMessage,
  onHoverSfx,
}: BaseInputCallbacks & {
  placeholder: string;
  initialValue?: string;
  initialFile?: { name: string; url?: string } | null;
  onSubmit: (brief: string, file: { name: string; url?: string } | null) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [file, setFile] = useState<{ name: string; url?: string } | null>(initialFile);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => areaRef.current?.focus(), 80);
    return () => {
      clearTimeout(t);
      onFocusChange(false, null);
    };
  }, [onFocusChange]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim().length < 6 && !file) {
      onValidationError("Give Pixy at least a quick line about your idea");
      areaRef.current?.focus();
      return;
    }
    onClearError();
    onFocusChange(false, null);
    onSubmit(value.trim(), file);
  };

  const hasError = Boolean(errorMessage);

  return (
    <form noValidate onSubmit={handleSubmit} className="w-full max-w-xl">
      <div
        className={`border-b pb-2.5 transition-colors duration-150 ${
          hasError
            ? "border-[#ef4444]"
            : "border-white/35 focus-within:border-white"
        }`}
      >
        <textarea
          ref={areaRef}
          rows={2}
          value={value}
          onFocus={() => onFocusChange(true, computeElementNDC(areaRef.current))}
          onBlur={() => onFocusChange(false, null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          onChange={(e) => {
            setValue(e.target.value);
            if (errorMessage) onClearError();
            onTypingPulse();
            onFocusChange(true, computeElementNDC(areaRef.current));
          }}
          placeholder={placeholder}
          aria-invalid={hasError}
          className="max-h-24 w-full resize-none overflow-y-auto bg-transparent text-base sm:text-lg text-white placeholder:text-white/35 outline-none glass-scroll"
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile({ name: f.name, url: URL.createObjectURL(f) });
                  if (errorMessage) onClearError();
                }
              }}
            />
            {file ? (
              <span className="inline-flex max-w-[210px] items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white">
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  aria-label="Remove file"
                  className="text-white/70 hover:text-white"
                >
                  <X size={12} />
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
              >
                <Paperclip size={14} />
                <span>Attach brief (optional)</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            onMouseEnter={onHoverSfx}
            className="pixy-studio-pill shrink-0"
          >
            Continue
          </button>
        </div>
      </div>

      <div className="mt-3 min-h-[28px]">
        <CrimsonValidationBadge message={errorMessage} />
      </div>
    </form>
  );
}
