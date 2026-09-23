"use client";

import { OptionButtons } from "./OptionButtons";

const OPTIONS = ["Allow Voice", "Keep it Silent"];

export function VoicePermission({ onSelect }: { onSelect: (voiceEnabled: boolean) => void }) {
  return (
    <OptionButtons
      variant="large"
      options={OPTIONS}
      onSelect={(choice) => onSelect(choice === OPTIONS[0])}
    />
  );
}
