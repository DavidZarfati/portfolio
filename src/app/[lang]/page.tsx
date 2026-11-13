import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Portfolio from "@/components/Portfolio";
import { content } from "@/content/content";
import { LINKS, SITE_URL, isLang } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = content[lang];
  return {
    title: { absolute: d.meta.title },
    description: d.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { it: "/it", en: "/en", "x-default": "/it" },
    },
    openGraph: {
      type: "website",
      title: d.meta.ogTitle,
      description: d.meta.description,
      url: `/${lang}`,
      siteName: "David Zarfati",
      locale: lang === "it" ? "it_IT" : "en_US",
    },
    twitter: { card: "summary_large_image", title: d.meta.ogTitle, description: d.meta.description },
  };
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = content[lang];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#david-zarfati`,
        name: "David Zarfati",
        jobTitle: d.hero.role,
        description: d.meta.description,
        url: `${SITE_URL}/${lang}`,
        sameAs: [LINKS.linkedin, LINKS.github],
        worksFor: { "@type": "Organization", name: "LEADEXMedia" },
        knowsAbout: ["Artificial intelligence", "Automation", "Web development", "React", "Next.js", "Python", "Technical SEO", "Performance marketing"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "David Zarfati",
        url: SITE_URL,
        inLanguage: lang,
        publisher: { "@id": `${SITE_URL}/#david-zarfati` },
      },
    ],
  };

  return (
    <>
      <Portfolio lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
