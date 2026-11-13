import type { Lang } from "@/lib/site";

// Solo informazioni PUBBLICHE e verificabili (README del profilo GitHub e repository pubblici).
// Nessun dato interno di LEADEXMedia (numeri, clienti, accessi, importi).

export type Project = {
  name: string;
  year: string;
  href: string;
  description: string;
  tags: string[];
  featured?: boolean;
};

export type Dict = {
  meta: { title: string; description: string; ogTitle: string };
  skip: string;
  nav: { about: string; craft: string; experience: string; work: string; stack: string; contact: string };
  langName: string;
  otherLang: { code: Lang; label: string };
  hero: {
    kicker: string;
    role: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scroll: string;
    readout: string;
  };
  about: { label: string; title: string; paragraphs: string[]; facts: { k: string; v: string }[] };
  craft: { label: string; title: string; items: { n: string; title: string; text: string; tags: string[] }[] };
  experience: {
    label: string;
    title: string;
    role: string;
    company: string;
    period: string;
    bullets: string[];
    learning: { title: string; text: string };
  };
  work: { label: string; title: string; intro: string; projects: Project[]; more: string; moreCta: string };
  stack: { label: string; title: string; groups: { name: string; items: string[] }[] };
  creds: { label: string; title: string; items: { issuer: string; title: string }[] };
  contact: { label: string; title: string; text: string; email: string; emailShow: string; emailCopied: string };
  footer: { built: string };
};

