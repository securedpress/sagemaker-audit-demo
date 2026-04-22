"use client";

interface Props {
  onAboutClick: () => void;
}

/**
 * DemoBanner — sticky context strip at the top of the dashboard.
 *
 * Two jobs:
 *   1. Make it unmissable that the data is synthetic (legal / clarity)
 *   2. Provide one-click access to the AboutDemoModal for prospects who
 *      want deeper context on what the demo represents.
 *
 * Intentionally slim (~36px) so it doesn't dominate the viewport.
 * Not dismissible — this is a context marker, not a notification.
 */
export function DemoBanner({ onAboutClick }: Props) {
  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 md:px-8 py-2 border-b"
      style={{
        backgroundColor: "rgba(42,157,143,0.12)",
        borderColor: "rgba(42,157,143,0.3)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Left — context message */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: "#2A9D8F" }}
          aria-hidden="true"
        />
        <p
          className="text-xs md:text-sm font-medium truncate"
          style={{ color: "#CDEDEA" }}
        >
          <span className="font-semibold">Interactive Demo</span>
          <span className="mx-2 opacity-60">·</span>
          <span>Synthetic Data</span>
          <span className="hidden md:inline">
            <span className="mx-2 opacity-60">·</span>
            <span className="opacity-80">
              Real engagements deliver findings specific to your SageMaker environment
            </span>
          </span>
        </p>
      </div>

      {/* Right — About this demo trigger */}
      <button
        onClick={onAboutClick}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 hover:opacity-80"
        style={{
          backgroundColor: "rgba(42,157,143,0.25)",
          color: "#CDEDEA",
          border: "1px solid rgba(205,237,234,0.3)",
        }}
        aria-label="About this demo"
      >
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
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>About this demo</span>
      </button>
    </div>
  );
}
