'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { sanitizeSvg } from '@/lib/sanitize';

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
}


/* ─────────────────────────────────────────────────
   Magnetic Button Component
   ───────────────────────────────────────────────── */
const MagneticButton = ({ children, href }: { children: React.ReactNode, href: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.a
      href={href}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="magnetic-btn"
    >
      {children}
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
    let particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; baseAlpha: number }> = [];
    const COUNT = 150;
    
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
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          baseAlpha: Math.random() * 0.5 + 0.1,
        });
      }
    };

    window.addEventListener('resize', resize);
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    });

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 3, 3, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let alpha = p.baseAlpha;
        if (dist < 200) {
          alpha = Math.min(1, alpha + (200 - dist) / 200);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.2 * (1 - dist/200)})`;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(168,85,247, ${alpha})`;
      }
      animId = requestAnimationFrame(draw);
    };
    
    resize();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="premium-service-sections" id="details">
      
      {/* ─────────────────────────────────────────────────
          SECTION 1.5: INFINITE TECH MARQUEE
          ───────────────────────────────────────────────── */}
      <TechMarquee techStack={techStack} />

      {/* ─────────────────────────────────────────────────
          SECTION 2: GLASSMORPHIC TECH STACK (KEPT)
          ───────────────────────────────────────────────── */}
      <section className="g-tech">
        <div className="g-tech__container">
          <div className="g-tech__header">
            <h2 className="k-heading">The <em>Stack</em></h2>
            <p className="k-sub">High-performance tooling ensuring scalable, immutable deployments.</p>
          </div>

          <div className="g-tech__grid">
            {techStack.filter(t => !t.svg || t.image_url).map((tech, idx) => (
              <GlassCard key={idx} tech={tech} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          SECTION 3: ELEVATED WORK SHOWCASE
          ───────────────────────────────────────────────── */}
      {relatedStudies.length > 0 && (
        <section className="showcase-section">
          <div className="showcase-header">
            <span className="k-label">DEPLOYED SYSTEMS</span>
            <h2 className="k-heading">Proven <em>Outcomes</em></h2>
          </div>

          <div className="showcase-grid">
            {relatedStudies.map((study, idx) => (
              <ShowcaseCard key={study.slug} study={study} idx={idx} />
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────
          SECTION 4: IMMERSIVE CTA (KEPT)
          ───────────────────────────────────────────────── */}
      <section className="k-cta" ref={ctaSectionRef}>
        <canvas ref={ctaCanvasRef} className="k-cta__canvas" />
        <div className="k-cta__overlay" />
        <motion.div 
          className="k-cta__content"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="k-cta__title">Initiate <em>Sequence</em></h2>
          <p className="k-cta__sub">Converge your fragmented systems into a singular, high-velocity platform.</p>
          <MagneticButton href="/contact">
            Deploy Now
          </MagneticButton>
        </motion.div>
      </section>

    </div>
  );
}

/* ─────────────────────────────────────────────────
   Sub-Components
   ───────────────────────────────────────────────── */

function TechMarquee({ techStack }: { techStack: TechItem[] }) {
  const logos = techStack.filter(t => t.svg || t.image_url);
  if (logos.length === 0) return null;

  return (
    <section className="tech-marquee-section">
      <div className="tech-marquee-header">
        <h3 className="tm-title">Tools we use</h3>
      </div>
      <div className="tech-marquee-container">
        <div className="tech-marquee-track">
          {[1, 2].map(group => (
            <div key={group} className="tech-marquee-group">
              {logos.map((tech, i) => (
                <div 
                  key={i} 
                  className="tm-logo" 
                  title={tech.name}
                >
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


function GlassCard({ tech, idx }: { tech: any, idx: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  const name = typeof tech === 'string' ? tech : tech.name;

  return (
    <motion.div 
      ref={cardRef}
      className="g-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div 
        className="g-card__glow"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(168,85,247,0.3) 0%, transparent 80%)`
        }}
      />
      <div className="g-card__content">
        <div className="g-card__icon-wrap">
          <span className="g-card__number">{(idx + 1).toString().padStart(2, '0')}</span>
        </div>
        <h3 className="g-card__name">{name}</h3>
      </div>
    </motion.div>
  );
}

function ShowcaseCard({ study, idx }: { study: any, idx: number }) {
  return (
    <Link href={`/work/${study.slug}`} className="showcase-card">
      <motion.div 
        className="showcase-card__inner"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="showcase-card__visual">
          <div className="showcase-card__img-wrap">
            {study.cover_image_url ? (
              <img 
                src={study.cover_image_url} 
                alt={study.title}
                className="showcase-card__img"
              />
            ) : (
              <div className="showcase-card__placeholder">
                <span>{study.title.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="showcase-card__hover-overlay">
            <span className="showcase-card__view-label">EXPLORE PROJECT</span>
            <svg className="showcase-card__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </div>
        </div>
        
        <div className="showcase-card__info">
          <span className="showcase-card__num">{(idx + 1).toString().padStart(2, '0')}</span>
          <h3 className="showcase-card__title">{study.title}</h3>
          {study.short_description && (
            <p className="showcase-card__desc">{study.short_description}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