const it: Dict = {
  meta: {
    title: "David Zarfati | AI & Automation Developer",
    description:
      "Portfolio di David Zarfati: sviluppatore AI e automazione, full-stack e performance marketing. Agenti AI, automazioni Python, siti Next.js veloci e SEO tecnico.",
    ogTitle: "David Zarfati — AI & Automation Developer",
  },
  skip: "Vai al contenuto",
  nav: { about: "Chi sono", craft: "Cosa faccio", experience: "Esperienza", work: "Progetti", stack: "Stack", contact: "Contatti" },
  langName: "Italiano",
  otherLang: { code: "en", label: "EN" },
  hero: {
    kicker: "AI & Automation · Full-Stack · Performance Marketing",
    role: "Sviluppatore AI & Automazione",
    lead: "Trasformo il rumore in segnale: automazioni, agenti AI e siti veloci che si fanno trovare.",
    ctaPrimary: "Scrivimi su LinkedIn",
    ctaSecondary: "Vedi il codice su GitHub",
    scroll: "scorri",
    readout: "segnale",
  },
  about: {
    label: "01 — Chi sono",
    title: "A metà strada tra codice e crescita.",
    paragraphs: [
      "Ho una formazione in ingegneria informatica e lavoro dove lo sviluppo software incontra il performance marketing. Costruisco automazioni, bot, integrazioni API e prototipi con AI, e li porto in fretta da idea a strumento che funziona davvero.",
      "In LEADEXMedia unisco le due metà del mestiere: sviluppo siti e landing page, gestisco campagne paid, leggo i dati e creo gli assistenti AI interni che fanno risparmiare tempo al team.",
    ],
    facts: [
      { k: "Ruolo", v: "Web Developer & Performance Marketing Specialist" },
      { k: "Lavoro con", v: "Python · JavaScript · React · Next.js · Supabase" },
      { k: "Mi interessa", v: "Agenti AI, SEO tecnico, strumenti interni" },
    ],
  },
  craft: {
    label: "02 — Cosa faccio",
    title: "Tre discipline, un solo obiettivo: risultati misurabili.",
    items: [
      {
        n: "01",
        title: "AI & Automazione",
        text: "Agenti, bot e pipeline che tolgono lavoro ripetitivo: scraping, report automatici, integrazioni API e assistenti conversazionali. Sperimento con Claude, MCP e modelli locali.",
        tags: ["Python", "Claude API", "MCP", "Telegram", "Selenium"],
      },
      {
        n: "02",
        title: "Sviluppo Full-Stack",
        text: "Interfacce React e Next.js con backend Node/Express, database SQL e Supabase. Codice con test e controlli automatici a ogni modifica, per consegnare spesso senza rompere nulla.",
        tags: ["React", "Next.js", "Node.js", "Supabase", "MySQL"],
      },
      {
        n: "03",
        title: "Performance Marketing & SEO",
        text: "Campagne paid, analisi di dati e KPI, SEO tecnico: indicizzazione, dati strutturati, Core Web Vitals, Search Console e GA4. Le pagine devono essere veloci, leggibili dai motori e dall'AI.",
        tags: ["Paid media", "SEO tecnico", "GA4", "Search Console", "Core Web Vitals"],
      },
    ],
  },
  experience: {
    label: "03 — Esperienza",
    title: "Dove metto in pratica tutto questo.",
    role: "Web Developer & Performance Marketing Specialist",
    company: "LEADEXMedia (Alea 5 S.r.l.s.)",
    period: "Oggi",
    bullets: [
      "Sviluppo di siti e landing page orientati alla conversione e alla SEO.",
      "Gestione di campagne paid media, con analisi di dati e KPI.",
      "Strumenti interni con AI: assistenti e automazioni che velocizzano il lavoro del team.",
      "Integrazione di fonti dati (Search Console, Analytics, PageSpeed) in flussi di lavoro automatizzati.",
    ],
    learning: {
      title: "Formazione",
      text: "Ingegneria informatica, più un percorso full-stack pratico: HTML/CSS, JavaScript, React, Node/Express e database SQL, con decine di progetti pubblicati su GitHub.",
    },
  },
  work: {
    label: "04 — Progetti",
    title: "Codice che puoi leggere.",
    intro: "Una selezione dei miei repository pubblici. Ogni progetto è aperto e documentato.",
    projects: [
      {
        name: "SEO Stack Test",
        year: "2026",
        href: "https://github.com/DavidZarfati/seo-stack-test",
        description:
          "Stack di prova per siti veloci e ben indicizzabili: Next.js con pagine pre-generate, Supabase con regole di sicurezza, aggiornamento immediato dei contenuti e controlli automatici su ogni modifica (SEO tecnica, Yoast, Lighthouse, ricerca di segreti).",
        tags: ["Next.js", "Supabase", "Vercel", "GitHub Actions", "SEO"],
        featured: true,
      },
      {
        name: "Telegram News & Crypto Bot",
        year: "2026",
        href: "https://github.com/DavidZarfati/telegram-bot-notizie-crypto",
        description:
          "Bot Telegram con comandi asincroni: ultime notizie tech e AI da scraping filtrato per parole chiave e prezzi crypto in tempo reale da API esterne.",
        tags: ["Python", "Telegram", "Scraping", "API"],
      },
      {
        name: "Web Search Email Digest",
        year: "2026",
        href: "https://github.com/DavidZarfati/ricerca-web-email",
        description:
          "Pipeline completa: automazione del browser con Selenium, raccolta dei risultati in CSV e invio automatico di un report via email.",
        tags: ["Python", "Selenium", "CSV", "Email"],
      },
      {
        name: "Advanced Sales Report",
        year: "2026",
        href: "https://github.com/DavidZarfati/report-vendite-avanzato",
        description:
          "Legge un file Excel di vendite, calcola i KPI (fatturato, miglior venditore, prodotto e regione top), genera quattro grafici e un report Excel multi-foglio.",
        tags: ["Python", "pandas", "Excel", "Grafici"],
      },
      {
        name: "CodeCraftHub",
        year: "2026",
        href: "https://github.com/DavidZarfati/codecrafthub",
        description: "API REST con Node.js ed Express per tracciare i corsi da imparare: piccola piattaforma di apprendimento per sviluppatori.",
        tags: ["Node.js", "Express", "REST API"],
      },
      {
        name: "Emotion Detection",
        year: "2026",
        href: "https://github.com/DavidZarfati/emotion_detection",
        description: "Capstone della certificazione IBM AI Developer: rilevamento delle emozioni nel testo con Watson NLP.",
        tags: ["IBM Watson NLP", "Python", "AI"],
      },
    ],
    more: "E oltre 90 repository pubblici: script di automazione, scraping, reportistica, app React e API Express.",
    moreCta: "Tutti i repository",
  },
  stack: {
    label: "05 — Stack",
    title: "Gli strumenti con cui lavoro.",
    groups: [
      { name: "Linguaggi", items: ["Python", "JavaScript", "TypeScript", "HTML", "CSS", "SQL"] },
      { name: "Web", items: ["React", "Next.js", "Node.js", "Express", "Three.js", "React Native / Expo"] },
      { name: "Dati & backend", items: ["Supabase", "MySQL", "Selenium", "pandas", "API REST"] },
      { name: "AI", items: ["Claude API", "MCP", "IBM Watson NLP", "Agenti AI"] },
      { name: "Marketing & SEO", items: ["Paid media", "SEO tecnico", "GA4", "Search Console", "Core Web Vitals"] },
      { name: "Qualità & rilascio", items: ["Git / GitHub", "GitHub Actions", "Vercel", "Lighthouse"] },
    ],
  },
  creds: {
    label: "06 — Certificazioni",
    title: "Formazione continua.",
    items: [
      { issuer: "IBM", title: "AI Developer — Capstone: Emotion Detection con Watson NLP" },
      { issuer: "Anthropic (Skilljar)", title: "Building with the Claude API" },
      { issuer: "Google", title: "Google AI Certification" },
    ],
  },
  contact: {
    label: "07 — Contatti",
    title: "Parliamone.",
    text: "Hai un'automazione da costruire, un sito da far trovare o un'idea con l'AI? Scrivimi: rispondo volentieri.",
    email: "Email",
    emailShow: "Mostra email",
    emailCopied: "Copiata negli appunti",
  },
  footer: { built: "Costruito con Next.js e Three.js · codice aperto su GitHub" },
};

