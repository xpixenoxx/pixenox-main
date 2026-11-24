import Link from 'next/link';
import type { Metadata } from 'next';
import { Download, ArrowRight } from 'lucide-react';
import { getCanonicalSiteUrl } from '@/lib/supabase/public';
import {
  BENCHMARK_2026_COHORTS,
  BENCHMARK_2026_METADATA,
  BENCHMARK_2026_RESULTS,
  BENCHMARK_2026_SUMMARY,
} from '@/lib/seo/benchmark-2026-data';
import BenchmarkExplorerClient from './BenchmarkExplorerClient';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getCanonicalSiteUrl();
  const title = '2026 Enterprise AI Visibility Benchmark (50 Domains)';
  const description = `Empirical HTTP study across 50 leading AI, SaaS & Indian tech domains: ${BENCHMARK_2026_SUMMARY.llmsTxtPct}% publish /llms.txt, ${BENCHMARK_2026_SUMMARY.acceptMarkdownPct}% negotiate text/markdown, ${BENCHMARK_2026_SUMMARY.oaiBlockedPct}% block OAI-SearchBot.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Pixenox`,
      description,
      url: `${baseUrl}/research/ai-visibility-benchmark-2026`,
      type: 'article',
    },
    alternates: {
      canonical: `${baseUrl}/research/ai-visibility-benchmark-2026`,
      types: {
        'text/markdown': `${baseUrl}/research/ai-visibility-benchmark-2026.md`,
      },
    },
  };
}

