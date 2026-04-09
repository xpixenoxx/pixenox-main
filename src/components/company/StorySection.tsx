'use client';

import React, { useEffect, useRef } from 'react';
import type { ContentBlock } from '@/lib/types/database';
import './StorySection.css';

interface StorySectionProps {
  blocks: ContentBlock[];
}

export default function StorySection({ blocks }: StorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Fallback text if DB is empty
  const rawText = blocks?.length > 0 
    ? blocks.map(b => b.text).join(' ') 
    : "Pixenox operates at the intersection of cutting-edge technology and transformative design. Founded by engineers and strategists, we set out to make technology accessible, human, and visually inspiring.";

  useEffect(() => {
    let gsapModule: typeof import('gsap') | null = null;
    let scrollTriggerModule: typeof import('gsap/ScrollTrigger') | null = null;
    let splitTextModule: typeof import('gsap/SplitText') | null = null; // Assuming we don't have premium plugins, let's build custom span split

    async function initGsap() {
      gsapModule = await import('gsap');
      scrollTriggerModule = await import('gsap/ScrollTrigger');
      gsapModule.gsap.registerPlugin(scrollTriggerModule.ScrollTrigger);

      if (!textRef.current) return;

      // Manually split words for the painting effect
      const words = rawText.split(' ');
      textRef.current.innerHTML = words.map(w => `<span class="story-word">${w}</span>`).join(' ');

      const spans = textRef.current.querySelectorAll('.story-word');

      // The scrub animation: as you scroll down, words light up sequentially
      gsapModule.gsap.fromTo(
        spans,
        { color: 'rgba(255, 255, 255, 0.1)' },
        {
          color: 'rgba(255, 255, 255, 1)',
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'bottom 80%',
            scrub: true,
          },
        }
      );
    }

    initGsap();

    return () => {
      if (scrollTriggerModule) {
        scrollTriggerModule.ScrollTrigger.getAll().forEach((t) => t.kill());
      }
    };
  }, [rawText]);

  return (
    <section ref={sectionRef} className="story-premium-section" id="story">
      <div className="story-premium-bg"></div>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <p className="story-label">OUR OVERARCHING MISSION</p>
        <div className="story-massive-text" ref={textRef}>
          {rawText}
        </div>
      </div>
    </section>
  );
}
