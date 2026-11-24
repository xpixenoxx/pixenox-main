'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface PreferredSourceButtonProps {
  variant?: 'button' | 'link';
}

const PREFERRED_SOURCE_URL = 'https://www.google.com/preferences/source?q=pixenox.com';

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  color: '#c4b5fd',
  background: 'rgba(168, 85, 247, 0.08)',
  border: '1px solid rgba(196, 181, 253, 0.35)',
  borderRadius: '999px',
  padding: '6px 14px',
  fontSize: '0.85rem',
  fontWeight: 500,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  lineHeight: 1.3,
};

export function PreferredSourceButton({ variant = 'button' }: PreferredSourceButtonProps) {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [googleRendered, setGoogleRendered] = useState(false);

  useEffect(() => {
    if (variant !== 'button') return;
    const el = widgetRef.current;
    if (!el) return;

    const checkRendered = () => {
      if (el.children.length > 0 || el.innerHTML.trim().length > 0) {
        setGoogleRendered(true);
      }
    };

    checkRendered();

    const observer = new MutationObserver(() => {
      checkRendered();
    });
    observer.observe(el, { childList: true, subtree: true });

    const timer = window.setTimeout(checkRendered, 1500);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [variant]);

  if (variant === 'link') {
    return (
      <a
        href={PREFERRED_SOURCE_URL}
        target="_blank"
        rel="noopener"
        aria-label="Add Pixenox as a preferred source on Google"
        style={pillStyle}
      >
        <span aria-hidden="true" style={{ fontWeight: 700, color: '#ffffff' }}>G</span>
        <span>Add Pixenox as a preferred source on Google</span>
      </a>
    );
  }

  return (
    <div className="pref-source" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
      <Script
        id="google-preferred-source-js"
        src="https://news.google.com/swg/js/v1/publisher.js"
        strategy="lazyOnload"
      />
      <div
        ref={widgetRef}
        {...{ 'google-add-preferred-source-btn': '' }}
        data-theme="dark"
        suppressHydrationWarning
      />
      {!googleRendered && (
        <a
          href={PREFERRED_SOURCE_URL}
          target="_blank"
          rel="noopener"
          aria-label="Add Pixenox as a preferred source on Google"
          style={pillStyle}
        >
          <span aria-hidden="true" style={{ fontWeight: 700, color: '#ffffff' }}>G</span>
          <span aria-hidden="true" style={{ color: '#e9d5ff' }}>★</span>
          <span>Add Pixenox as a preferred source on Google</span>
        </a>
      )}
      <noscript>
        <a
          href={PREFERRED_SOURCE_URL}
          target="_blank"
          rel="noopener"
          style={pillStyle}
        >
          Add Pixenox as a preferred source on Google
        </a>
      </noscript>
    </div>
  );
}
