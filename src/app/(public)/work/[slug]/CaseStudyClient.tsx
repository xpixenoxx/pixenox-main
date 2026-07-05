'use client';

import React from 'react';
import Image from 'next/image';

import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

/* ── TipTap JSON → HTML parser ── */
function parseTipTapJSONArray(content: string): string[] {
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    
    // Handle array of TipTap documents
    if (Array.isArray(parsed)) {
      return parsed.map((doc: any) => {
        if (!doc || !doc.content) return '';
        return doc.content.map((node: any) => renderNode(node)).join('');
      });
    }

    const doc = parsed;
    if (!doc || !doc.content) return [content]; // fallback: treat as raw HTML
    return [doc.content.map((node: any) => renderNode(node)).join('')];
  } catch {
    // Not JSON — treat as raw HTML string
    return [content];
  }
}

function renderNode(node: any): string {
  if (!node) return '';
  
  switch (node.type) {
    case 'paragraph':
      const pContent = node.content?.map((c: any) => renderInline(c)).join('') ?? '';
      return `<p>${pContent}</p>`;
    case 'heading': {
      const level = node.attrs?.level ?? 2;
      const hContent = node.content?.map((c: any) => renderInline(c)).join('') ?? '';
      return `<h${level}>${hContent}</h${level}>`;
    }
    case 'bulletList':
      return `<ul>${node.content?.map((c: any) => renderNode(c)).join('') ?? ''}</ul>`;
    case 'orderedList':
      return `<ol>${node.content?.map((c: any) => renderNode(c)).join('') ?? ''}</ol>`;
    case 'listItem':
      return `<li>${node.content?.map((c: any) => renderNode(c)).join('') ?? ''}</li>`;
    case 'blockquote':
      return `<blockquote>${node.content?.map((c: any) => renderNode(c)).join('') ?? ''}</blockquote>`;
    case 'codeBlock':
      const code = node.content?.map((c: any) => c.text ?? '').join('') ?? '';
      return `<pre><code>${code}</code></pre>`;
    case 'horizontalRule':
      return '<hr />';
    default:
      return node.content?.map((c: any) => renderNode(c)).join('') ?? '';
  }
}

function renderInline(node: any): string {
  if (!node) return '';
  if (node.type === 'text') {
    let text = node.text ?? '';
    // Apply marks (bold, italic, link, etc.)
    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case 'bold': text = `<strong>${text}</strong>`; break;
          case 'italic': text = `<em>${text}</em>`; break;
          case 'underline': text = `<u>${text}</u>`; break;
          case 'strike': text = `<s>${text}</s>`; break;
          case 'code': text = `<code>${text}</code>`; break;
          case 'link':
            text = `<a href="${mark.attrs?.href ?? '#'}" target="${mark.attrs?.target ?? '_blank'}">${text}</a>`;
            break;
        }
      }
    }
    return text;
  }
  if (node.type === 'hardBreak') return '<br />';
  return '';
}

