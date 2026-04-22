"use client";

import { useState } from "react";
import { Card, Title } from "@tremor/react";
import type { CostScan, CostRecommendation } from "@/types";

interface Props {
  scan: CostScan;
}

type EffortLevel = "LOW" | "MEDIUM" | "HIGH";

interface ActionItem {
  id: string;
  name: string;
  resource: string;
  action: CostRecommendation;
  effort: EffortLevel;
  savings: number;
  current: number;
  detail: string;
}

const EFFORT_ORDER: Record<EffortLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };

const ACTION_META: Record<CostRecommendation, { label: string; color: string; bg: string }> = {
  DELETE: { label: "Delete", color: "#bf1922", bg: "rgba(191,25,34,0.12)" },
  RIGHT_SIZE: { label: "Right-size", color: "#F4A261", bg: "rgba(244,162,97,0.12)" },
  SCALE_DOWN: { label: "Scale down", color: "#EAB308", bg: "rgba(234,179,8,0.12)" },
  CONSOLIDATE: { label: "Consolidate", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  USE_SERVERLESS: { label: "Use Serverless", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  ENABLE_SPOT: { label: "Enable Spot", color: "#2A9D8F", bg: "rgba(42,157,143,0.12)" },
  OPTIMIZE: { label: "Optimize", color: "#4DB6AC", bg: "rgba(77,182,172,0.12)" },
  OK: { label: "OK", color: "#6C757D", bg: "rgba(108,117,125,0.12)" },
};

const EFFORT_META: Record<EffortLevel, { color: string; label: string }> = {
  LOW: { color: "#2A9D8F", label: "Quick win" },
  MEDIUM: { color: "#EAB308", label: "Medium" },
  HIGH: { color: "#bf1922", label: "Complex" },
};

const $ = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n < 1 ? 2 : 0,
    maximumFractionDigits: n < 1 ? 2 : 0,
  });

type FilterKey = "ALL" | EffortLevel;

