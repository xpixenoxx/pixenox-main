'use client';

import React from 'react';
import Image from 'next/image';

import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

/* ── TipTap JSON → HTML parser ── */
function parseTipTapJSON(content: string): string {
  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    if (!doc || !doc.content) return content; // fallback: treat as raw HTML
    return doc.content.map((node: any) => renderNode(node)).join('');
  } catch {
    // Not JSON — treat as raw HTML string
    return content;
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
  const bodyHTML = caseStudy.body_content ? parseTipTapJSON(caseStudy.body_content) : null;

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

      {/* 3. ANTIMATTER-STYLE: SUMMARY LEFT, TECH STACK + LENGTH RIGHT */}
      <motion.section 
        className="cs-info-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <div className="cs-container">
          <div className="cs-info-grid">
            {/* LEFT: Summary */}
            <motion.div className="cs-info-left" variants={fadeUp}>
              <span className="cs-info-label">Summary</span>
              {bodyHTML ? (
                <div className="cs-summary-text" dangerouslySetInnerHTML={{ __html: bodyHTML }} />
              ) : (
                <p className="cs-summary-text">{caseStudy.short_description}</p>
              )}
            </motion.div>

            {/* RIGHT: Tech Stack + Length */}
            <motion.div className="cs-info-right" variants={fadeUp}>
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
                <div className="cs-info-block">
                  <span className="cs-info-label">Length of Project</span>
                  <span className="cs-length-value">{caseStudy.project_length}</span>
                </div>
              )}
            </motion.div>
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