export default function Benchmark2026Page() {
  const baseUrl = getCanonicalSiteUrl();
  const pageUrl = `${baseUrl}/research/ai-visibility-benchmark-2026`;
  const s = BENCHMARK_2026_SUMMARY;

  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: BENCHMARK_2026_METADATA.title,
    description: BENCHMARK_2026_METADATA.methodology,
    url: pageUrl,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    datePublished: BENCHMARK_2026_METADATA.measuredAt,
    dateModified: BENCHMARK_2026_METADATA.measuredAt,
    creator: { '@id': `${baseUrl}/#organization` },
    measurementTechnique: 'Automated read-only HTTP GET inspection across HTML, robots.txt, llms.txt, Accept: text/markdown, and .well-known/agent-card.json',
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `${baseUrl}/research/ai-visibility-benchmark-2026.csv`,
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${baseUrl}/research/ai-visibility-benchmark-2026.json`,
      },
    ],
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: BENCHMARK_2026_METADATA.title,
    description: BENCHMARK_2026_METADATA.methodology,
    datePublished: BENCHMARK_2026_METADATA.measuredAt,
    dateModified: BENCHMARK_2026_METADATA.measuredAt,
    author: [
      { '@id': `${baseUrl}/#founder-sai-charan` },
      { '@id': `${baseUrl}/#founder-hemanth-sairam` },
    ],
    publisher: { '@id': `${baseUrl}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.aeo-answer-capsule', 'h1'],
    },
    about: [
      { '@type': 'Thing', name: 'Search engine optimization', sameAs: 'https://www.wikidata.org/wiki/Q180711' },
      { '@type': 'Thing', name: 'Artificial Intelligence', sameAs: 'https://www.wikidata.org/wiki/Q11660' },
      { '@type': 'Thing', name: 'Knowledge graph', sameAs: 'https://www.wikidata.org/wiki/Q33002955' },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What percentage of leading tech websites block ChatGPT Search (OAI-SearchBot) vs support llms.txt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `In Pixenox Solutions’ November 24, 2026 empirical HTTP benchmark across 50 leading AI labs, cloud infrastructure vendors, B2B SaaS platforms, and Indian enterprise tech firms, ${s.oaiBlockedPct}% (${s.oaiBlockedCount}/50) block OAI-SearchBot in robots.txt, whereas ${s.llmsTxtPct}% (${s.llmsTxtCount}/50) publish a Markdown /llms.txt index.`,
        },
      },
      {
        '@type': 'Question',
        name: 'How widely adopted are Accept: text/markdown, Content-Signal, and A2A Agent Cards in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Across the 50 audited domains on November 24, 2026, ${s.acceptMarkdownPct}% (${s.acceptMarkdownCount}/50) negotiate HTTP Accept: text/markdown cleanly, ${s.contentSignalPct}% (${s.contentSignalCount}/50) declare Content-Signal usage policies, ${s.agentCardPct}% (${s.agentCardCount}/50) expose /.well-known/agent-card.json, and only ${s.speakablePct}% (${s.speakableCount}/50) emit SpeakableSpecification JSON-LD.`,
        },
      },
    ],
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: '2026 AI Visibility Benchmark', item: pageUrl },
    ],
  };

  const kpis = [
    { label: '/llms.txt Adopted', val: `${s.llmsTxtPct}%`, sub: `${s.llmsTxtCount}/50 (${s.llmsMdLinksCount} v2 .md links)` },
    { label: 'OAI-SearchBot Blocked', val: `${s.oaiBlockedPct}%`, sub: `${s.oaiBlockedCount}/50 block ChatGPT Search` },
    { label: 'Accept: text/markdown', val: `${s.acceptMarkdownPct}%`, sub: `${s.acceptMarkdownCount}/50 serve clean Markdown` },
    { label: 'Content-Signal Policy', val: `${s.contentSignalPct}%`, sub: `${s.contentSignalCount}/50 declare usage rules` },
    { label: 'Wikidata Grounded JSON-LD', val: `${s.wikidataPct}%`, sub: `${s.jsonLdCount}/50 JSON-LD • ${s.wikidataCount}/50 QIDs` },
    { label: 'A2A Agent Card / Speakable', val: `${s.agentCardCount} / ${s.speakableCount}`, sub: `A2A ${s.agentCardPct}% • Speakable ${s.speakablePct}%` },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#050509', color: '#ffffff', padding: '156px 24px 112px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gap: '36px' }}>
        <header style={{ display: 'grid', gap: '16px' }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.58)', display: 'flex', gap: '8px' }}>
            <Link href="/" style={{ color: '#c4b5fd', textDecoration: 'none' }}>Home</Link>
            <span aria-hidden="true">/</span>
            <span style={{ color: '#ffffff' }}>2026 AI Visibility Benchmark</span>
          </nav>

          <span style={{ fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c4b5fd', fontWeight: 600 }}>
            Primary Empirical Research • Measured {BENCHMARK_2026_METADATA.measuredAt} • CC-BY-4.0 Dataset
          </span>

          <h1 style={{ margin: 0, fontSize: 'clamp(2.1rem, 4.2vw, 3.25rem)', fontWeight: 700, lineHeight: 1.12, fontFamily: 'var(--font-outfit), sans-serif' }}>
            2026 Enterprise AI Visibility &amp; Machine-Readability Benchmark
          </h1>

          <p style={{ margin: 0, fontSize: '1.06rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.78)', maxWidth: '840px' }}>
            Pixenox Solutions ran an automated, reproducible HTTP audit across <strong>50 leading technology, AI, B2B SaaS, and Indian enterprise domains</strong> on {BENCHMARK_2026_METADATA.measuredAt} to measure real adoption of SSR extractability, ChatGPT Search &amp; Perplexity crawlability, <code>llms.txt</code>, <code>Accept: text/markdown</code>, <code>Content-Signal</code>, and Google A2A discovery.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
            <a
              href="/research/ai-visibility-benchmark-2026.csv"
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '999px',
                background: 'rgba(168,85,247,0.16)',
                border: '1px solid rgba(196,181,253,0.4)',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Download size={15} />
              <span>Download Raw CSV (50 Rows)</span>
            </a>
            <a
              href="/research/ai-visibility-benchmark-2026.json"
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.16)',
                color: '#e2e8f0',
                fontSize: '0.86rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <Download size={15} />
              <span>Download JSON Dataset</span>
            </a>
            <Link
              href="/tools/ai-visibility-checker"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #9333ea, #6366f1)',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>Test Your Own Domain Live</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </header>

        {/* AEO Direct Answer Capsule */}
        <aside
          className="aeo-answer-capsule"
          aria-label="Key Empirical Findings"
          style={{
            padding: '24px 26px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.11), rgba(56,189,248,0.04))',
            border: '1px solid rgba(196,181,253,0.3)',
            display: 'grid',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4b5fd', fontWeight: 700 }}>
            Headline Benchmark Finding (N = {s.totalDomains} Public Domains)
          </div>
          <p style={{ margin: 0, fontSize: '1.02rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.9)' }}>
            While <strong>{s.llmsTxtPct}% ({s.llmsTxtCount}/50)</strong> of major tech companies have adopted <code>/llms.txt</code> and <strong>{s.jsonLdPct}% ({s.jsonLdCount}/50)</strong> emit JSON-LD, <strong>{s.oaiBlockedPct}% ({s.oaiBlockedCount}/50)</strong> inadvertently or explicitly block <code>OAI-SearchBot</code> in <code>robots.txt</code> and another <strong>{s.wafBlockedPct}% ({s.wafBlockedCount}/50)</strong> fail automated HTTP fetches behind WAF 403 challenges. Only <strong>{s.acceptMarkdownPct}%</strong> negotiate <code>Accept: text/markdown</code>, <strong>{s.contentSignalPct}%</strong> declare <code>Content-Signal</code>, and just <strong>{s.agentCardPct}%</strong> expose an A2A Agent Card.
          </p>
        </aside>

        {/* KPI Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {kpis.map((k) => (
            <div
              key={k.label}
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.09)',
                display: 'grid',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#c4b5fd', fontWeight: 600 }}>{k.label}</span>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-outfit), sans-serif' }}>
                {k.val}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.62)' }}>{k.sub}</span>
            </div>
          ))}
        </section>

        {/* Cohort Comparison Table */}
        <section style={{ display: 'grid', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Adoption Breakdown by Industry Cohort (10 Domains Each)</h2>
          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left', minWidth: '720px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', color: '#c4b5fd' }}>
                  <th style={{ padding: '12px 16px' }}>Cohort</th>
                  <th style={{ padding: '12px 12px' }}>WAF Blocked</th>
                  <th style={{ padding: '12px 12px' }}>OAI Blocked</th>
                  <th style={{ padding: '12px 12px' }}>JSON-LD</th>
                  <th style={{ padding: '12px 12px' }}>llms.txt</th>
                  <th style={{ padding: '12px 12px' }}>Markdown</th>
                  <th style={{ padding: '12px 12px' }}>Content-Signal</th>
                  <th style={{ padding: '12px 16px' }}>A2A Card</th>
                </tr>
              </thead>
              <tbody>
                {BENCHMARK_2026_COHORTS.map((c) => (
                  <tr key={c.cohort} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>{c.cohort}</td>
                    <td style={{ padding: '12px 12px' }}>{c.wafBlocked}/10</td>
                    <td style={{ padding: '12px 12px' }}>{c.oaiBlocked}/10</td>
                    <td style={{ padding: '12px 12px' }}>{c.jsonLd}/10</td>
                    <td style={{ padding: '12px 12px' }}>{c.llmsTxt}/10</td>
                    <td style={{ padding: '12px 12px' }}>{c.acceptMarkdown}/10</td>
                    <td style={{ padding: '12px 12px' }}>{c.contentSignal}/10</td>
                    <td style={{ padding: '12px 16px' }}>{c.agentCard}/10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Interactive Explorer */}
        <section style={{ display: 'grid', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Interactive 50-Domain Explorer</h2>
          <BenchmarkExplorerClient
            rows={BENCHMARK_2026_RESULTS}
            cohorts={BENCHMARK_2026_COHORTS.map((c) => c.cohort)}
          />
        </section>

        {/* Methodology & Limitations */}
        <section
          style={{
            padding: '26px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'grid',
            gap: '12px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>Methodology, Transparency &amp; Limitations</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65 }}>
            {BENCHMARK_2026_METADATA.methodology} Median TTFB across the {s.reachableHtmlCount} directly reachable domains was <strong>{s.medianTtfbMs}ms</strong> with a median raw SSR word count of <strong>{s.medianSsrWords.toLocaleString()} words</strong>. Because HTTP checks evaluate root `/` and root well-known files without executing client-side JavaScript or bypassing WAF challenges, subdomains (such as dedicated `docs.*` hosts) may expose separate policies.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '0.9rem', paddingTop: '4px' }}>
            <Link href="/compare/ai-visibility-platforms" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>
              Compare AI Visibility Platforms →
            </Link>
            <Link href="/products/engenox" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>
              Explore Engenox by Pixenox →
            </Link>
            <Link href="/contact/pixy" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>
              Request Architecture Audit via Pixy →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
