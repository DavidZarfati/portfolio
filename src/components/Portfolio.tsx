import type { CSSProperties } from "react";
import { content, type Dict, type Project } from "@/content/content";
import { LINKS, type Lang } from "@/lib/site";
import EmailReveal from "./EmailReveal";

const rd = (i: number, step = 0.08): CSSProperties => ({ ["--rd" as string]: `${(i * step).toFixed(2)}s` });
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

function Header({ lang, d }: { lang: Lang; d: Dict }) {
  return (
    <header className="nav">
      <a className="brand" href="#top" aria-label="David Zarfati">
        DZ<span>.</span>
      </a>
      <nav aria-label={lang === "it" ? "Sezioni" : "Sections"}>
        <a href="#about">{d.nav.about}</a>
        <a href="#craft">{d.nav.craft}</a>
        <a href="#experience">{d.nav.experience}</a>
        <a href="#work">{d.nav.work}</a>
        <a href="#stack">{d.nav.stack}</a>
        <a href="#contact">{d.nav.contact}</a>
      </nav>
      <a className="lang mono" href={`/${d.otherLang.code}`} hrefLang={d.otherLang.code} lang={d.otherLang.code}>
        {d.otherLang.label}
      </a>
    </header>
  );
}

function Hero({ d }: { d: Dict }) {
  return (
    <section id="top" className="hero" data-scene="0" data-dim="1" data-x="3.6">
      <div className="wrap hero-inner">
        <p className="kicker mono">
          <span className="dot" aria-hidden="true" />
          {d.hero.kicker}
        </p>
        <h1 className="name">
          <span className="mask">
            <span className="rise" style={{ ["--d" as string]: "0.05s" }}>
              David
            </span>
          </span>{" "}
          <span className="mask">
            <span className="rise accent" style={{ ["--d" as string]: "0.18s" }}>
              Zarfati
            </span>
          </span>
          <span className="sr"> — {d.hero.role}</span>
        </h1>
        <p className="lead serif">{d.hero.lead}</p>
        <div className="cta">
          <a className="btn btn-primary" href={LINKS.linkedin} {...ext}>
            {d.hero.ctaPrimary} <span aria-hidden="true">↗</span>
          </a>
          <a className="btn btn-ghost" href={LINKS.github} {...ext}>
            {d.hero.ctaSecondary} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-foot mono" aria-hidden="true">
          <span>
            {d.hero.scroll} <span className="bob">↓</span>
          </span>
          <span>
            {d.hero.readout} <b id="signal-value">0%</b>
          </span>
        </div>
      </div>
    </section>
  );
}

