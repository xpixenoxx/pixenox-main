import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { permanentRedirect } from 'next/navigation';
import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import { sortBlogPostsByDate } from '@/lib/blog-utils';
import type { Metadata } from 'next';
import './blog.css';

export const revalidate = 300;

const POSTS_PER_PAGE = 8;

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  image_url: string;
  excerpt: string;
  priority: number;
  created_at?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const pageNum = Math.max(1, parseInt(resolved.page || '1', 10) || 1);
  const baseUrl = getCanonicalSiteUrl();
  const isPaginated = pageNum > 1;

  const title = isPaginated
    ? `Engineering Insights & Research — Page ${pageNum}`
    : 'Engineering Insights — AI Systems, GEO & Enterprise Architecture';
  const description =
    'Technical guides and architecture research from the Pixenox engineering team on production AI systems, enterprise data convergence, and AI visibility (GEO/AEO).';
  const canonical = isPaginated ? `${baseUrl}/blog?page=${pageNum}` : `${baseUrl}/blog`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | Pixenox`,
      description,
      url: canonical,
    },
  };
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  if (resolvedParams.page === '1') {
    permanentRedirect('/blog');
  }

  const parsedPage = parseInt(resolvedParams.page || '1', 10);
  const currentPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  const supabase = createPublicSupabaseClient();

  const { data } = await supabase
    .from('blog_posts')
    .select('id, slug, title, date, category, image_url, excerpt, priority, created_at')
    .eq('is_visible', true);

  const rawPosts = (data as BlogPost[]) ?? [];
  const posts = sortBlogPostsByDate(rawPosts);

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  if (currentPage > totalPages) {
    permanentRedirect(totalPages === 1 ? '/blog' : `/blog?page=${totalPages}`);
  }
  const safePage = currentPage;
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const baseUrl = getCanonicalSiteUrl();
  const blogCollectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${baseUrl}/blog#blog`,
    url: safePage > 1 ? `${baseUrl}/blog?page=${safePage}` : `${baseUrl}/blog`,
    name: 'Pixenox Engineering Insights & Research',
    publisher: { '@id': `${baseUrl}/#organization` },
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
    ],
  };

  return (
    <div className="blog-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="blog-page__hero">
        <nav aria-label="Breadcrumb" style={{ marginBottom: '16px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
          <Link href="/" style={{ color: '#c4b5fd', textDecoration: 'none' }}>Home</Link>
          <span aria-hidden="true"> / </span>
          <span style={{ color: '#ffffff' }}>Blog</span>
        </nav>
        <h1>Engineering Insights &amp; Research</h1>
        <p>
          Production AI systems architecture, enterprise data platforms, and AI visibility (GEO/AEO) research from the Pixenox team.{' '}
          <a href="/blog/feed.xml" style={{ color: '#c4b5fd', textDecoration: 'underline', marginLeft: '6px' }}>RSS Feed</a>
        </p>
      </div>

      <div className="blog-page__container">
        <div className="blog-page__grid row">
          {currentPosts.map((post, idx) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card__image-wrapper">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  width={600}
                  height={340}
                  className="blog-card__image"
                  priority={startIndex === 0 && idx < 2}
                  loading={startIndex === 0 && idx < 2 ? 'eager' : 'lazy'}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                />
              </div>

              <div className="blog-card__content">
                <div className="blog-card__date">
                  {post.category ? <span style={{ color: '#c4b5fd', fontWeight: 600, marginRight: '8px' }}>{post.category}</span> : null}
                  {post.date}
                </div>

                <h2 className="blog-card__title">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <Link href={`/blog/${post.slug}`} className="blog-card__read-more">
                  READ ARTICLE
                  <svg className="blog-card__read-more-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 8 16 12 12 16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}

          {posts.length === 0 && (
            <div className="blog-empty">
              <p>No posts published yet. Check back soon.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <nav className="blog-pagination" aria-label="Blog pagination">
            {safePage > 1 ? (
              <Link
                href={safePage === 2 ? '/blog' : `/blog?page=${safePage - 1}`}
                className="blog-pagination__btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Prev
              </Link>
            ) : (
              <button type="button" className="blog-pagination__btn" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Prev
              </button>
            )}

            <div className="blog-pagination__pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={page === 1 ? '/blog' : `/blog?page=${page}`}
                  className={`blog-pagination__page ${safePage === page ? 'is-active' : ''}`}
                  aria-current={safePage === page ? 'page' : undefined}
                >
                  {page}
                </Link>
              ))}
            </div>

            {safePage < totalPages ? (
              <Link href={`/blog?page=${safePage + 1}`} className="blog-pagination__btn">
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ) : (
              <button type="button" className="blog-pagination__btn" disabled>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </nav>
        )}

        <p className="blog-pagination__info">
          {posts.length > 0 ? `Page ${safePage} of ${totalPages} — ${posts.length} articles` : ''}
        </p>
      </div>
    </div>
  );
}
