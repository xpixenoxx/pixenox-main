'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import Skeleton from '@/components/ui/Skeleton';
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
        const { data } = await supabase.from('section_config').select('*').eq('section_key', 'services').limit(1).single();
        if (data) setConfig(data as SectionConfig);
      }
      if (!initialLayout) {
        const { data } = await supabase.from('services_layout').select('*').limit(1).single();
        if (data) setLayout(data as ServicesLayout);
      }
    }
    load();

    const ch = supabase
      .channel('services_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services_cards' }, async () => {
        const { data } = await supabase.from('services_cards').select('*').order('priority', { ascending: true });
        if (data) setCards(data as ServiceCard[]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services_layout' }, async () => {
        const { data } = await supabase.from('services_layout').select('*').limit(1).single();
        if (data) setLayout(data as ServicesLayout);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'card_tools' }, async () => {
        const { data } = await supabase.from('card_tools').select('*');
        if (data) setTools(data as CardTool[]);
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-activate first card
  useEffect(() => {
    if (cards.length > 0 && !activeId) {
      setActiveId(cards[0].id);
    }
  }, [cards, activeId]);

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

  const visibleCards = cards.filter((c) => c.is_visible); // Shows ALL visible cards now
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
      <div className="container">
        
        {/* Section Heading */}
        <div className="services__header">
          <h2
            className="services__heading"
            style={{
              fontFamily: config?.heading_font_family,
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
                fontFamily: config.subheading_font_family,
                color: config.subheading_color,
              }}
            >
              {config.subheading}
            </p>
          )}
        </div>

        {/* Dynamic DB-Controlled Layout Container */}
        <div 
          ref={scrollRef}
          className={`services__accordion ${isHorizontal ? 'services__accordion--horizontal' : 'services__accordion--vertical'}`} 
          style={!isHorizontal ? { '--cols': layout?.cards_per_row || 3 } as React.CSSProperties : undefined}
          onPointerDown={isHorizontal ? handlePointerDown : undefined}
          onPointerMove={isHorizontal ? handlePointerMove : undefined}
          onPointerUp={isHorizontal ? handlePointerUp : undefined}
          onPointerLeave={isHorizontal ? handlePointerUp : undefined}
          role="list"
        >
          <AnimatePresence mode="popLayout">
            {visibleCards.map((card, idx) => {
              const isActive = activeId === card.id;
              const features = card.subheading 
                  ? card.subheading.split(',').map(s => s.trim()).filter(Boolean) 
                  : ['System Architecture', 'Performance Scaling', 'API Integration'];

              return (
                <motion.div
                  key={card.id}
                  layout="position"
                  className={`service-card ${isActive ? 'service-card--active' : ''}`}
                  onMouseEnter={() => setActiveId(card.id)}
                  onClick={() => {
                    if (isActive) {
                       router.push(`/services/${card.page_slug}`);
                    } else {
                       setActiveId(card.id);
                    }
                  }}
                >
                  {/* Background Image (Inactive State) */}
                  <div 
                    className="service-card__bg" 
                    style={{ backgroundImage: `url(${card.image_url || ''})` }} 
                  />
                  <div className="service-card__bg-overlay" />

                  {/* Top Bar */}
                  <div className="service-card__top">
                    {isActive ? (
                      <motion.h3 
                        layoutId={`title-${card.id}`}
                        className="service-card__title"
                        style={{ fontFamily: card.title_font_family }}
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
                        {String(idx + 1).padStart(2, '0')}
                      </motion.span>
                    )}
                    <ArrowUpRight className="service-card__arrow" size={28} />
                  </div>

                  {/* Middle Description (Only visible when active, handled by CSS) */}
                  <div className="service-card__middle">
                     {isActive && (
                       <p
                         className="service-card__desc"
                         style={{ fontFamily: card.desc_font_family }}
                       >
                         {card.description}
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
                        style={{ fontFamily: card.title_font_family }}
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
      </div>
    </section>
  );
}
