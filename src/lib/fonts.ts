/**
 * Google Fonts URL builder utility.
 * Deduplicates font families and returns a single combined Google Fonts URL.
 */

export function buildGoogleFontsUrl(fontFamilies: string[]): string {
  const unique = Array.from(
    new Set(
      fontFamilies
        .filter(Boolean)
        .map((f) => f.replace(/['"]/g, '').trim())
        .filter((f) => f !== 'sans-serif' && f !== 'serif' && f !== 'monospace')
    )
  );

  if (unique.length === 0) return '';

  const families = unique
    .map((f) => {
      const formatted = f.replace(/\s+/g, '+');
      return `family=${formatted}:wght@300;400;500;600;700;800;900`;
    })
    .join('&');

  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/**
 * Extract all font family values from an object by searching for keys
 * that contain 'font_family'.
 */
export function extractFontFamilies(
  obj: Record<string, unknown>
): string[] {
  const fonts: string[] = [];
  for (const key of Object.keys(obj)) {
    if (key.includes('font_family') && typeof obj[key] === 'string') {
      fonts.push(obj[key] as string);
    }
  }
  return fonts;
}

/**
 * Extract font families from an array of objects.
 */
export function extractFontFamiliesFromArray(
  arr: Record<string, unknown>[]
): string[] {
  const fonts: string[] = [];
  for (const obj of arr) {
    fonts.push(...extractFontFamilies(obj));
  }
  return fonts;
}
