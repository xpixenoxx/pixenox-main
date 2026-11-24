'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { Faq } from '@/lib/types/database';

export default function FaqsClient({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(initialFaqs[0]?.id ?? null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const handleBeforeMatch = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const matchedId = target?.getAttribute('data-faq-id');
      if (matchedId) {
        setOpenId(matchedId);
      }
    };

    listEl.addEventListener('beforematch', handleBeforeMatch);
    return () => listEl.removeEventListener('beforematch', handleBeforeMatch);
  }, []);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <>
      <div className="home-faqs-glow" aria-hidden="true" />
      <div className="home-faqs-container">
        <div className="home-faqs-header">
          <h1 className="home-faqs-title">
            Frequently Asked <span>Questions</span>
          </h1>
          <p className="home-faqs-subtitle">
            Direct engineering answers on Pixenox production AI systems, AI Visibility (GEO/AEO), Enterprise Intelligence platforms, Engenox, Unool, and how we work.
          </p>
        </div>

        <div className="home-faqs-list" ref={listRef}>
          {initialFaqs.length > 0 ? (
            initialFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              const panelId = `faq-panel-${faq.id}`;

              return (
                <div
                  key={faq.id}
                  className={`home-faq-item ${isOpen ? 'is-open' : ''}`}
                >
                  <h2 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>
                    <button
                      type="button"
                      className="home-faq-question"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                    >
                      <span>{faq.question}</span>
                      <div className="home-faq-icon" aria-hidden="true">
                        <ChevronDown size={20} strokeWidth={2.5} />
                      </div>
                    </button>
                  </h2>
                  {/* Rendered in SSR HTML for find-in-page, Googlebot, and AI search crawlers */}
                  <div
                    id={panelId}
                    data-faq-id={faq.id}
                    {...(!isOpen ? { hidden: 'until-found' as unknown as boolean } : {})}
                  >
                    <div className="home-faq-answer-wrapper">
                      <div className="home-faq-answer-content">
                        {faq.answer.split('\n').filter(Boolean).map((paragraph, i) => (
                          <p key={i} className="mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-white/50 py-12 border border-dashed border-white/10 rounded-2xl">
              No FAQs available at the moment. Please check back later.
            </div>
          )}
        </div>

        <div className="home-faqs-cta-wrapper" style={{ marginTop: '48px' }}>
          <Link href="/contact/pixy" className="home-faqs-btn">
            Still have an architecture question? Talk to Pixy
          </Link>
        </div>
      </div>
    </>
  );
}
