'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { CtaSection as CtaSectionType } from '@/lib/types/database';
import './CtaSection.css';

interface CtaSectionProps {
  data: CtaSectionType | null;
}

export default function CtaSection({ data }: CtaSectionProps) {
  const containerRef = useRef<HTMLElement>(null);

  // Parallax the black hole effect as you scroll into the CTA
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  const scaleCore = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
  const opacityCore = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  if (!data) return null;

  return (
    <section ref={containerRef} className="cta-singularity segment" aria-label="Call to Action">
      
      {/* ─── The Gravitational Core (Background) ─── */}
      <motion.div 
        className="cta-singularity__blackhole"
        style={{ scale: scaleCore, opacity: opacityCore }}
      >
        <div className="cta-singularity__accretion-disk"></div>
        <div className="cta-singularity__event-horizon"></div>
      </motion.div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="cta-singularity__inner">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="cta-singularity__heading"
          >
            {/* Split text to enforce exact styling */}
            {(data.heading || '').split(' ').map((word, i) => (
              <span key={i}>{word} </span>
            ))}
          </motion.h2>

          {data.subheading && (
            <motion.p
              className="cta-singularity__sub"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {data.subheading}
            </motion.p>
          )}

          <motion.div
            className="cta-singularity__actions"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link href="/contact" className="cta-singularity__btn-primary">
              <span className="btn-glow"></span>
              <span className="btn-text">{data.btn_text || "INITIATE"}</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
