'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, XCircle, Search, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';

interface CheckItem {
  id: string;
  category: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  points: number;
  maxPoints: number;
  detail: string;
  fix: string;
}

interface CategoryScore {
  category: string;
  score: number;
  max: number;
}

interface AuditResult {
  auditedUrl: string;
  host: string;
  score: number;
  grade: string;
  ttfbMs: number;
  ssrWords: number;
  categories: CategoryScore[];
  checks: CheckItem[];
  embedBadgeHtml: string;
}

const SAMPLE_URLS = [
  'https://www.pixenox.com',
  'https://www.pixenox.com/products/engenox',
  'https://stripe.com',
];

export default function VisibilityCheckerClient() {
  const [url, setUrl] = useState('https://www.pixenox.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pass' | 'warn' | 'fail'>('all');
  const [copiedBadge, setCopiedBadge] = useState(false);

  const runAudit = async (targetUrl?: string) => {
    const chosen = (targetUrl ?? url).trim();
    if (!chosen) return;
    setUrl(chosen);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tools/visibility-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: chosen }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Audit failed. Ensure the URL is publicly accessible.');
        setResult(null);
      } else {
        setResult(data as AuditResult);
      }
    } catch {
      setError('Network error while connecting to the diagnostic endpoint.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBadge = async () => {
    if (!result?.embedBadgeHtml) return;
    try {
      await navigator.clipboard.writeText(result.embedBadgeHtml);
      setCopiedBadge(true);
      window.setTimeout(() => setCopiedBadge(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const filteredChecks =
    result?.checks.filter((c) => (filterStatus === 'all' ? true : c.status === filterStatus)) ?? [];

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runAudit();
        }}
        style={{
          padding: '28px',
          borderRadius: '18px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(168,85,247,0.28)',
          display: 'grid',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            aria-label="Website URL to audit"
            style={{
              flex: '1 1 300px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: '#0b0b12',
              border: '1px solid rgba(255,255,255,0.16)',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 26px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #9333ea, #6366f1)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.96rem',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.75 : 1,
            }}
          >
            <Search size={18} />
            <span>{loading ? 'Auditing Live Protocols...' : 'Run Live Audit'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.68)' }}>
          <span>Quick test:</span>
          {SAMPLE_URLS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => runAudit(sample)}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#c4b5fd',
                cursor: 'pointer',
                fontSize: '0.82rem',
              }}
            >
              {sample.replace('https://', '')}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5',
              fontSize: '0.92rem',
            }}
          >
            {error}
          </div>
        )}
      </form>

      {/* Results Dashboard */}
      {result && (
        <div style={{ display: 'grid', gap: '28px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              padding: '28px',
              borderRadius: '18px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#c4b5fd', fontWeight: 600 }}>
                AI Readiness Score — {result.host}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
                <span style={{ fontSize: '3.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                  {result.score}
                </span>
                <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)' }}>/ 100</span>
                <span
                  style={{
                    padding: '4px 14px',
                    borderRadius: '999px',
                    background: result.score >= 78 ? 'rgba(34,197,94,0.16)' : 'rgba(234,179,8,0.16)',
                    border: result.score >= 78 ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(234,179,8,0.4)',
                    color: result.score >= 78 ? '#86efac' : '#fde047',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  Grade {result.grade}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.68)' }}>
                TTFB: <strong>{result.ttfbMs}ms</strong> • SSR Extractable Text: <strong>{result.ssrWords} words</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {result.categories.map((cat) => {
                const pct = Math.round((cat.score / cat.max) * 100);
                return (
                  <div key={cat.category} style={{ display: 'grid', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'rgba(255,255,255,0.88)' }}>
                      <span>{cat.category}</span>
                      <span style={{ color: '#c4b5fd', fontWeight: 600 }}>{cat.score} / {cat.max}</span>
                    </div>
                    <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: pct >= 80 ? '#a855f7' : pct >= 50 ? '#eab308' : '#ef4444',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {(['all', 'pass', 'warn', 'fail'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: filterStatus === st ? 'rgba(168,85,247,0.22)' : 'rgba(255,255,255,0.04)',
                  border: filterStatus === st ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  textTransform: 'capitalize',
                }}
              >
                {st} (
                {st === 'all'
                  ? result.checks.length
                  : result.checks.filter((c) => c.status === st).length}
                )
              </button>
            ))}
          </div>

          {/* Detailed Checks */}
          <div style={{ display: 'grid', gap: '14px' }}>
            {filteredChecks.map((check) => (
              <div
                key={check.id}
                style={{
                  padding: '20px 22px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  display: 'grid',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {check.status === 'pass' && <CheckCircle2 size={18} color="#4ade80" />}
                    {check.status === 'warn' && <AlertTriangle size={18} color="#facc15" />}
                    {check.status === 'fail' && <XCircle size={18} color="#f87171" />}
                    <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{check.label}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{check.category}</span>
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#c4b5fd' }}>
                    {check.points} / {check.maxPoints} pts
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)' }}>{check.detail}</p>
                {check.status !== 'pass' && (
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#d8b4fe' }}>
                    <strong>Engineering Fix:</strong> {check.fix}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Embed Badge Snippet + Engenox CTA */}
          <div
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(196,181,253,0.24)',
              display: 'grid',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 600 }}>
                <Sparkles size={18} color="#c4b5fd" />
                <span>Embed Your AI-Visibility Audited Badge</span>
              </div>
              <button
                type="button"
                onClick={handleCopyBadge}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                }}
              >
                {copiedBadge ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                <span>{copiedBadge ? 'Copied HTML!' : 'Copy Badge HTML'}</span>
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#06060a',
                color: '#c4b5fd',
                fontSize: '0.82rem',
                overflowX: 'auto',
              }}
            >
              {result.embedBadgeHtml}
            </pre>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', paddingTop: '6px' }}>
              <Link
                href="/products/engenox"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ffffff',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                <span>Automate fixes continuously with Engenox OS</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact/pixy"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#c4b5fd',
                  textDecoration: 'underline',
                }}
              >
                <span>Request a full architectural audit via Pixy</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
