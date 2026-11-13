import { ImageResponse } from "next/og";
import { content } from "@/content/content";
import { isLang } from "@/lib/site";

export const alt = "David Zarfati — AI & Automation Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const d = content[isLang(lang) ? lang : "it"];
  const dots = Array.from({ length: 90 }, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180;
    const r = 30 + (i % 30) * 10;
    return { x: 880 + Math.cos(a) * r * 1.1, y: 315 + Math.sin(a) * r * 0.9, s: 3 + (i % 4) };
  });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "#0a0b0a", color: "#ecebe4", padding: 72, position: "relative" }}>
        {dots.map((p, i) => (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: p.s, height: p.s, borderRadius: 99, background: i % 11 === 0 ? "#ff5a1f" : "#c6ff3d", opacity: 0.8 }} />
        ))}
        <div style={{ fontSize: 26, letterSpacing: 4, color: "#c6ff3d", textTransform: "uppercase" }}>AI & Automation · Full-Stack · Marketing</div>
        <div style={{ fontSize: 120, lineHeight: 1, marginTop: 18 }}>David Zarfati</div>
        <div style={{ fontSize: 34, marginTop: 24, color: "#a3a49a", maxWidth: 760 }}>{d.hero.lead}</div>
      </div>
    ),
    size,
  );
}
