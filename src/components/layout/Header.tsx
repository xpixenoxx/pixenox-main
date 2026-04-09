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
  const [servicesMegaOpen, setServicesMegaOpen] = useState(false);
  const [serviceCards, setServiceCards] = useState<any[]>([]);
  const pathname = usePathname();
  const megaRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smart Scroll state
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setAtTop(latest < 50);
  });

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

      // Load services for mega menu
      const { data: svcData } = await supabase
        .from('services_cards')
        .select('*')
        .eq('is_visible', true)
        .order('priority', { ascending: true });
      if (svcData) setServiceCards(svcData);
    }
    load();
  }, [initialBrand, initialNav]);

  // Close mega menu on route change
  useEffect(() => {
    setServicesMegaOpen(false);
  }, [pathname]);

  // Hover-intent: open on enter, close with delay on leave
  const handleMegaEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setServicesMegaOpen(true);
  };

  const handleMegaLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setServicesMegaOpen(false);
    }, 200); // small delay to prevent flicker
  };

  const coreNavItems = navItems.filter((n) => n.is_visible && n.label.toLowerCase() !== 'start your project');
  const ctaItems = navItems.filter((n) => n.is_visible && n.label.toLowerCase() === 'start your project');

  const isServicesLink = (label: string) => label.toLowerCase() === 'services';

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
              <img src={brand.logo_url} alt="Logo" className="am-logo" />
            )}
            {brand?.company_name && (
              <span className="am-company-name">{brand.company_name}</span>
            )}
          </Link>

          {/* Center Navigation */}
          <nav className="am-nav" onMouseLeave={() => setHoveredNode(null)}>
            {coreNavItems.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredNode === item.id;
              const isSvc = isServicesLink(item.label);

              if (isSvc) {
                return (
                  <div
                    key={item.id}
                    className="am-nav-link am-nav-link--btn"
                    onMouseEnter={() => { setHoveredNode(item.id); handleMegaEnter(); }}
                    onMouseLeave={handleMegaLeave}
                  >
                    <span className={`am-nav-text ${servicesMegaOpen || isActive ? 'is-active' : ''}`}>
                      {item.label}
                    </span>
                    {(servicesMegaOpen || isActive) && (
                      <motion.div
                        layoutId="am-nav-active-underline"
                        className="am-nav-active-underline"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="am-nav-link"
                  onMouseEnter={() => setHoveredNode(item.id)}
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
            <button className="am-hamburger" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>
          </div>

        </div>

        {/* ═══ SERVICES MEGA MENU ═══ */}
        <AnimatePresence>
          {servicesMegaOpen && (
            <motion.div
              ref={megaRef}
              className="mega-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={handleMegaEnter}
              onMouseLeave={handleMegaLeave}
            >
              <div className="mega-menu__inner">
                <div className="mega-menu__grid">
                  {serviceCards.map((card) => (
                    <div key={card.id} className="mega-service">
                      <div className="mega-service__header">
                        {card.icon_svg && (
                          <span className="mega-service__icon" dangerouslySetInnerHTML={{ __html: sanitizeSvg(card.icon_svg) }} />
                        )}
                        <h4 className="mega-service__title">{card.title}</h4>
                      </div>
                      <ul className="mega-service__list">
                        {(card.technology_stack || []).map((item: any, i: number) => {
                          const name = typeof item === 'string' ? item : (item?.name || '');
                          return (
                            <li key={i} className="mega-service__item">{name}</li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-drawer-inner">
              <button onClick={() => setMobileOpen(false)} className="mobile-close">
                <X size={32} />
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
