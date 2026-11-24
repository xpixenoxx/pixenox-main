import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
  compress: true,
  
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  
  // Optimize images for LCP (unoptimized in local dev to bypass Next.js NAT64 SSRF block)
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hylycwrnfqghmewamqzu.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
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

  async redirects() {
    return [
      // Single-hop apex redirects for retired entry points before wildcard apex catch-all
      {
        source: '/contact',
        has: [{ type: 'host', value: 'pixenox.com' }],
        destination: 'https://www.pixenox.com/contact/pixy',
        permanent: true,
      },
      {
        source: '/pixy',
        has: [{ type: 'host', value: 'pixenox.com' }],
        destination: 'https://www.pixenox.com/contact/pixy',
        permanent: true,
      },
      // Permanent host canonicalization (apex -> www)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'pixenox.com' }],
        destination: 'https://www.pixenox.com/:path*',
        permanent: true,
      },
      // Dead /contact and /pixy entry points -> canonical Pixy contact route
      {
        source: '/contact',
        destination: '/contact/pixy',
        permanent: true,
      },
      {
        source: '/pixy',
        destination: '/contact/pixy',
        permanent: true,
      },
      // Clean leading-hyphen blog slugs -> canonical slugs (single-hop 308)
      {
        source: '/blog/-architecting-for-ai-first-multi-regional-traffic-rebuilding-enterprise-web-infr',
        destination: '/blog/architecting-for-ai-first-multi-regional-traffic-rebuilding-enterprise-web-infr',
        permanent: true,
      },
      {
        source: '/blog/-ai-citation-monitoring-how-to-track-whether-chatgpt-perplexity-and-other-llms-m',
        destination: '/blog/ai-citation-monitoring-how-to-track-whether-chatgpt-perplexity-and-other-llms-m',
        permanent: true,
      },
      // Topical GSC 404 & retired blog URLs -> closest canonical architecture / article (single-hop 308)
      {
        source: '/blog/why-business-analytics-dashboards-are-important-for-smarter-growth',
        destination: '/blog/enterprise-business-intelligence-systems-after-the-dashboard-era',
        permanent: true,
      },
      {
        source: '/blog/impact-of-technology-on-our-lives',
        destination: '/blog/how-ai-systems-are-changing-the-way-businesses-work',
        permanent: true,
      },
      {
        source: '/blog/how-erp-helps-business-save-time',
        destination: '/engineering/enterprise-intelligence-engineering',
        permanent: true,
      },
      {
        source: '/blog/growth-intelligence-the-framework-behind-10x-campaigns',
        destination: '/engineering/ai-visibility',
        permanent: true,
      },
      {
        source: '/blog/understanding-bio-intelligence-the-next-layer-of-human-performance-data',
        destination: '/work/genomic-analysis-pipeline',
        permanent: true,
      },
      {
        source: '/blog/how-digital-transformation-is-changing-every-industry',
        destination: '/blog/from-fragmented-tools-to-unified-platforms-the-case-for-convergence',
        permanent: true,
      },
      {
        source: '/blog/how-pixenox-reduced-client-churn-by-60-with-a-single-platform-decision',
        destination: '/blog/from-fragmented-tools-to-unified-platforms-the-case-for-convergence',
        permanent: true,
      },
      // Legacy fallback career IDs -> /careers
      { source: '/careers/1', destination: '/careers', permanent: true },
      { source: '/careers/2', destination: '/careers', permanent: true },
      { source: '/careers/3', destination: '/careers', permanent: true },
      { source: '/careers/4', destination: '/careers', permanent: true },
      { source: '/careers/5', destination: '/careers', permanent: true },
      // Retired / alias engineering slugs -> canonical 3 service pillars (single-hop 308)
      {
        source: '/engineering/ai-visibility-engineering',
        destination: '/engineering/ai-visibility',
        permanent: true,
      },
      {
        source: '/engineering/ai-systems-engineering',
        destination: '/engineering/ai-systems',
        permanent: true,
      },
      {
        source: '/engineering/autonomous-ai-systems',
        destination: '/engineering/ai-systems',
        permanent: true,
      },
      {
        source: '/engineering/custom-software',
        destination: '/engineering/enterprise-intelligence-engineering',
        permanent: true,
      },
      {
        source: '/engineering/web-architecture',
        destination: '/engineering/enterprise-intelligence-engineering',
        permanent: true,
      },
      {
        source: '/engineering/growth-intelligence',
        destination: '/engineering/ai-visibility',
        permanent: true,
      },
      {
        source: '/engineering/bio-intelligence',
        destination: '/engineering',
        permanent: true,
      },
      {
        source: '/engineering/generative-intelligence',
        destination: '/engineering',
        permanent: true,
      },
      {
        source: '/engineering/how-we-engineer',
        destination: '/engineering',
        permanent: true,
      },
      // Consolidate duplicate /services/* tree -> /engineering/* in single hop
      {
        source: '/services',
        destination: '/engineering',
        permanent: true,
      },
      {
        source: '/services/ai-visibility-engineering',
        destination: '/engineering/ai-visibility',
        permanent: true,
      },
      {
        source: '/services/ai-systems-engineering',
        destination: '/engineering/ai-systems',
        permanent: true,
      },
      {
        source: '/services/autonomous-ai-systems',
        destination: '/engineering/ai-systems',
        permanent: true,
      },
      {
        source: '/services/custom-software',
        destination: '/engineering/enterprise-intelligence-engineering',
        permanent: true,
      },
      {
        source: '/services/web-architecture',
        destination: '/engineering/enterprise-intelligence-engineering',
        permanent: true,
      },
      {
        source: '/services/growth-intelligence',
        destination: '/engineering/ai-visibility',
        permanent: true,
      },
      {
        source: '/services/bio-intelligence',
        destination: '/engineering',
        permanent: true,
      },
      {
        source: '/services/generative-intelligence',
        destination: '/engineering',
        permanent: true,
      },
      {
        source: '/services/:slug',
        destination: '/engineering/:slug',
        permanent: true,
      },
    ];
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
      // Prevent admin routes from ever being indexed
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      // Cache fonts and keep binary font assets out of Google search index
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
      {
        source: '/_next/static/media/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
      {
        source: '/:path*.(woff|woff2|ttf|otf)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
      // Cache static images and assets in /public
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      // Cache SVGs, logos, and other static files
      {
        source: '/:path*.(svg|jpg|jpeg|png|webp|avif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      // Cache llms.txt files for AI crawlers
      {
        source: '/:path*.(txt)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
