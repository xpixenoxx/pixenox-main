import React, { useState, useRef, MouseEvent } from 'react';
import Link from 'next/link';
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
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cursorX = useSpring(0, { stiffness: 300, damping: 28, mass: 0.5 });
  const cursorY = useSpring(0, { stiffness: 300, damping: 28, mass: 0.5 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left - 60);
    cursorY.set(e.clientY - rect.top - 60);
  };

  const getTagColor = (tagSlug: string): string => {
    const tag = tags.find((t) => t.slug === tagSlug);
    return tag?.color ?? 'rgba(255, 255, 255, 0.1)';
  };

  const formattedIndex = (index + 1).toString().padStart(2, '0');

  return (
    <Link
      href={`/work/${study.slug}`}
      className="case-study-card"
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
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
        {isHovered && (
          <motion.div
            className="case-study-card__custom-cursor"
            style={{ x: cursorX, y: cursorY }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            aria-hidden="true"
          >
            <span>Explore</span>
          </motion.div>
        )}

        {study.cover_image_url && (
          <Image
            src={study.cover_image_url}
            alt={study.title}
            width={1920}
            height={1080}
            quality={75}
            className="case-study-card__image"
            loading={index < 4 ? 'eager' : 'lazy'}
            priority={index < 2}
          />
        )}
      </div>

      <div className="case-study-card__footer">
        <h2 className="case-study-card__title">{study.title}</h2>
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
    </Link>
  );
}
