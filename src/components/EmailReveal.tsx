"use client";

import { useState } from "react";
import { EMAIL_PARTS } from "@/lib/site";

// L'email non è nell'HTML: viene composta solo dopo il click (anti-spam).
export default function EmailReveal({ label, copiedLabel }: { label: string; copiedLabel: string }) {
  const [email, setEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* gli appunti possono essere bloccati: il link mailto resta disponibile */
    }
  }

  if (!email) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => setEmail(`${EMAIL_PARTS[0]}@${EMAIL_PARTS[1]}`)}>
        {label}
      </button>
    );
  }

  return (
    <span className="email-out">
      <a className="mono email-link" href={`mailto:${email}`}>
        {email}
      </a>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(email)} aria-live="polite">
        {copied ? copiedLabel : "Copy"}
      </button>
    </span>
  );
}
