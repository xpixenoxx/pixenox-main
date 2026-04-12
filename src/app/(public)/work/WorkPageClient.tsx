'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterBar from '@/components/work/FilterBar';
import CaseStudyCard from '@/components/work/CaseStudyCard';
import type { CaseStudy, WorkTag, PageHeroConfig } from '@/lib/types/database';
import './work.css';

interface WorkPageClientProps {
  studies: CaseStudy[];
  tags: WorkTag[];
  heroConfig: PageHeroConfig | null;
}

export default function WorkPageClient({ studies, tags, heroConfig }: WorkPageClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredStudies = activeTag
    ? studies.filter((s) => s.tags?.includes(activeTag))
    : studies;

  const handleFilter = useCallback((slug: string | null) => {
    setActiveTag(slug);
  }, []);

  const textRevealVariants: any = {
    hidden: { y: '105%' },
    visible: (i: number) => ({
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // apple-style ease-out
      },
    }),
  };

  const word = heroConfig?.heading || 'WORK';

  return (
    <>
      {/* Massive Typographical Header */}
      <section className="work-hero-massive">
        <div className="container">
          <h1
            className="work-massive-title overflow-hidden py-3"
            aria-hidden="true"
            style={{
              fontFamily: heroConfig?.heading_font_family || undefined,
              fontSize: heroConfig?.heading_font_size || undefined,
              fontWeight: heroConfig?.heading_font_weight || undefined,
              letterSpacing: heroConfig?.heading_letter_spacing || undefined,
              color: heroConfig?.heading_color || undefined,
              position: 'relative',
              display: 'block',
              textAlign: 'start',
            }}
          >
            {word.split('').map((char, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={textRevealVariants}
                initial="hidden"
                animate="visible"
                aria-hidden="true"
                style={{
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.div>
            ))}
          </h1>
        </div>
      </section>

      <section className="work-listing section">
        <div className="container">
          <FilterBar tags={tags} activeSlug={activeTag} onFilter={handleFilter} />

          <motion.div className="work-grid" layout>
            <AnimatePresence mode="popLayout">
              {filteredStudies.map((study, index) => (
                <motion.div
                  key={study.id}
                  layout
                  initial={{ opacity: 0, filter: 'blur(20px)', y: 120 }}
                  whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 1.2, 
                    ease: [0.16, 1, 0.3, 1],
                    delay: (index % 2) * 0.15 
                  }}
                >
                  <CaseStudyCard study={study} tags={tags} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredStudies.length === 0 && (
            <div className="work-empty">
              <p>No projects found for this filter.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
