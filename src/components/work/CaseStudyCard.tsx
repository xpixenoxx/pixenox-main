import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, useSpring } from 'framer-motion';
import type { CaseStudy, WorkTag } from '@/lib/types/database';
import './CaseStudyCard.css';

interface CaseStudyCardProps {
  study: CaseStudy;
  tags: WorkTag[];
  index: number;
}

export default function CaseStudyCard({ study, tags, index }: CaseStudyCardProps) {
  const router = useRouter();
  
  // Custom cursor state Tracking
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Smooth spring physics for cursor follow
  const cursorX = useSpring(0, { stiffness: 300, damping: 28, mass: 0.5 });
  const cursorY = useSpring(0, { stiffness: 300, damping: 28, mass: 0.5 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Offset by 60px (half of the 120px cursor) to perfectly center the mouse
    cursorX.set(e.clientX - rect.left - 60);
    cursorY.set(e.clientY - rect.top - 60);
  };

  const getTagColor = (tagSlug: string): string => {
    const tag = tags.find((t) => t.slug === tagSlug);
    return tag?.color ?? 'rgba(255, 255, 255, 0.1)';
  };

  const formattedIndex = (index + 1).toString().padStart(2, '0');

  return (
    <div
      className="case-study-card"
      onClick={() => router.push(`/work/${study.slug}`)}
      aria-label={study.title}
      role="article"
      tabIndex={0}
    >
      <div className="case-study-card__header">
        <span className="case-study-card__index">{formattedIndex}</span>
      </div>

      <div 
        className="case-study-card__image-container"
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Custom Inverse Cursor */}
        {isHovered && (
          <motion.div
            className="case-study-card__custom-cursor"
            style={{ x: cursorX, y: cursorY }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <span>View Work</span>
          </motion.div>
        )}

        {study.cover_image_url && (
          <Image
            src={study.cover_image_url}
            alt={study.title}
            width={1200}
            height={800}
            quality={100} // Prioritize image quality, no blur
            className="case-study-card__image"
            priority={index < 4} // fast load for above-fold items
          />
        )}
      </div>

      <div className="case-study-card__footer">
        <h3 className="case-study-card__title">
          {study.title}
        </h3>
        <div className="case-study-card__tags">
          {study.tags?.map((tag) => (
            <span
              key={tag}
              className="case-study-card__tag"
              style={{
                borderColor: getTagColor(tag),
                color: '#fff',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
