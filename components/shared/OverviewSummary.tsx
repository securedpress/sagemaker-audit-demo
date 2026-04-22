"use client";

import { Card, Metric, Text, Flex, ProgressBar } from "@tremor/react";
import type { DashboardPayload, Severity } from "@/types";
import { ROICard } from "@/components/shared/ROICard";
import { TrendCharts } from "@/components/shared/TrendCharts";

const SEVERITY_COLOR: Record<Severity, string> = {
  CRITICAL: "#bf1922",
  HIGH: "#F4A261",
  MEDIUM: "#EAB308",
  LOW: "#2A9D8F",
  INFO: "#6C757D",
};

export function OverviewSummary({ payload }: { payload: DashboardPayload }) {
  const { cost, security, livecosts } = payload;

  const savingsPct =
    cost && cost.totalCurrentSpend > 0
      ? Math.round((cost.totalEstimatedSavings / cost.totalCurrentSpend) * 100)
      : 0;

  const securityPassPct =
    security && security.totalChecks > 0
      ? Math.round((security.passedChecks / security.totalChecks) * 100)
      : 0;

  const { entitlements } = payload;

  return (
    <div className="space-y-6">
      {/* SageMaker scope statement */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "rgba(42,157,143,0.12)", border: "1px solid rgba(42,157,143,0.3)", color: "var(--accent)" }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5z"
              stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          AWS SageMaker
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Auditing SageMaker resources in{" "}
          <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
            {entitlements.region}
          </span>
          {" "}·{" "}Account{" "}
          <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
            {entitlements.accountId}
          </span>
        </span>
      </div>

      {/* ROI summary card — cost module only */}
      {cost && <ROICard scan={cost} history={payload.history} />}

      {/* Executive summary banner */}
      <div
        className="rounded-xl px-6 py-5 border"
        style={{ backgroundColor: "rgba(42,157,143,0.08)", borderColor: "rgba(42,157,143,0.3)" }}
      >
        <Text
          className="text-xs font-bold tracking-widest uppercase mb-4"
          style={{ color: "var(--accent)" }}
        >
          Executive Summary
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cost && (
            <div>
              <Text className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                Cost Savings Identified
              </Text>
              <Metric style={{ color: "var(--gold)" }}>
                ${cost.totalEstimatedSavings.toLocaleString()}
                <span className="text-base font-normal" style={{ color: "var(--text-muted)" }}> / mo</span>
              </Metric>
              <Text className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {savingsPct}% of current ${cost.totalCurrentSpend.toLocaleString()}/mo spend
              </Text>
              <ProgressBar value={savingsPct} color="teal" className="mt-2 h-1.5" />
            </div>
          )}
          {security && (
            <div>
              <Text className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                Security Risk Score
              </Text>
              <Metric
                style={{
                  color: security.riskScore >= 70 ? "#bf1922"
                    : security.riskScore >= 40 ? "#F4A261"
                      : "#2A9D8F",
                }}
              >
                {security.riskScore}
                <span className="text-base font-normal" style={{ color: "var(--text-muted)" }}> / 100</span>
              </Metric>
              <Text className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {securityPassPct}% of {security.totalChecks} checks passed
              </Text>
              <ProgressBar
                value={securityPassPct}
                color={securityPassPct >= 80 ? "teal" : securityPassPct >= 60 ? "yellow" : "red"}
                className="mt-2 h-1.5"
              />
            </div>
          )}
          {livecosts && (
            <div>
              <Text className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                Month-to-Date Spend
              </Text>
              <Metric className="" style={{ color: "var(--text-primary)" }}>
                ${livecosts.monthToDate.toLocaleString()}
              </Metric>
              <Text className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Forecast: ${livecosts.forecastEndOfMonth.toLocaleString()} end of month
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Top cost + security summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cost && (
          <Card
            className="rounded-xl"
            style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
          >
            <Text className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Top Cost Issues
            </Text>
            <div className="space-y-2">
              {[
                ...cost.endpoints
                  .filter((e) => e.recommendation !== "OK")
                  .map((e) => ({ name: e.endpointName, savings: e.estimatedSavings })),
                ...cost.notebooks
                  .filter((n) => n.estimatedSavings > 0)
                  .map((n) => ({ name: n.instanceName, savings: n.estimatedSavings })),
                ...(cost.storageFindings ?? [])
                  .filter((s) => s.estimatedSavings > 0)
                  .map((s) => ({ name: s.bucketName, savings: s.estimatedSavings })),
              ]
                .sort((a, b) => b.savings - a.savings)
                .slice(0, 5)
                .map((item, i) => (
                  <Flex key={`${item.name}-${i}`} className="gap-2">
                    <Text className="text-xs font-mono truncate flex-1" style={{ color: "var(--text-primary)" }}>{item.name}</Text>
                    <Text className="text-xs font-semibold whitespace-nowrap" style={{ color: "var(--gold)" }}>
                      ${item.savings < 1 ? item.savings.toFixed(2) : item.savings.toLocaleString()}/mo
                    </Text>
                  </Flex>
                ))}
            </div>
          </Card>
        )}
        {security && (
          <Card
            className="rounded-xl"
            style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
          >
            <Text className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Security Findings by Severity
            </Text>
            <div className="space-y-2">
              {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as Severity[])
                .filter((s) => (security.bySeverity[s] ?? 0) > 0)
                .map((s) => (
                  <Flex key={s}>
                    <Text className="text-xs font-semibold" style={{ color: SEVERITY_COLOR[s] }}>
                      {s}
                    </Text>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${SEVERITY_COLOR[s]}22`, color: SEVERITY_COLOR[s] }}
                    >
                      {security.bySeverity[s]}
                    </span>
                  </Flex>
                ))}
            </div>
          </Card>
        )}
      </div>

      {/* Trend charts — needs at least 2 scans of history */}
      {payload.history && <TrendCharts history={payload.history} />}
    </div>
  );
}
