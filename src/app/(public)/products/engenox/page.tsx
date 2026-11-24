import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Layers, Cpu, Network, BarChart3, ShieldCheck } from 'lucide-react';
import { getCanonicalSiteUrl } from '@/lib/supabase/public';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Engenox by Pixenox — Unified SEO, GEO & AEO Operating System',
  description:
    'Engenox is Pixenox Solutions’ unified autonomous operating system for technical SEO, Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), entity governance, and AI citation monitoring.',
  keywords: [
    'Engenox',
    'Engenox by Pixenox',
    'SEO GEO AEO operating system',
    'unified AI visibility platform',
    'autonomous SEO GEO automation',
    'AI citation monitoring',
    'social SEO automation',
    'Pixenox Solutions',
  ],
  alternates: {
    canonical: '/products/engenox',
  },
  openGraph: {
    title: 'Engenox by Pixenox — Unified SEO, GEO & AEO Operating System',
    description:
      'Enter your domain and business context once. Engenox orchestrates technical crawl audits, entity graphs, answer-first publishing, and AI citation telemetry.',
  },
};

const ENGENOX_FAQS = [
  {
    question: 'What is Engenox by Pixenox?',
    answer:
      'Engenox by Pixenox is a unified software operating system engineered by PIXENOX SOLUTIONS PRIVATE LIMITED that consolidates technical SEO, Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), entity schema management, and social search distribution into one automated workspace.',
  },
  {
    question: 'How does Engenox differ from traditional SEO agencies or standalone AI writing tools?',
    answer:
      'Standalone writing tools generate isolated text without fixing SSR rendering, canonicals, sitemaps, or Knowledge Graph entities, while traditional agencies rely on manual spreadsheets and slow monthly cycles. Engenox unifies automated technical crawl diagnostics, Schema.org @graph entity orchestration, answer-first structured workflows, and multi-engine AI citation tracking with built-in human-in-the-loop quality governance.',
  },
  {
    question: 'Does Engenox guarantee #1 Google rankings or automatic ChatGPT citations?',
    answer:
      'No ethical platform can guarantee rankings or third-party AI citations because search engines and LLMs continuously update retrieval algorithms. Engenox maximizes verified technical eligibility, entity accuracy, extractable answer structure, and measurable citation tracking against your real Search Console and AI-engine baselines.',
  },
  {
    question: 'Which search engines and AI answer platforms does Engenox engineer for?',
    answer:
      'Engenox validates crawler eligibility and citation visibility across Google Search (Googlebot, AI Overviews, AI Mode), Microsoft Bing & Copilot (Bingbot), ChatGPT Search (OAI-SearchBot), Perplexity (PerplexityBot), and Claude (Claude-SearchBot), while preserving strict RFC 9309 governance and clean privacy compliance.',
  },
  {
    question: 'How can our engineering or growth team access Engenox?',
    answer:
      'Request an architecture walkthrough and onboarding session via Pixy at /contact/pixy or email connect@pixenox.com. Our team responds within 24–48 business hours IST.',
  },
  {
    question: 'How does Engenox track brand citations across Perplexity, ChatGPT Search, and Google AI Overviews?',
    answer:
      'Instead of collapsing visibility into one opaque score, Engenox runs repeatable commercial prompt panels and parses four separate telemetry signals: (1) brand mention rate, (2) entity description accuracy, (3) commercial recommendation share, and (4) clickable source citation URLs correlated alongside Google Search Console performance.',
  },
  {
    question: 'When is a standard SEO suite add-on not enough compared to a unified SEO, GEO, and AEO operating system?',
    answer:
      'Legacy keyword tools and lightweight AI writing plugins cannot inspect whether Next.js pages ship client-side spinner shells, emit broken canonicals or Soft 404s, or maintain a clean Schema.org @graph. Engenox unifies technical SSR crawl readiness, entity graph maintenance, content structure, and AI citation tracking on one control plane.',
  },
  {
    question: 'How does Engenox handle multi-regional hreflang, translations, and local search nuances?',
    answer:
      'Engenox enforces canonical + bidirectional hreflang validation alongside locale-aware structured data and server-rendered regional copy so search crawlers and generative answer engines resolve the exact market variant without duplicate-content cannibalization.',
  },
  {
    question: 'What security and data privacy controls protect our domain and proprietary content inside Engenox?',
    answer:
      'Engenox uses least-privilege role permissions, encrypted transport and storage, zero third-party model training on private tenant context, and mandatory human-in-the-loop review gates before any schema, metadata, or content change reaches production.',
  },
];

