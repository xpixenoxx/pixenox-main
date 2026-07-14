'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, Terminal } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import type { ServiceCard } from '@/lib/types/database';
import './ContactForm.css';

interface FormData {
  name: string;
  email: string;
  mobile: string;
  services_interested: string[];
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  mobile?: string;
  message?: string;
}

interface ContactFormProps {
  initialServices?: ServiceCard[];
}

// Stagger animation definitions
const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -20 }
};

export default function ContactForm({ initialServices }: ContactFormProps) {
  const [services, setServices] = useState<ServiceCard[]>(initialServices ?? []);
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', mobile: '', services_interested: [], message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (!initialServices?.length) {
        const { data } = await supabase
          .from('services_cards')
          .select('id, title')
          .order('priority', { ascending: true });
        if (data) setServices(data as ServiceCard[]);
      }
    }
    load();
  }, [initialServices]);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (formData.mobile && !/^[+]?[\d\s()-]{7,20}$/.test(formData.mobile)) newErrors.mobile = 'Invalid mobile number';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email, mobile: formData.mobile,
          services_interested: formData.services_interested, message: formData.message
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }
      
      setIsSuccess(true);
      setFormData({ name: '', email: '', mobile: '', services_interested: [], message: '' });
    } catch (err) {
      console.error('Contact form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleService = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      services_interested: prev.services_interested.includes(title)
        ? prev.services_interested.filter((s) => s !== title)
        : [...prev.services_interested, title],
    }));
  };

  return (
    <div className="contact-form-wrapper">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form
            key="form"
            className="contact-form"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onSubmit={handleSubmit}
            aria-label="Contact form"
          >
            <motion.h2 variants={itemVariants} className="contact-form__title">Get In Touch</motion.h2>

            <motion.div variants={itemVariants} className="contact-form__field">
              <label htmlFor="contact-name">Full Name *</label>
              <input
                id="contact-name" type="text" placeholder="Your name"
                value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className={errors.name ? 'contact-form__input--error' : ''}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <span id="name-error" className="contact-form__error" role="alert">{errors.name}</span>}
            </motion.div>

            <motion.div variants={itemVariants} className="contact-form__field">
              <label htmlFor="contact-email">Email Address *</label>
              <input
                id="contact-email" type="email" placeholder="you@company.com"
                value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className={errors.email ? 'contact-form__input--error' : ''}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <span id="email-error" className="contact-form__error" role="alert">{errors.email}</span>}
            </motion.div>

            <motion.div variants={itemVariants} className="contact-form__field">
              <label htmlFor="contact-mobile">Phone Number</label>
              <input
                id="contact-mobile" type="tel" placeholder="+1 (234) 567-8900"
                value={formData.mobile} onChange={(e) => setFormData(p => ({ ...p, mobile: e.target.value }))}
                className={errors.mobile ? 'contact-form__input--error' : ''}
              />
              {errors.mobile && <span className="contact-form__error">{errors.mobile}</span>}
            </motion.div>

            <motion.div variants={itemVariants} className="contact-form__field">
              <label id="services-label">Engineering Interested In</label>
              <div className="contact-form__checkboxes" role="group" aria-labelledby="services-label">
                {services.map((service) => {
                  const isSelected = formData.services_interested.includes(service.title);
                  return (
                    <label key={service.id} className={`contact-form__checkbox ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleService(service.title)}
                      />
                      <div className="contact-form__checkbox-indicator">
                        {isSelected && <Check size={12} />}
                      </div>
                      <span>{service.title}</span>
                    </label>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="contact-form__field">
              <label htmlFor="contact-message">Your Message *</label>
              <textarea
                id="contact-message" placeholder="Tell us about your project..." rows={5}
                value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                className={errors.message ? 'contact-form__input--error' : ''}
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message && <span id="message-error" className="contact-form__error" role="alert">{errors.message}</span>}
            </motion.div>

            <motion.button 
              variants={itemVariants}
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
              <Send size={18} />
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            className="contact-success"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            role="status"
            aria-live="polite"
          >
            <div className="success-glitch">
              <motion.div 
                className="success-icon"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.4 }}
              >
                <Terminal size={32} />
              </motion.div>
              <motion.h3 
                className="success-title"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              >
                TRANSMISSION SECURE
              </motion.h3>
              
              <motion.div 
                className="success-terminal"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ delay: 0.8 }}
              >
                <p>{'>'} STATUS: 200 OK</p>
                <p>{'>'} ENCRYPTION: ACCEPTED</p>
                <br />
                <p>Mission brief received. Operations team notified.</p>
                <p>Expect incoming connection within standard cycle time (24h).</p>
                <p className="animate-pulse">_</p>
              </motion.div>

              <motion.button 
                className="success-reset"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                onClick={() => setIsSuccess(false)}
              >
                [ INITIATE NEW COMM-LINK ]
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
