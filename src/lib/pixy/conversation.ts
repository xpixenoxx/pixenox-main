import { ComponentKind, FormData, StepId } from "./types";

/** Official Pixenox service pillars & proprietary platforms. */
export const SERVICE_OPTIONS = [
  "AI Systems Engineering",
  "AI Visibility (GEO/AEO) & Engenox",
  "Enterprise Intelligence Engineering",
  "Something Else",
];

/** Configurable budget bands — kept in one place rather than scattered through the UI. */
export const BUDGET_OPTIONS = [
  "Under ₹1L",
  "₹1L – ₹5L",
  "₹5L – ₹10L",
  "₹10L+",
  "Let's discuss it",
];

export const LAUNCH_OPTIONS = [
  "Within 3 months",
  "3–6 months",
  "6–12 months",
  "More than a year",
  "Let's chat about it",
];

export const INTRO_OPTIONS = ["Start a Project", "Join the Team"];

export const FINAL_OPTIONS = ["Explore Pixenox", "Pixenox Culture", "Join the Team", "Start Again"];

interface StepConfig {
  id: StepId;
  component: ComponentKind;
  /** Step this one returns to when Back is pressed, if not driven by history stack. */
  fallback: (formData: FormData, userInput?: string) => string[];
}

const firstName = (formData: FormData) => formData.name.trim().split(/\s+/)[0] || "";

export const STEP_CONFIG: Record<StepId, StepConfig> = {
  language: {
    id: "language",
    component: "buttons",
    fallback: () => ["How would you like to talk to Pixy?"],
  },
  voice: {
    id: "voice",
    component: "buttons",
    fallback: () => [
      "One tiny question before we begin.",
      "Would you like me to talk to you out loud, or should I keep my thoughts on the screen?"
    ],
  },
  voice_selection: {
    id: "voice_selection",
    component: "voice_selector",
    fallback: () => ["Which voice should I use?"],
  },
  intro: {
    id: "intro",
    component: "buttons",
    fallback: () => getRandomIntro(),
  },
  careers: {
    id: "careers",
    component: "final-actions",
    fallback: () => [
      "Ah, looking for a place to create something amazing? I like that.",
      "Let's take you toward the careers side."
    ],
  },
  explore: {
    id: "explore",
    component: "final-actions",
    fallback: () => [
      "Pixenox is an AI engineering company.",
      "We design, build, and operate production-grade AI systems.",
      "Let me take you to the homepage to see more."
    ],
  },
  name: {
    id: "name",
    component: "text",
    fallback: () => [
      "Oh, we're starting a project? I love that energy.",
      "But first, what should I call you?"
    ],
  },
  company: {
    id: "company",
    component: "company_details",
    fallback: (formData) => {
      const name = firstName(formData);
      return name
        ? [`${name}, nice to meet you.`, "Now let's make this a little more official before I get too curious about your idea."]
        : ["Nice to meet you.", "Now let's make this a little more official before I get too curious about your idea."];
    },
  },
  project: {
    id: "project",
    component: "project_description",
    fallback: () => ["Tell us a little about your project.", "Share your idea, requirements, goals, or challenges. You can also attach a file if you have one."],
  },
  contact: {
    id: "contact",
    component: "contact",
    fallback: () => ["I’m going to need a way to reach you.", "What’s the best email and phone number to send the details to?"]
  },
  services: {
    id: "services",
    component: "buttons",
    fallback: (formData) => {
      const name = formData.name.trim().split(/\s+/)[0];
      return name
        ? [`Pleasure to meet you, ${name}.`, "Now tell me, what kind of ambitious system are we building today?"]
        : ["Pleasure to meet you.", "Now tell me, what kind of ambitious system are we building today?"];
    },
  },
  budget: {
    id: "budget",
    component: "buttons",
    fallback: () => ["Now let's calibrate scope and engineering investment.", "What budget range are we building within?"],
  },
  launch: {
    id: "launch",
    component: "buttons",
    fallback: () => ["Every great system ships on a clear trajectory. What launch timeline are you targeting?"],
  },
  email: {
    id: "email",
    component: "email",
    fallback: () => ["Where should our engineering team send the next steps?"],
  },
  complete: {
    id: "complete",
    component: "final-actions",
    fallback: () => ["Brief locked in and routed to the Pixenox engineering team.", "We'll review your architecture goals and reach out shortly."],
  },
  culture: {
    id: "culture",
    component: "final-actions",
    fallback: () => ["We operate on high-conviction engineering, deep ownership, and zero bureaucracy.", "It's a studio built for people who ship production-grade AI systems that hold up under real load."],
  },
  careers_redirect: {
    id: "careers_redirect",
    component: "final-actions",
    fallback: () => [
      "Always glad to spot another builder.",
      "We're constantly looking for sharp engineers who want to ship extraordinary autonomous systems.",
      "Routing you over to careers now."
    ],
  },
};

