'use client';

import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import './LeadCaptureSection.css';

const SERVICE_OPTIONS = [
  'Unified Data Architecture',
  'AI Convergence System',
  'Optimization Engine',
  'Bespoke Software',
  'Other',
];

export default function LeadCaptureSection() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', message: ''
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customService, setCustomService] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectService = (s: string) => {
    setSelectedServices([s]);
    setDropdownOpen(false);
    if (s !== 'Other') {
      setCustomService('');
    }
  };

  const activeService = selectedServices[0] || '';
  const displayService = activeService === 'Other' ? (customService || 'enter service...') : (activeService || 'Select Module...');

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Smooth spotlight positioning
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('Name and email are required to proceed.');
      setStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    if (!turnstileToken) {
      setErrorMsg('Please complete the security verification.');
      setStatus('error');
      return;
    }

    try {
      const resolvedService = activeService === 'Other' ? customService.trim() : activeService;
      const fullMessage = [
        formData.company.trim() ? `Company: ${formData.company.trim()}` : '',
        formData.phone.trim() ? `Phone: ${formData.phone.trim()}` : '',
        resolvedService ? `Service: ${resolvedService}` : '',
        formData.message.trim() || '',
        '[Source: AAA Architecture Uplink]',
      ].filter(Boolean).join('\n\n');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          services_interested: activeService === 'Other' ? [customService.trim()] : selectedServices,
          message: fullMessage || 'Architecture Uplink Request',
          turnstileToken
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'System error. Please try your request again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      setSelectedServices([]);
      setCustomService('');
    } catch {
      setErrorMsg('Network issue detected. Please check your connection.');
      setStatus('error');
    }
  };

  return (
    <section className="lc-master" id="free-audit" onMouseMove={handleMouseMove}>
      <div className="lc-spotlight" />

      <div className="lc-container">

        {/* Massive Center Block replacing the two-column grid */}
        <div className="lc-hero-header">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lc-nli-title"
          >
            Initiate Protocol.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="lc-nli-subtitle"
          >
            Transmit your telemetry. Our engineering architects will map a blueprint for pure operational autonomy.
          </motion.p>
        </div>

        <div className="lc-nli-wrapper">
          {status === 'success' ? (
            <div className="lc-success-box">
              <div className="lc-unique-brand-tag">
                PIXENOX
              </div>
              <h3>Signal Received</h3>
              <p>Your coordinates are logged. Pixenox architects will decrypt and respond with a payload brief within 48 hours.</p>
              <button className="lc-reset-btn" onClick={() => setStatus('idle')}>Initiate Another Uplink</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="lc-nli-form" noValidate>

              <div className="lc-nli-sentence">
                Hi, my name is
                <div className="lc-input-wrap">
                  <input type="text" name="name" value={formData.name} onChange={handleInput} placeholder="Name" required className="lc-nli-input" style={{ width: formData.name ? `${Math.max(formData.name.length, 5)}ch` : '8ch' }} />
                </div>
                and I lead technical strategy at
                <div className="lc-input-wrap">
                  <input type="text" name="company" value={formData.company} onChange={handleInput} placeholder="Enterprise Limitless" className="lc-nli-input" style={{ width: formData.company ? `${Math.max(formData.company.length, 12)}ch` : '20ch' }} />
                </div>.
                <br /><br />
                We are experiencing limits with our infrastructure and require Pixenox to engineer a custom
                <div className="lc-input-wrap lc-dropdown-wrap" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`lc-dropdown-trigger ${activeService ? 'lc-dropdown-trigger--active' : ''}`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span>{displayService}</span>
                    <svg className={`lc-dropdown-chevron ${dropdownOpen ? 'lc-dropdown-chevron--open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  {dropdownOpen && (
                    <div className="lc-dropdown-menu">
                      {SERVICE_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          className={`lc-dropdown-item ${activeService === opt ? 'lc-dropdown-item--selected' : ''}`}
                          onClick={() => selectService(opt)}
                        >
                          <span>{opt}</span>
                          {activeService === opt && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {activeService === 'Other' && (
                  <>
                    {' — '}
                    <div className="lc-input-wrap">
                      <input
                        type="text"
                        value={customService}
                        onChange={(e) => setCustomService(e.target.value)}
                        placeholder="enter your service"
                        className="lc-nli-input"
                        style={{ width: customService ? `${Math.max(customService.length, 12)}ch` : '18ch' }}
                        autoFocus
                      />
                    </div>
                  </>
                )}
                .
                <br /><br />
                Our primary technical challenge relates to
                <div className="lc-input-wrap">
                  <input type="text" name="message" value={formData.message} onChange={handleInput} placeholder="briefly describe the bottleneck" className="lc-nli-input lc-nli-long" />
                </div>.
                <br /><br />
                You can reach my team at
                <div className="lc-input-wrap">
                  <input type="email" name="email" value={formData.email} onChange={handleInput} placeholder="name@company.com" required className="lc-nli-input" style={{ width: formData.email ? `${Math.max(formData.email.length, 8)}ch` : '18ch' }} />
                </div>
                or call us on
                <div className="lc-input-wrap">
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInput} placeholder="+91 98765 43210" className="lc-nli-input" style={{ width: formData.phone ? `${Math.max(formData.phone.length, 10)}ch` : '16ch' }} />
                </div>
                to coordinate deployment.
              </div>

              {errorMsg && <div className="lc-form-error">{errorMsg}</div>}

              <div className="lc-turnstile-wrapper">
                <Turnstile 
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                  onSuccess={(token) => setTurnstileToken(token)} 
                  options={{ theme: 'dark' }} 
                />
              </div>

              <div className="lc-nli-action">
                <button type="submit" className="lc-nli-submit" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <Loader2 size={24} className="lc-spinner" />
                  ) : (
                    <>
                      <span>Transmit Request</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </section>
  );
}
