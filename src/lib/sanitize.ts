/**
 * Lightweight SVG sanitizer for admin-sourced inline SVGs.
 * Strips potentially dangerous elements (script, iframe, on* attributes)
 * while preserving valid SVG markup.
 */
export function sanitizeSvg(html: string | null | undefined): string {
  if (!html) return '';

  // Remove script tags and contents
  let clean = html.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Remove iframe, object, embed tags
  clean = clean.replace(/<(iframe|object|embed|link|meta|style|form|input|button)[\s\S]*?>/gi, '');

  // Remove all on* event handlers (onclick, onerror, onload, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol in href/xlink:href/src
  clean = clean.replace(/(?:href|src|xlink:href)\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, '');

  // Remove data: URIs except for images
  clean = clean.replace(/(?:href|src|xlink:href)\s*=\s*["']?\s*data:(?!image\/(png|jpeg|gif|svg\+xml|webp))[^"'\s>]*/gi, '');

  return clean;
}
