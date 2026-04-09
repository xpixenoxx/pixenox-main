'use client';

import React, { useCallback, useState, CSSProperties, ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  ariaLabel?: string;
  // All DB-driven style props
  bgColor?: string;
  hoverBgColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  letterSpacing?: string;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

export default function Button({
  children,
  onClick,
  href,
  type = 'button',
  disabled = false,
  ariaLabel,
  bgColor,
  hoverBgColor,
  textColor,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  borderRadius,
  className = '',
  style = {},
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const computedStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '14px 32px',
    background: isHovered
      ? (hoverBgColor ?? 'var(--btn-hover-bg)')
      : (bgColor ?? 'var(--btn-bg)'),
    color: textColor ?? 'var(--btn-text-color)',
    fontFamily: fontFamily ?? 'var(--btn-font-family)',
    fontSize: fontSize ?? 'var(--btn-font-size)',
    fontWeight: fontWeight ?? 'var(--btn-font-weight)',
    letterSpacing: letterSpacing ?? 'var(--btn-letter-spacing)',
    borderRadius: borderRadius ?? 'var(--btn-border-radius)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 250ms ease, transform 150ms ease, box-shadow 250ms ease',
    transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered && !disabled ? '0 0 40px rgba(124, 58, 237, 0.2)' : 'none',
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
    overflow: 'hidden',
    textDecoration: 'none',
    ...style,
  };

  if (href) {
    return (
      <a
        href={href}
        className={`pixenox-btn ${className}`}
        style={computedStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={`pixenox-btn ${className}`}
      style={computedStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
