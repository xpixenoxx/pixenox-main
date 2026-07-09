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
    default: "Pixenox",
    template: "Pixenox",
  },
  description:
    "We architect converged platforms where AI, data infrastructure, and growth systems operate as a single intelligent layer. Enterprise engineering for companies that refuse fragmented toolchains.",
  keywords: [
    "unified intelligent systems",
    "AI systems engineering",
    "web architecture",
    "SEO AEO GEO optimization",
    "enterprise software",
    "bio intelligence",
    "growth intelligence",
    "data analytics platform",
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
        height: 1200,
        alt: "Pixenox — Unified Intelligent Systems",
      },
    ],
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

        {/* JSON-LD Structured Data: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Pixenox",
              url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixenox.com",
              description: "Unified intelligent systems engineering. We architect converged platforms where AI, data infrastructure, and growth systems operate as a single intelligent layer.",
              contactPoint: {
                "@type": "ContactPoint",
                email: "xpixenox@gmail.com",
                contactType: "sales",
                availableLanguage: ["English"],
              },
              sameAs: [
                "https://linkedin.com/company/pixenox",
                "https://github.com/pixenox",
                "https://x.com/pixenox",
              ],
              founder: {
                "@type": "Person",
                name: "Pixenox Team",
              },
              knowsAbout: [
                "Autonomous AI Systems",
                "Web Architecture",
                "Unified Optimization (SEO/AEO/GEO)",
                "Insight Engine & Analytics",
                "Bio Intelligence",
                "Growth Intelligence",
                "Custom Software Engineering",
              ],
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