/* ── Framer Motion Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function CaseStudyClient({ caseStudy, workTags }: { caseStudy: any, workTags: any[] }) {
  const coverImage = caseStudy.cover_image_url || (caseStudy.gallery_images?.length ? caseStudy.gallery_images[0] : null);
  const galleryImages = caseStudy.gallery_images?.slice(1) || [];
  const bodyHTMLArray = caseStudy.body_content ? parseTipTapJSONArray(caseStudy.body_content) : [];

  return (
    <div className="cs-page">

      {/* 1. HERO TITLE */}
      <section className="cs-hero-section">
        <motion.div 
          className="cs-container"
          initial="hidden" 
          animate="visible" 
          variants={stagger}
        >
          <motion.h1 className="cs-title" variants={fadeUp}>
            {caseStudy.title}.
          </motion.h1>
          {caseStudy.short_description && (
            <motion.p className="cs-subtitle" variants={fadeUp}>
              {caseStudy.short_description}
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* 2. COVER IMAGE */}
      {coverImage && (
        <section className="cs-cover-section">
          <motion.div 
            className="cs-cover-frame"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image 
              src={coverImage} 
              alt={caseStudy.title} 
              fill 
              style={{ objectFit: 'cover' }} 
              priority 
            />
          </motion.div>
        </section>
      )}

      {/* 2.5 METRICS / KPI SECTION */}
      {caseStudy.metrics && caseStudy.metrics.length > 0 && (
        <motion.section 
          className="cs-metrics-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <div className="cs-container">
            <motion.div className="cs-metrics-header" variants={fadeUp}>
              <span className="cs-metrics-label">KEY METRICS</span>
              <h2 className="cs-metrics-heading">Measured <em>Impact</em></h2>
            </motion.div>
            <div className="cs-metrics-grid">
              {caseStudy.metrics.map((metric: any, idx: number) => (
                <MetricCard key={idx} metric={metric} idx={idx} />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* 3. ANTIMATTER-STYLE: SUMMARY LEFT, TECH STACK + LENGTH RIGHT */}
      <motion.section 
        className="cs-info-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <div className="cs-container">
          <div className="cs-summaries-extended">
            {/* FIRST SUMMARY & TECH STACK (Row 1) */}
            <div className="cs-summary-row-first">
              <motion.div className="cs-summary-extended-block cs-summary-left" variants={fadeUp}>
                <span className="cs-info-label">Summary</span>
                {bodyHTMLArray.length > 0 ? (
                  <div className="cs-summary-text" dangerouslySetInnerHTML={{ __html: bodyHTMLArray[0] }} />
                ) : (
                  <p className="cs-summary-text">{caseStudy.short_description}</p>
                )}
              </motion.div>

              <motion.div className="cs-info-meta" variants={fadeUp}>
                {caseStudy.tools_used && caseStudy.tools_used.length > 0 && (
                  <div className="cs-info-block">
                    <span className="cs-info-label">Tech Stack</span>
                    <div className="cs-tech-badges">
                      {caseStudy.tools_used.map((t: string) => (
                        <span key={t} className="cs-tech-badge">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {caseStudy.project_length && (
                  <div className="cs-info-block" style={{ marginTop: '24px' }}>
                    <span className="cs-info-label">Length of Project</span>
                    <span className="cs-length-value">{caseStudy.project_length}</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ADDITIONAL SUMMARIES */}
            {bodyHTMLArray.length > 1 && bodyHTMLArray.slice(1).map((html, idx) => {
              const isRight = idx % 2 === 0; // Second summary (idx 0 here) goes to the right
              return (
                <motion.div 
                  key={idx} 
                  className={`cs-summary-extended-block ${isRight ? 'cs-summary-right' : 'cs-summary-left'}`} 
                  variants={fadeUp}
                >
                  <div className="cs-summary-text" dangerouslySetInnerHTML={{ __html: html }} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 5. GALLERY */}
      {galleryImages.length > 0 && (
        <motion.section 
          className="cs-gallery-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <div className="cs-gallery-grid">
            {galleryImages.map((url: string, i: number) => (
              <motion.div key={i} className="cs-gallery-item" variants={fadeUp}>
                <Image src={url} alt={`Gallery ${i + 1}`} fill style={{ objectFit: 'cover' }} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* 6. PITCH DECK AUTO-SCROLL REEL */}
      {caseStudy.pitch_deck_images && caseStudy.pitch_deck_images.length > 0 && (
        <motion.section 
          className="cs-deck-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <div className="cs-deck-header">
            <h2 className="cs-deck-title">Pitch Deck</h2>
            <span className="cs-deck-subtitle">Executive Presentation</span>
          </div>
          
          <Swiper
            modules={[Autoplay]}
            slidesPerView="auto"
            spaceBetween={20}
            loop
            speed={5000}
            autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
            className="cs-deck-swiper"
            style={{ overflow: 'visible', paddingLeft: 'clamp(24px, 5vw, 80px)' }}
          >
            {caseStudy.pitch_deck_images.map((url: string, i: number) => (
              <SwiperSlide key={i} style={{ width: 'clamp(320px, 50vw, 700px)' }}>
                <div className="cs-deck-slide">
                  <Image src={url} alt={`Slide ${i + 1}`} fill style={{ objectFit: 'contain' }} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.section>
      )}

    </div>
  );
}


/* ═══════════════════════════════════════════════════
   METRIC CARD — Animated Count-Up + Glassmorphism
   ═══════════════════════════════════════════════════ */
interface MetricData {
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
}

function MetricCard({ metric, idx }: { metric: MetricData; idx: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [display, setDisplay] = React.useState('0');
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateValue(metric.value);
        }
      },
      { threshold: 0.3 }
    );
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, metric.value]);

  const animateValue = (targetStr: string) => {
    // Extract numeric part for animation
    const numericMatch = targetStr.replace(/,/g, '').match(/[\d.]+/);
    if (!numericMatch) {
      setDisplay(targetStr);
      return;
    }

    const target = parseFloat(numericMatch[0]);
    const isDecimal = targetStr.includes('.');
    const hasCommas = targetStr.includes(',');
    const prefix = targetStr.substring(0, targetStr.indexOf(numericMatch[0]));
    const suffixPart = targetStr.substring(targetStr.indexOf(numericMatch[0]) + numericMatch[0].length);
    const duration = 1800;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      let formatted: string;
      if (isDecimal) {
        const decimals = (numericMatch[0].split('.')[1] || '').length;
        formatted = current.toFixed(decimals);
      } else {
        formatted = Math.round(current).toString();
      }

      if (hasCommas) {
        formatted = Number(formatted).toLocaleString();
      }

      setDisplay(prefix + formatted + suffixPart);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplay(targetStr);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <motion.div
      ref={ref}
      className="cs-metric-card"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="cs-metric-value">
        {metric.prefix && <span className="cs-metric-prefix">{metric.prefix}</span>}
        <span>{display}</span>
        {metric.suffix && <span className="cs-metric-suffix">{metric.suffix}</span>}
      </div>
      <div className="cs-metric-label">{metric.label}</div>
      <div className="cs-metric-glow" />
    </motion.div>
  );
}
