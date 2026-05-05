'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { WhatWeDoCard } from '@/lib/types/database';
import './WhatWeDo.css';

interface WhatWeDoProps {
  cards: WhatWeDoCard[];
}

function StackCard({ card, index }: { card: WhatWeDoCard, index: number }) {
  // Pad index to "01", "02"
  const numStr = (index + 1).toString().padStart(2, '0');

  // Stagger height so they stack nicely
  const topOffset = 120 + index * 40; // 120px base + 40px per card

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="wwd-card"
      style={{ top: `${topOffset}px` }}
    >
      <div className="wwd-card__num">{numStr}</div>
      
      <div className="wwd-card__content">
        <span className="wwd-card__meta">DISCIPLINE // {numStr}</span>
        <h3 className="wwd-card__title">
          {card.title}
        </h3>
        <p className="wwd-card__desc">
          {card.description}
        </p>
      </div>

      <div className="wwd-card__graphic">
        <div className="wwd-card__circle">
          <div className="wwd-card__inner-circle"></div>
          <div className="wwd-card__core"></div>
        </div>
      </div>
    </motion.div>
  );
}

export default function WhatWeDo({ cards }: WhatWeDoProps) {
  const visible = [...cards].sort((a,b) => (a.priority || 0) - (b.priority || 0)).filter((c) => c.is_visible);

  return (
    <section className="what-we-do section" aria-label="Disciplines" id="disciplines">
      <div className="container">
        <h2 className="what-we-do__heading">
          Our <span>Disciplines</span>
        </h2>
        <div className="what-we-do__stack">
          {visible.map((card, idx) => (
            <StackCard key={card.id || idx} card={card} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
