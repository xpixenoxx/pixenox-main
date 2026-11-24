'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { HomeFaq } from '@/lib/types/database';
import './HomeFaqsSection.css';

export default function HomeFaqsSection({ initialFaqs }: { initialFaqs: HomeFaq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!initialFaqs || initialFaqs.length === 0) return null;

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="home-faqs-section" aria-labelledby="home-faqs-heading">
      <div className="home-faqs-glow" aria-hidden="true" />

      <div className="home-faqs-container">
        <motion.div
          className="home-faqs-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 id="home-faqs-heading" className="home-faqs-title">
            Frequently Asked <span>Questions</span>
          </h2>
          <p className="home-faqs-subtitle">
            Direct engineering answers on our AI systems, GEO/AEO visibility platforms, enterprise data architecture, and delivery model.
          </p>
        </motion.div>

        <div className="home-faqs-list">
          {initialFaqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <details
                key={faq.id}
                open={isOpen}
                onToggle={(e) => {
                  const isNowOpen = (e.currentTarget as HTMLDetailsElement).open;
                  if (isNowOpen && openId !== faq.id) {
                    setOpenId(faq.id);
                  } else if (!isNowOpen && openId === faq.id) {
                    setOpenId(null);
                  }
                }}
                className={`home-faq-item ${isOpen ? 'is-open' : ''}`}
              >
                <summary
                  className="home-faq-question"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFaq(faq.id);
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit', display: 'inline' }}>
                    {faq.question}
                  </h3>
                  <div className="home-faq-icon" aria-hidden="true">
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </div>
                </summary>
                <div className="home-faq-answer-wrapper">
                  <div className="home-faq-answer-content">
                    {faq.answer.split('\n').filter(Boolean).map((paragraph, i) => (
                      <p key={i} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        <motion.div
          className="home-faqs-cta-wrapper"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/faqs" className="home-faqs-btn">
            View All Engineering FAQs
            <span className="home-faqs-btn-icon" aria-hidden="true">
              <ArrowRight size={18} strokeWidth={2.5} />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
