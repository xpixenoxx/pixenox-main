import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  
  // Optimize images for LCP
  images: {
    qualities: [75, 100],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hylycwrnfqghmewamqzu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable experimental optimizations
  experimental: {
    optimizeCss: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      // Aggressive caching for static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache optimized images
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // Cache fonts
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
