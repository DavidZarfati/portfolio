import type { MetadataRoute } from "next";
import { LANGS, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return LANGS.map((lang) => ({
    url: `${SITE_URL}/${lang}`,
    lastModified: new Date(),
    alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE_URL}/${l}`])) },
  }));
}
