'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import './PageTransition.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const prevPathname = useRef(pathname);
  const isFirstRender = useRef(true);
  const transitionMs = prefersReducedMotion || isCoarsePointer ? 220 : 400;

  useEffect(() => {
    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const updatePointerMode = () => setIsCoarsePointer(coarseQuery.matches);
    updatePointerMode();
    coarseQuery.addEventListener('change', updatePointerMode);
    return () => coarseQuery.removeEventListener('change', updatePointerMode);
  }, []);

  useEffect(() => {
    // Skip animation on first render — critical for LCP
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Route changed — trigger transition
    if (pathname !== prevPathname.current) {
      setIsTransitioning(true);
      prevPathname.current = pathname;

      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setIsTransitioning(false);
      }, transitionMs);

      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children, transitionMs]);

  return (
    <>
      {/* Cinematic Wipe Overlay — only on navigation, never on first load */}
      <AnimatePresence>
        {isTransitioning && !prefersReducedMotion && !isCoarsePointer && (
          <motion.div
            className="page-wipe"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.76, 0, 0.24, 1],
            }}
            style={{ transformOrigin: 'top' }}
          >
            <motion.div 
              className="page-wipe__logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              <span className="page-wipe__text">PIXENOX</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content — NO initial animation on first render for LCP */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={isFirstRender.current ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            duration: prefersReducedMotion || isCoarsePointer ? 0.2 : 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {displayChildren}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
