'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import Skeleton from '@/components/ui/Skeleton';
import Image from 'next/image';
import type { ServiceCard, CardTool, SectionConfig, ServicesLayout } from '@/lib/types/database';
import { sanitizeSvg } from '@/lib/sanitize';
import './ServicesSection.css';

interface ServicesSectionProps {
  initialCards?: ServiceCard[];
  initialTools?: CardTool[];
  initialConfig?: SectionConfig | null;
  initialLayout?: ServicesLayout | null;
}

export default function ServicesSection({
  initialCards,
  initialTools,
  initialConfig,
  initialLayout,
}: ServicesSectionProps) {
  const router = useRouter();
  const [cards, setCards] = useState<ServiceCard[]>(initialCards ?? []);
  const [tools, setTools] = useState<CardTool[]>(initialTools ?? []);
  const [config, setConfig] = useState<SectionConfig | null>(initialConfig ?? null);
  const [layout, setLayout] = useState<ServicesLayout | null>(initialLayout ?? null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    async function load() {
      if (!initialCards?.length) {
        const { data } = await supabase.from('services_cards').select('*').order('priority', { ascending: true });
        if (data) setCards(data as ServiceCard[]);
      }
      if (!initialTools?.length) {
        const { data } = await supabase.from('card_tools').select('*');
        if (data) setTools(data as CardTool[]);
      }
      if (!initialConfig) {
        const { data } = await supabase.from('section_config').select('*').eq('section_key', 'services').limit(1).maybeSingle();
        if (data) setConfig(data as SectionConfig);
      }
      if (!initialLayout) {
        const { data } = await supabase.from('services_layout').select('*').limit(1).maybeSingle();
        if (data) setLayout(data as ServicesLayout);
      }
    }
    load();
  }, [initialCards, initialConfig, initialLayout, initialTools]);

  // No auto-activate on load - cards stay inactive until hovered.


  // Pointer Drag-to-Scroll for Horizontal Mode
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  const visibleCards = cards.filter((c) => c.is_visible);
  const getCardTools = (cardId: string) => tools.filter((t) => t.card_id === cardId).slice(0, 4);

  if (!cards.length) {
    return (
      <section className="services section" aria-label="Services loading">
        <div className="container">
          <Skeleton width="300px" height="40px" style={{ marginBottom: '48px' }} />
          <div className="services__accordion services__accordion--vertical" style={{ "--cols": 3 } as React.CSSProperties}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ flex: i === 1 ? 3 : 1, borderRadius: '24px' }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const headingWords = config?.heading ? config.heading.split(' ') : ['Platform', 'Ecosystem'];
  const headingWord1 = headingWords[0] || 'Platform';
  const headingWord2 = headingWords.slice(1).join(' ') || 'Ecosystem';

  const isHorizontal = layout?.layout_type === 'horizontal';

  return (
    <section className="services section" aria-label="Our Services" id="services">
      <div className="container" style={{ maxWidth: '1600px', padding: '0 4vw' }}>

        {/* Section Heading */}
        <motion.div
          className="services__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className="services__heading"
            style={{
              color: config?.heading_color,
            }}
          >
            {headingWord1}{' '}
            <span className="services__word--serif">{headingWord2}</span>
          </h2>
          {config?.subheading && (
            <p
              className="services__subheading"
              style={{
                color: config.subheading_color,
              }}
            >
              {config.subheading}
            </p>
          )}
        </motion.div>

        {/* Interactive Cards Layout (Max 3 per row) */}
        <div className="services__accordion-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Array.from({ length: Math.ceil(visibleCards.length / 3) }).map((_, rowIdx) => {
            const rowCards = visibleCards.slice(rowIdx * 3, rowIdx * 3 + 3);

            return (
              <div
                key={`row-${rowIdx}`}
                className={`services__accordion ${isHorizontal ? 'services__accordion--horizontal' : 'services__accordion--vertical'}`}
                ref={rowIdx === 0 ? scrollRef : undefined}
                style={{ "--cols": rowCards.length } as React.CSSProperties}
                onPointerDown={isHorizontal ? handlePointerDown : undefined}
                onPointerMove={isHorizontal ? handlePointerMove : undefined}
                onPointerUp={isHorizontal ? handlePointerUp : undefined}
                onPointerLeave={(e) => {
                  if (isHorizontal) handlePointerUp();
                  setActiveId(null);
                }}
                role="list"
              >
                <AnimatePresence mode="popLayout">
                  {rowCards.map((card, idx) => {
                    const globalIdx = rowIdx * 3 + idx;
                    const isActive = activeId === card.id;

                    let features: string[] = [];
                    if (card.what_you_get_items && Array.isArray(card.what_you_get_items) && card.what_you_get_items.length > 0) {
                      features = card.what_you_get_items.map((item: any) => item.title).filter(Boolean);
                    } else if (card.subheading) {
                      features = card.subheading.split(',').map(s => s.trim()).filter(Boolean);
                    } else {
                      features = ['System Architecture', 'Performance Scaling', 'API Integration'];
                    }
                    features = features.slice(0, 4); // Limit to top 4 services

                    return (
                      <motion.div
                        key={card.id}
                        layout="position"
                        className={`service-card ${isActive ? 'service-card--active' : ''}`}
                        onMouseEnter={() => setActiveId(card.id)}
                        onMouseLeave={() => setActiveId(null)}
                        onClick={() => router.push(`/services/${card.page_slug}`)}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-5%' }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 }}
                      >
                        {/* Background Image (Inactive State) */}
                        <div className="service-card__bg">
                          {card.image_url && (
                            <Image
                              src={card.image_url}
                              alt={card.title || "Service Background"}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              style={{ objectFit: 'cover' }}
                            />
                          )}
                          
                          {/* Reveal Overlays */}
                          {idx === 0 && (
                            <motion.div 
                              style={{ position: 'absolute', inset: 0, backgroundColor: '#08080c', originX: 0 }}
                              initial={{ scaleX: 1 }}
                              whileInView={{ scaleX: 0 }}
                              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 + (idx * 0.1) }}
                              viewport={{ once: true, margin: '-10%' }}
                            />
                          )}
                          {idx === 2 && (
                            <motion.div 
                              style={{ position: 'absolute', inset: 0, backgroundColor: '#08080c', originX: 1 }}
                              initial={{ scaleX: 1 }}
                              whileInView={{ scaleX: 0 }}
                              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 + (idx * 0.1) }}
                              viewport={{ once: true, margin: '-10%' }}
                            />
                          )}
                          {idx === 1 && (
                            <>
                              <motion.div 
                                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', backgroundColor: '#08080c', originX: 1 }}
                                initial={{ scaleX: 1 }}
                                whileInView={{ scaleX: 0 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 + (idx * 0.1) }}
                                viewport={{ once: true, margin: '-10%' }}
                              />
                              <motion.div 
                                style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', backgroundColor: '#08080c', originX: 0 }}
                                initial={{ scaleX: 1 }}
                                whileInView={{ scaleX: 0 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 + (idx * 0.1) }}
                                viewport={{ once: true, margin: '-10%' }}
                              />
                            </>
                          )}
                        </div>
                        <div className="service-card__bg-overlay" />

                        {/* Top Bar */}
                        <div className="service-card__top">
                          {isActive ? (
                            <motion.h3
                              layoutId={`title-${card.id}`}
                              className="service-card__title"
                            >
                              {card.title}
                            </motion.h3>
                          ) : (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="service-card__num"
                            >
                              {String(globalIdx + 1).padStart(2, '0')}
                            </motion.span>
                          )}
                          <span className="service-card__arrow">
                            <ArrowUpRight size={32} strokeWidth={1.5} />
                          </span>
                        </div>

                        {/* Middle Description */}
                        <div className="service-card__middle">
                          {isActive && (
                            <p className="service-card__desc">
                              {card.subheading}
                            </p>
                          )}
                        </div>

                        {/* Bottom Elements */}
                        <div className="service-card__bottom">
                          {isActive ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="service-card__extras"
                            >
                              {/* Features */}
                              <div className="extras-col">
                                <h4>Services</h4>
                                <ul className="features-list">
                                  {features.map((f, i) => <li key={i}>{f}</li>)}
                                </ul>
                              </div>

                              {/* Tools Grid */}
                              <div className="extras-col">
                                <h4>Tools</h4>
                                <div className="tools-grid">
                                  {(card.technology_stack || [])
                                    .filter((tool: any) => typeof tool !== 'string' && tool?.svg)
                                    .slice(0, 6)
                                    .map((tool: any, idx: number) => (
                                      <div key={idx} className="tool-icon" title={tool.name || `Tool ${idx + 1}`}>
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeSvg(tool.svg) }} style={{ width: '100%', height: '100%', fill: 'currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.h3
                              layoutId={`title-${card.id}`}
                              className="service-card__title"
                            >
                              {card.title}
                            </motion.h3>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
