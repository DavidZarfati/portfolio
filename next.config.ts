import type { NextConfig } from "next";

// Il sito NON è indicizzabile finché non si imposta SITE_INDEXABLE=true (decisione del proprietario).
const indexable = process.env.SITE_INDEXABLE === "true";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/it", permanent: false }];
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    const noindex = indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [{ source: "/:path*", headers: [...security, ...noindex] }];
  },
};

export default nextConfig;
