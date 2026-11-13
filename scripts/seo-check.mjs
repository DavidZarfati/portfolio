// Controlli SEO, sicurezza e riservatezza sul sito costruito.
// Uso: BASE_URL=http://localhost:3111 EXPECT_INDEXABLE=true node scripts/seo-check.mjs
import { appendFileSync, readFileSync } from "node:fs";
import * as cheerio from "cheerio";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const EXPECT_INDEXABLE = process.env.EXPECT_INDEXABLE === "true";
const cfg = JSON.parse(readFileSync(new URL("../seo.config.json", import.meta.url), "utf8")).technical;

const errors = [];
const warnings = [];
const error = (url, msg) => errors.push({ url, msg });
const warn = (url, msg) => warnings.push({ url, msg });

async function get(path, init = {}) {
  const res = await fetch(BASE + path, { redirect: "manual", ...init });
  const text = init.method === "HEAD" ? "" : await res.text();
  return { res, text };
}

const LANGS = ["it", "en"];
const LINKEDIN = "https://www.linkedin.com/in/david-zarfati-64889026a/";
const GITHUB = "https://github.com/DavidZarfati";

// 1) robots e sitemap
const robots = await get("/robots.txt");
if (robots.res.status !== 200) error("/robots.txt", `risposta ${robots.res.status}`);
else if (EXPECT_INDEXABLE) {
  if (/^\s*Disallow:\s*\/\s*$/im.test(robots.text)) error("/robots.txt", "blocca tutto il sito ma doveva essere indicizzabile");
  if (!/sitemap:/i.test(robots.text)) error("/robots.txt", "manca la riga Sitemap");
} else if (!/^\s*Disallow:\s*\/\s*$/im.test(robots.text)) error("/robots.txt", "non blocca il sito ma doveva essere noindex");

const sm = await get("/sitemap.xml");
if (sm.res.status !== 200) error("/sitemap.xml", `risposta ${sm.res.status}`);
for (const l of LANGS) if (!sm.text.includes(`/${l}</loc>`)) error("/sitemap.xml", `manca la pagina /${l}`);

