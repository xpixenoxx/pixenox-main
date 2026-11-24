import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Layers, Globe, ShieldCheck } from 'lucide-react';

export default function ProductsSection() {
  return (
    <section
      aria-labelledby="pixenox-products-heading"
      style={{
        position: 'relative',
        padding: '96px 24px',
        background: 'linear-gradient(180deg, rgba(10, 6, 20, 0.95) 0%, rgba(3, 1, 8, 1) 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px', maxWidth: '760px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#c4b5fd',
              fontWeight: 600,
              marginBottom: '12px',
            }}
          >
            PROPRIETARY PLATFORMS · BUILT BY PIXENOX
          </span>
          <h2
            id="pixenox-products-heading"
            style={{
              fontSize: 'clamp(2rem, 3.6vw, 3rem)',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 14px',
              lineHeight: 1.12,
            }}
          >
            Products Engineered In-House
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.65, margin: 0 }}>
            We don&apos;t only architect systems for enterprise clients — we build and operate our own production software platforms across AI visibility and creator distribution.
          </p>
        </div>

        {/* Two Flagship Products Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '56px',
          }}
        >
          {/* Product 1: Engenox by Pixenox */}
          <article
            style={{
              background:
                'linear-gradient(145deg, rgba(124, 58, 237, 0.16) 0%, rgba(14, 10, 26, 0.94) 65%, rgba(244, 63, 94, 0.08) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.38)',
              borderRadius: '24px',
              padding: '36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#e9d5ff',
                    background: 'rgba(124, 58, 237, 0.24)',
                    border: '1px solid rgba(168, 85, 247, 0.45)',
                    padding: '6px 12px',
                    borderRadius: '999px',
                  }}
                >
                  <Layers size={14} aria-hidden="true" />
                  SEO · GEO · AEO OPERATING SYSTEM
                </span>
              </div>

              <h3 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', margin: '0 0 12px' }}>
                Engenox <span style={{ color: '#c4b5fd', fontWeight: 400, fontSize: '1.15rem' }}>by Pixenox</span>
              </h3>

              <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, margin: '0 0 20px', fontSize: '0.98rem' }}>
                A unified autonomous operating system for technical SEO, Generative Engine Optimization (GEO), and Answer Engine Optimization (AEO). Provide your domain and entity context once — Engenox orchestrates technical crawl audits, Knowledge Graph schema governance, structured publishing workflows, and multi-engine AI citation telemetry from one control plane.
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                  fontSize: '0.88rem',
                  color: 'rgba(255,255,255,0.82)',
                }}
              >
                <li>• Automated Technical &amp; SSR Crawl Checks</li>
                <li>• Schema.org @graph Entity Governance</li>
                <li>• Answer-First Content &amp; Social SEO Ops</li>
                <li>• Multi-Engine AI Citation Monitoring</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '8px' }}>
              <Link
                href="/products/engenox"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 22px',
                  borderRadius: '999px',
                  background: '#ffffff',
                  color: '#09090b',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                }}
              >
                Explore Engenox OS
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/contact/pixy"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                }}
              >
                Request Demo
              </Link>
            </div>
          </article>

          {/* Product 2: Unool */}
          <article
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#a5f3fc',
                    background: 'rgba(6, 182, 212, 0.14)',
                    border: '1px solid rgba(34, 211, 238, 0.35)',
                    padding: '6px 12px',
                    borderRadius: '999px',
                  }}
                >
                  <Globe size={14} aria-hidden="true" />
                  LIVE PRODUCT · UNOOL.CO
                </span>
              </div>

              <h3 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', margin: '0 0 12px' }}>
                Unool <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400, fontSize: '1.15rem' }}>— One Link + One Click</span>
              </h3>

              <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, margin: '0 0 20px', fontSize: '0.98rem' }}>
                Unool is Pixenox&apos;s live web platform engineered for unified social presence, creator link routing, and social distribution velocity. Built end-to-end by Pixenox Solutions with fast edge performance and clean social-SEO architecture.
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                  fontSize: '0.88rem',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                <li>• Unified Brand &amp; Creator Link Hubs</li>
                <li>• Instant Social Distribution Workflows</li>
                <li>• Edge-Fast Global Web Performance</li>
                <li>• Operated by Pixenox Solutions</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '8px' }}>
              <a
                href="https://unool.co"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 22px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.24)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                }}
              >
                Visit unool.co
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>

        {/* Verified Technical & Enterprise Partnerships Strip */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '20px',
            padding: '28px 32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ShieldCheck size={18} color="#c4b5fd" aria-hidden="true" />
            <h3 style={{ margin: 0, fontSize: '0.85rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4b5fd', fontWeight: 600 }}>
              Verified Client &amp; Technical Partnerships
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <div style={{ borderLeft: '2px solid rgba(168, 85, 247, 0.5)', paddingLeft: '18px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <strong style={{ color: '#ffffff', fontSize: '1.08rem' }}>Flowtaris</strong>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>Enterprise ERP &amp; AI Finance Automation</span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>
                Engineering partner supporting web architecture and enterprise platform presence across the Flowtaris ecosystem.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem' }}>
                <a href="https://www.flowtaris.com" target="_blank" rel="noopener noreferrer" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>flowtaris.com</a>
                <a href="https://www.flowtaris.co" target="_blank" rel="noopener noreferrer" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>flowtaris.co</a>
                <a href="https://www.flowtaris.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#c4b5fd', textDecoration: 'underline' }}>flowtaris.ai</a>
              </div>
            </div>

            <div style={{ borderLeft: '2px solid rgba(34, 211, 238, 0.45)', paddingLeft: '18px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <strong style={{ color: '#ffffff', fontSize: '1.08rem' }}>Deynold Danny</strong>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>Technical Partner · Digital Brand Platform</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>
                Dedicated technical engineering partner for digital commerce experience, performance infrastructure, and search readiness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
