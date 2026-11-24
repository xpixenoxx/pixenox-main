'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, CheckCircle2, XCircle, ShieldAlert, ArrowUpRight } from 'lucide-react';
import type { BenchmarkDomainRow } from '@/lib/seo/benchmark-2026-data';

interface BenchmarkExplorerClientProps {
  rows: BenchmarkDomainRow[];
  cohorts: string[];
}

type ProtocolFilter =
  | 'all'
  | 'llms'
  | 'markdown'
  | 'contentSignal'
  | 'agentCard'
  | 'wikidata'
  | 'wafOrBlocked';

export default function BenchmarkExplorerClient({ rows, cohorts }: BenchmarkExplorerClientProps) {
  const [query, setQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('All');
  const [protoFilter, setProtoFilter] = useState<ProtocolFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (selectedCohort !== 'All' && r.cohort !== selectedCohort) return false;
      if (q && !r.domain.toLowerCase().includes(q) && !r.cohort.toLowerCase().includes(q)) return false;
      if (protoFilter === 'llms' && !r.hasLlmsTxt) return false;
      if (protoFilter === 'markdown' && !r.supportsAcceptMarkdown) return false;
      if (protoFilter === 'contentSignal' && !r.hasContentSignal) return false;
      if (protoFilter === 'agentCard' && !r.hasAgentCard) return false;
      if (protoFilter === 'wikidata' && !r.hasWikidataSameAs) return false;
      if (protoFilter === 'wafOrBlocked' && !r.wafBlocked && r.oaiSearchBot !== 'blocked') return false;
      return true;
    });
  }, [rows, query, selectedCohort, protoFilter]);

  const badge = (ok: boolean) =>
    ok ? (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontWeight: 600, fontSize: '0.78rem' }}>
        <CheckCircle2 size={14} /> Yes
      </span>
    ) : (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.34)', fontSize: '0.78rem' }}>
        <XCircle size={14} /> No
      </span>
    );

  const botPill = (status: string) => {
    if (status === 'allowed_explicit') {
      return <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.76rem' }}>Explicit</span>;
    }
    if (status === 'blocked') {
      return <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.76rem' }}>Blocked</span>;
    }
    return <span style={{ color: '#38bdf8', fontSize: '0.76rem' }}>Wildcard</span>;
  };

  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      <div
        style={{
          padding: '20px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(196,181,253,0.22)',
          display: 'grid',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div
            style={{
              position: 'relative',
              flex: '1 1 240px',
              display: 'flex',
              alignItems: 'center',
              background: '#080810',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '10px',
            }}
          >
            <Search size={16} style={{ position: 'absolute', left: '12px', color: '#c4b5fd' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter 50 domains (e.g. stripe.com, razorpay.com)..."
              aria-label="Filter benchmark domains"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            aria-label="Filter by industry cohort"
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#080810',
              border: '1px solid rgba(255,255,255,0.16)',
              color: '#ffffff',
              fontSize: '0.88rem',
            }}
          >
            <option value="All">All Cohorts (50)</option>
            {cohorts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {(
            [
              ['all', 'All (50)'],
              ['llms', 'Has /llms.txt (32)'],
              ['markdown', 'Accept: text/markdown (11)'],
              ['contentSignal', 'Content-Signal (7)'],
              ['agentCard', 'A2A Agent Card (3)'],
              ['wikidata', 'Wikidata QIDs (10)'],
              ['wafOrBlocked', 'WAF / OAI Blocked'],
            ] as [ProtocolFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setProtoFilter(key)}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                background: protoFilter === key ? 'rgba(168,85,247,0.22)' : 'rgba(255,255,255,0.04)',
                border: protoFilter === key ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.12)',
                color: '#ffffff',
              }}
            >
              {label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'rgba(255,255,255,0.58)' }}>
            Showing {filtered.length} / {rows.length} domains
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.015)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left', minWidth: '880px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', color: '#c4b5fd' }}>
              <th style={{ padding: '12px 14px' }}>Domain</th>
              <th style={{ padding: '12px 10px' }}>Cohort</th>
              <th style={{ padding: '12px 10px' }}>Status</th>
              <th style={{ padding: '12px 10px' }}>SSR Words</th>
              <th style={{ padding: '12px 10px' }}>OAI-SearchBot</th>
              <th style={{ padding: '12px 10px' }}>llms.txt</th>
              <th style={{ padding: '12px 10px' }}>Markdown</th>
              <th style={{ padding: '12px 10px' }}>Signal</th>
              <th style={{ padding: '12px 10px' }}>A2A</th>
              <th style={{ padding: '12px 10px' }}>JSON-LD</th>
              <th style={{ padding: '12px 14px' }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.domain} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '11px 14px', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                  {r.domain}
                </td>
                <td style={{ padding: '11px 10px', color: 'rgba(255,255,255,0.68)' }}>{r.cohort}</td>
                <td style={{ padding: '11px 10px' }}>
                  {r.wafBlocked ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#facc15', fontSize: '0.78rem' }}>
                      <ShieldAlert size={14} /> WAF ({r.status})
                    </span>
                  ) : (
                    <span style={{ color: r.status === 200 ? '#e2e8f0' : '#f87171', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                      {r.status}
                    </span>
                  )}
                </td>
                <td style={{ padding: '11px 10px', fontFamily: 'var(--font-jetbrains-mono), monospace', color: r.ssrWords < 50 ? '#facc15' : '#e2e8f0' }}>
                  {r.ssrWords.toLocaleString()}
                </td>
                <td style={{ padding: '11px 10px' }}>{botPill(r.oaiSearchBot)}</td>
                <td style={{ padding: '11px 10px' }}>{badge(r.hasLlmsTxt)}</td>
                <td style={{ padding: '11px 10px' }}>{badge(r.supportsAcceptMarkdown)}</td>
                <td style={{ padding: '11px 10px' }}>{badge(r.hasContentSignal)}</td>
                <td style={{ padding: '11px 10px' }}>{badge(r.hasAgentCard)}</td>
                <td style={{ padding: '11px 10px' }}>{badge(r.hasJsonLd)}</td>
                <td style={{ padding: '11px 14px' }}>
                  <Link
                    href={`/tools/ai-visibility-checker?url=${encodeURIComponent(`https://${r.domain}`)}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#c4b5fd', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    <span>Live</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
