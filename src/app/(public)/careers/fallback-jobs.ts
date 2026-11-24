export interface JobRole {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  is_active: boolean;
  created_at: string;
}

export const FALLBACK_ROLES: JobRole[] = [
  {
    id: '7f500218-e694-431d-9fce-93e40f472268',
    title: 'Senior Full-Stack Systems Engineer (Next.js / TypeScript)',
    department: 'Product Engineering',
    location: 'India / Remote',
    type: 'Full-Time',
    description:
      'Ship high-speed Server-Side Rendered web applications, Postgres data layers, and flagship Pixenox software platforms including Engenox and Unool.',
    requirements: [
      '5+ years React 19, Next.js App Router (RSC / ISR) & Node.js',
      'Strict TypeScript & versioned REST/RPC API contract design',
      'PostgreSQL schema design, indexing & Supabase RLS policies',
      'Core Web Vitals (LCP / INP / CLS) & WCAG accessibility rigor',
    ],
    is_active: true,
    created_at: '2026-09-18T17:30:01.369584+00:00',
  },
  {
    id: 'a7259de3-ed2c-401d-af2f-e416fa0e0373',
    title: 'Production AI Systems Engineer',
    department: 'AI Systems',
    location: 'India / Remote',
    type: 'Full-Time',
    description:
      'Architect stateful multi-agent orchestration, deterministic tool-validation membranes, and private VPC open-weights LLM inference pipelines for mission-critical enterprise workloads.',
    requirements: [
      '3+ years Python & TypeScript production systems experience',
      'Stateful multi-agent graphs, structured outputs & tool guardrails',
      'Private VPC serving with vLLM / TensorRT-LLM & OpenTelemetry',
      'Golden-dataset evaluation harnesses & regression gating',
    ],
    is_active: true,
    created_at: '2026-09-18T17:30:01.369584+00:00',
  },
  {
    id: '2830ebfb-888c-444e-a9f0-d234de7d3b88',
    title: 'AI Visibility & Search Platform Engineer (Engenox)',
    department: 'Engenox Platform',
    location: 'India / Remote',
    type: 'Full-Time',
    description:
      'Build core crawler diagnostics, Schema.org @graph entity compilers, and multi-engine citation telemetry inside Engenox by Pixenox across Google AI Overviews, ChatGPT Search, and Perplexity.',
    requirements: [
      'Next.js App Router SSR, HTTP/308/404/canonical forensics',
      'Deep mastery of Schema.org JSON-LD @graph & entity disambiguation',
      'RAG retrieval pipelines & answer-first content engineering',
      'Search Console API & disaggregated AI citation telemetry',
    ],
    is_active: true,
    created_at: '2026-09-18T17:30:01.369584+00:00',
  },
  {
    id: '2caedae6-b4b4-4c4e-bf06-fc2304a03e25',
    title: 'Enterprise Data & CDC Platform Engineer',
    department: 'Enterprise Intelligence',
    location: 'India / Remote',
    type: 'Full-Time',
    description:
      'Build non-disruptive ERP, CRM, and cloud data overlays using Change Data Capture, event streaming, and governed semantic layers with strict row-level security.',
    requirements: [
      'Apache Kafka, Debezium CDC & idempotent outbox pipelines',
      'PostgreSQL, lakehouse modeling & dbt semantic layers',
      'Row-Level Security (RLS), RBAC & data lineage enforcement',
      'SAP / NetSuite / Salesforce / custom SQL connector design',
    ],
    is_active: true,
    created_at: '2026-09-18T17:30:01.369584+00:00',
  },
  {
    id: '5cc0a2c9-2099-4406-8408-fe6e18caaad4',
    title: 'Cloud Infrastructure & LLMOps Architect',
    department: 'Cloud & Infra',
    location: 'India / Remote',
    type: 'Full-Time',
    description:
      'Design high-availability AWS, GCP, and Azure VPC topologies, GPU inference autoscaling, FinOps routing, and CI/CD infrastructure-as-code for regulated enterprise AI.',
    requirements: [
      '5+ years production cloud architecture (AWS / GCP / Azure)',
      'Kubernetes, Docker, Terraform & zero-downtime canary rollouts',
      'GPU inference FinOps routing & KV-cache optimization',
      'Security hardening, VPC peering & audit-grade observability',
    ],
    is_active: true,
    created_at: '2026-09-18T17:30:01.369584+00:00',
  },
];