const en: Dict = {
  meta: {
    title: "David Zarfati | AI & Automation Developer",
    description:
      "David Zarfati's portfolio: AI & automation developer, full-stack and performance marketing. AI agents, Python automations, fast Next.js sites and technical SEO.",
    ogTitle: "David Zarfati — AI & Automation Developer",
  },
  skip: "Skip to content",
  nav: { about: "About", craft: "What I do", experience: "Experience", work: "Projects", stack: "Stack", contact: "Contact" },
  langName: "English",
  otherLang: { code: "it", label: "IT" },
  hero: {
    kicker: "AI & Automation · Full-Stack · Performance Marketing",
    role: "AI & Automation Developer",
    lead: "I turn noise into signal: automations, AI agents and fast sites that get found.",
    ctaPrimary: "Message me on LinkedIn",
    ctaSecondary: "See the code on GitHub",
    scroll: "scroll",
    readout: "signal",
  },
  about: {
    label: "01 — About",
    title: "Halfway between code and growth.",
    paragraphs: [
      "I studied computer engineering and I work where software development meets performance marketing. I build automations, bots, API integrations and AI prototypes, and I take them quickly from idea to a tool that actually works.",
      "At LEADEXMedia I combine both halves of the job: I build sites and landing pages, run paid campaigns, read the data and create the internal AI assistants that save the team time.",
    ],
    facts: [
      { k: "Role", v: "Web Developer & Performance Marketing Specialist" },
      { k: "I work with", v: "Python · JavaScript · React · Next.js · Supabase" },
      { k: "Interested in", v: "AI agents, technical SEO, internal tools" },
    ],
  },
  craft: {
    label: "02 — What I do",
    title: "Three disciplines, one goal: measurable results.",
    items: [
      {
        n: "01",
        title: "AI & Automation",
        text: "Agents, bots and pipelines that remove repetitive work: scraping, automatic reports, API integrations and conversational assistants. I experiment with Claude, MCP and local models.",
        tags: ["Python", "Claude API", "MCP", "Telegram", "Selenium"],
      },
      {
        n: "02",
        title: "Full-Stack Development",
        text: "React and Next.js interfaces with Node/Express backends, SQL databases and Supabase. Code with tests and automated checks on every change, so I can ship often without breaking things.",
        tags: ["React", "Next.js", "Node.js", "Supabase", "MySQL"],
      },
      {
        n: "03",
        title: "Performance Marketing & SEO",
        text: "Paid campaigns, data and KPI analysis, technical SEO: indexing, structured data, Core Web Vitals, Search Console and GA4. Pages must be fast and readable by search engines and by AI.",
        tags: ["Paid media", "Technical SEO", "GA4", "Search Console", "Core Web Vitals"],
      },
    ],
  },
  experience: {
    label: "03 — Experience",
    title: "Where I put all of this to work.",
    role: "Web Developer & Performance Marketing Specialist",
    company: "LEADEXMedia (Alea 5 S.r.l.s.)",
    period: "Present",
    bullets: [
      "Building sites and landing pages focused on conversion and SEO.",
      "Running paid media campaigns, with data and KPI analysis.",
      "Internal AI tools: assistants and automations that speed up the team's work.",
      "Plugging data sources (Search Console, Analytics, PageSpeed) into automated workflows.",
    ],
    learning: {
      title: "Education",
      text: "Computer engineering, plus a hands-on full-stack path: HTML/CSS, JavaScript, React, Node/Express and SQL databases, with dozens of projects published on GitHub.",
    },
  },
  work: {
    label: "04 — Projects",
    title: "Code you can read.",
    intro: "A selection of my public repositories. Every project is open and documented.",
    projects: [
      {
        name: "SEO Stack Test",
        year: "2026",
        href: "https://github.com/DavidZarfati/seo-stack-test",
        description:
          "A test stack for fast, well-indexed sites: Next.js with pre-rendered pages, Supabase with security rules, instant content updates and automated checks on every change (technical SEO, Yoast, Lighthouse, secret scanning).",
        tags: ["Next.js", "Supabase", "Vercel", "GitHub Actions", "SEO"],
        featured: true,
      },
      {
        name: "Telegram News & Crypto Bot",
        year: "2026",
        href: "https://github.com/DavidZarfati/telegram-bot-notizie-crypto",
        description:
          "Telegram bot with async commands: the latest tech and AI news from keyword-filtered scraping, plus real-time crypto prices from external APIs.",
        tags: ["Python", "Telegram", "Scraping", "API"],
      },
      {
        name: "Web Search Email Digest",
        year: "2026",
        href: "https://github.com/DavidZarfati/ricerca-web-email",
        description: "End-to-end pipeline: browser automation with Selenium, results collected into CSV, and an automatic email report.",
        tags: ["Python", "Selenium", "CSV", "Email"],
      },
      {
        name: "Advanced Sales Report",
        year: "2026",
        href: "https://github.com/DavidZarfati/report-vendite-avanzato",
        description:
          "Reads a sales Excel file, computes KPIs (revenue, top seller, top product and region), generates four charts and a multi-sheet Excel report.",
        tags: ["Python", "pandas", "Excel", "Charts"],
      },
      {
        name: "CodeCraftHub",
        year: "2026",
        href: "https://github.com/DavidZarfati/codecrafthub",
        description: "REST API with Node.js and Express to track the courses you want to learn: a small learning platform for developers.",
        tags: ["Node.js", "Express", "REST API"],
      },
      {
        name: "Emotion Detection",
        year: "2026",
        href: "https://github.com/DavidZarfati/emotion_detection",
        description: "Capstone of the IBM AI Developer certification: detecting emotions in text with Watson NLP.",
        tags: ["IBM Watson NLP", "Python", "AI"],
      },
    ],
    more: "Plus 90+ public repositories: automation scripts, scraping, reporting, React apps and Express APIs.",
    moreCta: "All repositories",
  },
  stack: {
    label: "05 — Stack",
    title: "The tools I work with.",
    groups: [
      { name: "Languages", items: ["Python", "JavaScript", "TypeScript", "HTML", "CSS", "SQL"] },
      { name: "Web", items: ["React", "Next.js", "Node.js", "Express", "Three.js", "React Native / Expo"] },
      { name: "Data & backend", items: ["Supabase", "MySQL", "Selenium", "pandas", "REST APIs"] },
      { name: "AI", items: ["Claude API", "MCP", "IBM Watson NLP", "AI agents"] },
      { name: "Marketing & SEO", items: ["Paid media", "Technical SEO", "GA4", "Search Console", "Core Web Vitals"] },
      { name: "Quality & delivery", items: ["Git / GitHub", "GitHub Actions", "Vercel", "Lighthouse"] },
    ],
  },
  creds: {
    label: "06 — Certifications",
    title: "Always learning.",
    items: [
      { issuer: "IBM", title: "AI Developer — Capstone: Emotion Detection with Watson NLP" },
      { issuer: "Anthropic (Skilljar)", title: "Building with the Claude API" },
      { issuer: "Google", title: "Google AI Certification" },
    ],
  },
  contact: {
    label: "07 — Contact",
    title: "Let's talk.",
    text: "Got an automation to build, a site that needs to get found, or an idea with AI? Write to me — I'd love to hear it.",
    email: "Email",
    emailShow: "Show email",
    emailCopied: "Copied to clipboard",
  },
  footer: { built: "Built with Next.js and Three.js · open source on GitHub" },
};

export const content: Record<Lang, Dict> = { it, en };
