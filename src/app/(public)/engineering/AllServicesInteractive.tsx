'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Activity, ArrowLeft, ArrowRight } from 'lucide-react';
import type { ServiceCard } from '@/lib/types/database';
import { sanitizeSvg } from '@/lib/sanitize';
import './all-services.css';

interface AllServicesInteractiveProps {
  services: ServiceCard[];
  heroConfig?: any;
}

export default function AllServicesInteractive({ services, heroConfig }: AllServicesInteractiveProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = Math.max(1, services.length);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(totalSlides - 1, prev + 1));
  };

  // Canvas particle system
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let particles: Array<{ x: number, y: number, vx: number, vy: number, size: number, angle: number, radius: number, speed: number }> = [];
    const PARTICLE_COUNT = 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Create an orbital system
        const radius = Math.random() * (canvas.width * 0.4) + 100;
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1);
        
        particles.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.5 + 0.5,
          angle,
          radius,
          speed
        });
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.strokeStyle = 'rgba(168, 85, 247, 0.03)';
      ctx.lineWidth = 1;

      // Draw orbital rings
      [0.2, 0.3, 0.4].forEach(mult => {
        ctx.beginPath();
        ctx.arc(cx, cy, canvas.width * mult, 0, Math.PI * 2);
        ctx.stroke();
      });

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Orbital motion
        p.angle += p.speed;
        p.x = cx + Math.cos(p.angle) * p.radius;
        p.y = cy + Math.sin(p.angle) * p.radius;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${Math.random() * 0.5 + 0.2})`;
        ctx.fill();

        // Connect nearby particles to simulate a manifold
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${(150 - dist) / 150 * 0.15})`;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Frame motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="hub-page" ref={containerRef}>
      
      {/* Intro Sector */}
      <section className="hub-intro">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="hub-title">
            {heroConfig?.heading ? (
              <>
                {heroConfig.heading.split('\n')[0]}
                {heroConfig.heading.split('\n').length > 1 && (
                  <>
                    <br />
                    <em>{heroConfig.heading.split('\n').slice(1).join('\n')}</em>
                  </>
                )}
              </>
            ) : (
              <>
                Engineering<br /><em>The Future</em>
              </>
            )}
          </h1>
          <p className="hub-desc">
            {heroConfig?.subheading || "Explore our ecosystem of high-velocity platforms, autonomous AI systems, and scalable enterprise architectures designed to outperform the market."}
          </p>
        </motion.div>
      </section>

      {/* Dark Manifold Grid */}
      <section className="hub-grid-wrapper">
        <div className="hub-section-header">
          <h2 className="hub-section-title">Case Studies</h2>
          <p className="hub-section-desc">
            We clearly see our clients&apos; unique challenges and goals, and help them accelerate digital transformation efforts across every platform and engineering stack.
          </p>
        </div>

        <motion.div 
          className="hub-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div 
            className="hub-slider-track"
            style={{ '--slide-index': currentIndex } as React.CSSProperties}
          >
            {services.map((service, idx) => (
              <ServiceCardItem key={service.id} service={service} idx={idx} />
            ))}
          </div>
        </motion.div>

        <div className="hub-slider-nav">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className="hub-nav-btn prev-btn" 
            aria-label="Previous Slide"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="hub-nav-counter">
            {currentIndex + 1} / {totalSlides}
          </span>
          <button 
            onClick={handleNext} 
            disabled={currentIndex >= totalSlides - 1} 
            className="hub-nav-btn next-btn" 
            aria-label="Next Slide"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
      
    </div>
  );
}

function ServiceCardItem({ service, idx }: { service: ServiceCard, idx: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
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

  const slug = service.page_slug || service.id;
  const techStack = service.technology_stack as { name: string }[] | null;

  return (
    <motion.div 
      className="hub-slide-item"
      style={{ width: '596px', maxWidth: '100%', height: 'auto', display: 'flex', flexDirection: 'column' }}
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
      }}
    >
      <Link 
        href={`/engineering/${slug}`} 
        className="hub-card"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="hub-card-metric-bar" />
        
        <div 
          className="hub-card-glow"
          style={{ left: mousePos.x, top: mousePos.y }}
        />

        {/* Reflect exact images stored in the admin database with exact width 596 and height 300 */}
        {service.image_url && (
          <div className="hub-card-img-box">
            <Image
              src={service.image_url}
              alt={service.title || 'Engineering Service'}
              width={596}
              height={300}
              sizes="(max-width: 1024px) 100vw, 596px"
              style={{ width: '596px', height: '300px', minWidth: '596px', objectFit: 'cover' }}
              className="hub-card-img"
            />
          </div>
        )}

        <div className="hub-card-content">
          <div className="hub-card-stack">
            {techStack ? (
              techStack.slice(0, 4).map((tech, i) => (
                <span key={i} className="hub-stack-item">
                  {typeof tech === 'string' ? tech : tech.name}
                </span>
              ))
            ) : (
              // Add a generic fallback stack item if none defined to show capability
              <>
                <span className="hub-stack-item">High-Availability</span>
                <span className="hub-stack-item">Auto-Scaling</span>
              </>
            )}
          </div>

          <h2 
            className="hub-card-title"
            style={{ 
              color: '#FFFFFF'
            }}
          >
            {service.title}
          </h2>

          <div className="hub-card-footer">
            <span className="hub-card-btn">
              <span>Read More</span>
              <ArrowUpRight size={18} strokeWidth={2} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
