'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import { ArrowRight } from 'lucide-react';
import type { HeroSettings } from '@/lib/types/database';
import './HeroSection.css';

interface HeroSectionProps {
  initialData?: HeroSettings | null;
}

export default function HeroSection({ initialData }: HeroSectionProps) {
  const [hero, setHero] = useState<HeroSettings | null>(initialData ?? null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const controls = useAnimation();
  const inView = useInView(sectionRef, { once: true, margin: '-20%' });

  // 1. Data Fetching
  useEffect(() => {
    async function load() {
      if (!initialData) {
        const { data } = await supabase.from('hero_settings').select('*').limit(1).single();
        if (data) setHero(data as HeroSettings);
      }
    }
    load();

    const ch = supabase
      .channel('hero_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_settings' }, (payload) => {
        if (payload.new) setHero(payload.new as HeroSettings);
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Trigger Main Animations
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // 3. Premium Interactive WebGL-style Canvas (Magnetic Swarm)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let particles: Array<{x:number;y:number;vx:number;vy:number;size:number;baseX:number;baseY:number}> = [];

    // Performance: reduce particles on mobile
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 60 : 150;
    const CONNECTION_DISTANCE = isMobile ? 80 : 120;
    const MOUSE_RADIUS = 200;

    const mouse = { x: -1000, y: -1000 };

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      particles = [];
      if (!canvas) return;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push({
          x, y,
          baseX: x, baseY: y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    }

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    // Pause canvas when tab is hidden (performance)
    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) animId = requestAnimationFrame(animate);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    window.addEventListener('mousemove', handleMouseMove);
    sectionRef.current?.addEventListener('mouseleave', handleMouseLeave);

    function animate() {
      if (!ctx || !canvas || !isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse Magnetism
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS) {
          const forceDirectionX = dx / dist;
          const forceDirectionY = dy / dist;
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.x -= forceDirectionX * force * 2;
          p.y -= forceDirectionY * force * 2;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${Math.random() * 0.5 + 0.2})`;
        ctx.fill();

        // Constellation Lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = 1 - (dist2 / CONNECTION_DISTANCE);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * 0.15})`;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (!hero) return null;

  // 4. Typography Stagger
  const headlineWords = hero.headline.split(' ');
  const italicKeywords = ['digital', 'solutions', 'future', 'ai', 'architect', 'ranking', 'growth', 'seo', 'geo'];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const wordWrapVariants = {
    hidden: { y: '120%', rotateZ: 3, opacity: 0 },
    visible: {
      y: '0%',
      rotateZ: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section ref={sectionRef} className="hero">
      {/* Structural Background Watermark — decorative, not heading */}
      <div className="hero__watermark" aria-hidden="true">PIXENOX</div>
      <div className="hero__aurora-1" />
      <div className="hero__aurora-2" />

      {/* 3D Noise Sphere */}
      <div className="hero__noise-sphere" aria-hidden="true">
        <div className="hero__noise-sphere-texture hero__noise-sphere-texture--back" />
        <div className="hero__noise-sphere-texture hero__noise-sphere-texture--front" />
      </div>

      <canvas ref={canvasRef} className="hero__canvas" />

      {/* Main Structural Layout */}
      <div className="hero__layout container">

        {/* CENTER: Headline — uses h1 for SEO (was h2 originally) */}
        <div className="hero__center">
          <motion.h1
            className="hero__headline"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            style={{
              fontFamily: hero.headline_font_family,
              color: hero.headline_color
            }}
          >
            {headlineWords.map((word, i) => {
              const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
              const isSerif = italicKeywords.includes(cleanWord);

              return (
                <span key={i} className="hero__word--wrapper">
                  <motion.span
                    variants={wordWrapVariants}
                    className={isSerif ? 'hero__word--serif' : ''}
                  >
                    {word}
                  </motion.span>
                </span>
              );
            })}
          </motion.h1>
        </div>

        {/* BOTTOM: Split Architecture */}
        <div className="hero__bottom">

          <motion.div
            className="hero__info"
            initial={{ opacity: 0, y: 30 }}
            animate={controls}
            variants={{
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 1, ease: "easeOut", delay: 0.8 }
              }
            }}
          >
            <p className="hero__subheadline" style={{ fontFamily: hero.subheadline_font_family }}>
              {hero.subheadline}
            </p>

            <div className="hero__cta-wrapper">
              <a href={hero.cta_url} className="hero__cta">
                {hero.cta_text || 'Get Started'}
                <ArrowRight size={18} strokeWidth={2.5} />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="hero__stats"
            initial={{ opacity: 0, x: 30 }}
            animate={controls}
            variants={{
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 1, ease: "easeOut", delay: 1.1 }
              }
            }}
          >
            <div className="hero__stat">
              <span className="hero__stat-val">50+</span>
              <span className="hero__stat-label">Projects Deployed</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-val">100%</span>
              <span className="hero__stat-label">Client Satisfaction</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-val">24/7</span>
              <span className="hero__stat-label">Global Support</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
