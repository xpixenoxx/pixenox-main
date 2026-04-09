'use client';

import React from 'react';
import type { WorkTag } from '@/lib/types/database';
import './FilterBar.css';

interface FilterBarProps {
  tags: WorkTag[];
  activeSlug: string | null;
  onFilter: (slug: string | null) => void;
}

export default function FilterBar({ tags, activeSlug, onFilter }: FilterBarProps) {
  const visibleTags = tags.filter((t) => t.is_visible);

  return (
    <div className="filter-bar" role="group" aria-label="Filter case studies">
      <button 
        className={`filter-item ${activeSlug === null ? 'active' : ''}`}
        onClick={() => onFilter(null)}
      >
        All
      </button>
      
      {visibleTags.length > 0 && <span className="filter-separator">|</span>}
      
      {visibleTags.map((tag, index) => (
        <React.Fragment key={tag.id}>
          <button
            className={`filter-item ${activeSlug === tag.slug ? 'active' : ''}`}
            onClick={() => onFilter(tag.slug)}
          >
            {tag.label}
          </button>
          
          {index < visibleTags.length - 1 && (
            <span className="filter-separator">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
