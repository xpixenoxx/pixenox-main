'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Link2,
  Radar,
  Search,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';

type AuditState =
  | 'ok'
  | 'parked_domain'
  | 'dns_error'
  | 'http_error'
  | 'waf_blocked'
  | 'non_html'
  | 'unreachable';

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

interface BotAccessEntry {
  bot: string;
  product: string;
  status: 'allowed_explicit' | 'allowed_wildcard' | 'blocked';
  rule: string;
}

interface ProtocolEntry {
  key: string;
  active: boolean;
}

interface AuditResult {
  auditState: AuditState;
  auditedUrl: string;
  host: string;
  statusCode?: number;
  redirectHops?: number;
  redirectChain?: { url: string; status: number }[];
  providerDetected?: string;
  title?: string;
  message?: string;
  score: number | null;
  grade: string;
  ttfbMs?: number;
  ssrWords?: number;
  textToHtmlRatio?: number;
  pageTitle?: string;
  detectedSchemaTypes?: string[];
  botMatrix?: BotAccessEntry[];
  protocolSummary?: ProtocolEntry[];
  categories?: CategoryScore[];
  checks?: CheckItem[];
  embedBadgeHtml?: string;
}

const SAMPLE_URLS = [
  { label: 'pixenox.com', url: 'https://www.pixenox.com' },
  { label: 'pixenox.com/products/engenox', url: 'https://www.pixenox.com/products/engenox' },
  { label: 'stripe.com', url: 'https://stripe.com' },
  { label: 'engenox.com (Parked test)', url: 'https://www.engenox.com' },
];

const SCAN_STAGES = [
  { id: '01', label: 'DNS Resolution, TLS & Edge Redirect Trace', target: 'A/AAAA + Hop Guard' },
  { id: '02', label: 'RFC 9309 Bot Matrix & Sitemap XML Probe', target: '6 AI Bots + XML' },
  { id: '03', label: 'SSR DOM Clean-Text & Indexability Audit', target: 'Zero-JS Extraction' },
  { id: '04', label: 'JSON-LD @graph, Wikidata & AEO Schema Parser', target: 'Entity Graph' },
  { id: '05', label: '2026 AI-Native Protocol Handshake', target: 'Markdown / A2A / Signal' },
];

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const strokeColor = score >= 85 ? '#a855f7' : score >= 68 ? '#38bdf8' : score >= 50 ? '#facc15' : '#f87171';

  return (
    <div style={{ position: 'relative', width: '196px', height: '196px', margin: '0 auto' }}>
      <svg width="196" height="196" viewBox="0 0 196 196" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="98"
          cy="98"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
        />
        <motion.circle
          cx="98"
          cy="98"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c4b5fd', fontWeight: 600 }}>
          GEO Score
        </span>
        <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.05, color: '#ffffff', fontFamily: 'var(--font-outfit), sans-serif' }}>
          {score}
        </span>
        <span
          style={{
            marginTop: '4px',
            padding: '2px 10px',
            borderRadius: '999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            background: score >= 80 ? 'rgba(168,85,247,0.22)' : 'rgba(234,179,8,0.18)',
            border: `1px solid ${strokeColor}`,
            color: '#ffffff',
          }}
        >
          Grade {grade}
        </span>
      </div>
    </div>
  );
}

