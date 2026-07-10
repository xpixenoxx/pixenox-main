'use client';

import React, { useEffect, useRef } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import type { HowWeThinkConfig, CoreBelief } from '@/lib/types/database';
import './CoreBeliefs.css';

interface CoreBeliefsProps {
  config: HowWeThinkConfig | null;
  beliefs: CoreBelief[];
}

export default function CoreBeliefs({ config, beliefs }: CoreBeliefsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const visible = beliefs.filter((b) => b.is_visible);

  // GSAP ScrollTrigger: staggered slide-up reveal
  useEffect(() => {
    let gsapModule: typeof import('gsap') | null = null;
    let scrollTriggerModule: typeof import('gsap/ScrollTrigger') | null = null;

    async function initGsap() {
      gsapModule = await import('gsap');
      scrollTriggerModule = await import('gsap/ScrollTrigger');
      gsapModule.gsap.registerPlugin(scrollTriggerModule.ScrollTrigger);

      const cards = sectionRef.current?.querySelectorAll('.core-beliefs__card');
      cards?.forEach((card, i) => {
        gsapModule!.gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: i * 0.08,
            scrollTrigger: {
               trigger: card,
               start: 'top 88%',
               toggleActions: 'play none none none',
            },
          }
        );
      });
    }

    initGsap();

    return () => {
      if (scrollTriggerModule) {
         scrollTriggerModule.ScrollTrigger.getAll().forEach((t) => t.kill());
      }
    };
  }, [beliefs]);

  return (
    <section ref={sectionRef} className="core-beliefs section" aria-label="Core Beliefs" id="core-beliefs">
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {config && (
          <div className="core-beliefs__header">
            <h2>
              {config.section_heading || 'CORE BELIEFS'}
            </h2>
            {config.section_subheading && (
              <p>
                {config.section_subheading}
              </p>
            )}
          </div>
        )}

        <div className="core-beliefs__list">
          {visible.map((belief, index) => (
            <GlassCard key={belief.id} className="core-beliefs__card">
              <div className="core-beliefs__card-inner">
                <div className="core-beliefs__icon">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="core-beliefs__content">
                  <h3>{belief.title}</h3>
                  {belief.description && (
                    <p>{belief.description}</p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
