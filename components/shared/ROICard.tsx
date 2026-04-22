"use client";

import type { CostScan, ScanHistory } from "@/types";

interface Props {
  scan: CostScan;
  history?: ScanHistory;
}

const $ = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n < 1 ? 2 : 0,
    maximumFractionDigits: n < 1 ? 2 : 0,
  });

export function ROICard({ scan, history }: Props) {
  const annualized = scan.totalEstimatedSavings * 12;
  const savingsPct = scan.totalCurrentSpend > 0
    ? Math.round((scan.totalEstimatedSavings / scan.totalCurrentSpend) * 100)
    : 0;

  // Savings improvement since oldest scan in history
  const costHistory = history?.cost ?? [];
  const oldest = costHistory.length > 0
    ? costHistory[costHistory.length - 1]
    : null;
  const savingsGrowth = oldest?.totalEstimatedSavings != null
    ? scan.totalEstimatedSavings - oldest.totalEstimatedSavings
    : null;

  // Quick wins — LOW effort endpoints with savings
  const quickWinCount = scan.endpoints.filter(
    (e) => e.recommendation !== "OK" && e.estimatedSavings > 0
  ).length
    + scan.notebooks.filter((n) => n.estimatedSavings > 0).length
    + (scan.storageFindings ?? []).filter((s) => s.estimatedSavings > 0).length;

  const reducedTo = scan.totalCurrentSpend - scan.totalEstimatedSavings;

  const stats = [
    {
      label: "Monthly Savings",
      value: $(scan.totalEstimatedSavings),
      sub: `${savingsPct}% of current spend`,
      color: "var(--gold)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M10 2v1.5M10 16.5V18M5.5 10H4M16 10h-1.5" stroke="#F4A261" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="10" r="4" stroke="#F4A261" strokeWidth="1.5" />
          <path d="M10 7.5v1l1 1-1 1v1" stroke="#F4A261" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      bg: "rgba(244,162,97,0.15)",
    },
    {
      label: "Annual Projection",
      value: $(annualized),
      sub: "estimated 12-month impact",
      color: "var(--accent)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M3 14l4-4 3 3 4-5 3 3" stroke="#2A9D8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 17h14" stroke="#2A9D8F" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      bg: "rgba(42,157,143,0.15)",
    },
    {
      label: "Reduced Spend",
      value: $(reducedTo) + "/mo",
      sub: "after all recommendations",
      color: "var(--text-primary)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M10 15V5M10 5l-4 4M10 5l4 4" stroke="#2A9D8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      bg: "rgba(42,157,143,0.15)",
    },
    ...(savingsGrowth !== null ? [{
      label: "Savings Growth",
      value: $(savingsGrowth),
      sub: `identified since ${new Date(oldest!.scanTimestamp).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
      color: savingsGrowth >= 0 ? "var(--accent)" : "var(--danger)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M3 13l4-6 3 4 3-5 4 7" stroke="#2A9D8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      bg: "rgba(42,157,143,0.15)",
    }] : []),
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(244,162,97,0.25)" }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ backgroundColor: "rgba(244,162,97,0.08)", borderBottom: "1px solid rgba(244,162,97,0.15)" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
          ROI Summary
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {quickWinCount} addressable resource{quickWinCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stat grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ backgroundColor: "var(--navy-light)" }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="px-5 py-4"
            style={{
              borderRight: i < stats.length - 1 ? "1px solid var(--card-border)" : "none",
              borderBottom: "none",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: s.bg }}
              >
                {s.icon}
              </div>
              <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </p>
            </div>
            <p className="text-xl font-bold leading-tight" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Narrative footer */}
      <div
        className="px-5 py-3"
        style={{ backgroundColor: "rgba(244,162,97,0.04)", borderTop: "1px solid rgba(244,162,97,0.15)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Implementing all {quickWinCount} recommendations reduces your monthly SageMaker spend from{" "}
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{$(scan.totalCurrentSpend)}</span>
          {" "}to{" "}
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{$(reducedTo)}</span>
          {" "}— saving{" "}
          <span style={{ color: "var(--gold)", fontWeight: 600 }}>{$(annualized)}/yr</span>.
        </p>
      </div>
    </div>
  );
}
