'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { sanitizeSvg } from '@/lib/sanitize';
import '@/components/home/HomeFaqsSection.css';

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
  serviceDescription: string | null;
  techStack: TechItem[];
  relatedStudies: CaseStudyCard[];
  capabilities?: { title: string; desc: string; metric: string; metricLabel: string }[] | null;
  faqs?: { question: string; answer: string }[] | null;
  whatYouGetHeading?: string | null;
  whatYouGetDescription?: string | null;
  whatYouGetItems?: { title: string; desc: string; icon_svg?: string }[] | null;
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
  serviceDescription,
  techStack,
  relatedStudies,
  capabilities,
  faqs,
  whatYouGetHeading,
  whatYouGetDescription,
  whatYouGetItems,
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
          heading={whatYouGetHeading}
          description={whatYouGetDescription}
          items={whatYouGetItems}
        />
      )}

      {/* 2. THE EDITORIAL SHIFT: Cinematic Horizontal Scroll */}
      <HorizontalCapabilities serviceTitle={serviceTitle} dynamicCapabilities={capabilities || []} />

      {/* 3. DARK THEME RETURN: The Spotlight Matrix */}
      <MatrixTechStack techStack={techStack} />

      {/* FAQs Section */}
      {faqs && faqs.length > 0 && (
        <ServiceFaqs faqs={faqs} />
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
          <span className="k-cta__eyebrow">FINAL DIRECTIVE</span>
          <h2 className="k-cta__title">
            <span className="k-cta__title-line">Initiate</span>
            <span className="k-cta__title-line"><em>Sequence</em></span>
          </h2>
          <p className="k-cta__sub">Architecting compounding visibility and autonomous systems. Converge your fragmented tools into a singular, high-velocity platform.</p>
          <MagneticButton href="/contact" theme="dark">Deploy Now</MagneticButton>
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
   Horizontal Capabilities (Awwwards Style Scroll-jack)
   ───────────────────────────────────────────────── */
function HorizontalCapabilities({ serviceTitle, dynamicCapabilities }: { serviceTitle: string; dynamicCapabilities?: any[] }) {
  const capabilities = dynamicCapabilities && dynamicCapabilities.length > 0 ? dynamicCapabilities : getCapabilities(serviceTitle);
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: targetRef });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001
  });

  const [scrollRange, setScrollRange] = useState(0);
  useEffect(() => {
    const updateRange = () => {
      if (trackRef.current && viewportRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const viewportWidth = viewportRef.current.offsetWidth;
        setScrollRange(Math.min(0, -(trackWidth - viewportWidth)));
      }
    };

    updateRange();
    const timer = setTimeout(updateRange, 100);
    window.addEventListener('resize', updateRange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRange);
    };
  }, [capabilities.length]);

  const x = useTransform(smoothProgress, [0, 1], [0, scrollRange]);

  // Evolving background color: Charcoal Black
  const bgColor = useTransform(smoothProgress, [0, 1], ["#0f0f13", "#08080a"]);

  // Parallax elements
  const bgY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);
  const watermarkX = useTransform(smoothProgress, [0, 1], ["0%", "-10%"]);
  const watermarkOpacity = useTransform(smoothProgress, [0, 0.2, 1], [0.5, 0.1, 0.05]);

  return (
    <motion.section ref={targetRef} className="horizontal-cap" style={{ backgroundColor: bgColor }}>
      <div className="horizontal-cap__sticky">

        {/* Massive Animated Background Watermark */}
        <motion.div
          className="horizontal-cap__watermark"
          style={{ x: watermarkX, opacity: watermarkOpacity }}
        >
          CAPABILITIES
        </motion.div>

        {/* Ambient grain/mesh overlay */}
        <motion.div className="horizontal-cap__mesh" style={{ y: bgY }} />

        <div className="horizontal-cap__layout">
          {/* Left: Fixed Intro Text */}
          <div className="horizontal-cap__intro">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h2 className="hc-title">
                <span className="hc-title-line">Engineered</span>
                <span className="hc-title-line"><em>Excellence</em></span>
              </h2>
              <p className="hc-desc">
                We merge high-end editorial structures with deep technical implementations.
                Our modular approach ensures every facet of your platform operates autonomously and flawlessly.
              </p>
            </motion.div>
          </div>

          {/* Right: Scrolling Track */}
          <div className="horizontal-cap__viewport" ref={viewportRef}>
            <motion.div className="horizontal-cap__track" style={{ x }} ref={trackRef}>
              {capabilities.map((cap, idx) => (
                <CapabilityCard key={idx} cap={cap} idx={idx} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function CapabilityCard({ cap, idx }: { cap: any, idx: number }) {
  // 3D Parallax Tilt Effect on Hover
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -5; // Max 5 deg tilt
    const rotateYValue = ((x - centerX) / centerX) * 5;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className="hc-card"
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hc-card__inner">
        {/* Subtle glass reflection gradient */}
        <div className="hc-card__reflection" />

        <div className="hc-card__header">
          <span className="hc-card__num">{(idx + 1).toString().padStart(2, '0')}</span>
        </div>

        <div className="hc-card__body">
          <h3 className="hc-card__title">{cap.title}</h3>
          <p className="hc-card__desc">{cap.desc}</p>
        </div>

        <div className="hc-card__footer">
          <div className="hc-card__metric">
            <span className="hc-card__metric-val">{cap.metric}</span>
            <span className="hc-card__metric-label">{cap.metricLabel}</span>
          </div>
          <div className="hc-card__progress">
            <div className="hc-card__progress-fill" style={{ width: `${60 + ((idx * 13) % 40)}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
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
          <motion.span
            className="mt-label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            TECHNOLOGY STACK
          </motion.span>
          <motion.h2
            className="mt-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            The <em>Arsenal</em>
          </motion.h2>
          <motion.p
            className="mt-desc"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            An opinionated, high-performance tooling ecosystem.
            We architect systems using a deterministic stack ensuring scalable, immutable deployments.
          </motion.p>
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
   Capability Data Generator
   ───────────────────────────────────────────────── */
function getCapabilities(serviceTitle: string) {
  const titleLower = serviceTitle.toLowerCase();
  if (titleLower.includes('growth') || titleLower.includes('intelligence')) {
    return [
      { title: 'Predictive Analytics Engine', desc: 'Deploy machine learning models that forecast user behavior, churn risk, and revenue opportunities before they materialize.', metric: '340%', metricLabel: 'AVG ROI' },
      { title: 'Autonomous SEO Architecture', desc: 'Self-optimizing content systems that continuously adapt to algorithm shifts and competitive landscape changes.', metric: '12x', metricLabel: 'ORGANIC LIFT' },
      { title: 'Conversion Rate Optimization', desc: 'Multi-variant testing frameworks that systematically identify and eliminate friction across every user touchpoint.', metric: '89%', metricLabel: 'IMPROVEMENT' },
      { title: 'Real-Time Attribution', desc: 'End-to-end visibility across every channel, touchpoint, and conversion event with zero data loss.', metric: '100%', metricLabel: 'VISIBILITY' },
    ];
  }
  // Default fallback capabilities...
  return [
    { title: 'Strategic Architecture', desc: 'Purpose-built systems designed to scale with your business objectives and technical requirements.', metric: '10x', metricLabel: 'SCALABILITY' },
    { title: 'Precision Engineering', desc: 'Every line of code is optimized for performance, maintainability, and long-term evolution.', metric: '99.9%', metricLabel: 'RELIABILITY' },
    { title: 'Rapid Deployment', desc: 'From concept to production in record time with our battle-tested deployment pipelines.', metric: '2x', metricLabel: 'FASTER' },
    { title: 'Continuous Monitoring', desc: 'Systems that learn, adapt, and improve through data-driven iteration and feedback loops.', metric: '24/7', metricLabel: 'MONITORING' },
  ];
}

/* ─────────────────────────────────────────────────
   Service FAQs Section
   ───────────────────────────────────────────────── */
function ServiceFaqs({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenId(openId === index ? null : index);
  };

  return (
    <section className="home-faqs-section">
      <div className="home-faqs-glow" />

      <div className="home-faqs-container">
        <motion.div 
          className="home-faqs-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="home-faqs-title">
            Common <span>Questions</span>
          </h2>
          <p className="home-faqs-subtitle">Everything you need to know about this service.</p>
        </motion.div>

        <div className="home-faqs-list">
          {faqs.map((faq, index) => {
            const isOpen = openId === index;
            return (
              <motion.div 
                key={index} 
                className={`home-faq-item ${isOpen ? 'is-open' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1 * Math.min(index, 5) }}
              >
                <button 
                  className="home-faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <div className="home-faq-icon">
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="home-faq-answer-wrapper">
                        <div className="home-faq-answer-content">
                          {faq.answer.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   What You Get Section
   ───────────────────────────────────────────────── */
function WhatYouGetSection({
  heading,
  description,
  items,
}: {
  heading?: string | null;
  description?: string | null;
  items: { title: string; desc: string; icon_svg?: string }[];
}) {
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
          {items.map((item, idx) => (
            <motion.div 
              key={idx} 
              className="wyg-item"
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
