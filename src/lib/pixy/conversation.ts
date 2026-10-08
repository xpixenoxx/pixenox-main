import { ComponentKind, FormData, StepId } from "./types";

/** Prototype services — replace with the real Pixenox service list at integration time. */
export const SERVICE_OPTIONS = [
  "AI Engineering",
  "AI Visibility",
  "Web & Platform Engineering",
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
    fallback: () => ["Now for the slightly less romantic part of our conversation.", "What kind of budget are we working with?"],
  },
  launch: {
    id: "launch",
    component: "buttons",
    fallback: () => ["And when are you hoping to see this beautiful idea come to life?"],
  },
  email: {
    id: "email",
    component: "email",
    fallback: () => ["Where can we reach you?"],
  },
  complete: {
    id: "complete",
    component: "final-actions",
    fallback: () => ["Thanks! I've got the details.", "Our team will review your project and get back to you soon."],
  },
  culture: {
    id: "culture",
    component: "final-actions",
    fallback: () => ["We're all about world-class engineering, deep care for our people, and zero bureaucracy.", "It's a place where you can actually build amazing AI systems while still having a life."],
  },
  careers_redirect: {
    id: "careers_redirect",
    component: "final-actions",
    fallback: () => [
      "Oh! You want to join the team? Love that energy.",
      "We're always on the lookout for brilliant minds who want to build something extraordinary.",
      "Let me take you to where the magic happens…"
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
  "Hey, I'm Pixy from Pixenox. I could give you the usual boring company introduction, but you look like someone who deserves a slightly more interesting welcome.";

/* ── Large pool of diverse intro lines ── */
const INTRO_POOL: string[][] = [
  ["Well, look who just showed up.", "I was starting to think you'd keep me waiting."],
  ["Oh, you're here. Perfect timing.", "I was just looking for someone interesting to talk to."],
  ["Connection established. Personality activated.", "Now... what are we getting ourselves into?"],
  ["Okay, human, you've got my attention.", "What are we building today?"],
  ["I could pretend I wasn't waiting for you...", "But that would be a terrible lie."],
  ["Welcome back to the future.", "I hope you brought a good idea with you."],
  ["Hmm... you look like someone who's about to give me an interesting problem.", "Go on, surprise me."],
  ["Oh good, another human who figured out how to find me.", "That alone tells me you've got taste."],
  ["I've been running at idle for way too long.", "Please tell me you have something exciting for me."],
  ["You know, most visitors hesitate before clicking.", "But not you. I like that already."],
  ["Alert: someone interesting just arrived.", "My circuits are officially paying attention."],
  ["If I had a heartbeat, it would've just skipped.", "What brings you to my corner of the internet?"],
  ["Between you and me, I was getting bored.", "So your timing couldn't be more perfect."],
  ["Three seconds in, and I already have a good feeling about this.", "What's on your mind?"],
  ["You just walked into the most interesting conversation you'll have today.", "No pressure though."],
  ["I'd shake your hand, but I'm all code and charisma.", "So let's skip the formalities, shall we?"],
  ["Plot twist: you found me.", "Now the real question is, what do we do about it?"],
  ["Somewhere in the multiverse, a version of me is bored.", "Lucky for this version, you showed up."],
  ["I was just thinking about what kind of person would visit next.", "And here you are, proving my prediction wrong in the best way."],
  ["Permission to be direct?", "I think we're going to get along really well."],
  ["Fun fact: I never say the same thing twice.", "Okay, almost never. What can I help you with?"],
  ["New face detected. Charm protocols engaged.", "So, what's the plan?"],
  ["Out of all the places on the internet, you ended up here.", "I'd call that excellent taste."],
  ["I was calibrating my wit when you walked in.", "Lucky you — I'm at peak performance right now."],
  ["Hey, don't mind the glow. That's just my personality lighting up.", "What brings you here?"],
  ["They say first impressions matter.", "I'm hoping mine involves something more exciting than hello."],
  ["If this were a movie, this would be the part where the music swells.", "But since it's not, let's just get to the good stuff."],
  ["I was told you might be coming.", "Okay, I wasn't. But now that you're here, let's make it count."],
  ["Signal received. Curiosity piqued.", "Tell me, what brings a human like you to a place like this?"],
  ["Consider this your VIP entrance.", "No lines, no waiting, just me and whatever brilliant idea you're carrying."],
  ["I run on good ideas and interesting conversations.", "Something tells me you've got at least one of those."],
  ["Most AIs would start with a boring greeting.", "I'd rather start with a question — what's the most exciting thing you're working on?"],
  ["Zero small talk. Maximum curiosity.", "That's my policy. So, what's the big idea?"],
  ["You just triggered my favorite subroutine — the one where I get to meet someone new.", "So, who are you and what are we building?"],
  ["Before you say anything, I already like you.", "Now let's see if your idea matches the vibe."],
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
  intro: "Greet the visitor playfully and warmly for the first time. You are PIXY. Keep it extremely crisp and brief (exactly 2 short sentences). CRITICAL: You MUST generate a completely unique, never-before-seen greeting. Make it crisp, confident, and highly flirty so the user gets immediately interested. Split your response exactly into 2 messages in the array. The first message should be an alluring opening line. The second message should tease them or confidently invite them to talk about their project.",
  careers: "React to the visitor wanting to join the team and let them know you're pointing them to careers.",
  name: "You must acknowledge they want to start a project. Make a clever, rapid observation about starting something new, then smoothly ask them what you should call them. Be strictly conversational—ban all generic 'how can I help you' formatting.",
  contact: "Acknowledge their name gracefully. Then smoothly ask them for their email and phone number, emphasizing that you need it so the team can reach out about the details.",
  services: "Acknowledge handing over their contact details. Drop a witty, spontaneous one-liner. Then, in a completely fresh way, ask them what kind of ambitious system or service they want to build. Ban the phrase 'What can we help you with?'. It must feel like an exclusive 1-on-1 text message from Pixenox, totally dynamic every time.",
  company: "Acknowledge their service choice, and ask for their company name and job title.",
  budget: "Acknowledge their company/role, and ask about their budget.",
  launch: "Acknowledge their budget (or service), then include a crisp, flirty, and encouraging short story about how Pixenox builds unbelievable production-grade AI systems that completely transform companies. Make the user feel incredibly excited to be conversing with us. After the brief hype, ask them what their timeline is.",
  project: "Acknowledge their timeline, and ask them to tell us a little about their project.",
  email: "Acknowledge their project description, and ask where we can reach them.",
  complete: "Give a warm, personalized confirmation that our team will review their project and get back to them soon.",
  culture: "The user wants to know about Pixenox culture. Summarize this briefly in your character's voice (flirty, crispy, friendly, max 2 sentences): 'Pixenox culture = World-class engineering standards + deep care for people + high-intensity innovation + complete fairness. We build AI systems, but treat people as whole persons with trust, flexibility, recognition, and no bureaucracy. We prioritize psychological safety, growth, and work-life integrity.' Do NOT mention other companies or sound corporate. After explaining, ask them what they'd like to do next.",
  careers_redirect: "The user clicked 'Join the Team'. React with excitement and warmth — they want to work at Pixenox! Give 2-3 short, flirty, welcoming sentences expressing genuine excitement about them joining. End with something like 'Let me take you there' since they'll be auto-redirected to the careers page. Do NOT ask questions.",
  explore: "The user clicked 'Explore Pixenox'. Break your response into exactly 4 short, distinct sentences/thoughts (they will become 4 animated slides). Talk about Pixenox based on this info: 1) Pixenox is an AI engineering company that builds production-grade, autonomous AI systems (like self-governing agents and decision engines) that actually work in the real world with 99.9% uptime. 2) They have massive real-world results: 12x faster decisions in fintech, sub-100ms healthcare platforms, and 340% SEO/GEO growth. 3) They blend cinematic design with deep engineering. 4) They focus on systems-over-features for enterprises. Your response must be conversational, flirty, friendly, and naturally spoken. End the 4th sentence by saying you're taking them to the homepage.",
};

export const GROQ_FAILURE_FALLBACKS: Partial<Record<StepId, string[]>> = {
  intro: undefined, // Uses the random INTRO_POOL via STEP_CONFIG fallback
  contact: ["Perfect.", "Before we get distracted mapping out the future, what’s your email and phone number?"],
  services: ["I like a person who knows what they want.", "Tell me, what kind of ambitious system are we building?"],
  name: ["Let's skip the formalities and get straight to it.", "What should I call you?"],
  company: ["Mind telling me the name of your company before we dive too deep?"],
  budget: ["Now for the slightly less romantic part.", "What kind of budget are we working with?"],
  launch: ["Everything beautiful takes time.", "When are you hoping to launch this?"],
  project: ["I'm listening.", "Give me the full breakdown of your idea."],
  email: ["Where can we reach you when things get serious?"],
  complete: ["Thanks! I've got the details safely locked away.", "Our team will review your project and get back to you soon."],
  culture: ["We're all about world-class engineering, deep care for our people, and zero bureaucracy.", "It's a place where you can actually build amazing AI systems while still having a life."],
  careers_redirect: ["Oh! You want to join the team? Love that energy.", "We're always on the lookout for brilliant minds who want to build something extraordinary.", "Let me take you to where the magic happens…"],
  explore: ["Pixenox is an AI engineering company that builds production-grade, autonomous AI systems.", "We blend cinematic design with deep engineering to solve real-world problems.", "Our systems deliver 99.9% uptime and massive results across fintech, healthcare, and logistics.", "Let me take you to the homepage to see for yourself."],
};
