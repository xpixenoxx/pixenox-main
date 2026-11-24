'use client';

import Script from 'next/script';

interface PreferredSourceButtonProps {
  variant?: 'button' | 'link';
}

const PREFERRED_SOURCE_URL = 'https://www.google.com/preferences/source?q=pixenox.com';

export function PreferredSourceButton({ variant = 'button' }: PreferredSourceButtonProps) {
  if (variant === 'link') {
    return (
      <a
        href={PREFERRED_SOURCE_URL}
        target="_blank"
        rel="noopener"
        aria-label="Add Pixenox as a preferred source on Google"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#c4b5fd',
          border: '1px solid rgba(196,181,253,0.35)',
          borderRadius: '999px',
          padding: '6px 14px',
          fontSize: '0.85rem',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <span aria-hidden="true" style={{ fontWeight: 700 }}>G</span>
        <span>Add Pixenox as a preferred source on Google</span>
      </a>
    );
  }

  return (
    <div className="pref-source">
      <Script
        id="google-preferred-source-js"
        src="https://news.google.com/swg/js/v1/publisher.js"
        strategy="lazyOnload"
      />
      <div
        {...{ 'google-add-preferred-source-btn': '' }}
        data-theme="dark"
        suppressHydrationWarning
      />
      <noscript>
        <a
          href={PREFERRED_SOURCE_URL}
          target="_blank"
          rel="noopener"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#c4b5fd',
            border: '1px solid rgba(196,181,253,0.35)',
            borderRadius: '999px',
            padding: '6px 14px',
            fontSize: '0.85rem',
            textDecoration: 'none',
          }}
        >
          Add Pixenox as a preferred source on Google
        </a>
      </noscript>
    </div>
  );
}
