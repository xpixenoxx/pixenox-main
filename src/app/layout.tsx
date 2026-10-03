import type { Metadata } from "next";
// Trigger CSS reload
import { Inter, Outfit, Instrument_Serif, JetBrains_Mono, Space_Grotesk } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Pixenox - AI Systems, AI Visibility & Enterprise Intelligence Engineering",
    template: "%s | Pixenox",
  },
  description:
    "Pixenox engineers autonomous AI systems, enterprise intelligence platforms, and AI visibility (GEO/AEO) solutions. We build production-grade AI infrastructure, unified data layers, and generative engine optimization systems for enterprises.",
  keywords: [
    "AI systems engineering",
    "autonomous AI systems",
    "multi-agent orchestration",
    "enterprise intelligence engineering",
    "enterprise data platform",
    "data infrastructure engineering",
    "AI visibility",
    "generative engine optimization",
    "GEO optimization",
    "AEO optimization",
    "answer engine optimization",
    "AI citation optimization",
    "structured data engineering",
    "knowledge graph engineering",
    "pixenox",
    "AI company India",
    "enterprise AI solutions",
    "LLM integration",
    "decision intelligence",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixenox.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Pixenox Solutions Pvt Ltd",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pixenox - AI Systems, AI Visibility & Enterprise Intelligence Engineering",
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
  alternates: {
    canonical: "/",
  },
  other: {
    "ai-content-declarations": "structured-data, llms-txt, faq-schema",
  },
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
        {/* DNS prefetch + preconnect for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Preconnect to Supabase for faster data + image fetching */}
        <link rel="preconnect" href="https://hylycwrnfqghmewamqzu.supabase.co" />
        <link rel="dns-prefetch" href="https://hylycwrnfqghmewamqzu.supabase.co" />

        {/* JSON-LD: Organization with Service Offerings (GEO/AEO Entity Signal) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixenox.com"}/#organization`,
              name: "Pixenox",
              legalName: "Pixenox Solutions Pvt Ltd",
              url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixenox.com",
              description: "Pixenox is an AI engineering company that designs and operates autonomous AI systems, enterprise intelligence platforms, and AI visibility (Generative Engine Optimization) solutions for enterprises.",
              contactPoint: {
                "@type": "ContactPoint",
                email: "connect@pixenox.com",
                contactType: "sales",
                availableLanguage: ["English"],
              },
              sameAs: [
                "https://linkedin.com/company/pixenox",
                "https://github.com/pixenox",
                "https://x.com/pixenox",
              ],
              knowsAbout: [
                "AI Systems Engineering",
                "Autonomous AI Systems",
                "Multi-Agent Orchestration",
                "Enterprise Intelligence Engineering",
                "Enterprise Data Platform Engineering",
                "AI Visibility",
                "Generative Engine Optimization (GEO)",
                "Answer Engine Optimization (AEO)",
                "Structured Data Engineering",
                "Knowledge Graph Engineering",
                "Decision Intelligence",
                "LLM Integration",
              ],
              hasOfferingCatalog: {
                "@type": "OfferCatalog",
                name: "Pixenox Engineering Services",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "AI Systems Engineering",
                      description: "Design, build, and operate autonomous AI infrastructure — multi-agent orchestration, decision intelligence, and execution systems that run enterprise workflows in production.",
                      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixenox.com"}/engineering/ai-systems`,
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Enterprise Intelligence Engineering",
                      description: "Integrate ERP, CRM, cloud, and document systems into one governed data layer with business intelligence, workflow automation, and cloud infrastructure engineering.",
                      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixenox.com"}/engineering/enterprise-intelligence-engineering`,
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "AI Visibility — Generative Engine Optimization",
                      description: "Structure a brand's data, entity signals, and content so AI answer engines (ChatGPT, Gemini, Perplexity) can identify and cite it in generated answers. Includes GEO, AEO, structured data engineering, and AI citation monitoring.",
                      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixenox.com"}/engineering/ai-visibility`,
                    },
                  },
                ],
              },
            }),
          }}
        />

        {/* JSON-LD: WebSite with SearchAction (Sitelinks Search Box + AEO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixenox.com"}/#website`,
              name: "Pixenox",
              url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixenox.com",
              description: "AI Systems Engineering, Enterprise Intelligence Engineering, and AI Visibility (GEO/AEO) — Pixenox engineers production-grade AI infrastructure for enterprises.",
              publisher: {
                "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixenox.com"}/#organization`,
              },
              inLanguage: "en-US",
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
