import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import './blog-detail.css';

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

export const revalidate = 0; // Force dynamic to ensure new posts reflect instantly

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

  return (
    <div className="blog-detail">
      <div className="bd-layout">
        <article className="bd-main">
          
          {/* Title */}
          <h1 className="bd-title">{post.title}</h1>

          {/* Category + Date */}
          <div className="bd-article-meta">
            <span className="bd-cat-badge">{post.category}</span>
            <span className="bd-meta-dot">•</span>
            <span className="bd-meta-date">{post.date}</span>
          </div>

          {/* Hero image */}
          <div className="bd-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt={post.title} className="bd-hero__img" />
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sec.image_url} alt={sec.question} className="w-full h-auto object-cover rounded-xl shadow-2xl border border-white/10" />
                  </div>
                )}
                
              </div>
            ))}
          </div>

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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop'} alt={p.title} />
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