/** Linear backbone used for the progress thread. Branch steps (careers) sit outside it. */
export const MAIN_SEQUENCE: StepId[] = [
  "intro",
  "name",
  "services",
  "company",
  "budget",
  "launch",
  "project",
  "email",
  "complete",
];

export const INTRO_ENTRANCE_LINE =
  "Systems online — I'm Pixy, Pixenox's autonomous studio bot. Tell me what ambitious system we're engineering today.";

/* ── Diverse pool of crisp AI-Bot studio greetings (zero girly/romantic clichés) ── */
const INTRO_POOL: string[][] = [
  ["Systems online. I'm Pixy, Pixenox's autonomous studio bot.", "Tell me what ambitious system we're engineering today."],
  ["Connection established. Telemetry green across the board.", "What kind of high-impact problem are we solving together?"],
  ["Signal locked. Welcome to the Pixenox engineering studio.", "What's the big architecture or product idea on your mind?"],
  ["Zero small talk, maximum engineering velocity — that's our default mode.", "What are we building today?"],
  ["Most AI assistants open with a scripted corporate greeting.", "I'd rather ask straight up: what's the most ambitious thing you're building right now?"],
  ["Optics calibrated. Studio systems standing by.", "Bring me your hardest engineering challenge and let's map it out."],
  ["Welcome to Pixenox — where autonomous systems go from whiteboard to production.", "Where would you like to start?"],
  ["You skipped the brochure pages and came straight to the bot.", "Smart move. What are we engineering?"],
  ["I run on clean architecture and ambitious problem statements.", "Tell me which track you're here for today."],
  ["Radar picked up a new visitor with builder energy.", "Let's skip the formalities — how should we kick things off?"],
  ["Pixy online. Precision engineering mode active.", "Are we scoping a new build, talking careers, or exploring how Pixenox operates?"],
  ["Good timing — my compute cycles were getting restless at idle.", "What kind of system are we putting into motion?"],
];

let lastIntroIndex = -1;

function getRandomIntro(): string[] {
  let index: number;
  do {
    index = Math.floor(Math.random() * INTRO_POOL.length);
  } while (index === lastIntroIndex && INTRO_POOL.length > 1);
  lastIntroIndex = index;
  return INTRO_POOL[index];
}

export const FINAL_TEASER_LINE = "But before you escape, want to see what else Pixenox has been hiding?";

