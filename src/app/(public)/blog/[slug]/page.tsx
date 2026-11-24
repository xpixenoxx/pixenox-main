import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import { sortBlogPostsByDate } from '@/lib/blog-utils';
import './blog-detail.css';
import BlogExplainerPopup from '@/components/blog/BlogExplainerPopup';
import BlogFaqBot from '@/components/blog/BlogFaqBot';
import { CopyMarkdownButton } from '@/components/blog/CopyMarkdownButton';
import { PreferredSourceButton } from '@/components/seo/PreferredSourceButton';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

interface BlogSection {
  question: string;
  answer: string;
  image_url?: string;
  table?: string[][];
  table_explanation?: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  created_at?: string;
  category: string;
  image_url: string;
  excerpt: string;
  sections: BlogSection[];
  faqs?: { question: string; answer: string }[];
}

// ISR: regenerate every hour and on-demand via /api/revalidate
export const revalidate = 3600;

function toIsoDate(dateStr?: string | null, fallbackIso?: string | null): string | undefined {
  if (dateStr) {
    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  if (fallbackIso) {
    const parsed = new Date(fallbackIso);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  return undefined;
}

/**
 * Safely renders inline Markdown (**bold**, *italic*, `code`, and [text](url))
 * into sanitized HTML so contextual internal links & primary source citations
 * render as real crawlable <a> elements in SSR HTML.
 */
function renderInlineMarkdown(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const withLinks = escaped.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_match, label: string, rawUrl: string) => {
      const url = rawUrl.trim();
      const isInternal = url.startsWith('/') || url.startsWith('https://www.pixenox.com') || url.startsWith('https://pixenox.com');
      const isSafeProtocol = isInternal || url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:');
      if (!isSafeProtocol) return label;
      if (isInternal) {
        const normalizedHref = url.replace(/^https?:\/\/(www\.)?pixenox\.com/, '') || '/';
        return `<a href="${normalizedHref}" style="color:#c4b5fd;text-decoration:underline;text-underline-offset:3px;">${label}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#c4b5fd;text-decoration:underline;text-underline-offset:3px;">${label}</a>`;
    }
  );

  const formatted = withLinks
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-size:0.9em;">$1</code>');

  return DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: ['a', 'strong', 'em', 'code', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
  });
}

/**
 * Maps each blog post to its primary commercial pillar & relevant topic tags
 * for hub-and-spoke internal linking and contextual conversion bridges.
 */
