import Link from 'next/link';
import type { Metadata } from 'next';
import { getCanonicalSiteUrl } from '@/lib/supabase/public';
import VisibilityCheckerClient from './VisibilityCheckerClient';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getCanonicalSiteUrl();
  const title = 'Free AI Visibility & GEO Readiness Checker';
  const description =
    'Run a live technical audit across SSR extractability, AI crawler governance, Schema.org @graph, llms.txt, Content-Signal, and Accept: text/markdown.';

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
      'Live diagnostic tool scoring websites on SSR crawlability, AI search bot governance, Schema.org entity graphs, llms.txt, Content-Signal directives, A2A Agent Cards, and Markdown content negotiation.',
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
          text: 'It inspects live HTTP responses across five weighted pillars: Crawl & Bot Governance (robots.txt and AI search bots), SSR & Extractability, Schema & Entity Graph (including Wikidata sameAs and SpeakableSpecification), 2026 AI-Native Protocols (llms.txt, Accept: text/markdown, Content-Signal, A2A Agent Card, Speculation Rules), and Discovery & Speed (TTFB and RSS autodiscovery).',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Accept: text/markdown negotiation improve GEO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'When AI retrieval agents and coding assistants send Accept: text/markdown, supporting origins return clean structured Markdown instead of HTML boilerplate, lowering token consumption by up to 85% and increasing passage extraction fidelity.',
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
    <main style={{ minHeight: '100vh', background: '#06060a', color: '#ffffff', padding: '140px 24px 96px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'grid', gap: '40px' }}>
        <header style={{ display: 'grid', gap: '16px' }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
            <Link href="/" style={{ color: '#c4b5fd', textDecoration: 'none' }}>Home</Link>
            <span aria-hidden="true"> / </span>
            <span style={{ color: '#ffffff' }}>AI Visibility Checker</span>
          </nav>

          <span style={{ fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c4b5fd', fontWeight: 600 }}>
            Engenox Open Diagnostic • Live HTTP Audit
          </span>
          <h1 style={{ margin: 0, fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', fontWeight: 700, lineHeight: 1.15 }}>
            AI Visibility &amp; GEO Readiness Checker
          </h1>
          <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.78)', maxWidth: '780px' }}>
            Test any public website in real time across the technical stack that powers ChatGPT Search, Perplexity,
            Claude, and Google AI Overviews: SSR text extraction, RFC 9309 bot rules, Wikidata-linked JSON-LD,{' '}
            <code>llms.txt</code>, <code>Content-Signal</code>, <code>Accept: text/markdown</code>, and Speculation Rules.
          </p>
        </header>

        <VisibilityCheckerClient />

        <section
          aria-label="Scoring Methodology"
          style={{
            padding: '28px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'grid',
            gap: '14px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>5-Pillar 100-Point Scoring Model</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
            Unlike shallow SEO checklist widgets, this diagnostic inspects raw server HTML without JavaScript execution—exactly
            how AI retrieval bots and search fetchers parse your domain—and awards deterministic points across Crawl Governance (25),
            SSR Extractability (25), Schema &amp; Entity Graph (20), 2026 AI-Native Protocols (20), and Discovery &amp; Speed (10).
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
