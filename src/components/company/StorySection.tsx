'use client';

import React, { useEffect, useRef } from 'react';
import type { ContentBlock } from '@/lib/types/database';
import './StorySection.css';

interface StorySectionProps {
  blocks: any;
  title?: string;
}

export default function StorySection({ blocks, title }: StorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Fallback text if DB is empty
  let rawText = "Pixenox operates at the intersection of cutting-edge technology and transformative design. Founded by engineers and strategists, we set out to make technology accessible, human, and visually inspiring.";
  
  if (blocks && typeof blocks === 'object' && !Array.isArray(blocks) && blocks.type === 'doc') {
    const extractText = (node: any): string => {
      if (node.type === 'text') return node.text || '';
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join(node.type === 'paragraph' ? ' ' : '');
      }
      return '';
    };
    const extracted = extractText(blocks).trim();
    if (extracted) rawText = extracted;
  } else if (Array.isArray(blocks) && blocks.length > 0) {
    rawText = blocks.map((b: any) => b.text || '').join(' ');
  }

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
        { color: 'rgba(255, 255, 255, 0.25)' },
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
        <p className="story-label">{title || 'OUR OVERARCHING MISSION'}</p>
        <div className="story-massive-text" ref={textRef}>
          {rawText}
        </div>
      </div>
    </section>
  );
}
