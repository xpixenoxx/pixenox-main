'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './CtaBanner.css';

interface CtaBannerProps {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function CtaBanner({
  heading = "Ready to Grow Your Business?",
  subheading = "Get a free, no-obligation website audit and discover how to improve your digital presence.",
  ctaText = "Get Your Free Audit",
  ctaHref = "#free-audit",
}: CtaBannerProps) {
  return (
    <section className="cta-banner" aria-label="Call to action">
      <div className="cta-banner__noise" aria-hidden="true" />
      <div className="container">
        <motion.div
          className="cta-banner__inner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="cta-banner__text">
            <h2 className="cta-banner__heading">{heading}</h2>
            <p className="cta-banner__sub">{subheading}</p>
          </div>
          <a href={ctaHref} className="cta-banner__btn">
            {ctaText}
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