export function RemediationQueue({ scan }: Props) {
  const [effortFilter, setEffortFilter] = useState<FilterKey>("ALL");

  // Combine endpoints + notebooks into flat action items, sorted by savings desc
  // then effort asc so quick wins bubble up within same savings tier
  const items: ActionItem[] = [
    ...scan.endpoints
      .filter((e) => e.recommendation !== "OK" && e.estimatedSavings > 0)
      .map((e): ActionItem => ({
        id: e.endpointName,
        name: e.endpointName,
        resource: `${e.instanceType} ×${e.instanceCount}`,
        action: e.recommendation,
        effort: "LOW", // endpoints are always quick wins for now
        savings: e.estimatedSavings,
        current: e.monthlyCost,
        detail: e.recommendedInstanceType
          ? `Resize to ${e.recommendedInstanceType}`
          : `${e.utilizationPct}% utilization`,
      })),
    ...scan.notebooks
      .filter((n) => n.estimatedSavings > 0)
      .map((n): ActionItem => ({
        id: n.instanceName,
        name: n.instanceName,
        resource: n.instanceType,
        action: "SCALE_DOWN",
        effort: "LOW",
        savings: n.estimatedSavings,
        current: n.monthlyCost,
        detail: `${n.idleHours}h idle`,
      })),
    ...scan.trainingJobs
      .filter((j) => j.spotEligible && j.estimatedSpotSavings > 0)
      .map((j): ActionItem => ({
        id: j.jobName,
        name: j.jobName,
        resource: `${j.instanceType} ×${j.instanceCount}`,
        action: "ENABLE_SPOT",
        effort: "MEDIUM",
        savings: j.estimatedSpotSavings,
        current: j.cost,
        detail: `${j.durationHours}h avg duration`,
      })),
    ...(scan.storageFindings ?? [])
      .filter((s) => s.estimatedSavings > 0)
      .map((s): ActionItem => ({
        id: s.bucketName,
        name: s.bucketName,
        resource: "S3",
        action: "OPTIMIZE",
        effort: "LOW",
        savings: s.estimatedSavings,
        current: s.monthlyCost,
        detail: s.bucketName.includes("/")
          ? `${s.coldObjectCount} excess model versions`
          : s.coldObjectCount === 1 && !s.hasLifecyclePolicy && s.monthlyCost >= 10
            ? `Cross-region data transfer — sync to us-east-1`
            : s.hasLifecyclePolicy
              ? `${s.coldObjectCount} objects in wrong storage class`
              : "No lifecycle policy",
      })),
  ]
    .sort((a, b) =>
      b.savings !== a.savings
        ? b.savings - a.savings
        : EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort]
    );

  const filtered = effortFilter === "ALL"
    ? items
    : items.filter((i) => i.effort === effortFilter);

  const totalSavings = filtered.reduce((s, i) => s + i.savings, 0);

  const filters: FilterKey[] = ["ALL", "LOW", "MEDIUM", "HIGH"];
  const filterCounts: Record<FilterKey, number> = {
    ALL: items.length,
    LOW: items.filter((i) => i.effort === "LOW").length,
    MEDIUM: items.filter((i) => i.effort === "MEDIUM").length,
    HIGH: items.filter((i) => i.effort === "HIGH").length,
  };

  return (
    <Card
      className="rounded-xl"
      style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <Title className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Remediation Priority Queue
          </Title>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Sorted by savings · highest impact first
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setEffortFilter(f)}
              className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
              style={{
                backgroundColor: effortFilter === f
                  ? (f === "ALL" ? "rgba(42,157,143,0.2)" : f === "LOW" ? "rgba(42,157,143,0.2)" : f === "MEDIUM" ? "rgba(234,179,8,0.2)" : "rgba(191,25,34,0.2)")
                  : "var(--card-border)",
                color: effortFilter === f
                  ? (f === "ALL" ? "var(--accent)" : f === "LOW" ? "var(--accent)" : f === "MEDIUM" ? "#EAB308" : "var(--danger)")
                  : "var(--text-muted)",
                border: "1px solid transparent",
              }}
            >
              {f === "ALL" ? "All" : EFFORT_META[f].label} ({filterCounts[f]})
            </button>
          ))}
        </div>
      </div>

      {/* Total savings bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-lg mb-4"
        style={{ backgroundColor: "rgba(42,157,143,0.08)", border: "1px solid rgba(42,157,143,0.2)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {filtered.length} action{filtered.length !== 1 ? "s" : ""} shown
        </p>
        <p className="text-sm font-bold" style={{ color: "var(--gold)" }}>
          {$(totalSavings)}/mo potential savings
        </p>
      </div>

      {/* Queue rows */}
      <div className="space-y-2">
        {filtered.map((item, idx) => {
          const actionMeta = ACTION_META[item.action];
          const effortMeta = EFFORT_META[item.effort];
          return (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ backgroundColor: "var(--navy)", border: "1px solid var(--card-border)" }}
            >
              {/* Rank */}
              <span
                className="text-xs font-bold w-5 text-center flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                {idx + 1}
              </span>

              {/* Name + detail */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {item.name}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {item.resource} · {item.detail}
                </p>
              </div>

              {/* Action badge */}
              <span
                className="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0"
                style={{ backgroundColor: actionMeta.bg, color: actionMeta.color }}
              >
                {actionMeta.label}
              </span>

              {/* Effort badge */}
              <span
                className="hidden md:inline-flex text-xs font-medium px-2 py-0.5 rounded flex-shrink-0"
                style={{ color: effortMeta.color, backgroundColor: "transparent", border: `1px solid ${effortMeta.color}` }}
              >
                {effortMeta.label}
              </span>

              {/* Savings */}
              <p className="text-sm font-bold flex-shrink-0" style={{ color: "var(--gold)" }}>
                {$(item.savings)}/mo
              </p>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No items match this filter.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
