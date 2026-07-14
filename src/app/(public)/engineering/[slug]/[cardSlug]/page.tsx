'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import type { EngineeringCardPage } from '@/lib/types/database';
import './card-slug.css';
import '../../../blog/blog.css';

// Client-side fetcher component to allow framer-motion and canvas hooks
export default function EngineeringCardDetailPageClient({ params }: { params: Promise<{ slug: string; cardSlug: string }> }) {
  const [page, setPage] = useState<EngineeringCardPage | null>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [slugs, setSlugs] = useState({ slug: '', cardSlug: '' });
  const [s2Index, setS2Index] = useState(0);
  const [s2IsPlaying, setS2IsPlaying] = useState(true);
  const [openS3Index, setOpenS3Index] = useState<number | null>(null);
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
    async function loadData() {
      const p = await params;
      setSlugs(p);
      const supabase = createClient();
      const { data } = await supabase
        .from('engineering_card_pages')
        .select('*')
        .eq('service_slug', p.slug)
        .eq('card_slug', p.cardSlug)
        .limit(1)
        .single();

      const pageData = data as EngineeringCardPage;
      setPage(pageData);

      if (pageData && pageData.section5_blog_slugs && Array.isArray(pageData.section5_blog_slugs)) {
        const cleanSlugs = pageData.section5_blog_slugs
          .map((s: any) => typeof s === 'string' ? s.trim() : '')
          .filter(Boolean);

        if (cleanSlugs.length > 0) {
          const { data: blogData, error } = await supabase
            .from('blog_posts')
            .select('id, slug, title, date, excerpt, image_url, category')
            .in('slug', cleanSlugs);
            
          if (error) {
             console.error("Error fetching blogs for trends:", error);
          }

          if (blogData) {
            const sortedBlogs = cleanSlugs.map(s => blogData.find(b => b.slug === s)).filter(Boolean);
            setBlogs(sortedBlogs);
          }
        }
      }

      setLoading(false);
    }
    loadData();
  }, [params]);

  useEffect(() => {
    if (!page || !s2IsPlaying) return;
    const s2Cards = (page.section2_cards as any[]) || [];
    if (s2Cards.length <= 1) return;

    const interval = setInterval(() => {
      setS2Index((prev) => (prev + 1) % s2Cards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [page, s2IsPlaying]);



  if (loading) {
    return <div className="card-page-wrap flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!page) {
    return (
      <div className="card-page-wrap flex items-center justify-center">
        <div className="text-center z-10">
          <h1 className="text-6xl font-bold mb-4 uppercase text-white" style={{ fontFamily: 'var(--font-outfit)' }}>404 Matrix</h1>
          <p className="text-white/50 mb-8 font-serif text-xl">Sector anomaly. Target not found.</p>
          <Link href={`/engineering/${slugs.slug}`} className="cp-badge">
            Return to Base
          </Link>
        </div>
      </div>
    );
  }

  const s2Cards = (page.section2_cards as any[]) || [];
  const s3Cards = (page.section3_cards as any[]) || [];
  const s4Cards = (page.section4_cards as any[]) || [];

  return (
    <div className="card-page-wrap" ref={containerRef}>
      <div className="cp-ambient-1 fixed" />
      <div className="cp-ambient-2 fixed" />



      {/* 1. HERO SECTION */}
      <section className="cp-hero">
        <div className="cp-hero-grid">
          <motion.div
            className="cp-hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="cp-title" style={{ fontSize: '40px' }}>
              {page.hero_title}
            </h1>
            <p className="cp-desc" style={{ color: '#FFFFFF', fontSize: '18px', lineHeight: '24px', maxWidth: '652.59px', margin: '17.0577px 0px 0px' }}>
              {page.hero_description}
            </p>
          </motion.div>

          {page.hero_image_url && (
            <motion.div
              className="cp-hero-visual"
              initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ perspective: 1000 }}
            >
              <img src={page.hero_image_url} alt="Hero" className="cp-hero-img" />
            </motion.div>
          )}
        </div>
      </section>

      {/* 2. SECTION 2 (Features / Architecture) */}
      {s2Cards.length > 0 && (
        <section className="cp-section" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <motion.div
            className="rad-accordion__header-container w-full"
            style={{ padding: '0px 0px 48px', maxWidth: '1110.4px' }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="cp-section-title font-bold m-0" style={{ fontSize: '48px', color: '#FFFFFF', fontFamily: 'var(--font-inter)', width: '729.6px', height: '57.6px', lineHeight: '57.6px' }}>{page.section2_name || 'Architecture'}</h2>
            {page.section2_description && <p className="cp-section-desc">{page.section2_description}</p>}
          </motion.div>

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

              {/* Image Content */}
              {s2Cards[s2Index]?.image_url && (
                <div className="w-full aspect-[4/3] lg:aspect-[3/2] relative overflow-hidden rounded-sm">
                  <img src={s2Cards[s2Index].image_url} alt={s2Cards[s2Index].title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
            </motion.div>

            {/* Carousel Controls */}
            {s2Cards.length > 1 && (
              <div className="flex items-center justify-between" style={{ margin: '17.0577px 0px 0px' }}>
                <button
                  onClick={() => setS2IsPlaying(!s2IsPlaying)}
                  className="w-12 h-12 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  {s2IsPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
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
          <motion.div
            className="rad-accordion__header-container w-full"
            style={{ padding: '0px 0px 48px', maxWidth: '1110.4px' }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-bold m-0 rad-accordion__headline" style={{ color: '#FFFFFF', fontFamily: 'var(--font-inter)', fontSize: '48px', width: '729.6px', height: '57.6px', lineHeight: '57.6px' }}>
              {page.section3_name || 'What you can do'}
            </h2>
            {page.section3_description && <p className="text-white/65 leading-[1.6] max-w-3xl m-0 text-xl mt-6" style={{ fontFamily: 'var(--font-inter)' }}>{page.section3_description}</p>}
          </motion.div>

          <div className="flex flex-col">
            {s3Cards.map((card, i) => {
              const isOpen = openS3Index === i;
              const isPrevOpen = openS3Index === i - 1;
              const isLast = i === s3Cards.length - 1;

              const isHovered = hoveredS3Index === i;
              const isPrevHovered = hoveredS3Index === i - 1;
              const isAnyActive = openS3Index !== null || hoveredS3Index !== null;

              const topIsPurple = !isAnyActive || isOpen || isHovered || isPrevOpen || isPrevHovered;
              const topBorder = topIsPurple
                ? '2px solid #a178ff'
                : '2px solid rgba(255,255,255,0.2)';

              const bottomIsPurple = !isAnyActive || isOpen || isHovered;
              const bottomBorder = isLast
                ? (bottomIsPurple ? '2px solid #a178ff' : '2px solid rgba(255,255,255,0.2)')
                : undefined;

              const isTextActive = !isAnyActive || isOpen || isHovered;
              const textColor = isTextActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)';

              return (
                <motion.div
                  key={i}
                  className="transition-colors duration-300"
                  onMouseEnter={() => setHoveredS3Index(i)}
                  onMouseLeave={() => setHoveredS3Index(null)}
                  style={{
                    borderTop: topBorder,
                    borderBottom: bottomBorder
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <button
                    onClick={() => setOpenS3Index(isOpen ? null : i)}
                    className="rad-accordion__header w-full flex justify-between items-center text-left bg-transparent cursor-pointer"
                    style={{ padding: '24px 14px 24px 0px' }}
                    aria-expanded={isOpen}
                  >
                    <h3 className="rad-accordion__header-title font-bold transition-colors duration-300" style={{ fontFamily: 'var(--font-inter)', fontSize: '25.5867px', color: textColor, width: '878.83px', height: '33.26px', lineHeight: '33.26px' }}>
                      {card.topic || card.title}
                    </h3>
                    <div className="rad-accordion__icon-container flex-shrink-0 ml-6 flex items-center justify-center transition-colors duration-300" style={{ color: textColor, fontSize: '24px', fontWeight: 300, width: '80.11px', height: '29.85px' }}>
                      <div className="rad-accordion__icon relative flex items-center justify-center" style={{ width: '14.93px', height: '14.93px', margin: '7.46px 32.6px' }}>
                        {/* Horizontal Line (-) */}
                        <div style={{ position: 'absolute', width: '14.93px', height: '2.13px', backgroundColor: textColor, transition: 'background-color 0.3s' }} />
                        {/* Vertical Line (|) */}
                        <div style={{ position: 'absolute', width: '2.13px', height: '14.93px', backgroundColor: textColor, opacity: isOpen ? 0 : 1, transition: 'opacity 0.3s ease, background-color 0.3s' }} />
                      </div>
                    </div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rad-accordion__content" style={{ padding: '0px 0px 25.5867px' }}>
                      <div className="rad-accordion__detail" style={{ width: '888.78px' }}>
                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '21.3222px', color: '#FFFFFF', lineHeight: '34.11px', margin: '0 0 12.79px 0' }}>
                          {card.description}
                        </p>
                      </div>
                      {card.link_url && (
                        <Link href={card.link_url} className="text-[#a178ff] hover:text-white font-medium mt-6 inline-flex items-center gap-2 transition-colors block" style={{ fontFamily: 'var(--font-inter)' }}>
                          Learn More <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. SECTION 4: KEY OUTCOMES — Accenture-style horizontal carousel */}
      {s4Cards.length > 0 && (() => {
        const maxScroll = Math.max(0, s4Cards.length - 2);

        return (
          <section className="s4-section cp-section w-full overflow-hidden" style={{ padding: '60px 0' }}>
            {/* Section Title */}
            <motion.div
              className="s4-header-container w-full"
              style={{ padding: '0px 48px', margin: '0px 0px 48px' }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="s4-section-title font-bold leading-[1.15] m-0" style={{ color: '#FFFFFF', fontFamily: 'var(--font-inter)', fontSize: '48px', maxWidth: '830.4px' }}>
                {page.section4_name || 'Key Outcomes'}
              </h2>
              {page.section4_description && <p className="text-white/50 text-lg leading-relaxed font-normal mt-6 max-w-3xl" style={{ fontFamily: 'var(--font-inter)' }}>{page.section4_description}</p>}
            </motion.div>

            {/* Horizontal Scrolling Cards */}
            <div className="relative w-full">
              <motion.div
                className="flex"
                style={{ paddingLeft: '0', gap: '0', alignItems: 'flex-start' }}
                animate={{ x: -(s4ScrollIndex * (isMobile ? 411.2 : 562.8)) }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {s4Cards.map((card, i) => (
                    <motion.div
                      key={i}
                      className="s4-card-container flex flex-col flex-shrink-0"
                      style={{ width: '562.8px', height: 'auto', padding: '0px 32.56px 0px 80px' }}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    >
                      {/* Icon */}
                      {card.logo_url ? (
                        <img src={card.logo_url} alt={card.title} style={{ width: '80px', height: '80px', marginBottom: '24px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: '80px', height: '80px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                      )}
  
                      {/* Title */}
                      <h3 className="s4-card-title font-bold" style={{ color: '#FFFFFF', fontFamily: 'var(--font-inter)', fontSize: '24px', lineHeight: '31.2px', marginBottom: '16px', maxWidth: '450.25px' }}>
                        {card.title}
                      </h3>
  
                      {/* Description */}
                      <p className="s4-card-desc font-normal" style={{ color: '#FFFFFF', fontFamily: 'var(--font-inter)', fontSize: '16px', lineHeight: '24px', marginBottom: '12px', maxWidth: '450.25px' }}>
                        {card.description}
                      </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Arrows — bottom right */}
            {s4Cards.length > 2 && (
              <div className="flex items-center justify-end gap-2" style={{ marginTop: '17.0577px' }}>
                <button
                  onClick={() => setS4ScrollIndex(Math.max(0, s4ScrollIndex - 1))}
                  className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                  disabled={s4ScrollIndex === 0}
                  style={{ opacity: s4ScrollIndex === 0 ? 0.3 : 1 }}
                >
                  <ArrowLeft size={22} className="text-white" />
                </button>
                <button
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

      {/* 5. SECTION 5: TRENDS */}
      <section className="cp-section mb-32" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <motion.div
          className="s5-header-container rad-accordion__header-container w-full"
          style={{ padding: '0px 0px 48px', maxWidth: '1110.4px' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="cp-section-title font-bold m-0" style={{ color: '#FFFFFF', fontFamily: 'var(--font-inter)', fontSize: '48px', width: '729.6px', height: 'auto', lineHeight: '57.6px', margin: '0px 0px 8px' }}>{page.section5_name || 'Modernization Trends'}</h2>
          {page.section5_description && <p className="cp-section-desc">{page.section5_description}</p>}
        </motion.div>

        <div className="blog-page__grid row" style={{ gap: '0' }}>
          {blogs.map((post: any, i: number) => (
            <motion.article 
              key={post.id} 
              className="blog-card" 
              style={{ animation: 'none', margin: 0 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="blog-card__image-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image_url} alt={post.title} className="blog-card__image" />
              </div>

              <div className="blog-card__content">
                <div className="blog-card__date">
                  {post.date}
                </div>

                <h3 className="blog-card__title">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <Link href={`/blog/${post.slug}`} className="blog-card__read-more">
                  READ MORE
                  <svg className="blog-card__read-more-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 8 16 12 12 16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </Link>
              </div>
            </motion.article>
          ))}
          {blogs.length === 0 && (
            <div className="col-span-full cp-trend-card w-full flex flex-col gap-4" style={{ padding: '24px' }}>
              <div className="cp-trend-placeholder">No trends integrated yet.</div>
              <div className="text-xs font-mono text-red-400/80 bg-red-500/10 p-4 rounded text-left w-full max-w-lg mx-auto">
                <p className="mb-2 text-white/60">Debug Info (Slugs retrieved for this page):</p>
                {JSON.stringify(page.section5_blog_slugs || [], null, 2)}
                <p className="mt-2 text-white/60 text-[10px]">If this is empty, the database doesn't have the slug saved for THIS specific page URL.</p>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
