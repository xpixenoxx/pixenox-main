'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useReducedMotion } from 'framer-motion';
import '@/components/home/HeroSection.css';

interface ServiceAnimatedHeaderProps {
  title: string;
  description: string | null;
  titleColor: string | null;
  descColor: string | null;
}

export default function ServiceAnimatedHeader({
  title,
  description,
  titleColor,
  descColor,
}: ServiceAnimatedHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimation();
  const inView = useInView(containerRef, { once: true });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Premium Interactive WebGL-style Canvas (Magnetic Swarm)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let particles: Array<{ x: number, y: number, vx: number, vy: number, size: number, alpha: number }> = [];
    const PARTICLE_COUNT = window.matchMedia('(max-width: 1024px)').matches ? 48 : 84;
    const CONNECTION_DISTANCE = 120;
    const MOUSE_RADIUS = 200;

    const mouse = { x: -1000, y: -1000 };

    function resize() {
      if (!canvas || !container) return;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      initParticles();
    }

    function initParticles() {
      particles = [];
      if (!canvas) return;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.5 + 0.2,
        });
      }
    }

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0 && dist < MOUSE_RADIUS) {
          const forceDirectionX = dx / dist;
          const forceDirectionY = dy / dist;
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.x -= forceDirectionX * force * 2;
          p.y -= forceDirectionY * force * 2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();

        for (let j = i; j < particles.length; j++) {
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
      container?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [prefersReducedMotion]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const wordWrapVariants = {
    hidden: { y: '120%', rotateZ: 3, opacity: 0 },
    visible: { y: '0%', rotateZ: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  const descVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" as const, delay: 0.4 } }
  };

  const titleWords = title.split(' ');
  const accentKeywords = ['systems', 'count', 'on', 'developers', 'intelligence'];

  return (
    <>
      {/* Precision 3D Noise Sphere (Quantum Anomaly Orbit) */}
      <div className="hero__sphere-system" aria-hidden="true">
        <div className="hero__orbit-ring" />
        <div className="hero__orbit-ring hero__orbit-ring--2" />
        <div className="hero__noise-sphere">
          <div className="hero__noise-sphere-texture hero__noise-sphere-texture--back" />
          <div className="hero__noise-sphere-texture hero__noise-sphere-texture--front" />
          <div className="hero__sphere-highlight" />
        </div>
      </div>

      <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />

      <div className="all-srv-header" ref={containerRef}>
        <div className="all-srv-header-content">
          <motion.h1 
            className="all-srv-title"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {titleWords.map((word, i) => {
              const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
              const isAccent = accentKeywords.includes(cleanWord);

              return (
                <span key={i} style={{ display: 'inline-flex', overflow: 'hidden', paddingBottom: '0.12em', marginRight: '0.22em' }}>
                  <motion.span 
                    variants={wordWrapVariants}
                    className={isAccent ? 'all-srv-title-accent' : ''}
                  >
                    {word}
                  </motion.span>
                </span>
              );
            })}
          </motion.h1>

          <motion.div 
            className="all-srv-cta-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <a href="#details" className="all-srv-cta">
              <span>Read more</span>
            </a>
          </motion.div>

          {description && (
            <motion.p 
              className="all-srv-desc"
              variants={descVariants}
              initial="hidden"
              animate={controls}
              style={{ color: descColor || undefined }}
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
    </>
  );
}
