"use client";

interface Props {
  type: "no-scans" | "no-cost" | "no-security" | "expired" | "error";
  message?: string;
  onRetry?: () => void;
}

const ILLUSTRATIONS: Record<Props["type"], JSX.Element> = {
  "no-scans": (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
      <path d="M24 40h32M40 24v32" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="40" cy="40" r="6" fill="var(--accent)" opacity="0.3" />
    </svg>
  ),
  "no-cost": (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="16" y="24" width="48" height="32" rx="4" stroke="var(--gold)" strokeWidth="2" opacity="0.4" />
      <path d="M28 40h8M44 40h8M28 48h24" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <circle cx="40" cy="32" r="4" fill="var(--gold)" opacity="0.3" />
    </svg>
  ),
  "no-security": (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M40 16L56 24v16c0 10-7.2 19.3-16 22-8.8-2.7-16-12-16-22V24L40 16z"
        stroke="var(--accent)" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M32 40l5 5 11-11" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  ),
  expired: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="28" stroke="var(--danger)" strokeWidth="2" opacity="0.4" />
      <path d="M40 28v14l8 8" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="40" cy="40" r="2" fill="var(--danger)" opacity="0.4" />
    </svg>
  ),
  error: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M40 16L68 64H12L40 16z" stroke="var(--danger)" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M40 36v12" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="40" cy="54" r="2" fill="var(--danger)" opacity="0.6" />
    </svg>
  ),
};

const DEFAULT_MESSAGES: Record<Props["type"], string> = {
  "no-scans": "No scan data found. Run the scanner to populate this dashboard.",
  "no-cost": "No cost scans found. Run ml-cost-report to generate findings.",
  "no-security": "No security scans found. Run sagemaker-audit-lab to generate findings.",
  expired: "Your contract has expired. Contact SecuredPress to renew your subscription.",
  error: "Something went wrong loading your dashboard. Please try again.",
};

export function EmptyState({ type, message, onRetry }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-8 rounded-xl border border-dashed text-center"
      style={{ borderColor: "var(--card-border)", backgroundColor: "var(--navy-light)" }}
    >
      <div className="mb-5">{ILLUSTRATIONS[type]}</div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
        {type === "expired" ? "Subscription Expired" :
         type === "error" ? "Unable to Load Dashboard" :
         "No Data Available"}
      </p>
      <p className="text-xs max-w-sm" style={{ color: "var(--text-muted)" }}>
        {message ?? DEFAULT_MESSAGES[type]}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            backgroundColor: "rgba(42,157,143,0.15)",
            border: "1px solid var(--accent)",
            color: "var(--accent)",
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