// 2) pagine
for (const lang of LANGS) {
  const path = `/${lang}`;
  const { res, text: html } = await get(path);
  if (res.status !== 200) {
    error(path, `risposta ${res.status}, atteso 200`);
    continue;
  }
  const $ = cheerio.load(html);

  if ($("html").attr("lang") !== lang) error(path, `<html lang> è "${$("html").attr("lang")}", atteso "${lang}"`);

  const title = $("head title").first().text().trim();
  if (!title) error(path, "title mancante");
  else if (title.length < cfg.titleMin || title.length > cfg.titleMax) error(path, `title di ${title.length} caratteri (ammessi ${cfg.titleMin}-${cfg.titleMax})`);
  else if (title.length > cfg.titleWarnAbove) warn(path, `title lungo (${title.length} caratteri)`);

  const desc = $('meta[name="description"]').attr("content")?.trim() ?? "";
  if (!desc) error(path, "meta description mancante");
  else if (desc.length < cfg.descriptionMin || desc.length > cfg.descriptionMax) warn(path, `meta description di ${desc.length} caratteri (consigliati ${cfg.descriptionMin}-${cfg.descriptionMax})`);

  const h1 = $("h1");
  if (h1.length !== 1) error(path, `trovati ${h1.length} H1 (deve essere esattamente 1)`);
  else if (!/David Zarfati/.test(h1.text())) error(path, "l'H1 non contiene il nome");

  const canonical = $('link[rel="canonical"]').attr("href");
  try {
    if (new URL(canonical).pathname !== path) error(path, `canonical punta a "${new URL(canonical).pathname}", atteso "${path}"`);
  } catch {
    error(path, `canonical mancante o non assoluto: ${canonical}`);
  }

  const alts = $('link[rel="alternate"][hreflang]').toArray().map((a) => $(a).attr("hreflang"));
  for (const need of [...LANGS, "x-default"]) if (!alts.includes(need)) error(path, `hreflang "${need}" mancante`);

  // dati strutturati
  const raw = $('script[type="application/ld+json"]').first().text();
  try {
    const graph = JSON.parse(raw)["@graph"] ?? [];
    const person = graph.find((n) => n["@type"] === "Person");
    if (!person) error(path, "JSON-LD senza Person");
    else {
      if (person.name !== "David Zarfati") error(path, "JSON-LD Person: nome diverso");
      for (const u of [LINKEDIN, GITHUB]) if (!(person.sameAs ?? []).includes(u)) error(path, `JSON-LD sameAs senza ${u}`);
    }
  } catch {
    error(path, "JSON-LD mancante o non valido");
  }

  // social
  for (const p of ["og:title", "og:description", "og:image", "og:url"]) if (!$(`meta[property="${p}"]`).attr("content")) error(path, `manca ${p}`);
  if (!$('meta[name="twitter:card"]').attr("content")) error(path, "manca twitter:card");
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage) {
    try {
      const img = await fetch(BASE + new URL(ogImage).pathname);
      if (img.status !== 200 || !(img.headers.get("content-type") ?? "").includes("image/")) error(path, `immagine og non valida (${img.status})`);
    } catch {
      error(path, "immagine og non raggiungibile");
    }
  }

  // indicizzazione coerente
  const robotsMeta = $('meta[name="robots"]').attr("content") ?? "";
  const noindex = /noindex/i.test(res.headers.get("x-robots-tag") ?? "") || /noindex/i.test(robotsMeta);
  if (EXPECT_INDEXABLE && noindex) error(path, "la pagina è noindex ma doveva essere indicizzabile");
  if (!EXPECT_INDEXABLE && !noindex) error(path, "la pagina NON è noindex ma doveva esserlo");

  // header di sicurezza
  for (const [h, v] of [["x-content-type-options", "nosniff"], ["x-frame-options", "DENY"], ["referrer-policy", null], ["permissions-policy", null]]) {
    const got = res.headers.get(h);
    if (!got || (v && got !== v)) error(path, `header ${h} mancante o errato`);
  }

  // accessibilità e struttura
  if ($("main").length !== 1) error(path, "deve esserci un solo <main>");
  if (!$('a.skip[href="#main"]').length) error(path, "manca il link 'salta al contenuto'");
  if ($("canvas#scene").attr("aria-hidden") !== "true") error(path, "il canvas 3D deve avere aria-hidden=true");
  for (const img of $("img").toArray()) if (!$(img).attr("alt")) error(path, `immagine senza alt: ${$(img).attr("src")}`);
  for (const a of $("a[href]").toArray()) {
    const href = $(a).attr("href");
    const label = $(a).text().trim() || $(a).attr("aria-label");
    if (!label) error(path, `link senza testo: ${href}`);
    if (/^https?:\/\//.test(href) && $(a).attr("target") === "_blank" && !/noopener/.test($(a).attr("rel") ?? "")) error(path, `link esterno senza rel=noopener: ${href}`);
    if (href.startsWith("#") && href.length > 1 && !$(href).length) error(path, `ancora senza destinazione: ${href}`);
  }

  // riservatezza: l'email non deve stare nell'HTML (si ricompone solo al click) e nessun segreto
  if (/zarda2001|@gmail\.com/i.test(html)) error(path, "l'indirizzo email compare nell'HTML (deve comparire solo al click)");
  if (/sbp_|sb_secret|service_role|eyJ[A-Za-z0-9_-]{30,}/.test(html)) error(path, "possibile segreto nell'HTML");
}

// 3) vere risposte 404
for (const p of ["/xx", "/it/non-esiste", "/en/this-page-does-not-exist"]) {
  const { res } = await get(p);
  if (res.status !== 404) error(p, `risposta ${res.status}, atteso 404 vero`);
}

// 4) la radice porta alla lingua predefinita
const home = await get("/");
if (![301, 302, 307, 308].includes(home.res.status) || !(home.res.headers.get("location") ?? "").includes("/it")) error("/", "la radice non reindirizza a /it");

// Esito
const lines = ["## Controlli SEO, sicurezza e riservatezza", `Modalità: ${EXPECT_INDEXABLE ? "indicizzabile" : "noindex (anteprima/test)"}`, ""];
lines.push(errors.length ? `**❌ ${errors.length} errori**` : "**✅ Nessun errore**");
for (const e of errors) lines.push(`- ❌ \`${e.url}\` – ${e.msg}`);
if (warnings.length) lines.push("", `**⚠️ ${warnings.length} avvisi**`);
for (const w of warnings) lines.push(`- ⚠️ \`${w.url}\` – ${w.msg}`);
const out = lines.join("\n");
console.log(out);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, out + "\n\n");
process.exit(errors.length ? 1 : 0);
