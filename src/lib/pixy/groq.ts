import "server-only";
import Groq from "groq-sdk";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { ChatRequestBody } from "./types";
import { STEP_INTENT } from "./conversation";

let client: Groq | null = null;

function getClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Groq({ apiKey });
  return client;
}

export interface GroqTurn {
  messages: string[];
  tone: string;
}

/**
 * Asks Groq how Pixy should phrase the current step's message.
 * Returns null on any failure (missing key, network error, bad JSON) so the
 * caller can fall back to a predefined line — the conversation must never
 * depend on this succeeding.
 */
export async function generatePixyMessage(body: ChatRequestBody): Promise<GroqTurn | null> {
  const groq = getClient();
  if (!groq) return null;

  try {
    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      temperature: 0.9,
      presence_penalty: 0.4,
      frequency_penalty: 0.6,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(body.language, body.step) },
        { role: "user", content: buildUserPrompt(body, STEP_INTENT[body.step]) },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) return null;

    return {
      messages: parsed.messages.map((m: any) => String(m).trim()).filter(Boolean),
      tone: typeof parsed.tone === "string" ? parsed.tone : "neutral",
    };
  } catch {
    // Network error, timeout, malformed JSON, rate limit, etc. — fail closed.
    return null;
  }
}
