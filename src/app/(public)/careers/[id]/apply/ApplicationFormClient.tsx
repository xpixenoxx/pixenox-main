'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Loader2, CheckCircle, Paperclip } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { JobRole, FALLBACK_ROLES } from '../../fallback-jobs';
import '../job-details.css';

type AppStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ApplicationFormClient({ id }: { id: string }) {
  const [role, setRole] = useState<JobRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Application form fields
  const [appName, setAppName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appLocation, setAppLocation] = useState('');
  const [appCompany, setAppCompany] = useState('');
  const [appLinkedin, setAppLinkedin] = useState('');
  const [appPortfolio, setAppPortfolio] = useState('');
  const [appOtherUrl, setAppOtherUrl] = useState('');
  const [appStatus, setAppStatus] = useState<AppStatus>('idle');
  const [appError, setAppError] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

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

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppStatus('loading');
    setAppError('');

    if (!appName.trim() || !appEmail.trim()) {
      setAppError('Name and email are required.');
      setAppStatus('error');
      return;
    }
    
    if (!resumeFile) {
      setAppError('Please attach your Resume/CV.');
      setAppStatus('error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', appName.trim());
      formData.append('email', appEmail.trim());
      formData.append('phone', appPhone.trim());
      formData.append('location', appLocation.trim());
      formData.append('company', appCompany.trim());
      formData.append('linkedin', appLinkedin.trim());
      formData.append('portfolio', appPortfolio.trim());
      formData.append('otherUrl', appOtherUrl.trim());
      formData.append('jobTitle', role?.title || 'Position');
      formData.append('department', role?.department || 'Engineering');
      formData.append('resume', resumeFile);

      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setAppStatus('success');
    } catch (err: any) {
      setAppError(err?.message || 'Something went wrong. Please try again.');
      setAppStatus('error');
    }
  };

  if (isLoading) {
    return (
      <div className="job-details-loading">
        <Loader2 size={32} className="spinner" />
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="job-details-page">
      <div className="job-header-content">
        <div className="container">
          <div className="job-header-inner">
            <div>
              <h1 className="job-title">Apply for {role.title}</h1>
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
          <div className="application-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <h3 className="application-title">SUBMIT YOUR APPLICATION</h3>
            
            {appStatus === 'success' ? (
              <div className="application-success">
                <CheckCircle size={48} className="success-icon" />
                <h4>Application Submitted!</h4>
                <p>Thank you for applying. We will review your application and get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="application-form">
                {appError && <div className="application-error">{appError}</div>}
                
                <div className="form-group row-group">
                  <label>Resume/CV *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                    <label className="resume-upload" style={{ width: 'fit-content' }}>
                      <Paperclip size={18} />
                      <span>{resumeFile ? resumeFile.name : 'ATTACH RESUME/CV'}</span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    {resumeFile && <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>File attached successfully!</span>}
                  </div>
                </div>

                <div className="form-group row-group">
                  <label>Full name *</label>
                  <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} required />
                </div>

                <div className="form-group row-group">
                  <label>Email *</label>
                  <input type="email" value={appEmail} onChange={(e) => setAppEmail(e.target.value)} required />
                </div>

                <div className="form-group row-group">
                  <label>Phone</label>
                  <input type="tel" value={appPhone} onChange={(e) => setAppPhone(e.target.value)} />
                </div>

                <div className="form-group row-group">
                  <label>Current location *</label>
                  <input type="text" value={appLocation} onChange={(e) => setAppLocation(e.target.value)} required />
                </div>

                <div className="form-group row-group">
                  <label>Current company</label>
                  <input type="text" value={appCompany} onChange={(e) => setAppCompany(e.target.value)} />
                </div>

                <h4 className="form-section-title">LINKS</h4>

                <div className="form-group row-group">
                  <label>LinkedIn URL *</label>
                  <input type="url" value={appLinkedin} onChange={(e) => setAppLinkedin(e.target.value)} required />
                </div>

                <div className="form-group row-group">
                  <label>Website/Portfolio URL</label>
                  <input type="url" value={appPortfolio} onChange={(e) => setAppPortfolio(e.target.value)} />
                </div>

                <div className="form-group row-group">
                  <label>Other URL</label>
                  <input type="url" value={appOtherUrl} onChange={(e) => setAppOtherUrl(e.target.value)} />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-application-btn" disabled={appStatus === 'loading'}>
                    {appStatus === 'loading' ? <><Loader2 size={18} className="spinner" /> Submitting...</> : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
