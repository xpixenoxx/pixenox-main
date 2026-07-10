'use client';

import React, { useEffect, useState, useRef, MouseEvent } from 'react';
import { motion, useInView } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import Skeleton from '@/components/ui/Skeleton';
import type { WhyChooseUsConfig, WhyChooseUsItem } from '@/lib/types/database';
import './WhyChooseUs.css';

interface WhyChooseUsProps {
  initialConfig?: WhyChooseUsConfig | null;
  initialItems?: WhyChooseUsItem[];
}

// ── Hacker Cipher Decoder Module ──
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789><//\\{}[]';
const CipherText = ({ target, trigger }: { target: string; trigger: boolean }) => {
  const [text, setText] = useState(target);

  useEffect(() => {
    if (!trigger) {
      const initialTxt = target.replace(/[A-Za-z]/g, '0');
      requestAnimationFrame(() => setText(initialTxt));
      return;
    }
    let iteration = 0;
    const interval = setInterval(() => {
      setText(
        target
          .split('')
          .map((letter, index) => {
            if (index < iteration || letter === ' ') return target[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      if (iteration >= target.length) clearInterval(interval);
      iteration += 1 / 2; // Decrypt speed
    }, 40);

    return () => clearInterval(interval);
  }, [target, trigger]);

  return <>{text}</>;
};

// ── Flowing Wave Assembly Typography (Lightweight CSS-based) ──
const FlowingBackwardsText = ({ text, trigger }: { text: string; trigger: boolean }) => {
  const chars = text.split('');
  const total = chars.length;

  return (
    <span style={{ display: 'inline-block' }}>
      {chars.map((char, i) => {
        const backwardDelay = 0.5 + ((total - 1 - i) * 0.015);

        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={trigger ? { 
              opacity: 1, 
              x: 0,
            } : {}}
            transition={{
              opacity: { duration: 0.4, delay: backwardDelay },
              x: { type: 'spring', damping: 10, delay: backwardDelay },
            }}
            style={{ 
              display: 'inline-block', 
              whiteSpace: char === ' ' ? 'pre' : 'normal'
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
};

// ── Strict Canvas Particle Engine (Dot Assesmbler) ──
const ParticleHeading = ({ text, trigger, color }: { text: string; trigger: boolean; color: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = 1200; 
    const height = 160;
    canvas.width = width;
    canvas.height = height;

    const fontSize = text.length > 20 ? 60 : 90;
    ctx.font = `900 ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Draw text bounds invisible payload
    ctx.clearRect(0, 0, width, height);
    ctx.fillText(text, width / 2, height / 2);

    const imgData = ctx.getImageData(0, 0, width, height).data;
    const particles: {x: number, y: number, baseX: number, baseY: number, vx: number, vy: number, size: number}[] = [];
    const gap = 5; // Matrix mapping density (larger = fewer particles = better perf)
    
    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        const alpha = imgData[(y * width + x) * 4 + 3];
        if (alpha > 128) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height + height,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.5 + 1
          });
        }
      }
    }

    let animationFrameId: number;
    const mouse = { x: -1000, y: -1000, radius: 40 };

    const handleMouse = (e: globalThis.MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouse.x = (e.clientX - rect.left) * scaleX;
      mouse.y = (e.clientY - rect.top) * scaleY;
    };
    const handleLeave = () => { mouse.x = -1000; mouse.y = -1000; };

    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleLeave);

    let isIntersecting = true;
    let isDocVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isIntersecting = entries[0].isIntersecting;
      if (isIntersecting && isDocVisible) animationFrameId = requestAnimationFrame(render);
    }, { threshold: 0 });
    observer.observe(canvas);

    const handleVisibility = () => {
      isDocVisible = !document.hidden;
      if (isDocVisible && isIntersecting) animationFrameId = requestAnimationFrame(render);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (!isIntersecting || !isDocVisible) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color || 'var(--color-text-primary)fff';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        
        // Anti-Gravity Repulsion field
        if (distMouse < mouse.radius) {
          const force = (mouse.radius - distMouse) / mouse.radius;
          p.vx -= (dxMouse / distMouse) * force * 5;
          p.vy -= (dyMouse / distMouse) * force * 5;
        }

        // Kinetic Tether
        const dx = p.baseX - p.x;
        const dy = p.baseY - p.y;
        p.vx += dx * 0.08;
        p.vy += dy * 0.08;
        
        p.vx *= 0.75;
        p.vy *= 0.75;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleLeave);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [text, trigger, color]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'block', width: '100%', maxWidth: '1200px', height: '100%', cursor: 'crosshair', margin: '0 auto' }} 
      aria-label={text}
    />
  );
};

export default function WhyChooseUs({ initialConfig, initialItems }: WhyChooseUsProps) {
  const [config, setConfig] = useState<WhyChooseUsConfig | null>(initialConfig ?? null);
  const [items, setItems] = useState<WhyChooseUsItem[]>(initialItems ?? []);
  
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-20%' });

  // Load backend configs dynamically
  useEffect(() => {
    async function load() {
      if (!initialConfig) {
        const { data } = await supabase.from('why_choose_us_config').select('*').limit(1).maybeSingle();
        if (data) setConfig(data as WhyChooseUsConfig);
      }
      if (!initialItems?.length) {
        const { data } = await supabase.from('why_choose_us').select('*').order('priority', { ascending: true });
        if (data) setItems(data as WhyChooseUsItem[]);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Structural Mouse Physics (Spotlight + Parallax Tilt)
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Flashlight coordinates
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);

    // 3D Tilt calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12; // 12deg tilt
    const rotateY = ((x - centerX) / centerX) * 12;

    e.currentTarget.style.setProperty('--tilt-x', `${rotateX}deg`);
    e.currentTarget.style.setProperty('--tilt-y', `${rotateY}deg`);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--tilt-x', `0deg`);
    e.currentTarget.style.setProperty('--tilt-y', `0deg`);
  };

  const toHex = (val: number) => '0x' + Math.floor(val * 255).toString(16).toUpperCase().padStart(2, '0');

  if (!config && !items.length) {
    return (
      <section className="why-choose" aria-label="Why choose us loading">
        <div className="container">
          <Skeleton width="300px" height="40px" style={{ margin: '0 auto 48px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Pre-compiled HUD Telemetry aesthetics mapping to the specific array indexes 
  const telemetryData = [
    { s1: 'INTEL', s2: 'SPEED', v1: 0.95, v2: 0.88, color: '#9333ea', glow: 'rgba(147, 51, 234, 0.6)' }, // Purple
    { s1: 'POWER', s2: 'ARMOR', v1: 1.0, v2: 0.92, color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' }, // Violet
    { s1: 'LOGIC', s2: 'AGILE', v1: 0.94, v2: 0.99, color: '#6d28d9', glow: 'rgba(109, 40, 217, 0.6)' }, // Deep Purple
    { s1: 'THRT', s2: 'SYNC', v1: 0.82, v2: 0.97, color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)' }, // Bright Purple
  ];

  return (
    <section ref={sectionRef} className="why-choose" aria-label="Tactical HUD Layout" id="why-choose-us">
      
      {/* Dynamic 3D Matrix Infinite Floor Grid */}
      <div className="why-choose__tactical-grid" />
      
      {/* Structural Macro Text */}
      <div className="why-choose__bg-text" aria-hidden="true">
        {config?.section_heading || 'WHY\nCHOOSE'}
      </div>

      <div className="container">
        
        {/* Core Settings DB Heading Block with Extreme HUD Execution */}
        {config?.section_heading && (
          <motion.div 
            className="m-cmd-header-wrapper" 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-20%' }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
          >


            {/* Intense Particle Dots Assembling Title */}
            <div style={{ width: '100%', height: '160px', position: 'relative' }}>
              <ParticleHeading 
                text={config.section_heading} 
                trigger={inView}
                color={config.heading_color}
              />
            </div>
            
            {/* Natural Wave Subtitle */}
            {config.section_subheading && (
              <motion.div 
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.6, delay: 0.8 } }
                }}
                style={{
                  color: config.sub_color,
                  fontSize: '1.05rem',
                  lineHeight: '1.7',
                  maxWidth: '700px',
                  marginTop: '16px',
                  textAlign: 'center'
                }}
              >
                <FlowingBackwardsText text={config.section_subheading} trigger={inView} />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Render UI architecture natively */}
        <div className="hud-layout">
          {items.map((item, idx) => {
            const tel = telemetryData[idx % telemetryData.length];
            return (
              <div 
                key={item.id} 
                className="hud-panel" 
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ 
                  '--hud-accent': tel.color,
                  '--hud-accent-glow': tel.glow 
                } as React.CSSProperties}
              >
                {/* 4 Point Tactical Crosshairs */}
                <div className="crosshair ch-tl" />
                <div className="crosshair ch-tr" />
                <div className="crosshair ch-bl" />
                <div className="crosshair ch-br" />

                {/* HUD Header Stream */}
                <div className="hud-top-meta">
                  <span className="hud-lvl">LVL_0{idx + 1}</span>
                  <span className="hud-target">{'// '}{item.stat || 'OPERATIVE'}</span>
                </div>

                {/* The React Cipher Decrypt UI */}
                <h3 className="hud-maintitle">
                  <CipherText target={item.label.toUpperCase()} trigger={inView} />
                </h3>

                {/* Telemetry Readouts (RPC stats mapped to physics) */}
                <div className="hud-telemetry">
                  <div className="hud-bar-row">
                    <span className="hud-bar-label">{tel.s1}</span>
                    <div className="hud-bar-track">
                      <motion.div 
                        className="hud-bar-fill"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${tel.v1 * 100}%` } : { width: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 + (idx * 0.1) }}
                      />
                    </div>
                    <span className="hud-bar-val">{toHex(tel.v1)}</span>
                  </div>
                  
                  <div className="hud-bar-row">
                    <span className="hud-bar-label">{tel.s2}</span>
                    <div className="hud-bar-track">
                      <motion.div 
                        className="hud-bar-fill"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${tel.v2 * 100}%` } : { width: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 + (idx * 0.1) }}
                      />
                    </div>
                    <span className="hud-bar-val">{toHex(tel.v2)}</span>
                  </div>
                </div>

                {/* Retro Descriptive Log */}
                <p className="hud-terminal-desc">
                  {item.description}
                </p>

                {/* Optional Final Execute Trigger */}
                {idx === items.length - 1 && (
                  <a href={config?.cta_url || '/contact'} className="hud-execute-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    {config?.cta_text || 'EXECUTE PROTOCOL'}
                  </a>
                )}
                
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
