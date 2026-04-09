'use client';

import React from 'react';

interface TagPillProps {
  label: string;
  color: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function TagPill({ label, color, isActive = false, onClick }: TagPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tag-pill"
      aria-pressed={isActive}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 16px',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        border: `1px solid ${color}`,
        background: isActive ? color : 'transparent',
        color: isActive ? '#ffffff' : color,
        cursor: 'pointer',
        transition: 'all 250ms ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
