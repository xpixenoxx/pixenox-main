import type { Metadata } from "next";
import { Inter, Outfit, Instrument_Serif, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { getCanonicalSiteUrl } from "@/lib/supabase/public";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getCanonicalSiteUrl();

export const metadata: Metadata = {
  title: {
    default: "Pixenox — AI Systems, AI Visibility & Enterprise Intelligence Engineering",
    template: "%s | Pixenox",
  },
  description:
    "Pixenox Solutions engineers production-grade autonomous AI systems, unified enterprise intelligence platforms, and AI visibility (GEO/AEO) infrastructure — makers of Engenox and Unool.",
  keywords: [
    "AI systems engineering",
    "production grade AI systems",
    "multi-agent orchestration",
    "enterprise intelligence engineering",
    "enterprise data platform",
    "AI visibility engineering",
    "generative engine optimization",
    "answer engine optimization",
    "Engenox",
    "Unool",
    "Pixenox Solutions Private Limited",
    "AI engineering company India",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    types: {
      'application/rss+xml': `${siteUrl}/blog/feed.xml`,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Pixenox",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pixenox — AI Systems, AI Visibility & Enterprise Intelligence Engineering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@pixenox",
    creator: "@pixenox",
  },
  icons: {
    icon: "/icon.jpg",
    apple: "/apple-icon.jpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const entityGraphJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Pixenox",
      legalName: "PIXENOX SOLUTIONS PRIVATE LIMITED",
      alternateName: ["Pixenox Solutions", "Pixenox Solutions Pvt Ltd"],
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        url: `${siteUrl}/icon.jpg`,
      },
      image: `${siteUrl}/og-image.jpg`,
      foundingDate: "2026-04-02",
      identifier: {
        "@type": "PropertyValue",
        propertyID: "CIN",
        value: "U62091AP2026PTC125091",
      },
      description:
        "PIXENOX SOLUTIONS PRIVATE LIMITED is an India-based AI and software systems engineering company building production multi-agent AI systems, non-disruptive enterprise intelligence platforms, AI visibility (GEO/AEO) infrastructure, and proprietary software products including Engenox and Unool.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "H No. 1-1, Sreenu Raja, Main Road Prathipadu, Siripuram",
        addressLocality: "East Godavari",
        addressRegion: "Andhra Pradesh",
        postalCode: "533432",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "connect@pixenox.com",
        contactType: "sales",
        availableLanguage: ["English"],
      },
      founder: [
        { "@id": `${siteUrl}/#founder-sai-charan` },
        { "@id": `${siteUrl}/#founder-hemanth-sairam` },
      ],
      sameAs: [
        "https://www.linkedin.com/company/pixenox-solutions-pvt/",
        "https://x.com/pixenox",
      ],
      owns: [
        { "@id": `${siteUrl}/#product-engenox` },
        { "@id": `${siteUrl}/#product-unool` },
      ],
      knowsAbout: [
        "AI Systems Engineering",
        "Production Multi-Agent Orchestration",
        "Enterprise Intelligence Engineering",
        "Enterprise Data Platform Engineering",
        "AI Visibility Engineering",
        "Generative Engine Optimization (GEO)",
        "Answer Engine Optimization (AEO)",
        "Structured Data & Knowledge Graph Engineering",
        "Decision Intelligence",
        "LLMOps & Deterministic AI Guardrails",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Pixenox Engineering Disciplines",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Production AI Systems Engineering",
              description:
                "Design, build, and operate governed multi-agent workflows, deterministic guardrails, decision intelligence engines, and production AI infrastructure.",
              url: `${siteUrl}/engineering/ai-systems`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "AI Visibility Engineering (GEO & AEO)",
              description:
                "Engineering-led Generative Engine Optimization, Answer Engine Optimization, SSR crawler readiness, entity disambiguation, and AI citation telemetry.",
              url: `${siteUrl}/engineering/ai-visibility`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Enterprise Intelligence Engineering",
              description:
                "Non-disruptive ERP, CRM, cloud, and document unification via CDC pipelines, governed semantic layers, and scalable data infrastructure.",
              url: `${siteUrl}/engineering/enterprise-intelligence-engineering`,
            },
          },
        ],
      },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#founder-sai-charan`,
      name: "Muchakarla Sai Charan",
      jobTitle: "Co-Founder & Director",
      worksFor: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#founder-hemanth-sairam`,
      name: "Jagatha Hemanth Sai Ram",
      jobTitle: "Co-Founder & Director",
      worksFor: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#product-engenox`,
      name: "Engenox by Pixenox",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${siteUrl}/products/engenox`,
      description:
        "Unified autonomous SEO, GEO, and AEO operating system engineered by Pixenox Solutions for technical crawler readiness, entity graph orchestration, and AI citation intelligence.",
      creator: { "@id": `${siteUrl}/#organization` },
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#product-unool`,
      name: "Unool",
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Web",
      url: "https://unool.co",
      description:
        "One Link + One Click social publishing and creator distribution platform built by Pixenox Solutions.",
      creator: { "@id": `${siteUrl}/#organization` },
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Pixenox",
      url: siteUrl,
      description:
        "Production AI Systems Engineering, Enterprise Intelligence Engineering, and AI Visibility (GEO/AEO) — plus Engenox and Unool by Pixenox Solutions.",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Preconnect to Supabase for faster image and asset fetching */}
        <link rel="preconnect" href="https://hylycwrnfqghmewamqzu.supabase.co" />
        <link rel="dns-prefetch" href="https://hylycwrnfqghmewamqzu.supabase.co" />

        {/* Unified Schema.org @graph (Organization, Founders, Products, WebSite) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entityGraphJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
