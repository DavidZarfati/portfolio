# Portfolio — David Zarfati

Sito portfolio in italiano e inglese. Next.js (pagine pre-generate) + scena **Three.js** a nuvola di punti che cambia forma con lo scroll:
rumore → rete (AI) → grafico in crescita (marketing) → globo (stack).

## Idee di progetto
- **Contenuto prima, 3D dopo.** Tutto il testo è nell'HTML (SEO e crawler AI). Three.js si carica solo dopo il caricamento della pagina (`import()` dinamico) e non blocca LCP.
- **Una sola scena WebGL** e una sola draw call; meno punti su mobile; rispetta `prefers-reduced-motion`; se WebGL non c'è, il sito funziona uguale.
- **Riservatezza:** l'email non è nell'HTML (si ricompone al click); nessun dato interno di aziende; solo informazioni pubbliche.
- **Sito non indicizzato** finché non si imposta `SITE_INDEXABLE=true` su Vercel.

## Controlli automatici su ogni PR
`.github/workflows/pr-checks.yml`: gitleaks, lint, tipi, audit dipendenze, build, controlli SEO/sicurezza/riservatezza
(`scripts/seo-check.mjs`) e Lighthouse. Il ramo `main` accetta solo PR con i controlli verdi.

## Sviluppo
```bash
npm install
npm run dev
```
