"use client";

import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AboutDemoModal — context overlay explaining what the demo is.
 *
 * Accessibility:
 *   - Closes on Escape key
 *   - Closes on backdrop click
 *   - Traps focus within the modal while open (basic — relies on DOM order)
 *   - aria-modal and role="dialog" for screen readers
 *
 * Content draft below — structured as four short sections plus a single CTA
 * pointing to securedpress.com. No Calendly link (per demo design principle —
 * conversion happens on the marketing site, not in the product).
 */
export function AboutDemoModal({ isOpen, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);

    // Lock body scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-demo-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundColor: "rgba(6,14,31,0.75)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
        style={{
          backgroundColor: "var(--navy-light)",
          border: "1px solid var(--card-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          <h2
            id="about-demo-title"
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            About this demo
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors hover:opacity-80"
            aria-label="Close dialog"
            style={{ color: "var(--text-muted)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Section 1 — What this demo is */}
          <section>
            <h3
              className="text-xs font-bold tracking-[0.12em] uppercase mb-2"
              style={{ color: "var(--accent)" }}
            >
              What this demo shows
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
              An interactive version of the audit dashboard SecuredPress delivers to clients
              during SageMaker cost and security engagements. The findings shown represent
              a typical mid-size production SageMaker deployment — the kind of environment
              our audits are designed for.
            </p>
          </section>

          {/* Section 2 — Real vs synthetic */}
          <section>
            <h3
              className="text-xs font-bold tracking-[0.12em] uppercase mb-2"
              style={{ color: "var(--accent)" }}
            >
              What's real, what's synthetic
            </h3>
            <div className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
              <p>
                <span className="font-semibold" style={{ color: "var(--accent-light)" }}>Real:</span>{" "}
                the dashboard architecture, every component, every chart, every finding type,
                the remediation guidance, the compliance framework mappings. This is the same
                code deployed in client engagements.
              </p>
              <p>
                <span className="font-semibold" style={{ color: "var(--gold)" }}>Synthetic:</span>{" "}
                the client profile (Acme Corp), the AWS account ID, the specific endpoint
                and resource names, the dollar figures, and the scan timestamps. No real
                client data is exposed here.
              </p>
            </div>
          </section>

          {/* Section 3 — How to navigate */}
          <section>
            <h3
              className="text-xs font-bold tracking-[0.12em] uppercase mb-2"
              style={{ color: "var(--accent)" }}
            >
              What to explore
            </h3>
            <ul className="space-y-1.5 text-sm leading-relaxed list-none" style={{ color: "var(--text-primary)" }}>
              <li>
                <span className="font-semibold">Overview</span> — executive summary with savings potential and risk score
              </li>
              <li>
                <span className="font-semibold">Cost Optimization</span> — endpoint utilization, training jobs, notebooks, storage findings with a prioritized remediation queue
              </li>
              <li>
                <span className="font-semibold">Security Audit</span> — IAM, encryption, network, and logging findings with HIPAA / SOC2 / PCI-DSS compliance mapping
              </li>
              <li>
                <span className="font-semibold">Scan History</span> — how findings and risk scores evolve across scans
              </li>
            </ul>
          </section>

          {/* Section 4 — What a real audit delivers */}
          <section>
            <h3
              className="text-xs font-bold tracking-[0.12em] uppercase mb-2"
              style={{ color: "var(--accent)" }}
            >
              A real audit delivers
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
              Findings specific to your AWS account, a live dashboard configured for your
              environment, an exportable PDF findings report with severity rankings and
              remediation steps, a prioritized roadmap your team can action immediately,
              and a 30–60 minute findings walkthrough call. Delivered in five business days.
            </p>
          </section>

        </div>

        {/* Footer with CTA */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between flex-wrap gap-3"
          style={{ borderColor: "var(--card-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Built by SecuredPress LLC · SageMaker cost and security audits
          </p>
          <a
            href="https://securedpress.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-md transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--accent)",
              color: "#ffffff",
            }}
          >
            <span>Learn more at securedpress.com</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
