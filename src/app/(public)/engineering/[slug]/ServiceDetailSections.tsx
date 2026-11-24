'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { sanitizeSvg } from '@/lib/sanitize';
import '@/components/home/HomeFaqsSection.css';

const MotionLink = motion.create(Link);

interface TechItem {
  name: string;
  svg?: string;
  image_url?: string;
}

interface CaseStudyCard {
  title: string;
  slug: string;
  cover_image_url: string | null;
  short_description: string | null;
  tags: string[] | null;
}

interface ServiceDetailSectionsProps {
  serviceTitle: string;
  serviceSlug: string;
  serviceDescription: string | null;
  techStack: TechItem[];
  relatedStudies: CaseStudyCard[];
  capabilities?: { title: string; desc: string; metric: string; metricLabel: string }[] | null;
  faqs?: { question: string; answer: string }[] | null;
  whatYouGetHeading?: string | null;
  whatYouGetDescription?: string | null;
  whatYouGetItems?: { title: string; desc: string; icon_svg?: string }[] | null;
  faqBotNode?: React.ReactNode;
}

/* ─────────────────────────────────────────────────
   Magnetic Button Component
   ───────────────────────────────────────────────── */
const MagneticButton = ({ children, href, theme = 'dark' }: { children: React.ReactNode, href: string, theme?: 'dark' | 'light' }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const btnClass = `magnetic-btn ${theme === 'light' ? 'magnetic-btn--light' : ''}`;

  return (
    <motion.a
      href={href}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 100, damping: 10, mass: 0.1 }}
      className={btnClass}
    >
      <span className="magnetic-btn__text">{children}</span>
      {theme === 'dark' && <span className="magnetic-btn__glow" />}
    </motion.a>
  );
};

