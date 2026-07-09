'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { Faq } from '@/lib/types/database';

export default function FaqsClient({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <>
      <div className="faqs-glow" />
      <div className="faqs-container">
        
        <motion.div 
          className="faqs-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="faqs-title">Frequently Asked Questions</h1>
          <p className="faqs-subtitle">
            Find answers to common questions about our services, methodologies, and how we deliver platform excellence.
          </p>
        </motion.div>

        <motion.div 
          className="faqs-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {initialFaqs.length > 0 ? (
            initialFaqs.map((faq, index) => {
              const isOpen = openId === faq.id;
              
              return (
                <motion.div 
                  key={faq.id} 
                  className={`faq-item ${isOpen ? 'is-open' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <button 
                    className="faq-question" 
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <div className="faq-icon">
                      <ChevronDown size={20} strokeWidth={2.5} />
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
                        <div className="faq-answer-wrapper">
                          <div className="faq-answer-content">
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
            })
          ) : (
            <div className="text-center text-white/50 py-12 border border-dashed border-white/10 rounded-2xl">
              No FAQs available at the moment. Please check back later.
            </div>
          )}
        </motion.div>

      </div>
    </>
  );
}
