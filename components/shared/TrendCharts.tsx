"use client";

import { Card, Title } from "@tremor/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from "recharts";
import type { ScanHistory } from "@/types";

interface Props {
  history: ScanHistory;
}

function ChartTooltip({ active, payload, label, valuePrefix = "", valueSuffix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded px-3 py-2 text-xs shadow-lg"
      style={{ backgroundColor: "var(--header-bg)", border: "1px solid rgba(42,157,143,0.4)", color: "#fff" }}
    >
      <p className="font-medium mb-1" style={{ color: "#CDEDEA" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-bold" style={{ color: p.color }}>
          {valuePrefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{valueSuffix}
        </p>
      ))}
    </div>
  );
}

export function TrendCharts({ history }: Props) {
  const hasCost = history.cost.length >= 2;
  const hasSecurity = history.security.length >= 2;

  if (!hasCost && !hasSecurity) return null;

  // Build chart data oldest → newest
  const costData = [...history.cost]
    .reverse()
    .map((s) => ({
      date: new Date(s.scanTimestamp).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      Spend: s.totalCurrentSpend ?? 0,
      Savings: s.totalEstimatedSavings ?? 0,
    }));

  const securityData = [...history.security]
    .reverse()
    .map((s) => ({
      date: new Date(s.scanTimestamp).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      "Risk Score": s.riskScore ?? 0,
      Findings: s.totalFindings ?? 0,
    }));

  // Determine trend direction for callout
  const spendTrend = hasCost
    ? costData[costData.length - 1].Spend - costData[0].Spend
    : 0;
  const riskTrend = hasSecurity
    ? securityData[securityData.length - 1]["Risk Score"] - securityData[0]["Risk Score"]
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Spend trend */}
      {hasCost && (
        <Card
          className="rounded-xl"
          style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <Title className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Spend Trend
            </Title>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: spendTrend <= 0 ? "rgba(42,157,143,0.15)" : "rgba(191,25,34,0.15)",
                color: spendTrend <= 0 ? "var(--accent)" : "var(--danger)",
              }}
            >
              {spendTrend <= 0 ? "▼" : "▲"} ${Math.abs(spendTrend).toLocaleString()} since first scan
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Monthly spend vs identified savings · last {costData.length} scans
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={costData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4A261" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F4A261" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2A9D8F" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2A9D8F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <ReTooltip content={<ChartTooltip valuePrefix="$" />} />
              <Area type="monotone" dataKey="Spend" stroke="#F4A261" strokeWidth={2} fill="url(#spendGrad)" dot={{ fill: "#F4A261", r: 3 }} />
              <Area type="monotone" dataKey="Savings" stroke="#2A9D8F" strokeWidth={2} fill="url(#savingsGrad)" dot={{ fill: "#2A9D8F", r: 3 }} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "#F4A261" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Spend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded border-dashed" style={{ backgroundColor: "#2A9D8F" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Savings identified</span>
            </div>
          </div>
        </Card>
      )}

      {/* Risk score trend */}
      {hasSecurity && (
        <Card
          className="rounded-xl"
          style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <Title className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Risk Score Trend
            </Title>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: riskTrend <= 0 ? "rgba(42,157,143,0.15)" : "rgba(191,25,34,0.15)",
                color: riskTrend <= 0 ? "var(--accent)" : "var(--danger)",
              }}
            >
              {riskTrend <= 0 ? "▼" : "▲"} {Math.abs(riskTrend)} pts since first scan
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Risk score · last {securityData.length} scans · lower is better
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={securityData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#bf1922" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#bf1922" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false} tickLine={false}
              />
              <ReferenceLine y={70} stroke="rgba(191,25,34,0.4)" strokeDasharray="3 3"
                label={{ value: "High risk", position: "insideTopRight", fontSize: 9, fill: "rgba(191,25,34,0.7)" }} />
              <ReferenceLine y={40} stroke="rgba(234,179,8,0.4)" strokeDasharray="3 3"
                label={{ value: "Medium risk", position: "insideTopRight", fontSize: 9, fill: "rgba(234,179,8,0.7)" }} />
              <ReTooltip content={<ChartTooltip valueSuffix="/100" />} />
              <Area type="monotone" dataKey="Risk Score" stroke="#bf1922" strokeWidth={2}
                fill="url(#riskGrad)" dot={{ fill: "#bf1922", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "#bf1922" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Risk score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "rgba(191,25,34,0.4)", borderTop: "1px dashed rgba(191,25,34,0.4)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Thresholds</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
