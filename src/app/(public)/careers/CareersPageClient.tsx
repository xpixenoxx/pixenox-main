'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowRight, Briefcase, Search } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { JobRole, FALLBACK_ROLES } from './fallback-jobs';
import './careers.css';


export default function CareersPageClient() {
  const [roles, setRoles] = useState<JobRole[]>(FALLBACK_ROLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');

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



  return (
    <div className="careers-page">
      {/* Hero */}
      <section className="careers-hero">
        <div className="careers-hero__bg" aria-hidden="true" />
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="careers-title">Build the Future<br /><span className="careers-title--accent">With Us</span></h1>
            <p className="careers-subtitle">We&apos;re a global team of engineers, designers, and strategists building next-generation digital products. Remote-first, impact-driven, no bureaucracy.</p>
          </motion.div>
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
                <p>No matching positions found. Check back soon or <a href="/contact/pixy">contact us</a> directly.</p>
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
                  <Link href={`/careers/${role.id}`} className="careers-role-card__btn">
                    Apply <ArrowRight size={16} />
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
