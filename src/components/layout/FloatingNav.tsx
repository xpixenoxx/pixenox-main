'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Briefcase, FolderGit2, Mail, User, MessageSquare, LayoutGrid } from 'lucide-react';
import './FloatingNav.css';

const DEFAULT_NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '/', icon: 'logo' },
  { id: 'careers', label: 'Careers', href: '/careers', icon: 'Briefcase' },
  { id: 'work', label: 'Work', href: '#', icon: 'FolderGit2' },
  { id: 'contact', label: 'Talk to Pixy', href: '/contact/pixy', icon: 'MessageSquare' },
];

const ICON_MAP: Record<string, any> = {
  Briefcase,
  FolderGit2,
  Mail,
  User,
  MessageSquare,
  LayoutGrid,
};

export default function FloatingNav({ initialItems }: { initialItems?: any }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const navItems = Array.isArray(initialItems) && initialItems.length > 0
    ? initialItems
    : DEFAULT_NAV_ITEMS;

  return (
    <div className="floating-nav-container">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="floating-nav-panel"
            onDoubleClick={() => setIsExpanded(false)}
            title="Double-click to collapse"
          >
            <div className="fn-glow-bar" />
            
            {navItems.map((item: any, index: number) => {
              const IconComp = ICON_MAP[item.icon];
              
              // Handle logo specially to center it
              const isLogo = item.icon === 'logo';
              const isCustom = item.icon === 'custom';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="fn-item-wrapper"
                  onHoverStart={() => setHoveredId(item.id)}
                  onHoverEnd={() => setHoveredId(null)}
                >
                  <AnimatePresence>
                    {hoveredId === item.id && (
                      <motion.div
                        initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fn-item-tooltip"
                      >
                        {item.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Link
                    href={item.href}
                    className="fn-item"
                  >
                    {isLogo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src="/icon.jpg"
                        alt="Pixenox Logo"
                        className="fn-item-logo"
                        style={{ width: '48px', height: '48px', objectFit: 'contain', mixBlendMode: 'screen', display: 'block' }}
                      />
                    ) : (isCustom && item.icon_url) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.icon_url}
                        alt={item.label}
                        className="fn-item-logo"
                        style={{ width: '48px', height: '48px', objectFit: 'contain', display: 'block' }}
                      />
                    ) : IconComp ? (
                      <span className="fn-item-icon">
                        <IconComp size={32} strokeWidth={2} />
                      </span>
                    ) : null}


                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.button
            key="nub"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="floating-nav-nub"
            onClick={() => setIsExpanded(true)}
            aria-label="Expand Navigation"
            title="Click to expand navigation"
          >
            <ChevronLeft size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
