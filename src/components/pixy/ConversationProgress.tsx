import { MAIN_SEQUENCE } from "@/lib/pixy/conversation";
import type { StepId } from "@/lib/pixy/types";

export function ConversationProgress({ step }: { step: StepId }) {
  const index = MAIN_SEQUENCE.indexOf(step);
  if (index === -1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
      {MAIN_SEQUENCE.map((s, i) => (
        <span
          key={s}
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: i === index ? 18 : 6,
            background: i <= index ? "var(--accent-gold)" : "var(--surface-border)",
            opacity: i <= index ? 0.9 : 0.5,
          }}
        />
      ))}
    </div>
  );
}
