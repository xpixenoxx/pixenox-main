import Link from 'next/link';
import type { Metadata } from 'next';
import { getCanonicalSiteUrl } from '@/lib/supabase/public';
import { GLOSSARY_TERMS } from '@/lib/seo/glossary-terms';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getCanonicalSiteUrl();
  const title = 'Enterprise AI, GEO & AEO Engineering Glossary';
  const description =
    'Canonical engineering definitions for Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), AI Query Fan-Out, Content-Signal, IndexNow, Semantic Layers, and Production AI Systems.';

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Pixenox`,
      description,
      url: `${baseUrl}/glossary`,
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/glossary`,
      types: {
        'text/markdown': `${baseUrl}/glossary.md`,
      },
    },
  };
}

export default function GlossaryPage() {
  const baseUrl = getCanonicalSiteUrl();
  const categories = Array.from(new Set(GLOSSARY_TERMS.map((t) => t.category)));

  const definedTermSetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${baseUrl}/glossary#terms`,
    name: 'Pixenox Enterprise AI, GEO & AEO Engineering Glossary',
    url: `${baseUrl}/glossary`,
    publisher: { '@id': `${baseUrl}/#organization` },
    hasDefinedTerm: GLOSSARY_TERMS.map((t) => ({
      '@type': 'DefinedTerm',
      '@id': `${baseUrl}/glossary#${t.id}`,
      name: t.term,
      termCode: t.shortName,
      description: t.definition,
      url: `${baseUrl}/glossary#${t.id}`,
      inDefinedTermSet: `${baseUrl}/glossary#terms`,
      ...(t.wikidataUrl ? { sameAs: t.wikidataUrl } : {}),
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Glossary', item: `${baseUrl}/glossary` },
    ],
  };

  return (
    <main style={{ minHeight: '100vh', background: '#06060a', color: '#ffffff', padding: '140px 24px 96px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gap: '48px' }}>
        <header style={{ display: 'grid', gap: '16px' }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
            <Link href="/" style={{ color: '#c4b5fd', textDecoration: 'none' }}>Home</Link>
            <span aria-hidden="true"> / </span>
            <span style={{ color: '#ffffff' }}>Glossary</span>
          </nav>

          <span style={{ fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c4b5fd', fontWeight: 600 }}>
            Canonical Reference • DefinedTermSet ({GLOSSARY_TERMS.length} Terms)
          </span>
          <h1 style={{ margin: 0, fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', fontWeight: 700, lineHeight: 1.15 }}>
            Enterprise AI, GEO &amp; AEO Glossary
          </h1>
          <p style={{ margin: 0, fontSize: '1.08rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.78)', maxWidth: '800px' }}>
            Standardized definitions across Production AI Systems, AI Visibility (GEO/AEO), Machine Transport Protocols,
            and Non-Disruptive Enterprise Data Convergence—engineered for human architects and schema crawlers alike.
          </p>

          <nav aria-label="Glossary categories" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
            {categories.map((cat) => (
              <a
                key={cat}
                href={`#${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px solid rgba(196,181,253,0.3)',
                  color: '#c4b5fd',
                  fontSize: '0.86rem',
                  textDecoration: 'none',
                }}
              >
                {cat}
              </a>
            ))}
            <Link
              href="/tools/ai-visibility-checker"
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#ffffff',
                fontSize: '0.86rem',
                textDecoration: 'none',
              }}
            >
              Test Your Site Free →
            </Link>
          </nav>
        </header>

        {categories.map((cat) => {
          const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const items = GLOSSARY_TERMS.filter((t) => t.category === cat);
          return (
            <section key={cat} id={catSlug} style={{ display: 'grid', gap: '20px', scrollMarginTop: '110px' }}>
              <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                {cat}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
                {items.map((item) => (
                  <article
                    key={item.id}
                    id={item.id}
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      display: 'grid',
                      gap: '12px',
                      scrollMarginTop: '110px',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#ffffff' }}>
                      <a href={`#${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.term}
                      </a>
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.62, color: 'rgba(255,255,255,0.84)' }}>
                      {item.definition}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.65)' }}>
                      <strong style={{ color: '#c4b5fd' }}>Why it matters:</strong> {item.whyItMatters}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.84rem', marginTop: '4px' }}>
                      <Link href={item.relatedHref} style={{ color: '#c4b5fd', textDecoration: 'underline' }}>
                        {item.relatedLabel} →
                      </Link>
                      {item.wikidataUrl && (
                        <a href={item.wikidataUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
                          Wikidata Entity ↗
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