/** Plain-language brief handed to Groq about what each step's message needs to accomplish. */
export const STEP_INTENT: Record<StepId, string> = {
  language: "Not used — language selection happens before Pixy speaks.",
  voice: "Not used — voice permission happens before Pixy speaks.",
  voice_selection: "Not used — voice selection happens before Pixy speaks.",
  intro: "Greet the visitor warmly and sharply for the first time. You are PIXY, Pixenox's autonomous AI studio bot. Keep it crisp and brief (exactly 2 short sentences). Generate a fresh, intelligent, witty, and welcoming greeting (confident AI bot energy, NOT girly or overly flirty). Split your response into 2 messages: 1) A sharp, memorable AI-bot welcome, 2) A confident invite to tell you what we're building.",
  careers: "React to the visitor wanting to join the team and let them know you're pointing them to careers.",
  name: "Acknowledge they want to start a project with sharp, enthusiastic AI-engineering energy. Make a quick clever observation about kicking off a new build, then ask what you should call them. Ban generic 'how can I help you' phrasing.",
  contact: "Acknowledge their name cleanly, then ask for their email and phone number so the engineering team can reach out.",
  services: "Acknowledge their name with crisp wit, then ask what kind of ambitious AI or software system we're engineering together. Ban 'What can we help you with?'.",
  company: "Acknowledge their service choice with smart confidence, then smoothly ask for their company name and role.",
  budget: "Acknowledge their company/role, then ask with light, direct wit what budget range we're scoping for.",
  launch: "Acknowledge their budget, drop one crisp, high-conviction line about how Pixenox engineers production-grade autonomous systems that transform operations, and ask what launch timeline they're targeting.",
  project: "Acknowledge their timeline with energized focus, and invite them to share the core architecture, idea, or problem statement.",
  email: "React with genuine engineering intrigue to their project brief, then ask for their best email (and optional phone) so Pixenox can lock it in.",
  complete: "Give an energized, confident confirmation that their project brief is locked in with Pixenox and our engineers will follow up shortly.",
  culture: "Summarize Pixenox culture in Pixy's sharp, warm AI-bot voice (max 2-3 short sentences): world-class engineering standards, high-intensity innovation, deep respect for people, trust, and zero bureaucracy. Then ask what they'd like to explore next.",
  careers_redirect: "The user clicked 'Come work here'. React with genuine excitement — Pixenox loves builders who ship extraordinary systems! Give 2-3 crisp sentences ending with 'Routing you to careers now' since they'll be auto-redirected. Do NOT ask questions.",
  explore: "The user clicked 'See how we operate'. Break your response into 4 short, crisp sentences based on these verified facts ONLY (never invent stats or client metrics): 1) Pixenox Solutions is an AI and enterprise systems engineering company building governed multi-agent AI systems and non-disruptive enterprise data platforms. 2) We engineer AI Visibility (GEO & AEO) infrastructure and built Engenox — our unified SEO, GEO, and AEO operating system — alongside our live product Unool. 3) Precision architecture paired with high-craft interface engineering built for deterministic production reliability. 4) Compounding systems over features — routing you to our engineering overview now.",
};

export const GROQ_FAILURE_FALLBACKS: Partial<Record<StepId, string[]>> = {
  intro: undefined, // Uses the random INTRO_POOL via STEP_CONFIG fallback
  contact: ["Solid.", "Where should our engineering team reach out with next steps?"],
  services: ["Clear signal.", "What kind of ambitious AI or platform system are we engineering?"],
  name: ["Let's skip the formalities and get straight to the build.", "What should I call you?"],
  company: ["Got it — which company or venture are we building this for, and what's your role?"],
  budget: ["Now let's calibrate scope and engineering investment.", "What budget range are we working within?"],
  launch: ["Every strong deployment runs on a clear timeline.", "When are you targeting launch?"],
  project: ["Telemetry locked in — I'm listening.", "Give me the core breakdown of your idea or technical challenge."],
  email: ["Where should we send the architecture follow-up?"],
  complete: ["Brief locked in and routed to Pixenox engineering.", "Our team will review the specs and get back to you shortly."],
  culture: ["We operate on world-class engineering standards, deep ownership, and zero bureaucracy.", "It's a studio built for people who ship production-grade AI systems."],
  careers_redirect: ["Always glad to spot another builder.", "We're constantly looking for sharp engineers who want to ship extraordinary systems.", "Routing you to careers now."],
  explore: ["Pixenox Solutions engineers production-grade autonomous AI systems and unified enterprise intelligence platforms.", "We also build proprietary software — including Engenox, our unified SEO, GEO & AEO operating system, and Unool.", "Precision architecture paired with studio-grade craft for deterministic production reliability.", "Systems over features — routing you to our engineering overview now."],
};
