'use client';

import { useState } from 'react';
import { Check, Copy, FileText } from 'lucide-react';

interface CopyMarkdownButtonProps {
  slug: string;
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: '#e2e8f0',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.16)',
  borderRadius: '999px',
  padding: '6px 14px',
  fontSize: '0.82rem',
  fontWeight: 500,
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  lineHeight: 1.3,
};

export function CopyMarkdownButton({ slug }: CopyMarkdownButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const mdPath = `/blog/${slug}.md`;

  const handleCopy = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(mdPath, { headers: { Accept: 'text/markdown' } });
      if (!res.ok) return;
      const md = await res.text();
      await navigator.clipboard.writeText(md);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback unavailable
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <button type="button" onClick={handleCopy} style={btnStyle} aria-label="Copy article as Markdown for AI">
        {copied ? <Check size={14} color="#a855f7" /> : <Copy size={14} />}
        <span>{copied ? 'Copied Markdown!' : loading ? 'Loading...' : 'Copy for AI (.md)'}</span>
      </button>
      <a
        href={mdPath}
        target="_blank"
        rel="noopener"
        style={{
          ...btnStyle,
          color: '#a78bfa',
          borderColor: 'rgba(167, 139, 250, 0.28)',
        }}
      >
        <FileText size={14} />
        <span>View .md</span>
      </a>
    </div>
  );
}
