import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import './blog.css';

export const revalidate = 0; // Force dynamic to ensure new posts reflect instantly

const POSTS_PER_PAGE = 9;

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  image_url: string;
  excerpt: string;
  priority: number;
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  // Await searchParams as required in Next.js 15
  const resolvedParams = await searchParams;
  const currentPage = parseInt(resolvedParams.page || '1', 10);

  const supabase = await createClient();

  // Fetch all visible posts ordered by priority
  const { data } = await supabase
    .from('blog_posts')
    .select('id, slug, title, date, category, image_url, excerpt, priority')
    .eq('is_visible', true)
    .order('priority', { ascending: true });

  const posts = (data as BlogPost[]) ?? [];

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div className="blog-page">
      <div className="blog-page__hero">
        <h1>Latest Insights</h1>
        <p>Explore our latest thinking, research, and analysis.</p>
      </div>

      <div className="blog-page__container">

        {/* Posts grid */}
        <div className="blog-page__grid row">
          {currentPosts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card__image-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image_url} alt={post.title} className="blog-card__image" />
              </div>

              <div className="blog-card__content">
                <div className="blog-card__date">
                  <svg className="blog-card__date-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {post.date}
                </div>

                <h3 className="blog-card__title">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="blog-card__excerpt">{post.excerpt}</p>

                <Link href={`/blog/${post.slug}`} className="blog-card__read-more">
                  READ MORE
                  <svg className="blog-card__read-more-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="blog-pagination" aria-label="Blog pagination">
            {currentPage > 1 ? (
              <Link href={`/blog?page=${currentPage - 1}`} className="blog-pagination__btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Prev
              </Link>
            ) : (
              <button className="blog-pagination__btn" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Prev
              </button>
            )}

            <div className="blog-pagination__pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/blog?page=${page}`}
                  className={`blog-pagination__page ${currentPage === page ? 'is-active' : ''}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </Link>
              ))}
            </div>

            {currentPage < totalPages ? (
              <Link href={`/blog?page=${currentPage + 1}`} className="blog-pagination__btn">
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ) : (
              <button className="blog-pagination__btn" disabled>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </nav>
        )}

        <p className="blog-pagination__info">
          {posts.length > 0
            ? `Page ${currentPage} of ${totalPages} — ${posts.length} articles`
            : ''}
        </p>
      </div>
    </div>
  );
}
