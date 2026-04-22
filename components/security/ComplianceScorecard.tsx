"use client";

import { Card, Title } from "@tremor/react";
import type { SecurityScan, SecurityFinding } from "@/types";

interface Props {
  scan: SecurityScan;
}

const FRAMEWORKS = ["HIPAA", "SOC2", "PCI-DSS"] as const;
type Framework = typeof FRAMEWORKS[number];

const FRAMEWORK_META: Record<Framework, { color: string; bg: string; description: string }> = {
  "HIPAA":   { color: "#4DB6AC", bg: "rgba(77,182,172,0.15)",  description: "Health data protection" },
  "SOC2":    { color: "#2A9D8F", bg: "rgba(42,157,143,0.15)",  description: "Service organization controls" },
  "PCI-DSS": { color: "#F4A261", bg: "rgba(244,162,97,0.15)",  description: "Payment card security" },
};

function scoreFramework(findings: SecurityFinding[], framework: Framework) {
  const relevant = findings.filter((f) =>
    f.complianceFrameworks.includes(framework)
  );
  if (relevant.length === 0) return null;

  const open = relevant.filter(
    (f) => f.status === "OPEN" || f.status === "IN_PROGRESS"
  );
  const passed = relevant.length - open.length;
  const pct = Math.round((passed / relevant.length) * 100);

  const bySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  open.forEach((f) => {
    if (f.severity in bySeverity) bySeverity[f.severity as keyof typeof bySeverity]++;
  });

  return { total: relevant.length, open: open.length, passed, pct, bySeverity };
}

function RiskBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="relative h-2 rounded-full overflow-hidden mt-2"
      style={{ backgroundColor: "var(--card-border)" }}>
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function ComplianceScorecard({ scan }: Props) {
  const scores = FRAMEWORKS.map((fw) => ({
    fw,
    score: scoreFramework(scan.findings, fw),
    meta: FRAMEWORK_META[fw],
  })).filter((f) => f.score !== null);

  if (scores.length === 0) return null;

  return (
    <Card
      className="rounded-xl"
      style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <Title className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Compliance Scorecard
          </Title>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Based on findings mapped to each framework
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {scores.map(({ fw, score, meta }) => {
          if (!score) return null;
          const passing = score.pct >= 80;
          const warning = score.pct >= 60 && score.pct < 80;

          return (
            <div key={fw}>
              {/* Framework header row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {fw}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {meta.description}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: passing ? "var(--accent)"
                           : warning ? "#EAB308"
                           : "var(--danger)"
                    }}
                  >
                    {score.pct}%
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {score.passed}/{score.total} checks
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <RiskBar
                pct={score.pct}
                color={passing ? "#2A9D8F" : warning ? "#EAB308" : "#bf1922"}
              />

              {/* Open findings breakdown */}
              {score.open > 0 && (
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {score.open} open finding{score.open !== 1 ? "s" : ""}:
                  </span>
                  {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const)
                    .filter((s) => score.bySeverity[s] > 0)
                    .map((s) => {
                      const colors: Record<string, string> = {
                        CRITICAL: "#bf1922", HIGH: "#F4A261",
                        MEDIUM: "#EAB308", LOW: "#2A9D8F",
                      };
                      return (
                        <span
                          key={s}
                          className="text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${colors[s]}22`, color: colors[s] }}
                        >
                          {score.bySeverity[s]} {s}
                        </span>
                      );
                    })}
                </div>
              )}

              {score.open === 0 && (
                <p className="text-xs mt-1.5" style={{ color: "var(--accent)" }}>
                  ✓ All {fw} checks passing
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