export default function EngenoxProductPage() {
  const baseUrl = getCanonicalSiteUrl();

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${baseUrl}/#product-engenox`,
    name: 'Engenox by Pixenox',
    alternateName: ['Engenox', 'Engenox OS'],
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${baseUrl}/products/engenox`,
    description:
      'Unified autonomous SEO, GEO, and AEO operating system engineered by PIXENOX SOLUTIONS PRIVATE LIMITED for technical crawl readiness, Knowledge Graph entity governance, structured publishing, and multi-engine AI citation monitoring.',
    creator: { '@id': `${baseUrl}/#organization` },
    publisher: { '@id': `${baseUrl}/#organization` },
    featureList: [
      'Automated SSR, Canonical, Redirect & Crawler Diagnostics',
      'Unified Schema.org @graph & Entity Disambiguation Engine',
      'Answer-First AEO Content & Social SEO Distribution Workflows',
      'Disaggregated Multi-Engine AI Citation & Mention Telemetry',
      'Human-in-the-Loop Governance & Quality Safeguards',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ENGENOX_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'AI Visibility Engineering', item: `${baseUrl}/engineering/ai-visibility` },
      { '@type': 'ListItem', position: 3, name: 'Engenox OS', item: `${baseUrl}/products/engenox` },
    ],
  };

  return (
    <article
      style={{
        minHeight: '100vh',
        background: '#030108',
        color: '#ffffff',
        paddingTop: '140px',
        paddingBottom: '120px',
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px' }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '28px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
          <Link href="/" style={{ color: '#c4b5fd', textDecoration: 'none' }}>Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/engineering/ai-visibility" style={{ color: '#c4b5fd', textDecoration: 'none' }}>AI Visibility</Link>
          <span aria-hidden="true"> / </span>
          <span style={{ color: '#ffffff' }}>Engenox OS</span>
        </nav>

        {/* Hero */}
        <header style={{ marginBottom: '72px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(124, 58, 237, 0.2)',
              border: '1px solid rgba(168, 85, 247, 0.45)',
              color: '#e9d5ff',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            <Layers size={14} aria-hidden="true" />
            PROPRIETARY PLATFORM BY PIXENOX SOLUTIONS
          </span>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              margin: '0 0 24px',
              maxWidth: '920px',
            }}
          >
            Engenox <span style={{ color: '#c4b5fd' }}>by Pixenox</span> — The Unified SEO, GEO &amp; AEO Operating System
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.78)',
              maxWidth: '800px',
              margin: '0 0 36px',
            }}
          >
            Stop stitching together disconnected SEO spreadsheets, manual schema patches, and blind prompt trackers. Enter your domain, product architecture, and brand context once — Engenox orchestrates technical crawler readiness, Knowledge Graph entity engineering, answer-first publishing, social SEO signals, and multi-engine AI citation monitoring from a single governed operating system.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <Link
              href="/contact/pixy"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '999px',
                background: '#ffffff',
                color: '#09090b',
                fontWeight: 700,
                fontSize: '0.96rem',
                textDecoration: 'none',
              }}
            >
              Request Engenox Demo &amp; Early Access
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/engineering/ai-visibility"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.96rem',
                textDecoration: 'none',
              }}
            >
              AI Visibility Engineering Services
            </Link>
          </div>
        </header>

        {/* 4-Layer Operating System Grid */}
        <section aria-labelledby="engenox-layers-heading" style={{ marginBottom: '80px' }}>
          <h2 id="engenox-layers-heading" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 700, margin: '0 0 12px' }}>
            Four Autonomous Layers, One Governed Control Plane
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '720px', margin: '0 0 32px', lineHeight: 1.6 }}>
            Engenox automates repetitive technical diagnostics and visibility workflows while keeping deterministic validation gates and human engineering approval in charge of every production release.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              {
                icon: Cpu,
                title: '1. Technical Crawl & SSR Layer',
                desc: 'Continuously verifies HTTP status codes, Soft 404 prevention, canonical chains, sitemap sync, TTFB caching, and raw HTML visibility for Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, and PerplexityBot.',
              },
              {
                icon: Network,
                title: '2. Entity & Knowledge Graph OS',
                desc: 'Maintains a unified Schema.org @graph connecting your legal entity, leadership, services, and products — detecting broken sameAs links, brand name collisions, and external corroboration gaps automatically.',
              },
              {
                icon: ShieldCheck,
                title: '3. Answer-First AEO & Social SEO',
                desc: 'Structures commercial pages, technical FAQs, comparison tables, and cross-channel social distribution workflows (integrated alongside Unool) so human readers and answer engines extract verified facts cleanly.',
              },
              {
                icon: BarChart3,
                title: '4. Disaggregated AI Citation Telemetry',
                desc: 'Tracks mentions, description accuracy, commercial recommendations, clickable citation URLs, and Search Console performance separately — zero collapsed vanity scores.',
              },
            ].map((layer) => {
              const Icon = layer.icon;
              return (
                <div
                  key={layer.title}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '28px',
                  }}
                >
                  <Icon size={24} color="#c4b5fd" aria-hidden="true" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 10px', color: '#ffffff' }}>{layer.title}</h3>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, fontSize: '0.94rem' }}>{layer.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Semantic Comparison Table (AEO Extractable) */}
        <section aria-labelledby="engenox-comparison-heading" style={{ marginBottom: '80px' }}>
          <h2 id="engenox-comparison-heading" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 700, margin: '0 0 24px' }}>
            How Engenox Compares to Manual Agencies &amp; Point Tools
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.94rem' }}>
              <caption className="sr-only">Comparison of Traditional SEO Agencies, Standalone AI Tools, and Engenox Operating System</caption>
              <thead>
                <tr style={{ background: 'rgba(124, 58, 237, 0.16)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                  <th scope="col" style={{ padding: '16px 20px', fontWeight: 700 }}>Capability</th>
                  <th scope="col" style={{ padding: '16px 20px', fontWeight: 700 }}>Traditional SEO Agencies</th>
                  <th scope="col" style={{ padding: '16px 20px', fontWeight: 700 }}>Standalone AI Content Tools</th>
                  <th scope="col" style={{ padding: '16px 20px', fontWeight: 700, color: '#e9d5ff' }}>Engenox by Pixenox</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['SSR, Caching & Crawler Forensics', 'Periodic manual PDF audits', 'Not covered', 'Automated continuous diagnostics & fixes'],
                  ['Schema.org @graph & Entity Clarity', 'Basic plugin snippets', 'Not covered', 'Unified @graph + brand collision guardrails'],
                  ['SEO + GEO + AEO + Social Alignment', 'Siloed across 3–4 vendors', 'Isolated blog generation', 'Single unified operating system'],
                  ['Claim Integrity & Governance', 'Inconsistent editorial review', 'High hallucination / spam risk', 'Deterministic checks + human-in-the-loop approval'],
                  ['AI Citation & Mention Measurement', 'Rank trackers only', 'None', 'Disaggregated multi-engine mention, citation & GSC telemetry'],
                ].map(([cap, agency, tools, engenox]) => (
                  <tr key={cap} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th scope="row" style={{ padding: '16px 20px', fontWeight: 600, color: '#ffffff' }}>{cap}</th>
                    <td style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.68)' }}>{agency}</td>
                    <td style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.68)' }}>{tools}</td>
                    <td style={{ padding: '16px 20px', color: '#e9d5ff', fontWeight: 500 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={15} color="#a855f7" aria-hidden="true" />
                        {engenox}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Native SSR FAQs (<details>/<summary> for 100% searchability & zero hidden JS) */}
        <section aria-labelledby="engenox-faq-heading" style={{ marginBottom: '80px' }}>
          <h2 id="engenox-faq-heading" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 700, margin: '0 0 24px' }}>
            Engenox Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ENGENOX_FAQS.map((faq, idx) => (
              <details
                key={faq.question}
                open={idx === 0}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '1.05rem', color: '#ffffff', listStyle: 'none' }}>
                  {faq.question}
                </summary>
                <p style={{ margin: '14px 0 0', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(12, 10, 24, 0.96) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '24px',
            padding: '44px 36px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, margin: '0 0 12px' }}>
            Deploy Unified SEO, GEO &amp; AEO Governance
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '640px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Built and operated by PIXENOX SOLUTIONS PRIVATE LIMITED (CIN: U62091AP2026PTC125091). Talk with our engineering team to onboard your domain onto Engenox or scope a custom AI Visibility architecture.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
            <Link
              href="/contact/pixy"
              style={{
                padding: '14px 28px',
                borderRadius: '999px',
                background: '#ffffff',
                color: '#09090b',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Talk to Pixy &amp; Request Access
            </Link>
            <a
              href="mailto:connect@pixenox.com"
              style={{
                padding: '14px 24px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              connect@pixenox.com
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}
