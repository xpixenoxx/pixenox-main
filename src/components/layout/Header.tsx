'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import type { BrandSettings, NavConfig } from '@/lib/types/database';
import { sanitizeSvg } from '@/lib/sanitize';
import './Header.css';

interface HeaderProps {
  initialBrand?: BrandSettings | null;
  initialNav?: NavConfig[];
}

export default function Header({ initialBrand, initialNav }: HeaderProps) {
  const [brand, setBrand] = useState<BrandSettings | null>(initialBrand ?? null);
  const [navItems, setNavItems] = useState<NavConfig[]>(initialNav ?? []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const pathname = usePathname();

  // Smart Scroll state
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const hiddenRef = useRef(false);
  const atTopRef = useRef(true);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    const nextHidden = latest > previous && latest > 150;
    const nextAtTop = latest < 50;

    if (hiddenRef.current !== nextHidden) {
      hiddenRef.current = nextHidden;
      setHidden(nextHidden);
    }
    if (atTopRef.current !== nextAtTop) {
      atTopRef.current = nextAtTop;
      setAtTop(nextAtTop);
    }
  });

  // WCAG: Close mobile drawer on Escape, lock body scroll
  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    // Lock body scroll when drawer is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileOpen]);

  useEffect(() => {
    async function load() {
      if (!initialBrand) {
        const { data } = await supabase.from('brand_settings').select('*').limit(1).single();
        if (data) setBrand(data as BrandSettings);
      }
      if (!initialNav?.length) {
        const { data } = await supabase.from('nav_config').select('*').order('priority', { ascending: true });
        if (data) setNavItems(data as NavConfig[]);
      }
    }
    load();
  }, [initialBrand, initialNav]);

  useEffect(() => {
    const hasContactHash = navItems.some((n) => n.href === '/#contact' || (n.label.toLowerCase() === 'contact' && n.href !== '/contact'));
    if (hasContactHash) {
      supabase.from('nav_config').update({ href: '/contact' }).eq('href', '/#contact').then();
      supabase.from('nav_config').update({ href: '/contact' }).ilike('label', 'Contact').neq('href', '/contact').then();
    }
  }, [navItems]);

  const normalizedNavItems = navItems.map((n) =>
    n.href === '/#contact' || (n.label.toLowerCase() === 'contact' && n.href !== '/contact')
      ? { ...n, href: '/contact' }
      : n
  );

  const coreNavItems = normalizedNavItems.filter((n) => n.is_visible && n.label.toLowerCase() !== 'explore the engineering model');
  const ctaItems = normalizedNavItems.filter((n) => n.is_visible && n.label.toLowerCase() === 'explore the engineering model');

  return (
    <>
      <motion.header
        className={`am-header ${atTop ? 'is-top' : 'is-scrolled'}`}
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="am-header__container">
          
          {/* Logo */}
          <Link href="/" className="am-brand">
            {brand?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo_url} alt={`${brand.company_name || 'Pixenox'} logo`} className="am-logo" />
            )}
            {brand?.company_name && (
              <span className="am-company-name">{brand.company_name}</span>
            )}
          </Link>

          {/* Center Navigation */}
          <nav className="am-nav" aria-label="Main navigation" onMouseLeave={() => setHoveredNode(null)}>
            {coreNavItems.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredNode === item.id;
              // Default to standard Link mapping
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="am-nav-link"
                  onMouseEnter={() => setHoveredNode(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={`am-nav-text ${isActive ? 'is-active' : ''}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="am-nav-active-underline"
                      className="am-nav-active-underline"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA */}
          <div className="am-cta-group">
            {ctaItems.map((item) => (
              <Link key={item.id} href={item.href} className="am-cta-btn">
                <span className="am-cta-text">{item.label}</span>
                <span className="am-cta-icon-wrapper"><ArrowUpRight size={16} strokeWidth={2.5} /></span>
              </Link>
            ))}
            <button 
              className="am-hamburger" 
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>

        </div>

      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-drawer"
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-drawer-inner">
              <button 
                onClick={() => setMobileOpen(false)} 
                className="mobile-close"
                aria-label="Close navigation menu"
              >
                <X size={32} aria-hidden="true" />
              </button>
              <nav className="mobile-nav-list">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link href={item.href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
