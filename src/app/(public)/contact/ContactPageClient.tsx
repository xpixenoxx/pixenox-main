'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Send, Check, ArrowRight } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import type { ServiceCard, PageHeroConfig } from '@/lib/types/database';
import './contact.css';

interface ContactPageClientProps {
  services: ServiceCard[];
  heroConfig: PageHeroConfig | null;
}

// Pre-computed particle positions — deterministic to avoid SSR hydration mismatch
const PARTICLES = [
  { x: 12, y: 8, delay: 0, dur: 9, size: 2.5 },
  { x: 87, y: 15, delay: 1.2, dur: 11, size: 3 },
  { x: 34, y: 72, delay: 3.5, dur: 8, size: 2 },
  { x: 68, y: 45, delay: 0.8, dur: 13, size: 4 },
  { x: 5, y: 90, delay: 5, dur: 7, size: 2.8 },
  { x: 93, y: 33, delay: 2.3, dur: 10, size: 3.5 },
  { x: 51, y: 62, delay: 6.1, dur: 12, size: 2.2 },
  { x: 22, y: 28, delay: 4.4, dur: 9, size: 3.8 },
  { x: 76, y: 81, delay: 1.7, dur: 14, size: 2.6 },
  { x: 41, y: 5, delay: 7.2, dur: 8, size: 4.2 },
  { x: 60, y: 55, delay: 3, dur: 11, size: 2.3 },
  { x: 15, y: 42, delay: 5.8, dur: 7, size: 3.2 },
  { x: 82, y: 68, delay: 0.5, dur: 13, size: 2.7 },
  { x: 29, y: 95, delay: 4, dur: 10, size: 3.6 },
  { x: 95, y: 12, delay: 6.5, dur: 9, size: 2.4 },
  { x: 48, y: 38, delay: 2.8, dur: 12, size: 4.5 },
  { x: 8, y: 58, delay: 1.5, dur: 8, size: 3.1 },
  { x: 72, y: 22, delay: 7.8, dur: 11, size: 2.9 },
  { x: 55, y: 85, delay: 3.3, dur: 14, size: 3.4 },
  { x: 38, y: 18, delay: 5.5, dur: 7, size: 2.1 },
];

interface FormData {
  name: string;
  email: string;
  mobile: string;
  services_interested: string[];
  message: string;
}

export default function ContactPageClient({ services: initialServices }: ContactPageClientProps) {
  const [services, setServices] = useState<ServiceCard[]>(initialServices ?? []);
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', mobile: '', services_interested: [], message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mouse-tracking spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const spotY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

  useEffect(() => {
    async function load() {
      if (!initialServices?.length) {
        const { data } = await supabase.from('services_cards').select('id, title').order('priority', { ascending: true });
        if (data) setServices(data as ServiceCard[]);
      }
    }
    load();
  }, [initialServices]);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Required';
    if (!formData.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid';
    if (!formData.message.trim()) e.message = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const { error } = await (supabase.from('contact_submissions') as any).insert({
        name: formData.name, email: formData.email, mobile: formData.mobile,
        services_interested: formData.services_interested, message: formData.message,
      });
      if (error) throw error;
      setIsSuccess(true);
      setFormData({ name: '', email: '', mobile: '', services_interested: [], message: '' });
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const toggleService = (title: string) => {
    setFormData(p => ({
      ...p,
      services_interested: p.services_interested.includes(title)
        ? p.services_interested.filter(s => s !== title)
        : [...p.services_interested, title],
    }));
  };

  return (
    <section className="cx-page">
      {/* Mouse-following spotlight */}
      <motion.div
        className="cx-spotlight"
        style={{ x: spotX, y: spotY }}
      />

      {/* Giant bleeding background text */}
      <div className="cx-bg-text" aria-hidden="true">
        <span>CONTACT</span>
      </div>

      {/* Floating particles — deterministic to prevent hydration mismatch */}
      <div className="cx-particles" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <div key={i} className="cx-particle" style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }} />
        ))}
      </div>

      <div className="cx-container">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form
              key="form"
              className="cx-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              {/* Row 1: Name + Email */}
              <div className="cx-row">
                <motion.div
                  className="cx-field"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  <div className="cx-field__head">
                    <span className="cx-field__num">01</span>
                    <label htmlFor="cx-name">What&apos;s your name?</label>
                  </div>
                  <input
                    id="cx-name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className={errors.name ? 'cx-field--error' : ''}
                  />
                  {errors.name && <span className="cx-field__error">{errors.name}</span>}
                </motion.div>

                <motion.div
                  className="cx-field"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <div className="cx-field__head">
                    <span className="cx-field__num">02</span>
                    <label htmlFor="cx-email">Your email</label>
                  </div>
                  <input
                    id="cx-email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className={errors.email ? 'cx-field--error' : ''}
                  />
                  {errors.email && <span className="cx-field__error">{errors.email}</span>}
                </motion.div>
              </div>

              {/* Row 2: Phone */}
              <motion.div
                className="cx-field cx-field--full"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="cx-field__head">
                  <span className="cx-field__num">03</span>
                  <label htmlFor="cx-phone">Phone number <span className="cx-optional">(optional)</span></label>
                </div>
                <input
                  id="cx-phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.mobile}
                  onChange={e => setFormData(p => ({ ...p, mobile: e.target.value }))}
                />
              </motion.div>

              {/* Row 3: Services */}
              <motion.div
                className="cx-field cx-field--full"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="cx-field__head">
                  <span className="cx-field__num">04</span>
                  <label>What are you interested in?</label>
                </div>
                <div className="cx-chips">
                  {services.map(s => {
                    const active = formData.services_interested.includes(s.title);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`cx-chip ${active ? 'cx-chip--active' : ''}`}
                        onClick={() => toggleService(s.title)}
                      >
                        {active && <Check size={14} />}
                        {s.title}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Row 4: Message */}
              <motion.div
                className="cx-field cx-field--full"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="cx-field__head">
                  <span className="cx-field__num">05</span>
                  <label htmlFor="cx-msg">Tell us about your project</label>
                </div>
                <textarea
                  id="cx-msg"
                  placeholder="I need help with..."
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  className={errors.message ? 'cx-field--error' : ''}
                />
                {errors.message && <span className="cx-field__error">{errors.message}</span>}
              </motion.div>

              {/* Submit */}
              <motion.div
                className="cx-submit-row"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5 }}
              >
                <button type="submit" className="cx-submit" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  <div className="cx-submit__arrow">
                    <ArrowRight size={22} />
                  </div>
                </button>
              </motion.div>

              {/* Bottom Contact Strip */}
              <motion.div
                className="cx-bottom-strip"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <a href="mailto:connect@pixenox.com" className="cx-bottom-strip__item">connect@pixenox.com</a>
                <span className="cx-bottom-strip__dot" />
                <span className="cx-bottom-strip__item">Mon — Sat</span>
                <span className="cx-bottom-strip__dot" />
                <span className="cx-bottom-strip__item">48h Response</span>
              </motion.div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              className="cx-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="cx-success__ring"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, delay: 0.3 }}
              >
                <Check size={48} strokeWidth={1.5} />
              </motion.div>

              <motion.h2
                className="cx-success__title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Message sent.
              </motion.h2>

              <motion.p
                className="cx-success__desc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                We&apos;ll get back to you within 24 hours.
              </motion.p>

              <motion.button
                className="cx-success__reset"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                onClick={() => setIsSuccess(false)}
              >
                Send another message
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
