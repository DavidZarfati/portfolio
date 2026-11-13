export const LANGS = ["it", "en"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const INDEXABLE = process.env.SITE_INDEXABLE === "true";

export const LINKS = {
  linkedin: "https://www.linkedin.com/in/david-zarfati-64889026a/",
  github: "https://github.com/DavidZarfati",
  repo: "https://github.com/DavidZarfati/portfolio",
} as const;

// L'email è già pubblica nel profilo GitHub. Qui è divisa in pezzi e ricomposta solo al click,
// così i bot che leggono l'HTML non la raccolgono.
export const EMAIL_PARTS = ["zarda2001", "gmail.com"] as const;
