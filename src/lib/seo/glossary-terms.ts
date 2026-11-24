export interface GlossaryTerm {
  id: string;
  term: string;
  shortName: string;
  category: 'AI Visibility & Search' | 'AI Systems Architecture' | 'Enterprise Intelligence';
  definition: string;
  whyItMatters: string;
  wikidataUrl?: string;
  relatedHref: string;
  relatedLabel: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'geo',
    term: 'Generative Engine Optimization (GEO)',
    shortName: 'GEO',
    category: 'AI Visibility & Search',
    definition:
      'Generative Engine Optimization (GEO) is the engineering discipline of structuring server-rendered HTML, entity knowledge graphs, verifiable citations, and machine-readable protocols so generative search platforms (ChatGPT Search, Perplexity, Google AI Overviews, and Claude) accurately retrieve, ground, and cite a brand inside synthesized answers.',
    whyItMatters:
      'Unlike ranking ten blue links, generative engines retrieve sub-passages across multiple fan-out queries and synthesize a consensus response. Engineering-led GEO ensures your technical facts are parseable, trusted, and explicitly attributed.',
    wikidataUrl: 'https://www.wikidata.org/wiki/Q180711',
    relatedHref: '/engineering/ai-visibility',
    relatedLabel: 'AI Visibility Engineering (GEO & AEO)',
  },
  {
    id: 'aeo',
    term: 'Answer Engine Optimization (AEO)',
    shortName: 'AEO',
    category: 'AI Visibility & Search',
    definition:
      'Answer Engine Optimization (AEO) structures content and schema markup around clear, direct, answer-first capsules (typically 40–65 words per claim) paired with FAQPage, TechArticle, and SpeakableSpecification JSON-LD so voice assistants, featured snippets, and answer engines can extract authoritative facts verbatim without ambiguity.',
    whyItMatters:
      'Zero-click and direct-answer interfaces compress buyer research into one synthesized summary. AEO formats your core architectural specifications for frictionless extraction.',
    wikidataUrl: 'https://www.wikidata.org/wiki/Q180711',
    relatedHref: '/products/engenox',
    relatedLabel: 'Engenox by Pixenox',
  },
  {
    id: 'ai-query-fan-out',
    term: 'AI Query Fan-Out',
    shortName: 'Query Fan-Out',
    category: 'AI Visibility & Search',
    definition:
      'AI Query Fan-Out is the retrieval mechanism used by modern answer engines to decompose a single complex user prompt into 4 to 12 parallel sub-queries across entities, comparisons, pricing, and edge cases before merging retrieved chunks into one grounded answer.',
    whyItMatters:
      'A page optimized for one head keyword rarely wins citations alone. Winning fan-out retrieval requires modular sub-sections, clear comparison tables, and linked entity depth covering adjacent technical questions.',
    relatedHref: '/blog/the-mechanics-of-ai-query-fan-out-reverse-engineering-how-generative-search-deco',
    relatedLabel: 'Read AI Query Fan-Out Deep Dive',
  },
  {
    id: 'off-page-ai-consensus',
    term: 'Off-Page AI Consensus',
    shortName: 'AI Consensus',
    category: 'AI Visibility & Search',
    definition:
      'Off-Page AI Consensus measures whether independent third-party sources—such as GitHub repositories, technical publications, B2B directories, and verified documentation—corroborate a company’s entity identity and technical claims outside its own domain.',
    whyItMatters:
      'Large language models down-weight uncorroborated self-promotion. Independent consensus across developer ecosystems and trade press acts as the primary trust threshold for commercial recommendations.',
    relatedHref: '/blog/off-page-ai-consensus-graphs-why-backlinks-dont-trigger-citations-and-how-llms-v',
    relatedLabel: 'Read Off-Page AI Consensus Guide',
  },
  {
    id: 'llms-txt',
    term: 'llms.txt (and llms-full.txt)',
    shortName: 'llms.txt',
    category: 'AI Visibility & Search',
    definition:
      'llms.txt is a standardized root Markdown index file (/llms.txt) proposed for AI agents and coding assistants to discover clean documentation routes, entity facts, and .md endpoints without parsing navigation chrome, scripts, or styling overhead.',
    whyItMatters:
      'While traditional search engines do not treat llms.txt as a direct ranking signal, coding agents, MCP clients, and RAG ingestion pipelines rely on it as an unambiguous Business-to-Agent (B2A) directory.',
    relatedHref: '/blog/llmstxt-explained-the-emerging-standard-for-ai-crawler-access-and-when-your-site',
    relatedLabel: 'Read llms.txt Engineering Guide',
  },
  {
    id: 'markdown-content-negotiation',
    term: 'Markdown Content Negotiation (Accept: text/markdown)',
    shortName: 'Accept: text/markdown',
    category: 'AI Visibility & Search',
    definition:
      'Markdown Content Negotiation is an HTTP transport pattern where origin middleware inspects the Accept request header and dynamically serves clean text/markdown responses (plus X-Markdown-Tokens estimates) to AI agents instead of bloated HTML DOM trees.',
    whyItMatters:
      'Serving clean Markdown cuts agent token usage by up to 80–90%, reduces context-window truncation, and increases passage extraction fidelity for autonomous browsers and retrieval agents.',
    relatedHref: '/tools/ai-visibility-checker',
    relatedLabel: 'Test Markdown Negotiation Live',
  },
  {
    id: 'content-signal',
    term: 'Content-Signal Directives',
    shortName: 'Content-Signal',
    category: 'AI Visibility & Search',
    definition:
      'Content-Signal is a machine-readable policy directive delivered via robots.txt and HTTP response headers specifying granular post-crawl usage permissions across three dimensions: search (indexing & RAG retrieval), ai-input (real-time conversational answers), and ai-train (model training).',
    whyItMatters:
      'robots.txt only governs HTTP fetch access; Content-Signal explicitly clarifies how AI platforms may ingest and cite your pages downstream.',
    relatedHref: '/tools/ai-visibility-checker',
    relatedLabel: 'Inspect Content-Signal Support',
  },
  {
    id: 'indexnow',
    term: 'IndexNow Protocol',
    shortName: 'IndexNow',
    category: 'AI Visibility & Search',
    definition:
      'IndexNow is an open push-indexing protocol supported by Microsoft Bing and participating engines that lets publishers notify search indexes immediately via HTTP POST whenever a canonical URL is published or updated.',
    whyItMatters:
      'Because Bing powers fallback search retrieval for ChatGPT Search and Microsoft Copilot, pushing IndexNow notifications during CMS revalidation closes freshness lag across both web and AI search.',
    relatedHref: '/engineering/ai-visibility',
    relatedLabel: 'Explore AI Visibility Architecture',
  },
  {
    id: 'ai-citation-monitoring',
    term: 'AI Citation Monitoring',
    shortName: 'Citation Monitoring',
    category: 'AI Visibility & Search',
    definition:
      'AI Citation Monitoring is automated telemetry that runs structured commercial and technical prompt suites across ChatGPT, Perplexity, Google AI Overviews, and Claude to measure brand mention rate, grounded source URLs, sentiment, and competitor displacement.',
    whyItMatters:
      'Classic rank trackers measure static SERP URLs. AI Citation Monitoring reveals whether your brand is cited, misattributed, or invisible inside non-deterministic generative answers.',
    relatedHref: '/blog/ai-citation-monitoring-how-to-track-whether-chatgpt-perplexity-and-other-llms-m',
    relatedLabel: 'Read AI Citation Monitoring Guide',
  },
  {
    id: 'entity-graph',
    term: 'Schema.org Entity Graph (@graph)',
    shortName: 'Entity Graph',
    category: 'AI Visibility & Search',
    definition:
      'A Schema.org Entity Graph links Organization, Person, SoftwareApplication, Service, TechArticle, and WebSite JSON-LD nodes via persistent @id URIs and external sameAs / Wikidata links so search engines resolve brand identity unambiguously.',
    whyItMatters:
      'Explicit @id graphs eliminate brand-name collisions (such as lookalike software names) and feed structured attributes directly into Google Knowledge Graph and LLM entity resolution.',
    wikidataUrl: 'https://www.wikidata.org/wiki/Q33002955',
    relatedHref: '/blog/structured-data-vs-knowledge-graphs-why-ai-needs-both-to-understand-your-busines',
    relatedLabel: 'Read Structured Data vs Knowledge Graphs',
  },
  {
    id: 'speakable-specification',
    term: 'SpeakableSpecification Schema',
    shortName: 'Speakable Schema',
    category: 'AI Visibility & Search',
    definition:
      'SpeakableSpecification is a Schema.org property on WebPage and Article nodes that uses cssSelector or xPath pointers to identify concise, authoritative prose blocks best suited for text-to-speech playback and direct AEO snippet extraction.',
    whyItMatters:
      'Highlighting an explicit answer capsule selector removes extraction guesswork for voice assistants and answer-extraction pipelines.',
    relatedHref: '/engineering/ai-visibility',
    relatedLabel: 'See Schema Engineering',
  },
  {
    id: 'speculation-rules-api',
    term: 'Speculation Rules API',
    shortName: 'Speculation Rules',
    category: 'AI Visibility & Search',
    definition:
      'The Speculation Rules API is a browser standard allowing sites to declare JSON prerender and prefetch rules in <script type="speculationrules"> so compatible browsers and headless Chromium agents preload next-hop routes before navigation occurs.',
    whyItMatters:
      'Speculative prerendering drives near-zero navigation latency for human visitors while accelerating multi-hop traversal for modern Chromium-based browsing agents.',
    relatedHref: '/engineering/ai-visibility',
    relatedLabel: 'Technical Performance Engineering',
  },
  {
    id: 'production-grade-ai-systems',
    term: 'Production-Grade AI Systems',
    shortName: 'Production AI',
    category: 'AI Systems Architecture',
    definition:
      'Production-grade AI systems combine bounded LLM reasoning with deterministic state machines, schema-validated tool execution, latency and token cost budgets, automated golden-set CI evaluations, and OpenTelemetry observability for 24/7 enterprise operation.',
    whyItMatters:
      'Unconstrained demo loops fail silently under API throttling, drift, and permission edge cases. Production engineering prioritizes auditability, determinism, and bounded failure modes.',
    wikidataUrl: 'https://www.wikidata.org/wiki/Q11660',
    relatedHref: '/engineering/ai-systems',
    relatedLabel: 'Production AI Systems Engineering',
  },
  {
    id: 'deterministic-execution-membrane',
    term: 'Deterministic Execution Membrane',
    shortName: 'Execution Membrane',
    category: 'AI Systems Architecture',
    definition:
      'A Deterministic Execution Membrane is a strict code boundary sitting between an LLM planner and downstream enterprise APIs that enforces JSON schema validation, row-level RBAC authorization, idempotency keys, and risk-tier routing before any side effect occurs.',
    whyItMatters:
      'It ensures prompt injections or probabilistic model hallucinations can never execute unauthorized financial writes, deletions, or external customer mutations.',
    wikidataUrl: 'https://www.wikidata.org/wiki/Q529909',
    relatedHref: '/blog/the-rise-of-autonomous-ai-systems-what-enterprises-need-to-know',
    relatedLabel: 'Read Governed Agent Architecture',
  },
  {
    id: 'hitl',
    term: 'Human-in-the-Loop (HITL) Checkpoints',
    shortName: 'HITL Gates',
    category: 'AI Systems Architecture',
    definition:
      'Human-in-the-Loop (HITL) checkpoints suspend automated workflow state machines prior to irreversible or high-risk actions, presenting a structured diff and confidence context to an authorized reviewer with full cryptographic audit lineage.',
    whyItMatters:
      'Enterprises adopt automation faster when governance teams can calibrate autonomy thresholds by financial value, blast radius, and regulatory sensitivity.',
    relatedHref: '/engineering/ai-systems',
    relatedLabel: 'Explore AI Governance Systems',
  },
  {
    id: 'rag',
    term: 'Permission-Filtered Hybrid RAG',
    shortName: 'Hybrid RAG',
    category: 'AI Systems Architecture',
    definition:
      'Permission-Filtered Hybrid Retrieval-Augmented Generation (RAG) combines dense vector similarity with BM25 lexical search and document-level ACL metadata filtering so LLMs ground answers strictly in live enterprise records the caller is authorized to read.',
    whyItMatters:
      'Naive vector search leaks sensitive cross-tenant context and misses exact product SKUs or error codes; hybrid pre-filtering solves both accuracy and security.',
    wikidataUrl: 'https://www.wikidata.org/wiki/Q115305900',
    relatedHref: '/blog/beyond-vector-databases-engineering-stateful-long-term-memory-for-enterprise-aut',
    relatedLabel: 'Read Stateful Agent Memory',
  },
  {
    id: 'enterprise-platform-convergence',
    term: 'Enterprise Platform Convergence',
    shortName: 'Platform Convergence',
    category: 'Enterprise Intelligence',
    definition:
      'Enterprise Platform Convergence consolidates fragmented point tools, brittle point-to-point webhooks, and siloed ERP/CRM reporting tables onto a single shared operational backbone without forcing disruptive core system migrations.',
    whyItMatters:
      'Consolidating ingestion, governance, and semantic KPIs eliminates integration maintenance tax and reconciles conflicting executive numbers across departments.',
    wikidataUrl: 'https://www.wikidata.org/wiki/Q1172480',
    relatedHref: '/engineering/enterprise-intelligence-engineering',
    relatedLabel: 'Enterprise Intelligence Engineering',
  },
  {
    id: 'decision-intelligence',
    term: 'Decision Intelligence',
    shortName: 'Decision Intelligence',
    category: 'Enterprise Intelligence',
    definition:
      'Decision Intelligence bridges passive BI dashboards and automated operational action by pairing governed enterprise metrics with causal forecasting, scenario modeling, anomaly alerts, and closed-loop workflow triggers.',
    whyItMatters:
      'Historical charts tell leaders what broke last quarter; decision intelligence routes verified operational signals straight into ERP, inventory, or finance workflows in real time.',
    wikidataUrl: 'https://www.wikidata.org/wiki/Q185698',
    relatedHref: '/blog/decision-intelligence-is-replacing-traditional-business-intelligence',
    relatedLabel: 'Read Decision Intelligence vs BI',
  },
  {
    id: 'semantic-layer',
    term: 'Governed Semantic Layer',
    shortName: 'Semantic Layer',
    category: 'Enterprise Intelligence',
    definition:
      'A Governed Semantic Layer sits between raw cloud warehouses and downstream BI tools or AI agents, defining canonical metric formulas, entity joins, currency rules, and role permissions in one version-controlled business catalog.',
    whyItMatters:
      'Without a unified semantic layer, Finance, Operations, and AI assistants compute contradictory revenue, churn, or margin figures from identical tables.',
    relatedHref: '/blog/the-semantic-layer-is-becoming-enterprise-infrastructure',
    relatedLabel: 'Read Why the Semantic Layer Matters',
  },
  {
    id: 'change-data-capture',
    term: 'Change Data Capture (CDC)',
    shortName: 'CDC Pipelines',
    category: 'Enterprise Intelligence',
    definition:
      'Change Data Capture (CDC) streams row-level database commits from legacy ERPs, CRMs, and transactional stores via write-ahead logs with sub-second latency, avoiding heavy batch polling or production table locks.',
    whyItMatters:
      'CDC enables real-time enterprise intelligence and AI agent state synchronization without touching or destabilizing core legacy systems of record.',
    relatedHref: '/blog/beyond-etl-engineering-enterprise-data-platforms-that-scale-with-business-growth',
    relatedLabel: 'Read Beyond Batch ETL',
  },
];
