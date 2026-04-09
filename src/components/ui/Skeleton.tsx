'use client';

import React, { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

export default function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  className = '',
  style = {},
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      role="status"
      aria-label="Loading..."
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}
