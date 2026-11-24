'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import type { EngineeringCardPage } from '@/lib/types/database';
import './card-slug.css';
import '../../../blog/blog.css';
import BlogExplainerPopup from '@/components/blog/BlogExplainerPopup';
import BlogFaqBot from '@/components/blog/BlogFaqBot';

interface CardDetailClientProps {
  slug: string;
  cardSlug: string;
  page: EngineeringCardPage;
  blogs: any[];
}

export default function CardDetailClient({ slug, cardSlug, page, blogs }: CardDetailClientProps) {
  const [s2Index, setS2Index] = useState(0);
  const [s2IsPlaying, setS2IsPlaying] = useState(true);
  const [openS3Index, setOpenS3Index] = useState<number | null>(0);
  const [hoveredS3Index, setHoveredS3Index] = useState<number | null>(null);
  const [s4ScrollIndex, setS4ScrollIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!s2IsPlaying) return;
    const s2Cards = (page.section2_cards as any[]) || [];
    if (s2Cards.length <= 1) return;

    const interval = setInterval(() => {
      setS2Index((prev) => (prev + 1) % s2Cards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [page, s2IsPlaying]);

  const s2Cards = (page.section2_cards as any[]) || [];
  const s3Cards = (page.section3_cards as any[]) || [];
  const s4Cards = (page.section4_cards as any[]) || [];

  return (
    <div className="card-page-wrap" ref={containerRef}>
      <div className="cp-ambient-1 fixed" aria-hidden="true" />
      <div className="cp-ambient-2 fixed" aria-hidden="true" />

      {/* 1. HERO SECTION */}
      <section className="cp-hero">
        <div className="cp-hero-grid">
          <div className="cp-hero-content">
            <nav aria-label="Breadcrumb" style={{ marginBottom: '20px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
              <Link href="/engineering" style={{ color: '#c4b5fd', textDecoration: 'none' }}>Engineering</Link>
              <span aria-hidden="true"> / </span>
              <Link href={`/engineering/${slug}`} style={{ color: '#c4b5fd', textDecoration: 'none' }}>{slug.replace(/-/g, ' ')}</Link>
            </nav>
            <h1 className="cp-title" style={{ fontSize: '40px', margin: 0 }}>
              {page.hero_title}
              <span style={{ display: 'inline-block', marginLeft: '48px', verticalAlign: 'middle', marginTop: '-8px' }}>
                <BlogExplainerPopup slug={`${slug}/${cardSlug}`} source="engineering" />
              </span>
            </h1>
            <p className="cp-desc" style={{ color: '#FFFFFF', fontSize: '18px', lineHeight: '24px', maxWidth: '652.59px', margin: '17.0577px 0px 0px' }}>
              {page.hero_description}
            </p>
          </div>

          {page.hero_image_url && (
            <motion.div
              className="cp-hero-visual"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ perspective: 1000 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={page.hero_image_url} alt={page.hero_title ?? ''} className="cp-hero-img" />
            </motion.div>
          )}
        </div>
      </section>

      {/* 2. SECTION 2 (Features / Architecture) */}
      {s2Cards.length > 0 && (
        <section className="cp-section" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <div className="rad-accordion__header-container w-full" style={{ padding: '0px 0px 48px', maxWidth: '1110.4px' }}>
            <h2 className="cp-section-title font-bold m-0" style={{ fontSize: '48px', color: '#FFFFFF', fontFamily: 'var(--font-inter)', maxWidth: '729.6px', lineHeight: '57.6px' }}>
              {page.section2_name || 'Architecture'}
            </h2>
            {page.section2_description && <p className="cp-section-desc">{page.section2_description}</p>}
          </div>

          <div className="relative mt-12 w-full overflow-hidden">
            <motion.div
              key={s2Index}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col justify-end">
                <h3 className="s2-feature-title font-bold leading-tight tracking-tight mb-6" style={{ fontFamily: 'var(--font-inter)', fontSize: '25.5867px', color: '#FFFFFF' }}>
                  {s2Cards[s2Index]?.title}
                </h3>
                <p className="s2-feature-desc font-medium leading-relaxed max-w-2xl text-left" style={{ fontFamily: 'var(--font-inter)', fontSize: '17.0577px', color: '#FFFFFF', margin: '17.0577px 0px 0px', padding: 0 }}>
                  {s2Cards[s2Index]?.description}
                </p>
              </div>

              {s2Cards[s2Index]?.image_url && (
                <div className="w-full aspect-[4/3] lg:aspect-[3/2] relative overflow-hidden rounded-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s2Cards[s2Index].image_url} alt={s2Cards[s2Index].title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
            </motion.div>

            {s2Cards.length > 1 && (
              <div className="flex items-center justify-between" style={{ margin: '17.0577px 0px 0px' }}>
                <button
                  type="button"
                  onClick={() => setS2IsPlaying(!s2IsPlaying)}
                  aria-label={s2IsPlaying ? 'Pause carousel' : 'Play carousel'}
                  className="w-12 h-12 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  {s2IsPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous architecture slide"
                    onClick={() => {
                      setS2IsPlaying(false);
                      setS2Index((prev) => (prev - 1 + s2Cards.length) % s2Cards.length);
                    }}
                    className="w-12 h-12 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <ArrowLeft size={20} className="text-white" />
                  </button>
                  <span className="font-semibold text-white/80 w-16 text-center text-sm tracking-widest" style={{ fontFamily: 'var(--font-inter)' }}>
                    {s2Index + 1}/{s2Cards.length}
                  </span>
                  <button
                    type="button"
                    aria-label="Next architecture slide"
                    onClick={() => {
                      setS2IsPlaying(false);
                      setS2Index((prev) => (prev + 1) % s2Cards.length);
                    }}
                    className="w-12 h-12 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <ArrowRight size={20} className="text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. SECTION 3: KEY FUNCTIONS */}
      {s3Cards.length > 0 && (
        <section className="cp-section w-full rad-accordion" id="block-what-you-can-do" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <div className="rad-accordion__header-container w-full" style={{ padding: '0px 0px 48px', maxWidth: '1110.4px' }}>
            <h2 className="font-bold m-0 rad-accordion__headline" style={{ color: '#FFFFFF', fontFamily: 'var(--font-inter)', fontSize: '48px', maxWidth: '729.6px', lineHeight: '57.6px' }}>
              {page.section3_name || 'What you can do'}
            </h2>
            {page.section3_description && <p className="text-white/65 leading-[1.6] max-w-3xl m-0 text-xl mt-6" style={{ fontFamily: 'var(--font-inter)' }}>{page.section3_description}</p>}
          </div>

          <div className="flex flex-col">
            {s3Cards.map((card, i) => {
              const isOpen = openS3Index === i;
              const isPrevOpen = openS3Index === i - 1;
              const isLast = i === s3Cards.length - 1;
              const isHovered = hoveredS3Index === i;
              const isPrevHovered = hoveredS3Index === i - 1;
              const isAnyActive = openS3Index !== null || hoveredS3Index !== null;

              const topIsPurple = !isAnyActive || isOpen || isHovered || isPrevOpen || isPrevHovered;
              const topBorder = topIsPurple ? '2px solid #a178ff' : '2px solid rgba(255,255,255,0.2)';
              const bottomIsPurple = !isAnyActive || isOpen || isHovered;
              const bottomBorder = isLast ? (bottomIsPurple ? '2px solid #a178ff' : '2px solid rgba(255,255,255,0.2)') : undefined;
              const isTextActive = !isAnyActive || isOpen || isHovered;
              const textColor = isTextActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)';

              return (
                <details
                  key={i}
                  open={isOpen}
                  onToggle={(e) => {
                    const isNowOpen = (e.currentTarget as HTMLDetailsElement).open;
                    if (isNowOpen && openS3Index !== i) setOpenS3Index(i);
                  }}
                  className="transition-colors duration-300"
                  onMouseEnter={() => setHoveredS3Index(i)}
                  onMouseLeave={() => setHoveredS3Index(null)}
                  style={{ borderTop: topBorder, borderBottom: bottomBorder }}
                >
                  <summary
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenS3Index(isOpen ? null : i);
                    }}
                    className="rad-accordion__header w-full flex justify-between items-center text-left bg-transparent cursor-pointer list-none"
                    style={{ padding: '24px 14px 24px 0px', listStyle: 'none' }}
                  >
                    <h3 className="rad-accordion__header-title font-bold transition-colors duration-300 m-0" style={{ fontFamily: 'var(--font-inter)', fontSize: '25.5867px', color: textColor, maxWidth: '878.83px', lineHeight: '33.26px' }}>
                      {card.topic || card.title}
                    </h3>
                    <div className="rad-accordion__icon-container flex-shrink-0 ml-6 flex items-center justify-center transition-colors duration-300" style={{ color: textColor, fontSize: '24px', fontWeight: 300, width: '80.11px', height: '29.85px' }} aria-hidden="true">
                      <div className="rad-accordion__icon relative flex items-center justify-center" style={{ width: '14.93px', height: '14.93px', margin: '7.46px 32.6px' }}>
                        <div style={{ position: 'absolute', width: '14.93px', height: '2.13px', backgroundColor: textColor, transition: 'background-color 0.3s' }} />
                        <div style={{ position: 'absolute', width: '2.13px', height: '14.93px', backgroundColor: textColor, opacity: isOpen ? 0 : 1, transition: 'opacity 0.3s ease, background-color 0.3s' }} />
                      </div>
                    </div>
                  </summary>
                  <div className="rad-accordion__content" style={{ padding: '0px 0px 25.5867px' }}>
                    <div className="rad-accordion__detail" style={{ maxWidth: '888.78px' }}>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '21.3222px', color: '#FFFFFF', lineHeight: '34.11px', margin: '0 0 12.79px 0' }}>
                        {card.description}
                      </p>
                    </div>
                    {card.link_url && (
                      <Link href={card.link_url} className="text-[#a178ff] hover:text-white font-medium mt-6 inline-flex items-center gap-2 transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>
                        Learn More <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. SECTION 4: KEY OUTCOMES */}
      {s4Cards.length > 0 && (() => {
        const maxScroll = Math.max(0, s4Cards.length - 2);
        return (
          <section className="s4-section cp-section w-full overflow-hidden" style={{ padding: '60px 0' }}>
            <div className="s4-header-container w-full" style={{ padding: '0px 48px', margin: '0px 0px 48px' }}>
              <h2 className="s4-section-title font-bold leading-[1.15] m-0" style={{ color: '#FFFFFF', fontFamily: 'var(--font-inter)', fontSize: '48px', maxWidth: '830.4px' }}>
                {page.section4_name || 'Key Outcomes'}
              </h2>
              {page.section4_description && <p className="text-white/50 text-lg leading-relaxed font-normal mt-6 max-w-3xl" style={{ fontFamily: 'var(--font-inter)' }}>{page.section4_description}</p>}
            </div>

            <div className="relative w-full">
              <motion.div
                className="flex"
                style={{ paddingLeft: '0', gap: '0', alignItems: 'flex-start' }}
                animate={{ x: -(s4ScrollIndex * (isMobile ? 411.2 : 658.72)) }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {s4Cards.map((card, i) => (
                  <div
                    key={i}
                    className="s4-card-container flex flex-col flex-shrink-0"
                    style={{ width: isMobile ? '411.2px' : '658.72px', height: 'auto', padding: isMobile ? '0px 22.56px' : '0px 32.56px 0px 80px' }}
                  >
                    {card.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.logo_url} alt={card.title} style={{ width: '80px', height: '80px', marginBottom: '24px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} aria-hidden="true" />
                    )}
                    <h3 className="s4-card-title font-bold" style={{ color: '#FFFFFF', fontFamily: 'var(--font-inter)', fontSize: isMobile ? '18px' : '24px', lineHeight: '31.2px', marginBottom: isMobile ? '8px' : '16px', maxWidth: '546.16px' }}>
                      {card.title}
                    </h3>
                    <p className="s4-card-desc font-normal" style={{ color: '#FFFFFF', fontFamily: 'var(--font-inter)', fontSize: isMobile ? '14px' : '17.577px', lineHeight: '1.6', marginBottom: isMobile ? '4px' : '12px', maxWidth: '546.16px' }}>
                      {card.description}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            {s4Cards.length > 2 && (
              <div className="flex items-center justify-end gap-2" style={{ marginTop: '17.0577px' }}>
                <button
                  type="button"
                  aria-label="Scroll outcomes left"
                  onClick={() => setS4ScrollIndex(Math.max(0, s4ScrollIndex - 1))}
                  className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                  disabled={s4ScrollIndex === 0}
                  style={{ opacity: s4ScrollIndex === 0 ? 0.3 : 1 }}
                >
                  <ArrowLeft size={22} className="text-white" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll outcomes right"
                  onClick={() => setS4ScrollIndex(Math.min(maxScroll, s4ScrollIndex + 1))}
                  className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                  disabled={s4ScrollIndex >= maxScroll}
                  style={{ opacity: s4ScrollIndex >= maxScroll ? 0.3 : 1 }}
                >
                  <ArrowRight size={22} className="text-white" />
                </button>
              </div>
            )}
          </section>
        );
      })()}

      {/* FAQ Bot */}
      <div style={{ maxWidth: '1200px', margin: '4rem auto 2rem', padding: '0 2rem' }}>
        <BlogFaqBot slug={`${slug}/${cardSlug}`} source="engineering" />
      </div>

      {/* 5. SECTION 5: RELATED ARTICLES (Zero public debug leaks!) */}
      {blogs.length > 0 && (
        <section className="cp-section mb-32" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <div className="s5-header-container rad-accordion__header-container w-full" style={{ padding: '0px 0px 48px', maxWidth: '1110.4px' }}>
            <h2 className="cp-section-title font-bold m-0" style={{ color: '#FFFFFF', fontFamily: 'var(--font-inter)', fontSize: '48px', maxWidth: '729.6px', lineHeight: '57.6px', margin: '0px 0px 8px' }}>
              {page.section5_name || 'Related Research & Engineering Guides'}
            </h2>
            {page.section5_description && <p className="cp-section-desc">{page.section5_description}</p>}
          </div>

          <div className="blog-page__grid row" style={{ gap: '0' }}>
            {blogs.map((post: any) => (
              <article key={post.id} className="blog-card" style={{ animation: 'none', margin: 0 }}>
                <div className="blog-card__image-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image_url} alt={post.title} className="blog-card__image" loading="lazy" />
                </div>
                <div className="blog-card__content">
                  <div className="blog-card__date">{post.date}</div>
                  <h3 className="blog-card__title">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
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
          </div>
        </section>
      )}

      {/* Clean back-to-pillar + Contact CTA */}
      <section className="cp-section" style={{ paddingBottom: '80px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
          <Link href="/contact/pixy" className="cp-badge" style={{ background: '#ffffff', color: '#09090b', fontWeight: 600 }}>
            Scope {page.hero_title}
          </Link>
          <Link href={`/engineering/${slug}`} className="cp-badge">
            Back to {slug.replace(/-/g, ' ')}
          </Link>
        </div>
      </section>
    </div>
  );
}
