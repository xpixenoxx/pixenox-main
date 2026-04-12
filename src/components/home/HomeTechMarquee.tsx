'use client';

import React from 'react';
import { sanitizeSvg } from '@/lib/sanitize';
import './HomeTechMarquee.css';

interface HomeTechMarqueeProps {
  specialTech: { name: string; svg?: string; image_url?: string }[];
}

export default function HomeTechMarquee({ specialTech }: HomeTechMarqueeProps) {
  if (!specialTech || specialTech.length === 0) return null;

  // Render more copies if the list is small to ensure continuous looping
  const copies = specialTech.length < 5 ? [1, 2, 3, 4] : [1, 2];

  return (
    <section className="tech-marquee-section">
      <div className="tech-marquee-header">
         <h3 className="tm-title">Core Architecture & Frameworks</h3>
      </div>
      <div className="tech-marquee-container">
        <div className="tech-marquee-track">
          {copies.map(group => (
            <div key={group} className="tech-marquee-group">
              {specialTech.map((tech, i) => (
                <div 
                  key={i} 
                  className="tm-logo" 
                  title={tech.name}
                >
                  {tech.image_url ? (
                    <img src={tech.image_url} alt={tech.name} style={{ height: '100%', width: 'auto', maxWidth: '160px', objectFit: 'contain' }} />
                  ) : tech.svg ? (
                    <div style={{ height: '100%' }} dangerouslySetInnerHTML={{ __html: sanitizeSvg(tech.svg) }} />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
