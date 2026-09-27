import type { Metadata } from "next";
import localFont from "next/font/local";
import { PixenoxHero } from "@/components/pixy/PixenoxHero";

export const dynamic = 'force-dynamic';
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
  title: "Pixy | Pixenox",
  description: "A conversation with Pixy, Pixenox's AI guide.",
};

export default function PixyPage() {
  return (
    <div className={`pixy-scope ${nunito.variable} ${sora.variable}`}>
      <PixenoxHero />
    </div>
  );
}
