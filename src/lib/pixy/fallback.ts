import { STEP_CONFIG } from "./conversation";
import type { FormData, StepId } from "./types";

/**
 * Used only when the request to /api/pixy/chat itself cannot be made
 * (offline, DNS failure, etc). The server route already has its own
 * fallback for when Groq specifically fails but the network is fine.
 */
export function getOfflineFallback(step: StepId, formData: FormData, userInput?: string): string[] {
  return STEP_CONFIG[step].fallback(formData, userInput);
}