function inferPillarContext(slug: string, category: string, title: string) {
  const haystack = `${slug} ${category} ${title}`.toLowerCase();

  if (
    haystack.includes('geo') ||
    haystack.includes('aeo') ||
    haystack.includes('seo') ||
    haystack.includes('visibility') ||
    haystack.includes('citation') ||
    haystack.includes('llms') ||
    haystack.includes('fan-out') ||
    haystack.includes('knowledge-graph') ||
    haystack.includes('structured-data') ||
    haystack.includes('retrieval') ||
    haystack.includes('catalog-architecture') ||
    haystack.includes('consensus')
  ) {
    return {
      pillarName: 'AI Visibility Engineering (GEO & AEO)',
      pillarHref: '/engineering/ai-visibility',
      secondaryName: 'Explore Engenox OS',
      secondaryHref: '/products/engenox',
      ctaCopy:
        'Need SSR crawl readiness, Schema.org @graph entity engineering, or multi-engine AI citation tracking? Our AI Visibility team and Engenox OS engineer measurable visibility across Google AI Overviews, ChatGPT Search, and Perplexity.',
      tags: ['AI Visibility', 'GEO & AEO', 'Entity Architecture', 'Engenox'],
    };
  }

  if (
    haystack.includes('erp') ||
    haystack.includes('etl') ||
    haystack.includes('data') ||
    haystack.includes('integration') ||
    haystack.includes('cloud') ||
    haystack.includes('semantic-layer') ||
    haystack.includes('convergence') ||
    haystack.includes('business-intelligence') ||
    haystack.includes('platform') ||
    haystack.includes('enterprise-software') ||
    haystack.includes('fragmented')
  ) {
    return {
      pillarName: 'Enterprise Intelligence Engineering',
      pillarHref: '/engineering/enterprise-intelligence-engineering',
      secondaryName: 'Explore Reference Architectures',
      secondaryHref: '/work',
      ctaCopy:
        'Unify legacy ERP, CRM, and cloud data without rip-and-replace disruption. Pixenox architects CDC pipelines, governed semantic layers, and decision intelligence infrastructure.',
      tags: ['Enterprise Intelligence', 'Data Platforms', 'Systems Integration', 'Semantic Layer'],
    };
  }

  return {
    pillarName: 'Production AI Systems Engineering',
    pillarHref: '/engineering/ai-systems',
    secondaryName: 'Explore Reference Architectures',
    secondaryHref: '/work',
    ctaCopy:
      'Moving from AI prototype to governed production? Pixenox engineers multi-agent workflows, deterministic guardrails, HITL gates, and cost-controlled LLM infrastructure.',
    tags: ['AI Systems', 'Multi-Agent Architecture', 'Production LLMOps', 'Decision Intelligence'],
  };
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('is_visible', true);

  return (data ?? []).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, image_url, category, date, created_at')
    .eq('slug', slug)
    .eq('is_visible', true)
    .limit(1)
    .maybeSingle();

  if (!post) {
    return {
      title: 'Post Not Found',
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getCanonicalSiteUrl();
  const isoDate = toIsoDate(post.date, post.created_at);
  const desc = post.excerpt?.slice(0, 160) || `Read ${post.title} on the Pixenox engineering blog.`;

  return {
    title: post.title,
    description: desc,
    openGraph: {
      title: `${post.title} | Pixenox`,
      description: desc,
      type: 'article',
      publishedTime: isoDate,
      authors: ['Muchakarla Sai Charan', 'Jagatha Hemanth Sai Ram'],
      images: post.image_url ? [{ url: post.image_url, width: 1200, height: 630, alt: post.title }] : [],
      url: `${baseUrl}/blog/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: desc,
      images: post.image_url ? [post.image_url] : [],
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
      types: {
        'text/markdown': `${baseUrl}/blog/${slug}.md`,
      },
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();

  const { data: postData } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .maybeSingle();

  const post = postData as BlogPost | null;
  if (!post) notFound();

  const { data: allPosts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, priority, image_url, category, date, created_at')
    .eq('is_visible', true);

  const allList = sortBlogPostsByDate((allPosts as any[]) ?? []);
  const pillar = inferPillarContext(post.slug, post.category || '', post.title);

  // Prefer sibling posts in the same category first for tighter topical interlinking
  const sameCategory = allList.filter((p: any) => p.slug !== slug && p.category === post.category);
  const otherPosts = allList.filter((p: any) => p.slug !== slug && p.category !== post.category);
  const relatedPosts = [...sameCategory, ...otherPosts].slice(0, 3);

  const baseUrl = getCanonicalSiteUrl();
  const isoPublished = toIsoDate(post.date, post.created_at);

  const visibleSections = (post.sections || []).filter((s) => s?.question?.trim() && s?.answer?.trim());
  const fullText = [
    post.excerpt || '',
    ...visibleSections.map((s) => `${s.question} ${s.answer}`),
  ].join(' ');
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(3, Math.ceil(wordCount / 220));
  const tocItems = visibleSections.map((sec, idx) => {
    const slugId =
      sec.question
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `section-${idx + 1}`;
    return { id: `${slugId}-${idx + 1}`, title: sec.question };
  });

  const externalCitationSet = new Set<string>();
  const urlRe = /https:\/\/[^\s)\]"'<>]+/g;
  for (const sec of visibleSections) {
    const textChunk = `${sec.answer || ''} ${sec.table_explanation || ''}`;
    for (const match of textChunk.match(urlRe) ?? []) {
      const cleaned = match.replace(/[.,;:]+$/, '');
      if (!cleaned.includes('pixenox.com')) externalCitationSet.add(cleaned);
    }
  }
  const externalCitations = Array.from(externalCitationSet);

  const wikidataTagMap: Record<string, string> = {
    'AI Visibility': 'https://www.wikidata.org/wiki/Q180711',
    'GEO & AEO': 'https://www.wikidata.org/wiki/Q180711',
    'Entity Architecture': 'https://www.wikidata.org/wiki/Q33002955',
    'AI Systems': 'https://www.wikidata.org/wiki/Q11660',
    'Multi-Agent Architecture': 'https://www.wikidata.org/wiki/Q529909',
    'Production LLMOps': 'https://www.wikidata.org/wiki/Q115305900',
    'Decision Intelligence': 'https://www.wikidata.org/wiki/Q185698',
    'Enterprise Intelligence': 'https://www.wikidata.org/wiki/Q185698',
    'Data Platforms': 'https://www.wikidata.org/wiki/Q1172480',
    'Systems Integration': 'https://www.wikidata.org/wiki/Q1172480',
  };

  const articleAbout = pillar.tags.map((tag) =>
    wikidataTagMap[tag]
      ? { '@type': 'Thing', name: tag, sameAs: wikidataTagMap[tag] }
      : { '@type': 'Thing', name: tag }
  );

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.excerpt,
    image: post.image_url || undefined,
    datePublished: isoPublished,
    dateModified: isoPublished,
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
    isPartOf: { '@id': `${baseUrl}/#website` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.bd-title', '.aeo-answer-capsule', '.bd-content__lead'],
    },
    ...(externalCitations.length > 0 ? { citation: externalCitations } : {}),
    author: [
      { '@id': `${baseUrl}/#founder-sai-charan` },
      { '@id': `${baseUrl}/#founder-hemanth-sairam` },
    ],
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${slug}`,
    },
    about: articleAbout,
  };

  const faqJsonLd =
    post.faqs && post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((faq: { question: string; answer: string }) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <div className="blog-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
              { '@type': 'ListItem', position: 3, name: post.title, item: `${baseUrl}/blog/${slug}` },
            ],
          }),
        }}
      />

      <div className="bd-layout">
        <article className="bd-main">
          <nav aria-label="Breadcrumb" style={{ marginBottom: '20px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
            <Link href="/" style={{ color: '#c4b5fd', textDecoration: 'none' }}>Home</Link>
            <span aria-hidden="true"> / </span>
            <Link href="/blog" style={{ color: '#c4b5fd', textDecoration: 'none' }}>Blog</Link>
            <span aria-hidden="true"> / </span>
            <span style={{ color: '#ffffff' }}>{post.category || 'Engineering'}</span>
          </nav>
          <div className="bd-title-row">
            <h1 className="bd-title">{post.title}</h1>
            <BlogExplainerPopup slug={slug} />
          </div>

          <div className="bd-article-meta">
            <span className="bd-cat-badge">{post.category}</span>
            <span className="bd-meta-dot" aria-hidden="true">•</span>
            <time dateTime={isoPublished} className="bd-meta-date">{post.date}</time>
            <span className="bd-meta-dot" aria-hidden="true">•</span>
            <span className="bd-meta-date">{readingMinutes} min read</span>
            <span className="bd-meta-dot" aria-hidden="true">•</span>
            <span className="bd-meta-date">
              Reviewed by <Link href="/company" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>Pixenox Founding Engineering Team</Link>
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', margin: '12px 0 20px' }}>
            <PreferredSourceButton />
            <CopyMarkdownButton slug={slug} />
          </div>

          <div className="bd-hero">
            <Image
              src={post.image_url}
              alt={post.title}
              width={1200}
              height={630}
              className="bd-hero__img"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>

          <div className="bd-content">
            <aside
              className="aeo-answer-capsule"
              aria-label="Key Engineering Takeaway"
              style={{
                maxWidth: '800px',
                margin: '0 auto 32px',
                padding: '20px 24px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.09), rgba(255,255,255,0.02))',
                border: '1px solid rgba(196,181,253,0.28)',
              }}
            >
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4b5fd', fontWeight: 600, marginBottom: '8px' }}>
                Direct Answer / Key Engineering Takeaway
              </div>
              <p className="bd-content__lead" style={{ margin: '0 0 14px' }}>{post.excerpt}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.75)' }}>
                <span>
                  Pillar:{' '}
                  <Link href={pillar.pillarHref} style={{ color: '#c4b5fd', textDecoration: 'underline' }}>
                    {pillar.pillarName}
                  </Link>
                </span>
                <span>• {readingMinutes} min read ({wordCount} words)</span>
                <span>• {externalCitations.length} primary external citations</span>
              </div>
            </aside>

            {tocItems.length >= 2 && (
              <nav
                aria-label="Table of contents"
                style={{
                  maxWidth: '800px',
                  margin: '0 auto 48px',
                  padding: '20px 24px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(168,85,247,0.22)',
                }}
              >
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4b5fd', fontWeight: 600, marginBottom: '12px' }}>
                  On This Page
                </div>
                <ol style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px', fontSize: '0.96rem', color: 'rgba(255,255,255,0.82)' }}>
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} style={{ color: 'rgba(255,255,255,0.88)', textDecoration: 'none' }}>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {visibleSections.map((sec, i) => (
              <div
                key={i}
                className={`bd-section ${sec.image_url ? 'bd-section--has-image' : ''} ${i % 2 === 0 ? 'bd-section--left' : 'bd-section--right'}`}
              >
                <div className="bd-section__content">
                  <h2 id={tocItems[i]?.id} className="bd-content__h2">{sec.question}</h2>
                  {sec.answer.split('\n\n').map((para, j) => {
                    if (para.startsWith('- ')) {
                      return (
                        <ul key={j} className="bd-content__list">
                          {para
                            .split('\n')
                            .filter((l) => l.startsWith('- '))
                            .map((item, k) => (
                              <li
                                key={k}
                                dangerouslySetInnerHTML={{
                                  __html: renderInlineMarkdown(item.replace(/^-\s+/, '')),
                                }}
                              />
                            ))}
                        </ul>
                      );
                    }
                    if (para.startsWith('1. ')) {
                      return (
                        <ol key={j} className="bd-content__list bd-content__list--ordered">
                          {para
                            .split('\n')
                            .filter((l) => /^\d+\.\s/.test(l))
                            .map((item, k) => (
                              <li
                                key={k}
                                dangerouslySetInnerHTML={{
                                  __html: renderInlineMarkdown(item.replace(/^\d+\.\s+/, '')),
                                }}
                              />
                            ))}
                        </ol>
                      );
                    }
                    return (
                      <p
                        key={j}
                        className="bd-content__p"
                        dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(para) }}
                      />
                    );
                  })}

                  {sec.table && sec.table.length > 0 && (
                    <div className="bd-table-wrapper">
                      <table className="bd-table">
                        <thead>
                          <tr>
                            {sec.table[0].map((th, cIdx) => (
                              <th scope="col" key={cIdx}>{th}</th>
                            ))}
                          </tr>
                        </thead>
                        {sec.table.length > 1 && (
                          <tbody>
                            {sec.table.slice(1).map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(cell) }}
                                  />
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        )}
                      </table>
                    </div>
                  )}

                  {sec.table_explanation && (
                    <div className="bd-table-explanation" style={{ marginTop: '1rem' }}>
                      {sec.table_explanation.split('\n\n').map((para, j) => (
                        <p
                          key={j}
                          className="bd-content__p"
                          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(para) }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {sec.image_url && (
                  <div className="bd-section__media">
                    <Image
                      src={sec.image_url}
                      alt={sec.question}
                      width={800}
                      height={450}
                      className="w-full h-auto object-cover rounded-xl shadow-2xl border border-white/10"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contextual Commercial Pillar Bridge CTA (Hub-and-Spoke Architecture) */}
          <aside
            aria-label="Related Pixenox Engineering Capability"
            style={{
              margin: '48px 0 36px',
              padding: '28px 32px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.14) 0%, rgba(12, 10, 22, 0.92) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4b5fd', fontWeight: 600, marginBottom: '8px' }}>
              PIXENOX ENGINEERING PRACTICE
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', margin: '0 0 10px' }}>
              {pillar.pillarName}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 20px' }}>
              {pillar.ctaCopy}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link
                href={pillar.pillarHref}
                style={{
                  padding: '10px 20px',
                  borderRadius: '999px',
                  background: '#ffffff',
                  color: '#09090b',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Explore {pillar.pillarName}
              </Link>
              <Link
                href={pillar.secondaryHref}
                style={{
                  padding: '10px 20px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                {pillar.secondaryName}
              </Link>
              <Link
                href="/contact/pixy"
                style={{
                  padding: '10px 20px',
                  borderRadius: '999px',
                  background: 'transparent',
                  border: '1px solid rgba(196,181,253,0.4)',
                  color: '#c4b5fd',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Scope an Architecture Review
              </Link>
            </div>
          </aside>

          <BlogFaqBot slug={slug} />

          {post.faqs && post.faqs.length > 0 && (
            <div className="bd-faqs-container">
              <h2 className="bd-faqs-title">Frequently Asked Questions</h2>
              <div className="bd-faqs-list">
                {post.faqs.map((faq, i) => (
                  <details key={i} className="bd-faq-item">
                    <summary className="bd-faq-question">
                      {faq.question}
                      <span className="bd-faq-icon" aria-hidden="true">+</span>
                    </summary>
                    <div className="bd-faq-answer">
                      {faq.answer.split('\n\n').map((para, j) => (
                        <p key={j} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(para) }} />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Pillar-matched Topic Tags */}
          <div className="bd-tags-row">
            {pillar.tags.map((tag) => (
              <span key={tag} className="bd-tag">{tag}</span>
            ))}
          </div>

          <div className="bd-divider" />

          <div className="bd-read-next">
            <h2 className="bd-read-next__title">Related Engineering Articles</h2>
            <div className="bd-read-next__grid">
              {relatedPosts.map((p: any) => (
                <Link href={`/blog/${p.slug}`} key={p.id} className="bd-next-card">
                  <div className="bd-next-card__img">
                    <Image
                      src={p.image_url || '/og-image.jpg'}
                      alt={p.title}
                      width={400}
                      height={225}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                  <span className="bd-next-card__cat">{p.category || 'Engineering'}</span>
                  <h3 className="bd-next-card__title">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
