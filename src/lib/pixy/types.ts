export type LanguageCode = "en" | "te" | "hi";

export type AvatarState = "idle" | "listening" | "thinking" | "speaking" | "success";

export type StepId =
  | "language"
  | "voice"
  | "voice_selection"
  | "intro"
  | "careers"
  | "name"
  | "company"
  | "project"
  | "services"
  | "budget"
  | "launch"
  | "email"
  | "contact"
  | "complete"
  | "culture"
  | "careers_redirect"
  | "explore";

/**
 * Allowlist of component kinds the frontend knows how to render.
 * Groq may only ever select from this list — anything else is rejected
 * server-side and the app falls back to the step's own expected component.
 */
export const ALLOWED_COMPONENTS = [
  "text",
  "email",
  "textarea",
  "company_details",
  "buttons",
  "checkboxes",
  "final-actions",
  "voice_selector",
  "project_description",
  "contact",
] as const;

export type ComponentKind = (typeof ALLOWED_COMPONENTS)[number];

export interface FormData {
  name: string;
  company: string;
  jobTitle: string;
  projectDescription: string;
  uploadedFile?: { name: string; url?: string } | null;
  services: string;
  budget: string;
  launchTimeline: string;
  email: string;
  phone: string;
}

export const EMPTY_FORM_DATA: FormData = {
  name: "",
  company: "",
  jobTitle: "",
  projectDescription: "",
  uploadedFile: null,
  services: "",
  budget: "",
  launchTimeline: "",
  email: "",
  phone: "",
};

export interface ConversationState {
  language: LanguageCode;
  voiceEnabled: boolean;
  currentStep: StepId;
  history: StepId[];
  formData: FormData;
  avatarState: AvatarState;
}

export interface PixyTurn {
  message: string;
  tone: "warm" | "playful" | "curious" | "encouraging" | "celebratory" | "neutral";
  step: StepId;
  component: ComponentKind;
  options?: string[];
}

export interface ChatRequestBody {
  step: StepId;
  language: LanguageCode;
  formData: FormData;
  userInput?: string;
  recentPixyResponses?: string[];
}
