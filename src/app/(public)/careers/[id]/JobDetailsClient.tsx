'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { JobRole, FALLBACK_ROLES } from '../fallback-jobs';
import './job-details.css';

import Link from 'next/link';

export default function JobDetailsClient({ id }: { id: string }) {
  const [role, setRole] = useState<JobRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRole() {
      setIsLoading(true);
      try {
        const supabase = getBrowserClient();
        const { data } = await (supabase.from('careers') as any).select('*').eq('id', id).single();
        if (data) {
          setRole(data as JobRole);
        } else {
          // fallback
          const fallback = FALLBACK_ROLES.find(r => r.id === id);
          if (fallback) setRole(fallback);
          else notFound();
        }
      } catch {
        const fallback = FALLBACK_ROLES.find(r => r.id === id);
        if (fallback) setRole(fallback);
        else notFound();
      } finally {
        setIsLoading(false);
      }
    }
    loadRole();
  }, [id]);



  if (isLoading) {
    return (
      <div className="job-details-loading">
        <Loader2 size={32} className="spinner" />
      </div>
    );
  }

  if (!role) {
    return null; // Handled by notFound()
  }

  return (
    <div className="job-details-page">
      {/* Header section matches design reference (black logo area and light bg content) */}
      <div className="job-header-top">
        <div className="container">
          {/* Logo or brand icon could go here if needed, keeping it simple as per reference */}
          <div className="brand-logo-placeholder">a</div>
        </div>
      </div>
      
      <div className="job-header-content">
        <div className="container">
          <div className="job-header-inner">
            <div>
              <h1 className="job-title">{role.title}</h1>
              <div className="job-meta-header">
                <p>{role.location}</p>
                <p className="job-tags">{role.department} / {role.type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="job-body">
        <div className="container">
          <div className="job-description">
            <div className="job-info-block">
              <p><strong>Department:</strong> {role.department}</p>
              <p><strong>Location and Timezone:</strong> {role.location}</p>
              <p><strong>Type:</strong> {role.type}</p>
            </div>
            
            <div className="job-content-section">
              <h2>The Role</h2>
              <p>{role.description}</p>
            </div>

            {role.requirements && role.requirements.length > 0 && (
              <div className="job-content-section">
                <h2>Requirements</h2>
                <ul>
                  {role.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="job-actions-bottom" style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid #eaeaea' }}>
              <Link href={`/careers/${id}/apply`} className="apply-for-job-btn">
                APPLY FOR THIS JOB
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
