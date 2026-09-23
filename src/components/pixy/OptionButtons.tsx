"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BackButton } from "./BackButton";

interface OptionButtonsProps {
  options: string[];
  onSelect: (option: string) => void;
  onBack?: () => void;
  /** "large" for the two big intro choices, "pill" for budget/launch/etc. */
  variant?: "large" | "pill";
}

export function OptionButtons({ options, onSelect, onBack, variant = "pill" }: OptionButtonsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    // Small delay so the selection glow is visible before the step transitions away.
    setTimeout(() => onSelect(option), 220);
  };

  return (
    <div className="space-y-4">
      <div
        className={
          variant === "large"
            ? "flex flex-wrap justify-start gap-4"
            : "flex flex-wrap justify-start gap-3"
        }
      >
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              whileTap={{ scale: 0.97 }}
              animate={isSelected ? { scale: [1, 1.04, 1] } : {}}
              transition={{ duration: 0.25 }}
              className={
                variant === "large" ? "pixy-btn-large" : "pixy-btn-pill"
              }
              style={
                isSelected ? { opacity: 0.7 } : {}
              }
            >
              {option}
            </motion.button>
          );
        })}
      </div>
      {onBack && (
        <div className="flex justify-center">
          <BackButton onClick={onBack} />
        </div>
      )}
    </div>
  );
}
