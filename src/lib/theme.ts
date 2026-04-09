/**
 * Theme utility functions for Supabase → CSS variable injection.
 */

export interface ThemeKeyValue {
  key: string;
  value: string;
}

/**
 * Map of Supabase theme_settings keys → CSS custom property names.
 */
const THEME_KEY_TO_CSS: Record<string, string> = {
  // Colors
  color_bg_primary: '--color-bg-primary',
  color_bg_secondary: '--color-bg-secondary',
  color_accent_primary: '--color-accent-primary',
  color_accent_secondary: '--color-accent-secondary',
  color_accent_glow: '--color-accent-glow',
  color_text_primary: '--color-text-primary',
  color_text_secondary: '--color-text-secondary',
  color_border: '--color-border',
  color_glass: '--color-glass',
  // Buttons
  btn_bg: '--btn-bg',
  btn_hover_bg: '--btn-hover-bg',
  btn_text_color: '--btn-text-color',
  btn_border_radius: '--btn-border-radius',
  btn_font_family: '--btn-font-family',
  btn_font_size: '--btn-font-size',
  btn_font_weight: '--btn-font-weight',
  btn_letter_spacing: '--btn-letter-spacing',
  // Typography
  font_heading: '--font-heading',
  font_body: '--font-body',
  font_size_base: '--font-size-base',
  font_weight_heading: '--font-weight-heading',
  letter_spacing_heading: '--letter-spacing-heading',
  line_height_body: '--line-height-body',
};

/**
 * Apply a set of theme key-value pairs as CSS custom properties onto :root.
 */
export function applyThemeToDocument(settings: ThemeKeyValue[]): void {
  const root = document.documentElement;
  for (const { key, value } of settings) {
    const cssVar = THEME_KEY_TO_CSS[key];
    if (cssVar) {
      root.style.setProperty(cssVar, value);
    } else {
      // Still set it with a generic prefix for any unknown keys
      root.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
    }
  }
}

/**
 * Apply a single theme key-value pair.
 */
export function applySingleThemeProp(key: string, value: string): void {
  const root = document.documentElement;
  const cssVar = THEME_KEY_TO_CSS[key];
  if (cssVar) {
    root.style.setProperty(cssVar, value);
  } else {
    root.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
  }
}
