import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import './blog-detail.css';
import BlogExplainerPopup from '@/components/blog/BlogExplainerPopup';
import BlogFaqBot from '@/components/blog/BlogFaqBot';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  image_url: string;
  excerpt: string;
  sections: { question: string; answer: string; image_url?: string; table?: string[][]; table_explanation?: string }[];
  faqs?: { question: string; answer: string }[];
}

// ISR: regenerate every hour instead of hitting Supabase on every request
export const revalidate = 3600;

// Pre-render published blog posts at build time
// Uses public client because generateStaticParams runs without HTTP context (no cookies)
export async function generateStaticParams() {
  const { createClient: createPublicClient } = await import('@supabase/supabase-js');
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('is_visible', true);

  return (data ?? []).map((post) => ({ slug: post.slug }));
}

// Individual SEO metadata per blog post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, image_url, category, date')
    .eq('slug', slug)
    .eq('is_visible', true)
    .limit(1)
    .single();

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pixenox.com';

  return {
    title: post.title,
    description: post.excerpt?.slice(0, 160) || `Read ${post.title} on the Pixenox blog.`,
    openGraph: {
      title: post.title,
      description: post.excerpt?.slice(0, 160) || '',
      type: 'article',
      publishedTime: post.date || undefined,
      authors: ['Pixenox'],
      images: post.image_url ? [{ url: post.image_url, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt?.slice(0, 160) || '',
      images: post.image_url ? [post.image_url] : [],
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single();

  if (!post) notFound();

  // Adjacent posts for prev/next nav and recent posts
  const { data: allPosts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, priority, image_url, category')
    .eq('is_visible', true)
    .order('priority', { ascending: true });

  const allList = allPosts ?? [];
  const currentIdx = allList.findIndex((p: any) => p.slug === slug);
  const prevPost = currentIdx > 0 ? allList[currentIdx - 1] : null;
  const nextPost = currentIdx < allList.length - 1 ? allList[currentIdx + 1] : null;

  // Recent posts for sidebar
  const recentPosts = allList
    .filter((p: any) => p.slug !== slug)
    .slice(0, 5);

  const tags = ['AI', 'Web Dev', 'Growth', 'Data', 'SEO', 'India', 'Startups', 'Next.js', 'Automation', 'CSR'];
  const categories = ['AI & Technology', 'Web Development', 'Growth', 'Case Studies', 'Industry'];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pixenox.com';

  // Article JSON-LD for Google rich results
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image_url || undefined,
    datePublished: post.date || undefined,
    dateModified: post.date || undefined,
    author: {
      '@type': 'Organization',
      name: 'Pixenox',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pixenox Solutions Pvt Ltd',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.jpg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${slug}`,
    },
  };

  // FAQPage JSON-LD for FAQ rich snippets
  const faqJsonLd = post.faqs && post.faqs.length > 0 ? {
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
  } : null;

  return (
    <div className="blog-detail">
      {/* Structured Data */}
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
      {/* BreadcrumbList for AEO navigation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: `${baseUrl}/blog/${slug}` },
          ],
        }) }}
      />

      <div className="bd-layout">
        <article className="bd-main">
          
          {/* Title + Explainer inline */}
          <div className="bd-title-row">
            <h1 className="bd-title">{post.title}</h1>
            <BlogExplainerPopup slug={slug} />
          </div>

          {/* Category + Date */}
          <div className="bd-article-meta">
            <span className="bd-cat-badge">{post.category}</span>
            <span className="bd-meta-dot">•</span>
            <span className="bd-meta-date">{post.date}</span>
          </div>

          {/* Hero image — optimized with Next.js Image */}
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

          {/* Sections */}
          <div className="bd-content">
            <p className="bd-content__lead">{post.excerpt}</p>
            
            {(post.sections as { question: string; answer: string; image_url?: string; table?: string[][]; table_explanation?: string }[]).map((sec, i) => (
              <div key={i} className={`bd-section ${sec.image_url ? 'bd-section--has-image' : ''} ${i % 2 === 0 ? 'bd-section--left' : 'bd-section--right'}`}>
                
                <div className="bd-section__content">
                  <h2 className="bd-content__h2">{sec.question}</h2>
                  {sec.answer.split('\n\n').map((para, j) => {
                    if (para.startsWith('- ')) {
                      return (
                        <ul key={j} className="bd-content__list">
                          {para.split('\n').filter(l => l.startsWith('- ')).map((item, k) => (
                            <li key={k} dangerouslySetInnerHTML={{ __html: item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                          ))}
                        </ul>
                      );
                    }
                    if (para.startsWith('1. ')) {
                      return (
                        <ol key={j} className="bd-content__list bd-content__list--ordered">
                          {para.split('\n').filter(l => /^\d+\./.test(l)).map((item, k) => (
                            <li key={k} dangerouslySetInnerHTML={{ __html: item.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                          ))}
                        </ol>
                      );
                    }
                    const html = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    return <p key={j} className="bd-content__p" dangerouslySetInnerHTML={{ __html: html }} />;
                  })}

                  {sec.table && sec.table.length > 0 && (
                    <div className="bd-table-wrapper">
                      <table className="bd-table">
                        <thead>
                          <tr>
                            {sec.table[0].map((th, cIdx) => (
                              <th key={cIdx}>{th}</th>
                            ))}
                          </tr>
                        </thead>
                        {sec.table.length > 1 && (
                          <tbody>
                            {sec.table.slice(1).map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx}>{cell}</td>
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
                        <p key={j} className="bd-content__p" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
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

          {/* Blog FAQ Bot — before FAQs, for all blogs */}
          <BlogFaqBot slug={slug} />

          {/* FAQs */}
          {post.faqs && post.faqs.length > 0 && (
            <div className="bd-faqs-container">
              <h3 className="bd-faqs-title">Frequently Asked Questions</h3>
              <div className="bd-faqs-list">
                {post.faqs.map((faq, i) => (
                  <details key={i} className="bd-faq-item">
                    <summary className="bd-faq-question">
                      {faq.question}
                      <span className="bd-faq-icon">+</span>
                    </summary>
                    <div className="bd-faq-answer">
                      {faq.answer.split('\n\n').map((para, j) => (
                        <p key={j}>{para}</p>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="bd-tags-row">
            {tags.slice(0, 4).map(tag => (
              <span key={tag} className="bd-tag">{tag}</span>
            ))}
          </div>

          <div className="bd-divider" />

          {/* Read Next Section */}
          <div className="bd-read-next">
            <h3 className="bd-read-next__title">Read next</h3>
            <div className="bd-read-next__grid">
              {recentPosts.slice(0, 3).map((p: any) => (
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
                  <span className="bd-next-card__cat">{p.category || 'Article'}</span>
                  <h4 className="bd-next-card__title">{p.title}</h4>
                </Link>
              ))}
            </div>
          </div>

        </article>
      </div>
    </div>
  );
}
