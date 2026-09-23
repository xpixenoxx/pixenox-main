import { NextRequest, NextResponse } from "next/server";
import { generatePixyMessage } from "@/lib/pixy/groq";
import { GROQ_FAILURE_FALLBACKS, STEP_CONFIG } from "@/lib/pixy/conversation";
import { ChatRequestBody, EMPTY_FORM_DATA, StepId } from "@/lib/pixy/types";

const VALID_STEPS = new Set(Object.keys(STEP_CONFIG));
const VALID_LANGUAGES = new Set(["en", "te", "hi"]);
const MAX_INPUT_LENGTH = 2000;

// Very small in-memory rate limiter — good enough for a prototype, not for production scale.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function sanitizeText(value: unknown, maxLength = MAX_INPUT_LENGTH): string {
  if (typeof value !== "string") return "";
  // Strip control characters and angle brackets; the app never renders this
  // as HTML, but we still don't want to persist/echo raw markup.
  return value.replace(/[<>]/g, "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLength);
}

function sanitizeFormData(input: unknown) {
  const fd = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  return {
    name: sanitizeText(fd.name, 200),
    company: sanitizeText(fd.company, 200),
    jobTitle: sanitizeText(fd.jobTitle, 200),
    projectDescription: sanitizeText(fd.projectDescription, 2000),
    uploadedFile: fd.uploadedFile && typeof fd.uploadedFile === 'object' 
      ? { 
          name: sanitizeText((fd.uploadedFile as any).name, 255), 
          url: sanitizeText((fd.uploadedFile as any).url, 1000) 
        } 
      : null,
    services: sanitizeText(fd.services, 100),
    budget: sanitizeText(fd.budget, 100),
    launchTimeline: sanitizeText(fd.launchTimeline, 100),
    email: sanitizeText(fd.email, 320),
  };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down a little." },
      { status: 429 }
    );
  }

  let body: Partial<ChatRequestBody>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const step = typeof body.step === "string" && VALID_STEPS.has(body.step) ? (body.step as StepId) : null;
  if (!step) {
    return NextResponse.json({ error: "Unknown conversation step." }, { status: 400 });
  }

  const language = typeof body.language === "string" && VALID_LANGUAGES.has(body.language) ? body.language : "en";
  const formData = { ...EMPTY_FORM_DATA, ...sanitizeFormData(body.formData) };
  const userInput = body.userInput ? sanitizeText(body.userInput) : undefined;
  const recentPixyResponses = Array.isArray(body.recentPixyResponses) 
    ? body.recentPixyResponses.map(s => sanitizeText(s, 500)).slice(0, 4) 
    : undefined;

  const config = STEP_CONFIG[step];
  const fallbackMessage = GROQ_FAILURE_FALLBACKS[step] ?? config.fallback(formData, userInput);

  const result = await generatePixyMessage({ 
    step, 
    language: language as ChatRequestBody["language"], 
    formData, 
    userInput,
    recentPixyResponses
  });

  if (!result) {
    // Groq unavailable, rate-limited, or returned something unusable — the
    // conversation must still be able to continue.
    return NextResponse.json({
      messages: fallbackMessage,
      tone: "neutral",
      step,
      component: config.component,
      source: "fallback",
    });
  }

  return NextResponse.json({
    messages: result.messages,
    tone: result.tone,
    step,
    component: config.component,
    source: "groq",
  });
}
