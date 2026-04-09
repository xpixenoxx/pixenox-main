'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';


// Brand icons removed from lucide-react v1.x — using inline SVGs
function LinkedinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
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

  const socialLinks = links.filter((l) => l.section === 'social');
  const fallbackSocials = socialLinks.length ? socialLinks : [
    { id: '9', label: 'X', href: config?.reddit_url || 'https://x.com/pixenox', section: 'social' },
    { id: '10', label: 'LinkedIn', href: config?.linkedin_url || 'https://linkedin.com/company/pixenox', section: 'social' },
    { id: '12', label: 'GitHub', href: config?.github_url || 'https://github.com/pixenox', section: 'social' },
  ];

  const copyrightText = config?.copyright_text?.replace(
    '{year}',
    String(new Date().getFullYear())
  ) ?? `© ${new Date().getFullYear()} Pixenox Solutions Pvt Ltd. All rights reserved.`;

  return (
    <footer className="footer" role="contentinfo">
      {/* MASSIVE BACKGROUND WATERMARK */}
      <div className="footer__watermark">PIXENOX</div>

      <div className="footer__container">
        <div className="footer__top">

          {/* Left: Brand & Tagline */}
          <div className="footer__brand-col">
            <div className="footer__brand-logo">
              {brand?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brand.logo_url} alt="Logo" className="footer__logo-img" />
              ) : (
                <div className="footer__logo-fallback">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
              )}
              <span className="footer__brand-name">{brand?.company_name || 'PIXENOX'}</span>
            </div>
            <p className="footer__tagline">
              {brand?.tagline || 'Unified intelligent systems — where AI, data, and growth converge.'}
            </p>
            <a href="mailto:contact@pixenox.com" className="footer__email-link">
              contact@pixenox.com
            </a>

            <div className="footer__clock-widget">
              <div className="footer__clock-location">
                <span className="location-main">Based in India, IST</span>
                <span className="location-sub">Engineering globally</span>
              </div>
              <div className="footer__clock-time">
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

          {/* Right: Link Columns */}
          <div className="footer__links-wrapper">
            <div className="footer__links-col">
              <h4>Services</h4>
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

            <div className="footer__links-col">
              <h4>Work</h4>
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

            <div className="footer__links-col">
              <h4>Social</h4>
              <ul>
                {fallbackSocials.map((link) => (
                  <li key={link.id}>
                    {link.href.startsWith('http') ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="footer__cta-strip">
          <div className="footer__cta-text">
            <h3>Ready to converge your systems?</h3>
            <p>Get a scoped architecture brief — 48 hours, no obligations.</p>
          </div>
          <a href="/#free-audit" className="footer__cta-btn">Request Brief</a>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">{copyrightText}</p>
          <div className="footer__bottom-links">
            <a href="/careers">Careers</a>
            <span>·</span>
            <a href="/privacy">Privacy</a>
            <span>·</span>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
