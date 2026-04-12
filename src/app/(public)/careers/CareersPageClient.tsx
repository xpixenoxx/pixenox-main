'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ArrowRight, Briefcase, X, Loader2, CheckCircle, Search } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { getBrowserClient } from '@/lib/supabase/client';
import './careers.css';

interface JobRole {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  is_active: boolean;
  created_at: string;
}

const FALLBACK_ROLES: JobRole[] = [
  {
    id: '1',
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote — Global',
    type: 'Full-Time',
    description: 'Build scalable web applications and APIs powering enterprise-grade platforms. Work with Next.js, Node.js, and cloud infrastructure at scale.',
    requirements: ['5+ years full-stack experience', 'Proficiency in React/Next.js + Node.js', 'Experience with cloud platforms (AWS/GCP)', 'Strong system design skills'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'AI/ML Engineer',
    department: 'AI & Automation',
    location: 'Remote — Global',
    type: 'Full-Time',
    description: 'Design and deploy intelligent automation solutions, ML pipelines, and AI-powered products for clients across industries.',
    requirements: ['3+ years ML/AI experience', 'Python, TensorFlow/PyTorch', 'NLP or Computer Vision expertise', 'Production deployment experience'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'SEO & Growth Strategist',
    department: 'Digital Growth',
    location: 'Remote — Global',
    type: 'Full-Time',
    description: 'Drive organic growth for B2B clients through advanced SEO, GEO, and AEO strategies. Analyze performance data and optimize campaigns.',
    requirements: ['4+ years SEO experience', 'B2B SaaS or agency background', 'Data-driven approach', 'Excellent communication skills'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote — Global',
    type: 'Full-Time',
    description: 'Craft premium, conversion-focused interfaces for enterprise clients. Lead design systems and collaborate with engineering teams.',
    requirements: ['3+ years product design', 'Figma expertise', 'Design system experience', 'B2B/SaaS portfolio preferred'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'DevOps & Cloud Architect',
    department: 'Engineering',
    location: 'Remote — Global',
    type: 'Contract',
    description: 'Architect and manage cloud infrastructure, CI/CD pipelines, and deployment workflows for high-availability systems.',
    requirements: ['5+ years DevOps/Cloud experience', 'AWS/GCP/Azure certifications', 'Docker, Kubernetes, Terraform', 'Security-first mindset'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

type AppStatus = 'idle' | 'loading' | 'success' | 'error';

export default function CareersPageClient() {
  const [roles, setRoles] = useState<JobRole[]>(FALLBACK_ROLES);
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  // Application form
  const [appName, setAppName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appLinkedin, setAppLinkedin] = useState('');
  const [appCover, setAppCover] = useState('');
  const [appStatus, setAppStatus] = useState<AppStatus>('idle');
  const [appError, setAppError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const supabase = getBrowserClient();
        const { data } = await (supabase.from('careers') as any).select('*').eq('is_active', true).order('created_at', { ascending: false });
        if (data && data.length > 0) setRoles(data as JobRole[]);
      } catch {
        // Use fallback roles
      }
    }
    load();
  }, []);

  const departments = ['All', ...Array.from(new Set(roles.map((r) => r.department)))];

  const filteredRoles = roles.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'All' || r.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppStatus('loading');
    setAppError('');

    if (!appName.trim() || !appEmail.trim()) {
      setAppError('Name and email are required.');
      setAppStatus('error');
      return;
    }

    if (!turnstileToken) {
      setAppError('Please complete the security check.');
      setAppStatus('error');
      return;
    }

    try {
      const msg = [
        `[Career Application]`,
        `Role: ${selectedRole?.title}`,
        `Department: ${selectedRole?.department}`,
        appLinkedin.trim() ? `LinkedIn: ${appLinkedin.trim()}` : '',
        appCover.trim() ? `Cover Note: ${appCover.trim()}` : '',
      ].filter(Boolean).join('\n\n');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: appName.trim(),
          email: appEmail.trim(),
          message: msg,
          turnstileToken
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed');
      }

      setAppStatus('success');
    } catch {
      setAppError('Something went wrong. Please try again.');
      setAppStatus('error');
    }
  };

  return (
    <div className="careers-page">
      {/* Hero */}
      <section className="careers-hero">
        <div className="careers-hero__bg" aria-hidden="true" />
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="careers-tag">// JOIN THE TEAM</span>
            <h1 className="careers-title">Build the Future<br /><span className="careers-title--accent">With Us</span></h1>
            <p className="careers-subtitle">We&apos;re a global team of engineers, designers, and strategists building next-generation digital products. Remote-first, impact-driven, no bureaucracy.</p>
          </motion.div>
        </div>
      </section>

      {/* Why join */}
      <section className="careers-why">
        <div className="container">
          <div className="careers-why__grid">
            {[
              { icon: '🌍', title: 'Fully Remote', desc: 'Work from anywhere in the world. We operate across 12+ countries.' },
              { icon: '🚀', title: 'High Impact', desc: 'Work on products used by enterprises globally. No busywork.' },
              { icon: '📈', title: 'Growth Path', desc: 'Continuous learning budget, conferences, and skill development.' },
              { icon: '🤝', title: 'Great Culture', desc: 'Async-first, transparent, and engineered for deep work.' },
            ].map((item, i) => (
              <motion.div key={i} className="careers-why__card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}>
                <span className="careers-why__icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="careers-roles">
        <div className="container">
          <h2 className="careers-roles__heading">Open Positions</h2>

          <div className="careers-roles__filters">
            <div className="careers-search">
              <Search size={16} />
              <input type="text" placeholder="Search roles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="careers-dept-filter">
              {departments.map((d) => (
                <button key={d} className={`careers-dept-btn ${filterDept === d ? 'careers-dept-btn--active' : ''}`} onClick={() => setFilterDept(d)}>{d}</button>
              ))}
            </div>
          </div>

          <div className="careers-roles__list">
            {filteredRoles.length === 0 ? (
              <div className="careers-roles__empty">
                <p>No matching positions found. Check back soon or <a href="/contact">contact us</a> directly.</p>
              </div>
            ) : (
              filteredRoles.map((role, i) => (
                <motion.div key={role.id} className="careers-role-card" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.5 }}>
                  <div className="careers-role-card__info">
                    <h3>{role.title}</h3>
                    <div className="careers-role-card__meta">
                      <span><Briefcase size={14} /> {role.department}</span>
                      <span><MapPin size={14} /> {role.location}</span>
                      <span><Clock size={14} /> {role.type}</span>
                    </div>
                    <p className="careers-role-card__desc">{role.description}</p>
                  </div>
                  <button className="careers-role-card__btn" onClick={() => { setSelectedRole(role); setShowApply(true); setAppStatus('idle'); }}>
                    Apply <ArrowRight size={16} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Application Modal */}
      <AnimatePresence>
        {showApply && selectedRole && (
          <motion.div className="careers-modal__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApply(false)}>
            <motion.div className="careers-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <button className="careers-modal__close" onClick={() => setShowApply(false)}><X size={20} /></button>

              {appStatus === 'success' ? (
                <div className="careers-modal__success">
                  <CheckCircle size={48} />
                  <h3>Application Submitted!</h3>
                  <p>We&apos;ll review your application and get back to you within 5 business days.</p>
                  <button className="careers-role-card__btn" onClick={() => setShowApply(false)}>Close</button>
                </div>
              ) : (
                <>
                  <h3 className="careers-modal__title">Apply for {selectedRole.title}</h3>
                  <p className="careers-modal__dept">{selectedRole.department} · {selectedRole.location}</p>

                  {selectedRole.requirements.length > 0 && (
                    <div className="careers-modal__reqs">
                      <h4>Requirements</h4>
                      <ul>{selectedRole.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
                    </div>
                  )}

                  <form onSubmit={handleApply} className="careers-modal__form">
                    {appError && <div className="lead-capture__error">{appError}</div>}
                    <input type="text" placeholder="Full Name *" value={appName} onChange={(e) => setAppName(e.target.value)} required />
                    <input type="email" placeholder="Email *" value={appEmail} onChange={(e) => setAppEmail(e.target.value)} required />
                    <input type="url" placeholder="LinkedIn Profile (optional)" value={appLinkedin} onChange={(e) => setAppLinkedin(e.target.value)} />
                    <textarea placeholder="Why are you a great fit? (optional)" value={appCover} onChange={(e) => setAppCover(e.target.value)} rows={4} />
                    
                    <div className="mt-4 mb-2">
                      <Turnstile 
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                        onSuccess={(token) => setTurnstileToken(token)} 
                        options={{ theme: 'dark' }} 
                      />
                    </div>

                    <button type="submit" className="lead-capture__submit" disabled={appStatus === 'loading'}>
                      {appStatus === 'loading' ? <><Loader2 size={18} className="lead-capture__spinner" /> Submitting...</> : <>Submit Application <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
