"use client";

import type { LanguageCode } from "@/lib/pixy/types";
import { OptionButtons } from "./OptionButtons";

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिंदी" },
];

export function LanguageSelector({ onSelect }: { onSelect: (code: LanguageCode) => void }) {
  const labelToCode = Object.fromEntries(LANGUAGES.map((l) => [l.label, l.code]));

  return (
    <OptionButtons
      variant="large"
      options={LANGUAGES.map((l) => l.label)}
      onSelect={(label) => onSelect(labelToCode[label] as LanguageCode)}
    />
  );
}
