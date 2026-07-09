'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { HomeFaq } from '@/lib/types/database';
import './HomeFaqsSection.css';

export default function HomeFaqsSection({ initialFaqs }: { initialFaqs: HomeFaq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!initialFaqs || initialFaqs.length === 0) return null;

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="home-faqs-section">
      <div className="home-faqs-glow" />

      <div className="home-faqs-container">
        <motion.div 
          className="home-faqs-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="home-faqs-title">
            Frequently Asked <span>Questions</span>
          </h2>
          <p className="home-faqs-subtitle">
            Everything you need to know about our methodologies, timelines, and how we deliver platform excellence.
          </p>
        </motion.div>

        <div className="home-faqs-list">
          {initialFaqs.map((faq, index) => {
            const isOpen = openId === faq.id;
            
            return (
              <motion.div 
                key={faq.id} 
                className={`home-faq-item ${isOpen ? 'is-open' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1 * Math.min(index, 5) }}
              >
                <button 
                  className="home-faq-question"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <div className="home-faq-icon">
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="home-faq-answer-wrapper">
                        <div className="home-faq-answer-content">
                          {faq.answer.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="home-faqs-cta-wrapper"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/faqs" className="home-faqs-btn">
            Know more FAQs
            <span className="home-faqs-btn-icon">
              <ArrowRight size={18} strokeWidth={2.5} />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