export default function VisibilityCheckerClient() {
  const [url, setUrl] = useState('https://www.pixenox.com');
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [scanStageIdx, setScanStageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  const [filterStatus, setFilterStatus] = useState<'all' | 'fail' | 'warn' | 'pass'>('all');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [faviconOk, setFaviconOk] = useState(true);
  const hasAutoRunRef = useRef(false);

  const runAudit = useCallback(async (overrideUrl?: string) => {
    const chosen = (overrideUrl ?? url).trim();
    if (!chosen) return;

    setUrl(chosen);
    setLoading(true);
    setError(null);
    setResult(null);
    setFilterStatus('all');
    setFilterCategory(null);
    setFaviconOk(true);
    setElapsedMs(0);
    setScanStageIdx(0);

    const startTime = performance.now();
    const timerInterval = window.setInterval(() => {
      const diff = Math.round(performance.now() - startTime);
      setElapsedMs(diff);
      setScanStageIdx(Math.min(SCAN_STAGES.length - 1, Math.floor(diff / 310)));
    }, 60);

    try {
      const fetchPromise = fetch('/api/tools/visibility-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: chosen }),
      });

      const minAnimPromise = new Promise((r) => setTimeout(r, 1550));
      const [res] = await Promise.all([fetchPromise, minAnimPromise]);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Audit rejected. Please enter a valid public website domain.');
        setResult(null);
      } else {
        setScanStageIdx(SCAN_STAGES.length);
        setResult(data as AuditResult);
      }
    } catch {
      setError('Unable to reach Pixenox diagnostic API. Please try again.');
      setResult(null);
    } finally {
      window.clearInterval(timerInterval);
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (hasAutoRunRef.current) return;
    hasAutoRunRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const deepUrl = params.get('url');
    if (deepUrl && deepUrl.trim()) {
      runAudit(deepUrl.trim());
    }
  }, [runAudit]);

  const handleCopyBadge = async () => {
    if (!result?.embedBadgeHtml) return;
    try {
      await navigator.clipboard.writeText(result.embedBadgeHtml);
      setCopiedBadge(true);
      window.setTimeout(() => setCopiedBadge(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleCopyShareLink = async () => {
    if (!result?.auditedUrl) return;
    try {
      const shareUrl = `${window.location.origin}/tools/ai-visibility-checker?url=${encodeURIComponent(result.auditedUrl)}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `pixenox-geo-audit-${result.host || 'report'}.json`;
    a.click();
    URL.revokeObjectURL(href);
  };

  const filteredChecks =
    result?.checks?.filter((c) => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterCategory && c.category !== filterCategory) return false;
      return true;
    }) ?? [];

  const scanProgressPct = Math.min(96, Math.round(((scanStageIdx + 1) / SCAN_STAGES.length) * 90));

  return (
    <div style={{ display: 'grid', gap: '28px' }}>
      {/* Command Console Input */}
      <form
        className="avc-console"
        onSubmit={(e) => {
          e.preventDefault();
          runAudit();
        }}
      >
        <div className="avc-input-row">
          <div className="avc-input-wrap">
            <Globe size={18} className="avc-input-icon" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter any public URL (e.g. pixenox.com or stripe.com)"
              aria-label="Website URL to audit"
              className="avc-input"
            />
          </div>
          <button type="submit" disabled={loading} className="avc-submit-btn">
            {loading ? <Radar size={18} className="animate-spin" /> : <Search size={18} />}
            <span>{loading ? 'Scanning Protocols...' : 'Run Live Audit'}</span>
          </button>
        </div>

        <div className="avc-quick-row">
          <span>Quick probes:</span>
          {SAMPLE_URLS.map((s) => (
            <button
              key={s.url}
              type="button"
              disabled={loading}
              onClick={() => runAudit(s.url)}
              className="avc-quick-pill"
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '13px 16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.38)',
              color: '#fca5a5',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Multi-Stage Live Telemetry Scanner */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.section
            key="scanner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="avc-scanner"
            aria-live="polite"
          >
            <div className="avc-scan-beam" />
            <div style={{ display: 'grid', gap: '14px', textAlign: 'center' }}>
              <div className="avc-radar-wrap">
                <div className="avc-radar-ring-outer" />
                <div className="avc-radar-ring-inner" />
                <div className="avc-radar-core">
                  <Activity size={24} color="#e9d5ff" />
                  <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                    {(elapsedMs / 1000).toFixed(2)}s
                  </span>
                  <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c4b5fd' }}>
                    Telemetry
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'rgba(255,255,255,0.62)' }}>
                {url}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d8b4fe' }}>
                  Executing 20-Signal AI Visibility Probe
                </span>
                <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '0.82rem', color: '#38bdf8' }}>
                  {scanProgressPct}%
                </span>
              </div>

              <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <motion.div
                  style={{
                    height: '100%',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #9333ea 0%, #38bdf8 100%)',
                  }}
                  initial={{ width: '8%' }}
                  animate={{ width: `${scanProgressPct}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>

              <div className="avc-stage-list">
                {SCAN_STAGES.map((st, idx) => {
                  const isDone = idx < scanStageIdx;
                  const isActive = idx === scanStageIdx;
                  return (
                    <div
                      key={st.id}
                      className={`avc-stage-item ${isDone ? 'is-done' : isActive ? 'is-active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '0.75rem', color: '#c4b5fd' }}>
                          {st.id}
                        </span>
                        <span>{st.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)' }}>
                        <span>{st.target}</span>
                        {isDone ? (
                          <CheckCircle2 size={15} color="#4ade80" />
                        ) : isActive ? (
                          <Radar size={15} color="#a855f7" className="animate-spin" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {/* Forensic Incident Card (Parked Domain / NXDOMAIN / 404 / WAF / Unreachable) */}
        {!loading && result && result.auditState !== 'ok' && (
          <motion.section
            key="incident"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="avc-card"
            style={{
              borderColor:
                result.auditState === 'parked_domain'
                  ? 'rgba(250, 204, 21, 0.45)'
                  : 'rgba(248, 113, 113, 0.45)',
              background:
                result.auditState === 'parked_domain'
                  ? 'linear-gradient(160deg, rgba(250,204,21,0.06), rgba(10,10,16,0.95))'
                  : 'linear-gradient(160deg, rgba(239,68,68,0.07), rgba(10,10,16,0.95))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: result.auditState === 'parked_domain' ? 'rgba(250,204,21,0.16)' : 'rgba(239,68,68,0.16)',
                  }}
                >
                  <AlertOctagon
                    size={22}
                    color={result.auditState === 'parked_domain' ? '#facc15' : '#f87171'}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: result.auditState === 'parked_domain' ? '#fde047' : '#fca5a5' }}>
                    {result.auditState.replace('_', ' ')} • Audit Halted (No False Score)
                  </div>
                  <h2 style={{ margin: '4px 0 0', fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
                    {result.title}
                  </h2>
                </div>
              </div>

              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#ffffff',
                }}
              >
                Status: {result.grade}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.86)' }}>
              {result.message}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.68)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
              <span>Target: {result.auditedUrl}</span>
              {typeof result.statusCode === 'number' && <span>• HTTP {result.statusCode}</span>}
              {typeof result.ttfbMs === 'number' && <span>• TTFB {result.ttfbMs}ms</span>}
              {result.providerDetected && <span>• Signature: {result.providerDetected}</span>}
              {typeof result.redirectHops === 'number' && <span>• Redirects: {result.redirectHops}</span>}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
              <button type="button" onClick={() => runAudit('https://www.pixenox.com')} className="avc-action-btn">
                Audit Live Benchmark (pixenox.com)
              </button>
              <button type="button" onClick={() => runAudit('https://stripe.com')} className="avc-action-btn">
                Test Production Enterprise (stripe.com)
              </button>
              <Link href="/products/engenox" className="avc-action-btn" style={{ borderColor: 'rgba(168,85,247,0.45)' }}>
                <span>See Engenox OS</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.section>
        )}

        {/* Executive Intelligence Report (auditState === 'ok') */}
        {!loading && result && result.auditState === 'ok' && result.score !== null && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'grid', gap: '24px' }}
          >
            {/* Hero Score Card */}
            <section className="avc-card avc-hero-report">
              <ScoreGauge score={result.score} grade={result.grade} />

              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {faviconOk ? (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(result.host)}&sz=64`}
                        alt={`${result.host} favicon`}
                        width={32}
                        height={32}
                        onError={() => setFaviconOk(false)}
                        style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.08)' }}
                      />
                    ) : (
                      <Globe size={28} color="#c4b5fd" />
                    )}
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
                        {result.host}
                      </h2>
                      <a
                        href={result.auditedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.84rem', color: '#c4b5fd', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>{result.auditedUrl}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button type="button" onClick={handleCopyShareLink} className="avc-action-btn">
                      {copiedShare ? <Check size={14} color="#4ade80" /> : <Link2 size={14} />}
                      <span>{copiedShare ? 'Link Copied!' : 'Share Report'}</span>
                    </button>
                    <button type="button" onClick={handleDownloadJson} className="avc-action-btn">
                      <Download size={14} />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {result.pageTitle && (
                  <p style={{ margin: 0, fontSize: '0.94rem', color: 'rgba(255,255,255,0.82)' }}>
                    <strong>Page Title:</strong> {result.pageTitle}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.8rem', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                    HTTP {result.statusCode}
                  </span>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                    TTFB {result.ttfbMs}ms
                  </span>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                    SSR {result.ssrWords} words ({result.textToHtmlRatio}% text)
                  </span>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                    Redirects: {result.redirectHops ?? 0} hop(s)
                  </span>
                </div>
              </div>
            </section>

            {/* 5 Interactive Pillar Cards */}
            {result.categories && (
              <section className="avc-pillar-grid" aria-label="Category Breakdown">
                {result.categories.map((cat) => {
                  const pct = Math.round((cat.score / cat.max) * 100);
                  const isSelected = filterCategory === cat.category;
                  return (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setFilterCategory(isSelected ? null : cat.category)}
                      style={{
                        textAlign: 'left',
                        padding: '16px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(168,85,247,0.16)' : 'rgba(255,255,255,0.025)',
                        border: isSelected ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.09)',
                        display: 'grid',
                        gap: '10px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.88)', minHeight: '36px' }}>
                        {cat.category}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
                          {cat.score}<span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>/{cat.max}</span>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#c4b5fd' }}>{pct}%</span>
                      </div>
                      <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: pct >= 80 ? 'linear-gradient(90deg,#a855f7,#38bdf8)' : pct >= 55 ? '#eab308' : '#ef4444',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </section>
            )}

            {/* 6-Bot AI Crawler Matrix (RFC 9309 Live Evaluation) */}
            {result.botMatrix && (
              <section className="avc-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1.05rem' }}>
                    <Bot size={18} color="#c4b5fd" />
                    <span>RFC 9309 AI Crawler Access Matrix</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.58)' }}>
                    Evaluated per longest-path precedence against {result.host}/robots.txt
                  </span>
                </div>

                <div className="avc-bot-grid">
                  {result.botMatrix.map((b) => {
                    const color =
                      b.status === 'allowed_explicit' ? '#4ade80' : b.status === 'allowed_wildcard' ? '#38bdf8' : '#f87171';
                    const badge =
                      b.status === 'allowed_explicit'
                        ? 'EXPLICIT ALLOW'
                        : b.status === 'allowed_wildcard'
                          ? 'WILDCARD ALLOW'
                          : 'BLOCKED';
                    return (
                      <div
                        key={b.bot}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '14px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          display: 'grid',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '0.88rem', color: '#ffffff' }}>
                            {b.bot}
                          </strong>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              border: `1px solid ${color}`,
                              color,
                            }}
                          >
                            {badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)' }}>{b.product}</div>
                        <div style={{ fontSize: '0.73rem', fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'rgba(255,255,255,0.48)' }}>
                          {b.rule}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 2026 AI Protocol Radar + Detected Schema Chips */}
            {result.protocolSummary && (
              <section className="avc-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <strong style={{ fontSize: '1.05rem' }}>2026 AI-Native Protocol &amp; Entity Radar</strong>
                  {result.detectedSchemaTypes && result.detectedSchemaTypes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {result.detectedSchemaTypes.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: 'rgba(168,85,247,0.14)',
                            border: '1px solid rgba(196,181,253,0.3)',
                            color: '#e9d5ff',
                            fontFamily: 'var(--font-jetbrains-mono), monospace',
                          }}
                        >
                          @{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="avc-proto-grid">
                  {result.protocolSummary.map((p) => (
                    <div
                      key={p.key}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: p.active ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                        border: p.active ? '1px solid rgba(74,222,128,0.35)' : '1px solid rgba(255,255,255,0.08)',
                        fontSize: '0.84rem',
                      }}
                    >
                      <span style={{ color: p.active ? '#ffffff' : 'rgba(255,255,255,0.58)' }}>{p.key}</span>
                      {p.active ? <CheckCircle2 size={15} color="#4ade80" /> : <XCircle size={15} color="rgba(255,255,255,0.3)" />}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Signal Inspector */}
            {result.checks && (
              <section className="avc-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    {(['all', 'fail', 'warn', 'pass'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFilterStatus(st)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '999px',
                          fontSize: '0.82rem',
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
                          ? result.checks!.length
                          : result.checks!.filter((c) => c.status === st).length}
                        )
                      </button>
                    ))}

                    {filterCategory && (
                      <button
                        type="button"
                        onClick={() => setFilterCategory(null)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          background: 'rgba(56,189,248,0.14)',
                          border: '1px solid rgba(56,189,248,0.4)',
                          color: '#7dd3fc',
                          cursor: 'pointer',
                        }}
                      >
                        Pillar: {filterCategory} ×
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {filteredChecks.map((check) => (
                    <div
                      key={check.id}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.018)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'grid',
                        gap: '7px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          {check.status === 'pass' && <CheckCircle2 size={18} color="#4ade80" />}
                          {check.status === 'warn' && <AlertTriangle size={18} color="#facc15" />}
                          {check.status === 'fail' && <XCircle size={18} color="#f87171" />}
                          <strong style={{ fontSize: '0.98rem', color: '#ffffff' }}>{check.label}</strong>
                          <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.48)' }}>{check.category}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '0.82rem', fontWeight: 600, color: '#c4b5fd' }}>
                          {check.points}/{check.maxPoints} pts
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{check.detail}</p>
                      {check.status !== 'pass' && (
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#d8b4fe' }}>
                          <strong>Engineering Remediation:</strong> {check.fix}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Embeddable Audited Badge + Flagship Engenox CTA */}
            {result.embedBadgeHtml && (
              <section
                className="avc-card"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.09) 0%, rgba(56,189,248,0.05) 100%)',
                  borderColor: 'rgba(196,181,253,0.32)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <Sparkles size={18} color="#c4b5fd" />
                    <span>Embed Your AI-Visibility Audited Badge</span>
                  </div>
                  <button type="button" onClick={handleCopyBadge} className="avc-action-btn">
                    {copiedBadge ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                    <span>{copiedBadge ? 'Copied HTML!' : 'Copy Badge HTML'}</span>
                  </button>
                </div>

                <pre
                  style={{
                    margin: 0,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#050509',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#c4b5fd',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                  }}
                >
                  {result.embedBadgeHtml}
                </pre>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
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
                    <span>Automate continuous GEO &amp; AEO fixes with Engenox OS</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link href="/contact/pixy" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>
                    Request an engineering visibility overhaul via Pixy
                  </Link>
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
