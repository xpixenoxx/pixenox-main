'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import './LeadCaptureSection.css';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const SERVICE_OPTIONS = [
  'Autonomous AI Systems',
  'Web Architecture',
  'Unified Optimization (SEO/AEO/GEO)',
  'Insight Engine & Analytics',
  'Bio Intelligence',
  'Growth Intelligence',
  'Custom Software Engineering',
];

const BUDGET_OPTIONS = [
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $50,000',
  '$50,000 – $100,000',
  '$100,000+',
  'Not sure yet',
];

export default function LeadCaptureSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [showServices, setShowServices] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email are required.');
      setStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    try {
      const supabase = getBrowserClient();
      const fullMessage = [
        company.trim() ? `Company: ${company.trim()}` : '',
        website.trim() ? `Website: ${website.trim()}` : '',
        services.length ? `Services: ${services.join(', ')}` : '',
        budget ? `Budget: ${budget}` : '',
        message.trim() || '',
        '[Source: Growth Strategy CTA]',
      ]
        .filter(Boolean)
        .join('\n\n');

      const { error } = await (supabase.from('contact_submissions') as any).insert({
        name: name.trim(),
        email: email.trim(),
        services_interested: services,
        message: fullMessage || 'Growth Strategy Request',
      });

      if (error) {
        setErrorMsg('Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setName('');
      setEmail('');
      setCompany('');
      setWebsite('');
      setServices([]);
      setBudget('');
      setMessage('');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <section className="lead-capture" id="free-audit" aria-label="Get Your Growth Strategy">
      <div className="lead-capture__grid-floor" aria-hidden="true" />
      <div className="lead-capture__glow" aria-hidden="true" />

      <div className="container">
        <div className="lead-capture__layout">
          {/* Left: Value Proposition */}
          <motion.div
            className="lead-capture__info"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="lead-capture__tag">// SYSTEM CONSULTATION</span>
            <h2 className="lead-capture__heading">
              Request a<br />
              <span className="lead-capture__heading--accent">System Architecture Brief</span>
            </h2>
            <p className="lead-capture__desc">
              Share your operational challenges. Our engineering team will assess your current stack, identify convergence opportunities, and deliver a technical architecture brief — within 48 hours.
            </p>

            <div className="lead-capture__checklist">
              <div className="lead-capture__check-item">
                <CheckCircle size={18} />
                <span>Infrastructure & Stack Assessment</span>
              </div>
              <div className="lead-capture__check-item">
                <CheckCircle size={18} />
                <span>AI Readiness Evaluation</span>
              </div>
              <div className="lead-capture__check-item">
                <CheckCircle size={18} />
                <span>Discovery Optimization Audit (SEO/AEO/GEO)</span>
              </div>
              <div className="lead-capture__check-item">
                <CheckCircle size={18} />
                <span>System Convergence Roadmap</span>
              </div>
              <div className="lead-capture__check-item">
                <CheckCircle size={18} />
                <span>Scoped Technical Architecture Brief</span>
              </div>
            </div>

            <div className="lead-capture__trust">
              <div className="lead-capture__trust-item">
                <span className="lead-capture__trust-val">50+</span>
                <span className="lead-capture__trust-label">Systems Deployed</span>
              </div>
              <div className="lead-capture__trust-divider" />
              <div className="lead-capture__trust-item">
                <span className="lead-capture__trust-val">12+</span>
                <span className="lead-capture__trust-label">Countries Served</span>
              </div>
              <div className="lead-capture__trust-divider" />
              <div className="lead-capture__trust-item">
                <span className="lead-capture__trust-val">99.9%</span>
                <span className="lead-capture__trust-label">System Uptime</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            className="lead-capture__form-wrapper"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            {status === 'success' ? (
              <div className="lead-capture__success">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="lead-capture__success-icon"
                >
                  <CheckCircle size={48} />
                </motion.div>
                <h3>Strategy Request Received!</h3>
                <p>Our team will analyze your needs and send a personalized growth roadmap within 48 hours.</p>
                <button className="lead-capture__reset-btn" onClick={() => setStatus('idle')}>
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="lead-capture__form" noValidate>
                <h3 className="lead-capture__form-title">Tell Us About Your Challenge</h3>

                {errorMsg && <div className="lead-capture__error">{errorMsg}</div>}

                <div className="lead-capture__form-row">
                  <div className="lead-capture__field">
                    <label htmlFor="lead-name">Full Name *</label>
                    <input id="lead-name" type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                  </div>
                  <div className="lead-capture__field">
                    <label htmlFor="lead-email">Work Email *</label>
                    <input id="lead-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                </div>

                <div className="lead-capture__form-row">
                  <div className="lead-capture__field">
                    <label htmlFor="lead-company">Company</label>
                    <input id="lead-company" type="text" placeholder="Your company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
                  </div>
                  <div className="lead-capture__field">
                    <label htmlFor="lead-website">Website URL</label>
                    <input id="lead-website" type="url" placeholder="https://yoursite.com" value={website} onChange={(e) => setWebsite(e.target.value)} autoComplete="url" />
                  </div>
                </div>

                {/* Multi-select Services */}
                <div className="lead-capture__field">
                  <label>Services You&apos;re Interested In</label>
                  <button
                    type="button"
                    className="lead-capture__multi-trigger"
                    onClick={() => setShowServices(!showServices)}
                  >
                    <span>{services.length ? `${services.length} selected` : 'Select services...'}</span>
                    <ChevronDown size={16} className={showServices ? 'lead-capture__chevron--open' : ''} />
                  </button>
                  {showServices && (
                    <div className="lead-capture__multi-dropdown">
                      {SERVICE_OPTIONS.map((s) => (
                        <label key={s} className="lead-capture__multi-option">
                          <input type="checkbox" checked={services.includes(s)} onChange={() => toggleService(s)} />
                          <span className="lead-capture__multi-check" />
                          <span>{s}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {services.length > 0 && (
                    <div className="lead-capture__selected-tags">
                      {services.map((s) => (
                        <span key={s} className="lead-capture__service-tag" onClick={() => toggleService(s)}>
                          {s} ×
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Budget */}
                <div className="lead-capture__field">
                  <label htmlFor="lead-budget">Estimated Budget</label>
                  <select id="lead-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="lead-capture__select">
                    <option value="">Select budget range...</option>
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="lead-capture__field">
                  <label htmlFor="lead-message">Tell us about your project</label>
                  <textarea id="lead-message" placeholder="Describe your goals, challenges, or what you'd like to build..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
                </div>

                <button type="submit" className="lead-capture__submit" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <><Loader2 size={18} className="lead-capture__spinner" /> Submitting...</>
                  ) : (
                    <>Request Architecture Brief <ArrowRight size={18} /></>
                  )}
                </button>

                <p className="lead-capture__disclaimer">No spam. No sales decks. Scoped technical brief delivered in 48 hours.</p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
