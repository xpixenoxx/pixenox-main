import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pixenox — AI Systems, AI Visibility & Enterprise Intelligence',
    short_name: 'Pixenox',
    description:
      'PIXENOX SOLUTIONS PRIVATE LIMITED engineers production multi-agent AI systems, non-disruptive enterprise data platforms, and AI visibility (GEO/AEO) operating systems — makers of Engenox and Unool.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030108',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
      {
        src: '/apple-icon.jpg',
        sizes: '180x180',
        type: 'image/jpeg',
      },
    ],
  };
}
