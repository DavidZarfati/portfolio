import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import Effects from "@/components/Effects";
import { content } from "@/content/content";
import { LANGS, SITE_URL, isLang } from "@/lib/site";
import "../globals.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const viewport: Viewport = { themeColor: "#0a0b0a", colorScheme: "dark" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  authors: [{ name: "David Zarfati" }],
  creator: "David Zarfati",
  // Codice di verifica di Google Search Console (si imposta come variabile su Vercel quando serve).
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = isLang(lang) ? lang : "it";
  return (
    <html lang={l} className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          {content[l].skip}
        </a>
        <canvas id="scene" aria-hidden="true" />
        {children}
        <Effects />
      </body>
    </html>
  );
}