/* ─────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────── */
export default function ServiceDetailSections({
  serviceTitle,
  serviceSlug,
  serviceDescription,
  techStack,
  relatedStudies,
  capabilities,
  faqs,
  whatYouGetHeading,
  whatYouGetDescription,
  whatYouGetItems,
  faqBotNode,
}: ServiceDetailSectionsProps) {

  // CTA Canvas
  const ctaCanvasRef = useRef<HTMLCanvasElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ctaCanvasRef.current;
    const section = ctaSectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; baseAlpha: number; hue: number; life: number; maxLife: number }> = [];
    const COUNT = window.matchMedia('(max-width: 768px)').matches ? 100 : 250;
    let mx = -1000;
    let my = -1000;

    const resize = () => {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
      init();
    };
    const init = () => {
      particles = [];
      for (let i = 0; i < COUNT; i++) {
        createParticle(true);
      }
    };

    const createParticle = (randomizeLife = false) => {
      const maxLife = 100 + Math.random() * 200;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        baseAlpha: Math.random() * 0.5 + 0.1,
        hue: 260 + Math.random() * 40,
        life: randomizeLife ? Math.random() * maxLife : 0,
        maxLife: maxLife
      });
    };

    window.addEventListener('resize', resize);
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    });
    section.addEventListener('mouseleave', () => {
      mx = -1000; my = -1000;
    });

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 1, 4, 0.3)'; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          createParticle();
          continue;
        }

        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let alpha = p.baseAlpha;

        // Dynamic constellation lines near mouse
        if (dist < 250) {
          alpha = Math.min(1, alpha + (250 - dist) / 250);
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist2 = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
            if (dist2 < 100) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, ${0.2 * (1 - dist2 / 100) * (1 - dist / 250)})`;
              ctx.stroke();
            }
          }
        }

        // Pulse size based on life
        const lifeFactor = Math.sin((p.life / p.maxLife) * Math.PI);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * lifeFactor, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${alpha * lifeFactor})`;
        ctx.fill();

        // Heavy glow for particles near mouse
        if (dist < 150) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = `hsla(${p.hue}, 90%, 75%, 0.8)`;
        } else {
          ctx.shadowBlur = 0;
        }
      }
      animId = requestAnimationFrame(draw);
    };
    resize(); draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="premium-service-sections" id="details">
      
      {/* 1.5 WHAT YOU GET SECTION */}
      {whatYouGetItems && whatYouGetItems.length > 0 && (
        <WhatYouGetSection 
          serviceSlug={serviceSlug}
          heading={whatYouGetHeading}
          description={whatYouGetDescription}
          items={whatYouGetItems}
        />
      )}

      {/* Proprietary Product Proof on AI Visibility Pillar */}
      {serviceSlug === 'ai-visibility' && (
        <section
          aria-labelledby="engenox-pillar-callout"
          style={{
            maxWidth: '1200px',
            margin: '0 auto 48px',
            padding: '0 24px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.14) 0%, rgba(15, 10, 30, 0.92) 60%, rgba(244, 63, 94, 0.08) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              borderRadius: '24px',
              padding: '36px 40px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <div style={{ maxWidth: '680px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#c4b5fd',
                  marginBottom: '10px',
                }}
              >
                PROPRIETARY PLATFORM · BUILT BY PIXENOX
              </span>
              <h2
                id="engenox-pillar-callout"
                style={{
                  fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: '0 0 12px',
                  lineHeight: 1.2,
                }}
              >
                Powered by Engenox — Unified SEO, GEO &amp; AEO Operating System
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.65 }}>
                We don&apos;t only consult on AI search visibility — we engineered Engenox by Pixenox to automate technical crawl readiness, Knowledge Graph entity governance, answer-first publishing, and multi-engine AI citation monitoring from a single operating workspace.
              </p>
            </div>
            <Link
              href="/products/engenox"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                borderRadius: '999px',
                background: '#ffffff',
                color: '#09090b',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Explore Engenox OS
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      {/* 2. THE EDITORIAL SHIFT: Cinematic Horizontal Scroll */}
      <HorizontalCapabilities serviceTitle={serviceTitle} dynamicCapabilities={capabilities || []} />

      {/* 3. DARK THEME RETURN: The Spotlight Matrix */}
      <MatrixTechStack techStack={techStack} />

      {/* FAQs Section */}
      {faqs && faqs.length > 0 && (
        <div style={{ position: 'relative' }}>
          {faqBotNode && (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 0' }}>
              {faqBotNode}
            </div>
          )}
          <ServiceFaqs faqs={faqs} />
        </div>
      )}

      {/* 4. DARK THEME: Immersive CTA */}
      <section className="k-cta" ref={ctaSectionRef}>
        <canvas ref={ctaCanvasRef} className="k-cta__canvas" />
        <div className="k-cta__overlay" />

        {/* Abstract 3D Torus/Orbital System */}
        <div className="k-cta__orbital-system" aria-hidden="true">
          <div className="k-cta__orbital-ring k-cta__orbital-ring--x" />
          <div className="k-cta__orbital-ring k-cta__orbital-ring--y" />
          <div className="k-cta__orbital-ring k-cta__orbital-ring--z" />
          <div className="k-cta__core-glow" />
        </div>

        <motion.div
          className="k-cta__content"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="k-cta__eyebrow">ARCHITECTURE SCOPING</span>
          <h2 className="k-cta__title">
            <span className="k-cta__title-line">Build Systems</span>
            <span className="k-cta__title-line"><em>That Compound</em></span>
          </h2>
          <p className="k-cta__sub">Schedule a technical architecture review with Pixenox engineers. Direct response within 24–48 business hours.</p>
          <MagneticButton href="/contact/pixy" theme="dark">Scope Your Architecture</MagneticButton>
        </motion.div>
      </section>

    </div>
  );
}

/* ─────────────────────────────────────────────────
   Kinetic Typography Marquee
   ───────────────────────────────────────────────── */
