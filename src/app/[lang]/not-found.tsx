import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: "2rem", textAlign: "center" }}>
      <div>
        <p className="mono label">404</p>
        <h1 className="serif" style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)", margin: "0.5rem 0 1rem" }}>
          Pagina non trovata · Page not found
        </h1>
        <p>
          <Link className="u" href="/it">
            Italiano
          </Link>{" "}
          ·{" "}
          <Link className="u" href="/en">
            English
          </Link>
        </p>
      </div>
    </main>
  );
}
