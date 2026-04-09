'use client';

import React from 'react';
import { sanitizeSvg } from '@/lib/sanitize';

interface ToolBadgeProps {
  name: string;
  svgUrl?: string;
  svgInline?: string;
}

export default function ToolBadge({ name, svgUrl, svgInline }: ToolBadgeProps) {
  return (
    <div
      className="tool-badge"
      title={name}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: 'rgba(74, 14, 143, 0.2)',
        border: '1px solid rgba(107, 33, 212, 0.2)',
        transition: 'background 250ms ease, border-color 250ms ease',
      }}
    >
      {svgInline ? (
        <span
          dangerouslySetInnerHTML={{ __html: sanitizeSvg(svgInline) }}
          style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label={name}
        />
      ) : svgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={svgUrl}
          alt={name}
          width={20}
          height={20}
          style={{ width: '20px', height: '20px', objectFit: 'contain' }}
        />
      ) : (
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
          {name.substring(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}
