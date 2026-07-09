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
      <div className="container">
        
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

        {/* Dynamic DB-Controlled Grid Layout */}
        <div className="services-grid-list">
          <AnimatePresence>
            {visibleCards.map((card, idx) => {
              return (
                <motion.div 
                  key={card.id} 
                  className="srv-grid-item"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => router.push(`/services/${card.page_slug}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="srv-grid-num">
                    0{/* */}{idx + 1}
                  </div>
                  <div className="srv-grid-title-group">
                    {card.icon_svg ? (
                      <span className="srv-grid-icon" dangerouslySetInnerHTML={{ __html: sanitizeSvg(card.icon_svg) }} />
                    ) : (
                      <span className="srv-grid-icon" style={{ visibility: 'hidden' }} />
                    )}
                    <h3 className="srv-grid-item-title">{card.title}</h3>
                  </div>
                  <p className="srv-grid-desc">
                    {card.description || card.subheading}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
