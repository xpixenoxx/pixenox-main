/**
 * Utility functions for blog post date parsing and sorting.
 */

/**
 * Safely parses a blog post date string into a timestamp (in ms).
 * Handles:
 * - "November 16, 2026" / "Nov 16, 2026"
 * - "16 November 2026" / "16 Nov 2026"
 * - "2026-11-16" / ISO timestamps
 * - "11/16/2026"
 * Falls back to createdAt or 0 if invalid.
 */
export function parseBlogDate(dateStr?: string | null, createdAt?: string | null): number {
  if (dateStr && typeof dateStr === 'string') {
    const cleaned = dateStr.trim();
    if (cleaned) {
      const parsed = Date.parse(cleaned);
      if (!isNaN(parsed)) return parsed;
    }
  }
  if (createdAt && typeof createdAt === 'string') {
    const cleaned = createdAt.trim();
    if (cleaned) {
      const parsed = Date.parse(cleaned);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

export interface SortableBlogPost {
  date?: string | null;
  created_at?: string | null;
  priority?: number | null;
}

/**
 * Sorts an array of blog posts chronologically:
 * 1. Primary: Latest date first (descending)
 * 2. Secondary: Most recently created first (created_at descending)
 * 3. Tertiary: Priority ascending (lower priority number first)
 */
export function sortBlogPostsByDate<T extends SortableBlogPost>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const timeA = parseBlogDate(a.date, a.created_at);
    const timeB = parseBlogDate(b.date, b.created_at);
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    const createdA = parseBlogDate(a.created_at);
    const createdB = parseBlogDate(b.created_at);
    if (createdB !== createdA) {
      return createdB - createdA;
    }
    return (a.priority ?? 0) - (b.priority ?? 0);
  });
}

