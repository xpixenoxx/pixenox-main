'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValue, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import type { Testimonial } from '@/lib/types/database';
import './FeedbackSection.css';

// Aesthetic Color Palette for different slides (RGB)
const THEME_COLORS = [
  { r: 147, g: 51, b: 234 },  // Royal Purple
  { r: 0, g: 229, b: 255 },   // Cyan / Health-tech
  { r: 16, g: 185, b: 129 },  // Emerald / Growth
  { r: 244, g: 63, b: 94 },   // Rose / Passion
  { r: 234, g: 179, b: 8 }    // Amber / Innovation
];

// Dynamic Client Network Engine

// ── Secondary Canvas Wrap: 3D Rotating Cyber-Globe ──
const SafeNetworkBg = ({ activeIndex }: { activeIndex: number }) => {
    // By tracking activeIndex inside a ref, we mutate the canvas without destroying the canvas context!
    const targetRef = useRef(0);
    useEffect(() => { targetRef.current = activeIndex; }, [activeIndex]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      let width = window.innerWidth;
      let height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
  
      let R = Math.min(width, height) * 0.45;
    const isMobile = width < 768;
    const NODE_COUNT = isMobile ? 80 : 150;
  
      const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        R = Math.min(width, height) * 0.45;
      };
      window.addEventListener('resize', resize);
  
      // Initialize nodes distributed across the surface of a 3D sphere
      const nodes = Array.from({ length: NODE_COUNT }).map(() => {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        
        return {
          x: R * Math.sin(phi) * Math.cos(theta),
          y: R * Math.sin(phi) * Math.sin(theta),
          z: R * Math.cos(phi),
          baseRadius: Math.random() * 1.5 + 0.5
        };
      });
  
      let animationId: number;
      let currentR = THEME_COLORS[0].r;
      let currentG = THEME_COLORS[0].g;
      let currentB = THEME_COLORS[0].b;
      
      const focalLength = 1200; // Z-space perspective mapping
  
      const render = () => {
        const targetColor = THEME_COLORS[targetRef.current % THEME_COLORS.length];
        currentR += (targetColor.r - currentR) * 0.05;
        currentG += (targetColor.g - currentG) * 0.05;
        currentB += (targetColor.b - currentB) * 0.05;
  
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1;
  
        // Globe Axis Rotation speeds
        const angleX = 0.0015;
        const angleY = 0.0025;
  
        // Apply 3D Matrix Projection
        const projectedNodes = nodes.map(node => {
          // 1. Rotate Node vertically (X axis matrix)
          const y1 = node.y * Math.cos(angleX) - node.z * Math.sin(angleX);
          const z1 = node.y * Math.sin(angleX) + node.z * Math.cos(angleX);
          node.y = y1;
          node.z = z1;
  
          // 2. Rotate Node horizontally (Y axis matrix)
          const x2 = node.x * Math.cos(angleY) - node.z * Math.sin(angleY);
          const z2 = node.x * Math.sin(angleY) + node.z * Math.cos(angleY);
          node.x = x2;
          node.z = z2;
  
          // 3. Project to 2D Surface Screen
          const scale = focalLength / (focalLength + node.z);
          // Offset the globe to center-right so it rests behind the Author column
          const px = (width * 0.65) + (node.x * scale); 
          const py = (height * 0.5) + (node.y * scale);
          
          return { ...node, px, py, scale };
        });
  
        // Sort from back to front (Painter's Algorithm)
        projectedNodes.sort((a, b) => b.z - a.z);
  
        // Physical geometry threshold
        const connScale = R * 0.35;
  
        for (let i = 0; i < projectedNodes.length; i++) {
          const n1 = projectedNodes[i];
          
          // Fade calculation: Front is visible, back of globe fades to black
          const fade1 = Math.max(0.05, (R - n1.z) / (2 * R));
          
          // Draw connection mesh vectors
          for (let j = i + 1; j < projectedNodes.length; j++) {
            const n2 = projectedNodes[j];
            
            // Absolute 3D distance between nodes on the sphere surface
            const dist = Math.sqrt(
              Math.pow(n1.x - n2.x, 2) + 
              Math.pow(n1.y - n2.y, 2) + 
              Math.pow(n1.z - n2.z, 2)
            );
  
            if (dist < connScale) {
              const fade2 = Math.max(0.05, (R - n2.z) / (2 * R));
              const lineAlpha = ((fade1 + fade2) / 2) * (1 - dist/connScale) * 0.6;
              
              if (lineAlpha > 0.02) {
                ctx.beginPath();
                ctx.moveTo(n1.px, n1.py);
                ctx.lineTo(n2.px, n2.py);
                ctx.strokeStyle = `rgba(${Math.round(currentR)}, ${Math.round(currentG)}, ${Math.round(currentB)}, ${lineAlpha})`;
                ctx.stroke();
              }
            }
          }
  
          // Draw the physical node dots
          if (fade1 > 0.05) {
            ctx.beginPath();
            ctx.arc(n1.px, n1.py, n1.baseRadius * n1.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${Math.round(currentR)}, ${Math.round(currentG)}, ${Math.round(currentB)}, ${fade1 * 0.9})`;
            ctx.fill();
          }
        }
  
        animationId = requestAnimationFrame(render);
      };
  
      render();
  
      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resize);
      };
    }, []); // Empty dependency array ensures it NEVER remounts.
  
    return <canvas ref={canvasRef} className="client-network-canvas" />;
};


interface FeedbackSectionProps {
  initialTestimonials?: Testimonial[];
}

export default function FeedbackSection({ initialTestimonials }: FeedbackSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials ?? []);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // High-End Scroll Tracking Hook
  const containerRef = useRef<HTMLDivElement>(null);
  const slideWrapRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // ── Physics-Driven 3D Matrix Mapping ──
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Tactical damping springs for smooth hardware-accelerated return-to-center tracking
  const springConfig = { damping: 20, stiffness: 120, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!slideWrapRef.current) return;
    const rect = slideWrapRef.current.getBoundingClientRect();
    // Calculate relative mapped coordinates -0.5 to 0.5
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    // Snap back to 0 perfectly
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    async function load() {
      if (!initialTestimonials?.length) {
        const { data } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_visible', true)
          .order('priority', { ascending: true });
        if (data) setTestimonials(data as Testimonial[]);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync scroll tracker mathematically into the index array
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (testimonials.length <= 1) return;
    const nextIndex = Math.min(
      Math.floor(latest * testimonials.length),
      testimonials.length - 1
    );
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  });

  // Fix: Framer Motion throws if a target ref isn't attached to a DOM node during render.
  if (!testimonials.length) {
    return <div ref={containerRef} style={{ display: 'none' }} />;
  }
  const current = testimonials[activeIndex];

  // Derive mockup tactical tags from the client's company string
  let tags = ['TARGETING', 'DEPLOYMENT'];
  if (current.company) {
     const split = current.company.split(' ');
     if (split.length >= 2) {
         tags = [split[0].substring(0, 10).toUpperCase(), split[1].substring(0, 10).toUpperCase()];
     } else {
         tags = [current.company.substring(0, 10).toUpperCase(), 'SYSTEM'];
     }
  }

  // Get active UI colors directly resolving out of the timeline palette map
  const activeColorStr = `rgb(${THEME_COLORS[activeIndex % THEME_COLORS.length].r}, ${THEME_COLORS[activeIndex % THEME_COLORS.length].g}, ${THEME_COLORS[activeIndex % THEME_COLORS.length].b})`;

  return (
    // Increased sensitivity: requires far less scroll distance to cycle through testimonials
    <div ref={containerRef} className="client-scroll-track" style={{ height: `${testimonials.length * 60}vh` }}>
      
      {/* Locked / Sticky Viewport */}
      <section className="client-sec" aria-label="What Our Clients Say" id="clients">
        
        {/* Immersive Deep Background Web - Persistently mutating state via useRef */}
        <SafeNetworkBg activeIndex={activeIndex} />

        {/* Main Structural UX - 3D Perspective Matrix */}
        <div style={{ perspective: '1500px' }} className="client-container">
          <AnimatePresence mode="wait">
            <motion.div
              ref={slideWrapRef}
              key={activeIndex}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              // Changed animation type to a Horizontal Spring-Physics Spatial Wipe
              initial={{ opacity: 0, x: 250, scale: 0.85, filter: 'blur(12px)', rotateZ: 2 }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', rotateZ: 0 }}
              exit={{ opacity: 0, x: -250, scale: 0.85, filter: 'blur(12px)', rotateZ: -2 }}
              transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d', // Projects children physically into Z-space
              }}
              className="client-slide-wrapper"
            >
              {/* Left Col: Giant Typography Structure */}
              <div className="client-quote-col" style={{ transform: 'translateZ(40px)' }}>
                <span className="client-quote-mark" style={{ color: activeColorStr, transform: 'translateZ(-20px)' }}>&ldquo;</span>
                <h2 className="client-quote-text" style={{ textShadow: `0 20px 40px rgba(0,0,0,0.5)` }}>
                  {current.review_text}
                </h2>
              </div>

              {/* Right Col: Tactical Author Interface */}
              <div className="client-author-col" style={{ transform: 'translateZ(60px)' }}>
                {current.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={current.avatar_url} 
                    alt={current.reviewer_name} 
                    className="client-avatar" 
                    style={{ borderColor: activeColorStr, boxShadow: `0 0 35px ${activeColorStr}`, transform: 'translateZ(30px)' }}
                  />
                )}
                <div className="client-meta" style={{ transform: 'translateZ(20px)' }}>
                  <div className="client-name">{current.reviewer_name}</div>
                  <div className="client-title">{current.reviewer_title}</div>
                  <div className="client-tags" style={{ transform: 'translateZ(10px)' }}>
                    {tags.map((tag, i) => (
                       <span 
                         key={i} 
                         className="client-tag"
                         style={{ 
                           color: activeColorStr, 
                           borderColor: activeColorStr, 
                           backgroundColor: activeColorStr.replace('rgb', 'rgba').replace(')', ', 0.1)')
                         }}
                       >
                         {tag}
                       </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Bottom Tracker Mapping */}
        <div className="client-tracker">
          <span className="client-tracker-current">
            {(activeIndex + 1).toString().padStart(2, '0')}
          </span>
          <span className="client-tracker-total">
            / {testimonials.length.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Right Edge Navigation Mapping */}
        <div className="client-dots-vert">
          {testimonials.map((_, i) => (
            <div 
               key={i} 
               className={`client-dot ${i === activeIndex ? 'active' : ''}`}
               style={{ 
                 backgroundColor: i === activeIndex ? activeColorStr : '#3f3f46',
                 boxShadow: i === activeIndex ? `0 0 10px ${activeColorStr}` : 'none',
                 transform: i === activeIndex ? 'scale(1.4)' : 'scale(1)'
               }}
            />
          ))}
        </div>

        <div className="client-watermark">WHAT PEOPLE SAY</div>
      </section>
    </div>
  );
}
