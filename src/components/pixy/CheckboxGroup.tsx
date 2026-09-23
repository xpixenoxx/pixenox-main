"use client";

import { useState } from "react";
import { BackButton } from "./BackButton";

interface CheckboxGroupProps {
  options: string[];
  initialValue?: string[];
  onSubmit: (selected: string[]) => void;
  onBack?: () => void;
}

export function CheckboxGroup({ options, initialValue = [], onSubmit, onBack }: CheckboxGroupProps) {
  const [selected, setSelected] = useState<string[]>(initialValue);

  const toggle = (option: string) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-center gap-2.5" role="group" aria-label="Services">
        {options.map((option) => {
          const isChecked = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              role="checkbox"
              aria-checked={isChecked}
              onClick={() => toggle(option)}
              className="rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderColor: isChecked ? "var(--accent-gold)" : "var(--surface-border)",
                background: isChecked ? "rgba(242, 200, 121, 0.14)" : "rgba(255,255,255,0.05)",
                color: isChecked ? "var(--accent-gold)" : "var(--text-primary)",
              }}
            >
              <span aria-hidden="true" className="mr-2">
                {isChecked ? "✓" : ""}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        {onBack ? <BackButton onClick={onBack} /> : <span />}
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => onSubmit(selected)}
          className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--bg-glow-violet)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(255,122,138,0.6)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