function About({ d }: { d: Dict }) {
  return (
    <section id="about" className="section" data-scene="1" data-dim="0.8" data-x="-3.4">
      <div className="wrap grid-2">
        <div>
          <p className="label mono" data-reveal>
            {d.about.label}
          </p>
          <h2 className="h2 serif" data-reveal style={rd(1)}>
            {d.about.title}
          </h2>
        </div>
        <div className="prose">
          {d.about.paragraphs.map((p, i) => (
            <p key={i} data-reveal style={rd(i + 2)}>
              {p}
            </p>
          ))}
          <dl className="facts">
            {d.about.facts.map((f, i) => (
              <div key={f.k} data-reveal style={rd(i + 4)}>
                <dt className="mono">{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Craft({ d }: { d: Dict }) {
  return (
    <section id="craft" className="section" data-scene="2" data-dim="0.6" data-x="0">
      <div className="wrap">
        <p className="label mono" data-reveal>
          {d.craft.label}
        </p>
        <h2 className="h2 serif wide" data-reveal style={rd(1)}>
          {d.craft.title}
        </h2>
        <ol className="rows">
          {d.craft.items.map((it, i) => (
            <li key={it.n} className="row" data-reveal style={rd(i, 0.1)}>
              <span className="row-n serif" aria-hidden="true">
                {it.n}
              </span>
              <h3 className="row-t serif">{it.title}</h3>
              <p className="row-p">{it.text}</p>
              <ul className="tags mono" aria-label="Tag">
                {it.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Experience({ d }: { d: Dict }) {
  const e = d.experience;
  return (
    <section id="experience" className="section" data-scene="2" data-dim="0.55" data-x="3.6">
      <div className="wrap">
        <p className="label mono" data-reveal>
          {e.label}
        </p>
        <h2 className="h2 serif wide" data-reveal style={rd(1)}>
          {e.title}
        </h2>
        <div className="exp">
          <article className="card exp-main" data-reveal style={rd(2)}>
            <p className="mono exp-period">{e.period}</p>
            <h3 className="serif exp-role">{e.role}</h3>
            <p className="exp-co">{e.company}</p>
            <ul className="bullets">
              {e.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>
          <aside className="card exp-side" data-reveal style={rd(3)}>
            <p className="mono exp-period">{e.learning.title}</p>
            <p>{e.learning.text}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  return (
    <article className={`project${p.featured ? " project-featured" : ""}`} data-reveal style={rd(i, 0.07)}>
      <a href={p.href} {...ext} className="project-link">
        <div className="project-head">
          <h3 className="serif project-name">{p.name}</h3>
          <span className="mono project-year">{p.year}</span>
        </div>
        <p className="project-desc">{p.description}</p>
        <ul className="tags mono" aria-label="Tag">
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <span className="project-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </article>
  );
}

function Work({ d }: { d: Dict }) {
  return (
    <section id="work" className="section" data-scene="1" data-dim="0.42" data-x="-3.6">
      <div className="wrap">
        <p className="label mono" data-reveal>
          {d.work.label}
        </p>
        <h2 className="h2 serif wide" data-reveal style={rd(1)}>
          {d.work.title}
        </h2>
        <p className="intro" data-reveal style={rd(2)}>
          {d.work.intro}
        </p>
        <div className="projects">
          {d.work.projects.map((p, i) => (
            <ProjectCard key={p.name} p={p} i={i} />
          ))}
        </div>
        <p className="more" data-reveal>
          {d.work.more}{" "}
          <a className="u" href={`${LINKS.github}?tab=repositories`} {...ext}>
            {d.work.moreCta} <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </section>
  );
}

function Stack({ d }: { d: Dict }) {
  const all = d.stack.groups.flatMap((g) => g.items);
  const half = Math.ceil(all.length / 2);
  const rowA = all.slice(0, half);
  const rowB = all.slice(half);
  return (
    <section id="stack" className="section" data-scene="3" data-dim="0.75" data-x="0">
      <div className="wrap">
        <p className="label mono" data-reveal>
          {d.stack.label}
        </p>
        <h2 className="h2 serif wide" data-reveal style={rd(1)}>
          {d.stack.title}
        </h2>
      </div>
      <div className="marquees" aria-hidden="true">
        {[rowA, rowB].map((row, k) => (
          <div className="marquee" key={k}>
            <div className={`track${k ? " rev" : ""}`}>
              {[...row, ...row].map((t, i) => (
                <span key={`${t}-${i}`} className="serif">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="wrap">
        <dl className="groups">
          {d.stack.groups.map((g, i) => (
            <div key={g.name} data-reveal style={rd(i, 0.06)}>
              <dt className="mono">{g.name}</dt>
              <dd>{g.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Creds({ d }: { d: Dict }) {
  return (
    <section id="credentials" className="section section-tight" data-scene="3" data-dim="0.6" data-x="0">
      <div className="wrap">
        <p className="label mono" data-reveal>
          {d.creds.label}
        </p>
        <h2 className="h2 serif wide" data-reveal style={rd(1)}>
          {d.creds.title}
        </h2>
        <ul className="creds">
          {d.creds.items.map((c, i) => (
            <li key={c.title} className="card" data-reveal style={rd(i, 0.08)}>
              <span className="mono">{c.issuer}</span>
              <p>{c.title}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Contact({ d }: { d: Dict }) {
  return (
    <section id="contact" className="section contact" data-scene="3" data-dim="0.9" data-x="0">
      <div className="wrap">
        <p className="label mono" data-reveal>
          {d.contact.label}
        </p>
        <h2 className="mega serif" data-reveal style={rd(1)}>
          <a href={LINKS.linkedin} {...ext}>
            {d.contact.title}
          </a>
        </h2>
        <p className="intro" data-reveal style={rd(2)}>
          {d.contact.text}
        </p>
        <div className="cta" data-reveal style={rd(3)}>
          <a className="btn btn-primary" href={LINKS.linkedin} {...ext}>
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
          <a className="btn btn-ghost" href={LINKS.github} {...ext}>
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <EmailReveal label={d.contact.emailShow} copiedLabel={d.contact.emailCopied} />
        </div>
      </div>
    </section>
  );
}

export default function Portfolio({ lang }: { lang: Lang }) {
  const d = content[lang];
  return (
    <>
      <Header lang={lang} d={d} />
      <main id="main">
        <Hero d={d} />
        <About d={d} />
        <Craft d={d} />
        <Experience d={d} />
        <Work d={d} />
        <Stack d={d} />
        <Creds d={d} />
        <Contact d={d} />
      </main>
      <footer className="foot">
        <div className="wrap foot-in mono">
          <span>© 2026 David Zarfati</span>
          <a href={LINKS.repo} {...ext}>
            {d.footer.built} ↗
          </a>
        </div>
      </footer>
    </>
  );
}
