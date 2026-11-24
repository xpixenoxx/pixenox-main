import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nunito } from "next/font/google";
import { PixenoxHero } from "@/components/pixy/PixenoxHero";
import { getCanonicalSiteUrl } from "@/lib/supabase/public";
import "@/components/pixy/pixy.css";

// ISR: page shell is static, chat is client-side
export const revalidate = 86400;

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-speech",
  display: "swap",
});

const sora = localFont({
  variable: "--font-interface",
  src: [{ path: "../../../../../public/fonts/Sora.ttf", weight: "400 700", style: "normal" }],
});

export const metadata: Metadata = {
  title: "Contact Pixenox — Talk to Pixy or Scope Your Architecture",
  description:
    "Start an architecture review with Pixenox Solutions via Pixy, our interactive AI guide, or write directly to connect@pixenox.com. Response within 24–48 business hours.",
  alternates: { canonical: "/contact/pixy" },
  openGraph: {
    title: "Contact Pixenox — Talk to Pixy | Pixenox",
    description:
      "Scope your AI systems, AI Visibility (GEO/AEO), Engenox, or Enterprise Intelligence project directly with Pixenox Solutions.",
  },
};

export default function PixyPage() {
  const baseUrl = getCanonicalSiteUrl();
  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${baseUrl}/contact/pixy#contact`,
    url: `${baseUrl}/contact/pixy`,
    name: "Contact Pixenox Solutions Private Limited",
    description: "Interactive AI contact concierge (Pixy) and direct engineering inquiry channel (connect@pixenox.com).",
    mainEntity: {
      "@id": `${baseUrl}/#organization`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Contact Pixenox", item: `${baseUrl}/contact/pixy` },
    ],
  };

  return (
    <div className={`pixy-scope ${nunito.variable} ${sora.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="sr-only">Contact Pixenox Solutions — Talk to Pixy or Email connect@pixenox.com</h1>
      <PixenoxHero />
    </div>
  );
}
