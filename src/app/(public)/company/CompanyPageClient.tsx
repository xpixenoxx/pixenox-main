'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  whatWeDoCards: WhatWeDoCard[];
  howConfig: HowWeThinkConfig | null;
  beliefs: CoreBelief[];
  ctaData: CtaSectionType | null;
}

// Number of horizontal slices for the fluid text effect
const SLICE_COUNT = 24;

export default function CompanyPageClient({
  heroConfig,
  story,
  whatWeDoCards,
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
  const mainText = heroConfig?.heading ? heroConfig.heading.split('\n')[0] : 'PIXENOX';
  const subText = heroConfig?.subheading || "THE VOID IS NOT EMPTY. WE ARE ALREADY HERE.";

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
          
          {/* Base Ghost Text (Static, outline only) */}
          <h1 className="fluid-base-text">
            {mainText}
          </h1>

          {/* Sliced Dynamic Text Layers */}
          {slices.map((slice) => (
            <motion.h1
              key={slice.id}
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
            </motion.h1>
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
        <StorySection blocks={story.content_json as unknown as ContentBlock[]} />
      )}

      {/* ═══ WHAT WE DO (PARALLAX STACK) ═══ */}
      {whatWeDoCards.length > 0 && <WhatWeDo cards={whatWeDoCards} />}

      {/* ═══ CORE BELIEFS ═══ */}
      {beliefs.length > 0 && <CoreBeliefs config={howConfig} beliefs={beliefs} />}

      {/* ═══ LET'S BUILD CTA ═══ */}
      <CtaSection data={ctaData} />
    </>
  );
}
