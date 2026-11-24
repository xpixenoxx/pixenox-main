'use client';

import React from 'react';
import Link from 'next/link';
import type { JobRole } from '../fallback-jobs';
import './job-details.css';

export default function JobDetailsClient({ id, initialRole }: { id: string; initialRole: JobRole }) {
  const role = initialRole;

  return (
    <div className="job-details-page">
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
