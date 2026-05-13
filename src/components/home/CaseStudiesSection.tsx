'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import Skeleton from '@/components/ui/Skeleton';
import Image from 'next/image';
import type { CaseStudy, SectionConfig } from '@/lib/types/database';
import './CaseStudiesSection.css';

interface CaseStudiesSectionProps {
  initialStudies?: CaseStudy[];
  initialConfig?: SectionConfig | null;
}

export default function CaseStudiesSection({
  initialStudies,
  initialConfig,
}: CaseStudiesSectionProps) {
  const [studies, setStudies] = useState<CaseStudy[]>(initialStudies ?? []);
  const [config, setConfig] = useState<SectionConfig | null>(initialConfig ?? null);

  useEffect(() => {
    async function load() {
      if (!initialStudies?.length) {
        const { data } = await supabase
          .from('case_studies')
          .select('*')
          .eq('is_featured', true)
          .order('priority', { ascending: true })
          .limit(4);
        if (data) setStudies(data as CaseStudy[]);
      }
      if (!initialConfig) {
        const { data } = await supabase
          .from('section_config')
          .select('*')
          .eq('section_key', 'case_studies')
          .limit(1)
          .single();
        if (data) setConfig(data as SectionConfig);
      }
    }
    load();

    const ch = supabase
      .channel('case_studies_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_studies' }, async () => {
        const { data } = await supabase
          .from('case_studies')
          .select('*')
          .eq('is_featured', true)
          .order('priority', { ascending: true })
          .limit(4);
        if (data) setStudies(data as CaseStudy[]);
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!studies.length) {
    return (
      <section className="highlights" aria-label="Case studies loading">
        <div className="container">
          <Skeleton width="300px" height="40px" style={{ margin: '0 auto 48px' }} />
          <div className="hl-accordion">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback map for custom title handling
  const title = config?.heading || 'RECENT_WORKS';

  return (
    <section className="highlights" id="highlights">
      <div className="hl-header">
        <h2 
          className="hl-title"
          style={{ color: config?.heading_color }}
        >
          {title}
        </h2>
        <div className="hl-stats">
          <span>ALL_DOMAINS <span className="hl-count">0{studies.length}</span></span>
          <span>DEPLOYED <span className="hl-count">0{Math.max(studies.length - 1, 1)}</span></span>
        </div>
      </div>

      <div className="hl-accordion">
        {studies.map((study, idx) => {
          // Formatting dynamic data to match the UI spec
          const prjId = `#PRJ_0${idx + 1}`;
          
          // Fallback logic to show IN_SYNC error state for demo if needed
          const isRed = idx === 1; // Exactly matching the HTML reference where Panel 2 is IN_SYNC
          const statusRaw = isRed ? 'IN_SYNC' : 'DEPLOYED';

          // Ensure Supabase URLs map cleanly into `url()`
          const bgUrl = study.cover_image_url || '';

          return (
            <Link 
              key={study.id} 
              href={`/work/${study.slug}`}
              className="hl-panel" 
              aria-label={`View case study: ${study.title}`}
            >
              <div className="hl-panel-bg">
                {bgUrl && (
                  <Image 
                    src={bgUrl} 
                    alt={study.title || "Case Study Background"} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 25vw"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
              {/* CSS gradient mask applied over image */}
              <div className="hl-panel-overlay"></div>
              
              <div className="hl-panel-content">
                <div className="hl-panel-top">
                  <span className="hl-panel-id">{prjId}</span>
                  <span className={`hl-panel-status ${isRed ? 'hl-status-red' : ''}`}>
                    {statusRaw}
                  </span>
                </div>
                
                <div className="hl-panel-bottom">
                  <div className="hl-title-wrap">
                    <h3 
                      className="hl-panel-title"
                      style={{ 
                        color: study.title_color 
                      }}
                    >
                      {study.title}
                    </h3>
                  </div>
                  <p className="hl-panel-desc">{study.short_description}</p>
                  
                  <div className="hl-panel-btn">
                    <span>EXPLORE</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Vertical Title shown when inactive */}
              <div className="hl-panel-vert-title">{study.title.toUpperCase()}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