function KineticMarquee({ serviceTitle }: { serviceTitle: string }) {
  return (
    <div className="kinetic-marquee">
      <div className="kinetic-marquee__track kinetic-marquee__track--left">
        {[1, 2, 3, 4].map(i => (
          <span key={`l-${i}`} className="kinetic-text kinetic-text--outline">{serviceTitle} — </span>
        ))}
      </div>
      <div className="kinetic-marquee__track kinetic-marquee__track--right">
        {[1, 2, 3, 4].map(i => (
          <span key={`r-${i}`} className="kinetic-text kinetic-text--solid">{serviceTitle} — </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Engineered Excellence (Multi-Column Reference Grid)
   ───────────────────────────────────────────────── */
function HorizontalCapabilities({ serviceTitle, dynamicCapabilities }: { serviceTitle: string; dynamicCapabilities?: any[] }) {
  const capabilities = dynamicCapabilities && dynamicCapabilities.length > 0 ? dynamicCapabilities : getCapabilities(serviceTitle);

  return (
    <section className="engineered-excellence-section">
      <div className="ee-container">
        <motion.div
          className="ee-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="ee-title">
            Engineered <span>Excellence</span>
          </h2>
        </motion.div>

        <div className="ee-grid">
          {capabilities.map((cap, idx) => (
            <motion.div
              key={idx}
              className="ee-column"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
            >
              <div className="ee-line" />
              <div className="ee-metric">
                <span className="ee-metric-val">{cap.metric}</span>
                {cap.metricLabel && <span className="ee-metric-label">{cap.metricLabel}</span>}
              </div>
              <div className="ee-desc">{cap.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   The Spotlight Matrix (Cursor Reveal Grid)
   ───────────────────────────────────────────────── */
function MatrixTechStack({ techStack }: { techStack: TechItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gridRef.current.style.setProperty('--mouse-x', `${x}px`);
    gridRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <section className="matrix-tech">
      <div className="matrix-tech__bg">
        <div className="matrix-tech__grid-floor" />
      </div>

      <div className="matrix-tech__container">

        {/* Header */}
        <div className="matrix-tech__header">
          <motion.h2
            className="mt-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Technology Stack
          </motion.h2>
        </div>

        {/* Spotlight Grid Container */}
        <div
          className="matrix-grid-wrapper"
          ref={gridRef}
          onMouseMove={handleMouseMove}
        >
          <motion.div
            className="matrix-tech__grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {techStack.map((tech, idx) => (
              <motion.div key={idx} variants={itemVariants} className="mt-cell">
                <div className="mt-cell__border" />
                <div className="mt-cell__inner">

                  <div className="mt-cell__top">
                    <span className="mt-cell__num">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div className="mt-cell__dot" />
                  </div>

                  <div className="mt-cell__center">
                    {(tech as any).svg && (tech as any).svg.includes('<svg') ? (
                      <div className="mt-cell__icon" dangerouslySetInnerHTML={{ __html: sanitizeSvg((tech as any).svg) }} />
                    ) : tech.image_url ? (
                      <img src={tech.image_url} alt={tech.name} className="mt-cell__img" />
                    ) : null}
                  </div>

                  <div className="mt-cell__bottom">
                    <span className="mt-cell__name">{tech.name}</span>
                  </div>

                </div>
              </motion.div>
            ))}

            {/* Fill empty cells */}
            {Array.from({ length: (4 - (techStack.length % 4)) % 4 }).map((_, i) => (
              <div key={`empty-${i}`} className="mt-cell mt-cell--empty">
                <div className="mt-cell__border" />
                <div className="mt-cell__inner" />
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────────
   Tech Marquee (Logos)
   ───────────────────────────────────────────────── */
function TechMarquee({ techStack }: { techStack: TechItem[] }) {
  const logos = techStack.filter(t => t.image_url || (t.svg && t.svg.includes('<svg')));
  if (logos.length === 0) return null;

  return (
    <section className="tech-marquee-section">
      <div className="tech-marquee-container">
        <div className="tech-marquee-track">
          {[1, 2].map(group => (
            <div key={group} className="tech-marquee-group">
              {logos.map((tech, i) => (
                <div key={i} className="tm-logo" title={tech.name}>
                  {tech.image_url ? (
                    <img src={tech.image_url} alt={tech.name} className="h-full w-auto max-w-[160px] object-contain object-center" />
                  ) : (
                    <div className="h-full" dangerouslySetInnerHTML={{ __html: sanitizeSvg(tech.svg!) }} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   Capability Data Generator (Honest Engineering Design Objectives)
   ───────────────────────────────────────────────── */
function getCapabilities(serviceTitle: string) {
  const titleLower = serviceTitle.toLowerCase();
  if (titleLower.includes('visibility') || titleLower.includes('geo')) {
    return [
      { title: 'SSR & AI Crawler Eligibility', desc: 'Server-rendered semantic HTML, verified RFC 9309 crawler access, and zero Soft 404 or canonical leaks across Google, Bing, OpenAI, Anthropic, and Perplexity.', metric: 'SSR', metricLabel: 'CRAWL READY' },
      { title: 'Entity & Knowledge Graph Engineering', desc: 'Unified Schema.org @graph architecture connecting legal entity, founders, services, and proprietary products across verified third-party corroboration.', metric: '@graph', metricLabel: 'ENTITY CLARITY' },
      { title: 'Answer-First AEO Architecture', desc: 'Structured HTML definitions, decision tables, and primary-source references formatted for clean extraction in AI Overviews and LLM retrieval.', metric: 'AEO', metricLabel: 'EXTRACTABLE' },
      { title: 'Multi-Engine Citation Telemetry', desc: 'Disaggregated tracking of brand mentions, accurate descriptions, clickable citations, and referral visits powered by Engenox.', metric: 'GEO', metricLabel: 'MEASURED' },
    ];
  }
  return [
    { title: 'Governed Production Architecture', desc: 'Deterministic validation membranes, explicit audit logs, and human-in-the-loop checkpoints engineered for mission-critical enterprise workloads.', metric: 'HITL', metricLabel: 'GOVERNED' },
    { title: 'Non-Disruptive Integration', desc: 'Event-driven CDC pipelines and clean API overlays that unify legacy ERPs, CRMs, and cloud data without rip-and-replace downtime.', metric: 'ZERO', metricLabel: 'RIP & REPLACE' },
    { title: 'Observable Infrastructure', desc: 'End-to-end latency, cost-per-task FinOps telemetry, evaluation harnesses, and fallback routing baked into every deployment.', metric: 'DAY-2', metricLabel: 'OBSERVABILITY' },
    { title: 'Maintainable Ownership', desc: 'Clean TypeScript and Python codebases with automated test suites, full documentation, and seamless handoff to internal engineering teams.', metric: '100%', metricLabel: 'CODE OWNERSHIP' },
  ];
}

/* ─────────────────────────────────────────────────
   Service FAQs Section (SSR-Always-Present with hidden="until-found")
   ───────────────────────────────────────────────── */
function ServiceFaqs({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openId, setOpenId] = useState<number | null>(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const handleBeforeMatch = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const idxStr = target?.getAttribute('data-faq-idx');
      if (idxStr !== null && idxStr !== undefined) {
        const parsed = parseInt(idxStr, 10);
        if (!Number.isNaN(parsed)) setOpenId(parsed);
      }
    };

    listEl.addEventListener('beforematch', handleBeforeMatch);
    return () => listEl.removeEventListener('beforematch', handleBeforeMatch);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenId(openId === index ? null : index);
  };

  return (
    <section className="home-faqs-section" aria-labelledby="service-faqs-heading">
      <div className="home-faqs-glow" aria-hidden="true" />

      <div className="home-faqs-container">
        <div className="home-faqs-header">
          <h2 id="service-faqs-heading" className="home-faqs-title">
            Common <span>Questions</span>
          </h2>
          <p className="home-faqs-subtitle">Technical and operational answers about this engineering discipline.</p>
        </div>

        <div className="home-faqs-list" ref={listRef}>
          {faqs.map((faq, index) => {
            const isOpen = openId === index;
            const panelId = `srv-faq-panel-${index}`;
            return (
              <div
                key={index}
                className={`home-faq-item ${isOpen ? 'is-open' : ''}`}
              >
                <h3 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>
                  <button
                    type="button"
                    className="home-faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span>{faq.question}</span>
                    <div className="home-faq-icon" aria-hidden="true">
                      <ChevronDown size={18} strokeWidth={2.5} />
                    </div>
                  </button>
                </h3>
                <div
                  id={panelId}
                  data-faq-idx={index}
                  {...(!isOpen ? { hidden: 'until-found' as unknown as boolean } : {})}
                >
                  <div className="home-faq-answer-wrapper">
                    <div className="home-faq-answer-content">
                      {faq.answer.split('\n').filter(Boolean).map((paragraph, i) => (
                        <p key={i} className="mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   What You Get Section (Semantic <Link> cards)
   ───────────────────────────────────────────────── */
function WhatYouGetSection({
  serviceSlug,
  heading,
  description,
  items,
}: {
  serviceSlug: string;
  heading?: string | null;
  description?: string | null;
  items: { title: string; desc: string; icon_svg?: string }[];
}) {
  const getSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <section className="what-you-get-section">
      <div className="container">
        <div className="what-you-get-header">
          <motion.h2
            className="wyg-title"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {heading || "What you get"}
          </motion.h2>
          {description && (
            <motion.p
              className="wyg-header-desc"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {description}
            </motion.p>
          )}
        </div>

        <div className="what-you-get-list">
          {items.map((item, idx) => {
            return (
              <WygItemCard
                key={idx}
                item={item}
                idx={idx}
                href={`/engineering/${serviceSlug}/${getSlug(item.title)}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WygItemCard({ item, idx, href }: { item: any; idx: number; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty('--mouse-enter-x', `${x}px`);
    ref.current.style.setProperty('--mouse-enter-y', `${y}px`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty('--mouse-leave-x', `${x}px`);
    ref.current.style.setProperty('--mouse-leave-y', `${y}px`);
  };

  return (
    <MotionLink
      href={href}
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="wyg-item"
      style={{ textDecoration: 'none', color: 'inherit' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
    >
      <div className="wyg-num">
        0{/* */}{idx + 1}
      </div>
      <div className="wyg-title-group">
        {item.icon_svg ? (
          <span className="wyg-icon" dangerouslySetInnerHTML={{ __html: sanitizeSvg(item.icon_svg) }} />
        ) : (
          <span className="wyg-icon" style={{ visibility: 'hidden' }} />
        )}
        <h3 className="wyg-item-title">{item.title}</h3>
      </div>
      <p className="wyg-desc">
        {item.desc}
      </p>
    </MotionLink>
  );
}
