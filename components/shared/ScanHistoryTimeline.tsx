"use client";

import { Flex, Text } from "@tremor/react";
import type { ScanHistory, ScanHistoryEntry } from "@/types";

interface Props {
  history: ScanHistory;
}

function DeltaBadge({ value, inverted = false }: { value: number; inverted?: boolean }) {
  // inverted = true means lower is better (risk score, findings count)
  const improved = inverted ? value < 0 : value < 0;
  const neutral = value === 0;

  const color = neutral ? "var(--text-muted)"
    : improved ? "var(--accent)"
    : "var(--danger)";

  const bg = neutral ? "rgba(108,117,125,0.15)"
    : improved ? "rgba(42,157,143,0.15)"
    : "rgba(191,25,34,0.15)";

  const arrow = neutral ? "—" : improved ? "▼" : "▲";
  const formatted = Math.abs(value).toLocaleString();

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: bg, color }}
    >
      {arrow} {formatted}
    </span>
  );
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
}

function CostHistoryRow({ entry, isLatest }: { entry: ScanHistoryEntry; isLatest: boolean }) {
  return (
    <div
      className="flex items-center gap-4 py-3 px-4 rounded-lg transition-colors"
      style={{
        backgroundColor: isLatest ? "rgba(42,157,143,0.08)" : "transparent",
        border: isLatest ? "1px solid rgba(42,157,143,0.2)" : "1px solid transparent",
      }}
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: isLatest ? "var(--accent)" : "var(--card-border)" }}
        />
      </div>

      {/* Date */}
      <div className="w-28 flex-shrink-0">
        <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
          {formatDate(entry.scanTimestamp)}
        </p>
        {isLatest && (
          <span className="text-xs" style={{ color: "var(--accent)" }}>Latest</span>
        )}
      </div>

      {/* Spend */}
      <div className="flex-1">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Monthly Spend</p>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          ${entry.totalCurrentSpend?.toLocaleString()}
          {entry.spendDelta !== undefined && (
            <span className="ml-2">
              <DeltaBadge value={entry.spendDelta} inverted />
            </span>
          )}
        </p>
      </div>

      {/* Savings */}
      <div className="flex-1">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Est. Savings</p>
        <p className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
          ${entry.totalEstimatedSavings?.toLocaleString()}
          {entry.savingsDelta !== undefined && (
            <span className="ml-2">
              <DeltaBadge value={entry.savingsDelta} />
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function SecurityHistoryRow({ entry, isLatest }: { entry: ScanHistoryEntry; isLatest: boolean }) {
  return (
    <div
      className="flex items-center gap-4 py-3 px-4 rounded-lg transition-colors"
      style={{
        backgroundColor: isLatest ? "rgba(42,157,143,0.08)" : "transparent",
        border: isLatest ? "1px solid rgba(42,157,143,0.2)" : "1px solid transparent",
      }}
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: isLatest ? "var(--accent)" : "var(--card-border)" }}
        />
      </div>

      <div className="w-28 flex-shrink-0">
        <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
          {formatDate(entry.scanTimestamp)}
        </p>
        {isLatest && (
          <span className="text-xs" style={{ color: "var(--accent)" }}>Latest</span>
        )}
      </div>

      <div className="flex-1">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Risk Score</p>
        <p className="text-sm font-semibold"
          style={{
            color: (entry.riskScore ?? 0) >= 70 ? "var(--danger)"
              : (entry.riskScore ?? 0) >= 40 ? "#EAB308"
              : "var(--accent)"
          }}
        >
          {entry.riskScore}/100
          {entry.riskDelta !== undefined && (
            <span className="ml-2">
              <DeltaBadge value={entry.riskDelta} inverted />
            </span>
          )}
        </p>
      </div>

      <div className="flex-1">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Findings</p>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {entry.totalFindings}
          {entry.findingsDelta !== undefined && (
            <span className="ml-2">
              <DeltaBadge value={entry.findingsDelta} inverted />
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export function ScanHistoryTimeline({ history }: Props) {
  const hasCost = history.cost.length > 0;
  const hasSecurity = history.security.length > 0;

  if (!hasCost && !hasSecurity) return null;

  return (
    <div className="space-y-6">
      {hasCost && (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
        >
          <Flex alignItems="center" className="mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Cost Scan History
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Last {history.cost.length} scans · ▼ green = improvement
              </p>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(42,157,143,0.15)", color: "var(--accent)" }}
            >
              {history.cost.length} scans
            </span>
          </Flex>

          {/* Vertical timeline */}
          <div className="relative">
            <div
              className="absolute left-[22px] top-4 bottom-4 w-px"
              style={{ backgroundColor: "var(--card-border)" }}
            />
            <div className="space-y-1">
              {history.cost.map((entry, i) => (
                <CostHistoryRow key={entry.scanId} entry={entry} isLatest={i === 0} />
              ))}
            </div>
          </div>
        </div>
      )}

      {hasSecurity && (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
        >
          <Flex alignItems="center" className="mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Security Scan History
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Last {history.security.length} scans · ▼ green = risk reduced
              </p>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(42,157,143,0.15)", color: "var(--accent)" }}
            >
              {history.security.length} scans
            </span>
          </Flex>

          <div className="relative">
            <div
              className="absolute left-[22px] top-4 bottom-4 w-px"
              style={{ backgroundColor: "var(--card-border)" }}
            />
            <div className="space-y-1">
              {history.security.map((entry, i) => (
                <SecurityHistoryRow key={entry.scanId} entry={entry} isLatest={i === 0} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
