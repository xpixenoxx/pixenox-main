import type { Metadata } from "next";
import localFont from "next/font/local";
import { PixenoxHero } from "@/components/pixy/PixenoxHero";

// ISR: page shell is static, chat is client-side
export const revalidate = 86400;
import "@/components/pixy/pixy.css";

import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-speech",
  weight: ["400", "500", "600", "700"],
});

const sora = localFont({
  variable: "--font-interface",
  src: [{ path: "../../../../../public/fonts/Sora.ttf", weight: "400 700", style: "normal" }],
});

export const metadata: Metadata = {
  title: "Talk to Pixy — AI Assistant",
  description: "A conversation with Pixy, Pixenox's AI guide. Get instant answers about our AI systems, engineering services, and platform capabilities.",
  alternates: { canonical: '/contact/pixy' },
};

export default function PixyPage() {
  return (
    <div className={`pixy-scope ${nunito.variable} ${sora.variable}`}>
      <PixenoxHero />
    </div>
  );
}
