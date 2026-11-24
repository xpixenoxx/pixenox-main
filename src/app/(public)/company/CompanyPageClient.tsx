'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import StorySection from '@/components/company/StorySection';
import WhatWeDo from '@/components/company/WhatWeDo';
import CoreBeliefs from '@/components/company/CoreBeliefs';
import CtaSection from '@/components/company/CtaSection';
import type {
  PageHeroConfig,
  CompanyStory,
  WhatWeDoCard,
  HowWeThinkConfig,
  CoreBelief,
  CtaSection as CtaSectionType,
  ContentBlock,
} from '@/lib/types/database';
import './company.css';

interface CompanyPageClientProps {
  heroConfig: PageHeroConfig | null;
  story: CompanyStory | null;
  storyConfig: any;
  whatWeDoCards: WhatWeDoCard[];
  disciplinesConfig: any;
  howConfig: HowWeThinkConfig | null;
  beliefs: CoreBelief[];
  ctaData: CtaSectionType | null;
}

// Number of horizontal slices for the fluid text effect
const SLICE_COUNT = 24;

export default function CompanyPageClient({
  heroConfig,
  story,
  storyConfig,
  whatWeDoCards,
  disciplinesConfig,
  howConfig,
  beliefs,
  ctaData,
}: CompanyPageClientProps) {
  // We will track the mouse, and apply a delayed spring to EACH slice based on its index.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize from -1 to 1
      const xPct = (e.clientX / innerWidth) * 2 - 1;
      const yPct = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(xPct);
      mouseY.set(yPct);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // The base text to render. We'll force it to "PIXENOX" with a subtext.
  const mainText = heroConfig?.heading ? heroConfig.heading.split('\n')[0] : 'SYSTEMS THAT COMPOUND.';
  const subText = heroConfig?.subheading || 'PIXENOX SOLUTIONS PRIVATE LIMITED engineers production autonomous AI systems, non-disruptive enterprise data platforms, and AI visibility operating systems — makers of Engenox and Unool.';

  // Generate the slices
  const slices = Array.from({ length: SLICE_COUNT }).map((_, i) => {
    // Top and bottom percentages for the clip path
    const top = (i / SLICE_COUNT) * 100;
    const bottom = ((i + 1) / SLICE_COUNT) * 100;
    
    // Each slice has a slightly different spring configuration (stiffness decreases = more lag)
    const springConfig = { 
      damping: 20 + (i * 1.5), 
      stiffness: 300 - (i * 8), // Top slices follow closely, bottom slices drag behind
      mass: 1 + (i * 0.1) 
    };
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const smoothX = useSpring(mouseX, springConfig);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const smoothY = useSpring(mouseY, springConfig);

    // X displacement reduced to keep text in viewport
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const xMovement = useTransform(smoothX, [-1, 1], [-60, 60]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const yMovement = useTransform(smoothY, [-1, 1], [-20, 20]);
    
    // The further down the slice, the more intense the deep purple outline becomes
    const opacityVal = 1 - (i * 0.02);
    const textShadowColor = `rgba(161, 120, 255, ${0.2 + (i * 0.03)})`;

    return { id: i, top, bottom, xMovement, yMovement, opacityVal, textShadowColor };
  });

  return (
    <>
      {/* ═══ CINEMATIC HERO (KINETIC FLUID TYPOGRAPHY) ═══ */}
      <section className="company-hero fluid-hero">
        
        {/* Ambient Void Background */}
        <div className="fluid-bg"></div>

        {/* The Kinetic Sliced Text Engine */}
        <div className="fluid-container">
          
          {/* Base Ghost Text (Single semantic H1) */}
          <h1 className="fluid-base-text">
            {mainText}
          </h1>

          {/* Sliced Dynamic Text Layers (Decorative only — NOT duplicate H1s) */}
          {slices.map((slice) => (
            <motion.div
              key={slice.id}
              aria-hidden="true"
              className="fluid-slice"
              style={{
                clipPath: `polygon(0% ${slice.top}%, 100% ${slice.top}%, 100% ${slice.bottom}%, 0% ${slice.bottom}%)`,
                x: slice.xMovement,
                y: slice.yMovement,
                opacity: slice.opacityVal,
                textShadow: `0 0 40px ${slice.textShadowColor}, 0 4px 10px rgba(0,0,0,0.8)`,
              }}
            >
              {mainText}
            </motion.div>
          ))}
          
        </div>

        {/* Subtext mapping */}
        <motion.div 
          className="fluid-subtext"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.5 }}
        >
          {subText}
        </motion.div>

        {/* Scanline Overlay */}
        <div className="fluid-scanlines"></div>
      </section>

      {/* ═══ OUR STORY ═══ */}
      {story?.content_json && (
        <StorySection 
          blocks={story.content_json as unknown as ContentBlock[]} 
          title={storyConfig?.heading || 'OUR OVERARCHING MISSION'} 
        />
      )}

      {/* ═══ WHAT WE DO (PARALLAX STACK) ═══ */}
      {whatWeDoCards.length > 0 && <WhatWeDo cards={whatWeDoCards} title={disciplinesConfig?.heading || 'Our Disciplines'} />}

      {/* ═══ CORE BELIEFS ═══ */}
      {beliefs.length > 0 && <CoreBeliefs config={howConfig} beliefs={beliefs} />}

      {/* ═══ LEADERSHIP, PRODUCTS & CORPORATE IDENTITY (E-E-A-T & Entity Clarity) ═══ */}
      <section
        aria-labelledby="company-identity-heading"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
          color: '#ffffff',
        }}
      >
        <div style={{ marginBottom: '40px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#c4b5fd',
              marginBottom: '12px',
              fontWeight: 600,
            }}
          >
            CORPORATE IDENTITY &amp; PROPRIETARY PLATFORMS
          </span>
          <h2
            id="company-identity-heading"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, margin: '0 0 12px' }}
          >
            Leadership, Legal Entity &amp; Products Built by Pixenox
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', maxWidth: '760px', lineHeight: 1.65, margin: 0 }}>
            PIXENOX SOLUTIONS PRIVATE LIMITED is an Indian AI and enterprise software systems engineering company incorporated on April 2, 2026 (CIN: U62091AP2026PTC125091, RoC-Vijayawada, Andhra Pradesh, India). Alongside bespoke enterprise systems engineering, we build proprietary software products.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '28px',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 12px', color: '#ffffff' }}>
              Founders &amp; Directors
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <div style={{ fontWeight: 600, color: '#ffffff' }}>Muchakarla Sai Charan</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)' }}>Co-Founder &amp; Director · AI Systems &amp; Architecture</div>
              </li>
              <li>
                <div style={{ fontWeight: 600, color: '#ffffff' }}>Jagatha Hemanth Sai Ram</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)' }}>Co-Founder &amp; Director · Engineering &amp; AI Visibility Platforms</div>
              </li>
            </ul>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '28px',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 12px', color: '#ffffff' }}>
              Verified Corporate Registry
            </h3>
            <dl style={{ margin: 0, display: 'grid', gap: '8px', fontSize: '0.92rem' }}>
              <div><dt style={{ display: 'inline', color: 'rgba(255,255,255,0.55)' }}>Legal Name: </dt><dd style={{ display: 'inline', margin: 0 }}>PIXENOX SOLUTIONS PRIVATE LIMITED</dd></div>
              <div><dt style={{ display: 'inline', color: 'rgba(255,255,255,0.55)' }}>CIN: </dt><dd style={{ display: 'inline', margin: 0 }}>U62091AP2026PTC125091</dd></div>
              <div><dt style={{ display: 'inline', color: 'rgba(255,255,255,0.55)' }}>Incorporated: </dt><dd style={{ display: 'inline', margin: 0 }}>April 2, 2026 (India)</dd></div>
              <div><dt style={{ display: 'inline', color: 'rgba(255,255,255,0.55)' }}>Headquarters: </dt><dd style={{ display: 'inline', margin: 0 }}>East Godavari, Andhra Pradesh, India</dd></div>
              <div>
                <dt style={{ display: 'inline', color: 'rgba(255,255,255,0.55)' }}>Contact: </dt>
                <dd style={{ display: 'inline', margin: 0 }}>
                  <a href="mailto:connect@pixenox.com" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>connect@pixenox.com</a>
                </dd>
              </div>
            </dl>
          </div>

          <div
            style={{
              background: 'linear-gradient(145deg, rgba(124, 58, 237, 0.12), rgba(255,255,255,0.02))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '20px',
              padding: '28px',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 12px', color: '#ffffff' }}>
              Proprietary Products
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <Link href="/products/engenox" style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Engenox by Pixenox <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>
                  Unified autonomous SEO, GEO &amp; AEO operating system for crawl governance, entity graphs, and AI citation intelligence.
                </p>
              </div>
              <div>
                <a href="https://unool.co" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Unool (unool.co) <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>
                  One Link + One Click social publishing and creator distribution platform engineered by Pixenox Solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LET'S BUILD CTA ═══ */}
      <CtaSection data={ctaData} />
    </>
  );
}
