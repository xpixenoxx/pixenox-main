import Link from 'next/link';
import type { Metadata } from 'next';
import { getCanonicalSiteUrl } from '@/lib/supabase/public';
import VisibilityCheckerClient from './VisibilityCheckerClient';
import './visibility-checker.css';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getCanonicalSiteUrl();
  const title = 'Free AI Visibility & GEO Readiness Checker';
  const description =
    'Run a live 20-signal technical audit across SSR extractability, RFC 9309 AI bot matrix, Schema.org @graph, llms.txt, Content-Signal, and Accept: text/markdown.';

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Pixenox`,
      description,
      url: `${baseUrl}/tools/ai-visibility-checker`,
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/tools/ai-visibility-checker`,
      types: {
        'text/markdown': `${baseUrl}/tools/ai-visibility-checker.md`,
      },
    },
  };
}

export default function AiVisibilityCheckerPage() {
  const baseUrl = getCanonicalSiteUrl();

  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pixenox AI Visibility & GEO Readiness Checker',
    url: `${baseUrl}/tools/ai-visibility-checker`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Live diagnostic tool auditing websites across SSR extractability, RFC 9309 AI crawler matrix, Schema.org entity graphs, llms.txt, Content-Signal directives, A2A Agent Cards, and Markdown content negotiation.',
    creator: { '@id': `${baseUrl}/#organization` },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does the AI Visibility & GEO Readiness Checker inspect?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It inspects live HTTP responses across 20 deterministic checks grouped into 5 pillars: Crawl & Bot Governance (RFC 9309 evaluation + live sitemap verification), SSR & AI Extractability, Schema & Knowledge Graph (including Wikidata sameAs and Speakable/FAQ schema), 2026 AI-Native Protocols (llms.txt, Accept: text/markdown, Content-Signal, A2A Agent Card, Speculation Rules), and Discovery, Trust & Speed.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the tool handle parked domains, 404 pages, or WAF-blocked hosts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Before running any scoring logic, the diagnostic classifies DNS errors (NXDOMAIN), HTTP 4xx/5xx dead pages, anti-bot WAF interstitials, non-HTML assets, and registrar parked-domain placeholders, surfacing an exact forensic alert instead of reporting a misleading score.',
        },
      },
    ],
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'AI Visibility Checker', item: `${baseUrl}/tools/ai-visibility-checker` },
    ],
  };

  return (
    <main className="avc-page">
      <div className="avc-bg-grid" aria-hidden="true" />
      <div className="avc-aura" aria-hidden="true" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="avc-container">
        <header className="avc-hero">
          <nav aria-label="Breadcrumb" className="avc-breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span style={{ color: '#ffffff' }}>AI Visibility Checker</span>
          </nav>

          <span className="avc-eyebrow">Engenox Open Diagnostic • Live 20-Signal Telemetry</span>

          <h1 className="avc-title">AI Visibility &amp; GEO Readiness Checker</h1>

          <p className="avc-subtitle">
            Inspect any public website in real time across the exact machine stack powering ChatGPT Search, Perplexity,
            Claude, and Google AI Overviews: parked-domain &amp; WAF pre-screening, RFC 9309 bot rules, Wikidata-linked
            JSON-LD, <code>llms.txt</code>, <code>Content-Signal</code>, <code>Accept: text/markdown</code>, and Speculation Rules.
          </p>
        </header>

        <VisibilityCheckerClient />

        <section
          aria-label="Scoring Methodology"
          className="avc-card"
        >
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>20-Signal 5-Pillar Diagnostic Architecture</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
            Unlike generic SEO checklist widgets, this diagnostic parses raw server HTML without JavaScript execution—just like
            AI citation fetchers—verifies live XML sitemaps and RFC 9309 longest-path precedence, automatically flags parked or
            WAF-blocked origins, and scores production domains across Crawl Governance (25), SSR Extractability (25),
            Schema &amp; Knowledge Graph (20), 2026 AI-Native Protocols (20), and Discovery, Trust &amp; Speed (10).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '0.92rem' }}>
            <Link href="/engineering/ai-visibility" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>
              Explore AI Visibility Engineering
            </Link>
            <Link href="/glossary" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>
              Read the GEO &amp; AEO Glossary
            </Link>
            <Link href="/products/engenox" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>
              See Engenox OS
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
