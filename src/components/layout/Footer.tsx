'use client';
// HMR trigger

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

// Brand icons removed from lucide-react v1.x — using inline SVGs
function LinkedinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
    </svg>
  );
}


import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import type { FooterConfig, FooterLink, BrandSettings, ServiceCard, CaseStudy } from '@/lib/types/database';
import './Footer.css';

interface FooterProps {
  initialConfig?: FooterConfig | null;
  initialLinks?: FooterLink[];
  initialBrand?: BrandSettings | null;
  initialServices?: ServiceCard[];
  initialWork?: CaseStudy[];
}

export default function Footer({ initialConfig, initialLinks, initialBrand, initialServices, initialWork }: FooterProps) {
  const [config, setConfig] = useState<FooterConfig | null>(initialConfig ?? null);
  const [links, setLinks] = useState<FooterLink[]>(initialLinks ?? []);
  const [brand, setBrand] = useState<BrandSettings | null>(initialBrand ?? null);
  const [serviceCards, setServiceCards] = useState<ServiceCard[]>(initialServices ?? []);
  const [workItems, setWorkItems] = useState<CaseStudy[]>(initialWork ?? []);

  const [timeStr, setTimeStr] = useState<string>('');
  const [ampmStr, setAmpmStr] = useState<string>('');

  useEffect(() => {
    async function load() {
      if (!initialConfig) {
        const { data } = await supabase.from('footer_config').select('*').limit(1).single();
        if (data) setConfig(data as FooterConfig);
      }
      if (!initialLinks?.length) {
        const { data } = await supabase.from('footer_links').select('*').order('priority', { ascending: true });
        if (data) setLinks(data as FooterLink[]);
      }
      if (!initialBrand) {
        const { data } = await supabase.from('brand_settings').select('*').limit(1).single();
        if (data) setBrand(data as BrandSettings);
      }
      if (!initialServices?.length) {
        const { data } = await supabase.from('services_cards').select('*').eq('is_visible', true).order('priority', { ascending: true });
        if (data) setServiceCards(data as ServiceCard[]);
      }
      if (!initialWork?.length) {
        const { data } = await supabase.from('case_studies').select('*').order('priority', { ascending: true }).limit(5);
        if (data) setWorkItems(data as CaseStudy[]);
      }
    }
    load();

    const ch = supabase
      .channel('footer_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_config' }, async () => {
        const { data } = await supabase.from('footer_config').select('*').limit(1).single();
        if (data) setConfig(data as FooterConfig);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_links' }, async () => {
        const { data } = await supabase.from('footer_links').select('*').order('priority', { ascending: true });
        if (data) setLinks(data as FooterLink[]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services_cards' }, async () => {
        const { data } = await supabase.from('services_cards').select('*').eq('is_visible', true).order('priority', { ascending: true });
        if (data) setServiceCards(data as ServiceCard[]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_studies' }, async () => {
        const { data } = await supabase.from('case_studies').select('*').order('priority', { ascending: true }).limit(5);
        if (data) setWorkItems(data as CaseStudy[]);
      })
      .subscribe();

    const timer = setInterval(() => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const formatted = formatter.format(new Date());
      const parts = formatted.split(' ');
      setTimeStr(parts[0]);
      setAmpmStr(parts[1] || '');
    }, 1000);

    // Initial call to avoid waiting 1s
    const initFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const initParts = initFormatter.format(new Date()).split(' ');
    setTimeStr(initParts[0]);
    setAmpmStr(initParts[1] || '');

    return () => {
      supabase.removeChannel(ch);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const companyLinks = links.filter((l) => l.section === 'company' || l.section === 'about');
  const fallbackCompany = companyLinks.length ? companyLinks : [
    { id: '1', label: 'About', href: '/company', section: 'company' },
    { id: '2', label: 'Services', href: '/services', section: 'company' },
    { id: '3', label: 'Careers', href: '/careers', section: 'company' },
    { id: '4', label: 'Contact', href: '/contact', section: 'company' },
  ];

  const resourceLinks = links.filter((l) => l.section === 'resources');
  const fallbackResources = resourceLinks.length ? resourceLinks : [
    { id: '5', label: 'Documentation', href: '#', section: 'resources' },
    { id: '6', label: 'Changelog', href: '#', section: 'resources' },
    { id: '7', label: 'Privacy', href: '/privacy', section: 'resources' },
    { id: '8', label: 'Terms', href: '/terms', section: 'resources' },
  ];

  const socialLinks = links.filter((l) => l.section === 'social' && l.label?.toLowerCase() !== 'github');
  const fallbackSocials = socialLinks.length ? socialLinks : [
    { id: '9', label: 'X', href: config?.reddit_url || 'https://x.com/pixenox', section: 'social' },
    { id: '10', label: 'LinkedIn', href: config?.linkedin_url || 'https://linkedin.com/company/pixenox', section: 'social' },
  ];

  const copyrightText = config?.copyright_text?.replace(
    '{year}',
    String(new Date().getFullYear())
  ) ?? `© ${new Date().getFullYear()} Pixenox Solutions Pvt Ltd. All rights reserved.`;

  return (
    <footer className="footer" role="contentinfo" suppressHydrationWarning>
      {/* Ambient background artifact */}
      <div className="footer__glow-orb" />

      <div className="footer__container">
        <div className="footer__grid">

          {/* Left: Brand Identity & Glass Clock Card */}
          <div className="footer__brand-section">
            <div className="footer__brand-header">
              {brand?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brand.logo_url} alt={`${brand.company_name || 'Pixenox'} logo`} className="footer__logo-img" />
              ) : (
                <div className="footer__logo-fallback">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
              )}
              <span className="footer__brand-title">{brand?.company_name || 'PIXENOX'}</span>
            </div>



            <a href="mailto:connect@pixenox.com" className="footer__email-contact">
              connect@pixenox.com
            </a>

            {/* Typographical Time Display */}
            <div className="footer__time-widget" aria-label="Current time in India">
              <div className="footer__location-badge">India, IST</div>
              <div className="footer__time-display">
                {timeStr ? (
                  <>
                    <span className="time-nums">{timeStr}</span>
                    <span className="time-ampm">{ampmStr}</span>
                  </>
                ) : (
                  <>
                    <span className="time-nums">--:--:--</span>
                    <span className="time-ampm">--</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Navigational Architecture */}
          <div className="footer__nav-groups" role="navigation" aria-label="Footer navigation">
            <div className="footer__nav-col">
              <h4>Platform</h4>
              <ul>
                {serviceCards.length > 0 ? (
                  serviceCards.map((card) => (
                    <li key={card.id}>
                      <Link href={`/services/${card.page_slug || card.id}`}>{card.title}</Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li><Link href="/services">AI Systems</Link></li>
                    <li><Link href="/services">Web Architecture</Link></li>
                    <li><Link href="/services">Optimization Engine</Link></li>
                    <li><Link href="/services">Custom Software</Link></li>
                  </>
                )}
              </ul>
            </div>

            <div className="footer__nav-col">
              <h4>Case Studies</h4>
              <ul>
                {workItems.length > 0 ? (
                  workItems.map((study) => (
                    <li key={study.id}>
                      <Link href={`/work/${study.slug}`}>{study.title}</Link>
                    </li>
                  ))
                ) : (
                  <li><Link href="/work">View All Work</Link></li>
                )}
              </ul>
            </div>

            <div className="footer__nav-col">
              <h4>Social</h4>
              <ul>
                {fallbackSocials.map((link) => (
                  <li key={link.id}>
                    {link.href.startsWith('http') ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.label} (opens in new tab)`}>
                        {link.label}
                        <ArrowUpRight className="external-icon" size={12} strokeWidth={2} />
                      </a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="footer__bottom">
          <div className="footer__copyright">{copyrightText}</div>
          <div className="footer__bottom-links">
            <Link href="/blog">Blog</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/careers">Careers</Link>
          </div>
        </div>
      </div>

      {/* Massive Vector Graphic Anchor (Vercel Style) */}
      <div className="footer__massive-anchor" aria-hidden="true">PIXENOX</div>
    </footer>
  );
}
