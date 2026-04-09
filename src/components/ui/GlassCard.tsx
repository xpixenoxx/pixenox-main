'use client';

import React, { CSSProperties, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
}

export default function GlassCard({
  children,
  className = '',
  style = {},
  onClick,
  ariaLabel,
  role,
  tabIndex,
}: GlassCardProps) {
  return (
    <div
      className={`glass-card ${className}`}
      style={style}
      onClick={onClick}
      aria-label={ariaLabel}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
