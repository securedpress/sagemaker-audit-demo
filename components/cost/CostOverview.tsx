"use client";

import { RemediationQueue } from "@/components/cost/RemediationQueue";
import {
  Card,
  Title,
  Text,
  Badge,
  Metric,
  Flex,
  ProgressBar,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  BadgeDelta,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@tremor/react";
import type { CostScan, CostExplorerData, CostRecommendation } from "@/types";
import { DonutPieChart, DonutLegend } from "@/components/shared/DonutPieChart";
import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const $ = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n < 1 ? 2 : 0,
    maximumFractionDigits: n < 1 ? 2 : 0,
  });

const ACTION_COLOR: Record<CostRecommendation, "red" | "orange" | "yellow" | "green" | "slate"> = {
  DELETE: "red",
  RIGHT_SIZE: "orange",
  SCALE_DOWN: "yellow",
  CONSOLIDATE: "slate",
  USE_SERVERLESS: "slate",
  ENABLE_SPOT: "yellow",
  OPTIMIZE: "yellow",
  OK: "green",
};

interface Props {
  scan: CostScan;
  liveCosts: CostExplorerData;
}

export function CostOverview({ scan, liveCosts }: Props) {
  const savingsPct =
    scan.totalCurrentSpend > 0
      ? Math.round((scan.totalEstimatedSavings / scan.totalCurrentSpend) * 100)
      : 0;

  const chartData = liveCosts.dailyCosts.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "Daily Spend": d.amount,
  }));

  // Aggregate duplicate service names before passing to the donut chart.
  // Cost Explorer can return the same service label (e.g. "Host") across
  // multiple line items; merging them here prevents duplicate React keys
  // and ensures the chart slice values are correct.
  const donutData = Object.values(
    liveCosts.serviceBreakdown.reduce<Record<string, { name: string; value: number }>>(
      (acc, s) => {
        if (acc[s.service]) {
          acc[s.service].value += s.amount;
        } else {
          acc[s.service] = { name: s.service, value: s.amount };
        }
        return acc;
      },
      {}
    )
  );

  // Derived metrics for spotlight bar
  const annualized = scan.totalEstimatedSavings * 12;
  const quickWins = scan.endpoints.filter(
    (e) => e.recommendation !== "OK" && e.estimatedSavings > 0
  ).length + scan.notebooks.filter((n) => n.estimatedSavings > 0).length
    + (scan.storageFindings ?? []).filter((s) => s.estimatedSavings > 0).length;

  return (
    <div className="space-y-6">
      {/* ── Metric spotlight bar ─────────────────────────────────────────── */}
      {/* 
        Divider strategy:
        Mobile  (1-col): borderBottom on col 1 + 2, none on col 3
        Desktop (3-col): borderRight on col 1 + 2 via .spotlight-col-divider in globals.css
      */}
      <div
        className="spotlight-bar rounded-xl overflow-hidden"
        style={{ backgroundColor: "rgba(244,162,97,0.06)", border: "1px solid rgba(244,162,97,0.25)" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3">

          {/* Col 1 — Monthly savings */}
          <div
            className="spotlight-col flex items-center gap-4 px-5 py-5"
            style={{ borderBottom: "1px solid rgba(244,162,97,0.2)" }}
          >
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(244,162,97,0.2)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2v1.5M10 16.5V18M5.5 10H4M16 10h-1.5" stroke="#F4A261" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="10" cy="10" r="4" stroke="#F4A261" strokeWidth="1.5" />
                <path d="M10 7.5v1l1 1-1 1v1" stroke="#F4A261" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1"
                style={{ color: "var(--text-muted)" }}>Monthly Savings</p>
              <p className="text-2xl font-bold leading-none" style={{ color: "var(--gold)" }}>
                {$(scan.totalEstimatedSavings)}
                <span className="text-sm font-normal ml-1" style={{ color: "var(--text-muted)" }}>/mo</span>
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {savingsPct}% of current spend
              </p>
            </div>
          </div>

          {/* Col 2 — Annualized projection */}
          <div
            className="spotlight-col flex items-center gap-4 px-5 py-5"
            style={{ borderBottom: "1px solid rgba(244,162,97,0.2)" }}
          >
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(42,157,143,0.2)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 14l4-4 3 3 4-5 3 3" stroke="#2A9D8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 17h14" stroke="#2A9D8F" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1"
                style={{ color: "var(--text-muted)" }}>Annual Projection</p>
              <p className="text-2xl font-bold leading-none" style={{ color: "var(--accent)" }}>
                {$(annualized)}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                estimated annual impact
              </p>
            </div>
          </div>

          {/* Col 3 — Quick wins */}
          <div className="spotlight-col flex items-center gap-4 px-5 py-5">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(42,157,143,0.2)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10l3.5 3.5L15 7" stroke="#2A9D8F" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="10" r="7.5" stroke="#2A9D8F" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1"
                style={{ color: "var(--text-muted)" }}>Quick Wins</p>
              <p className="text-2xl font-bold leading-none" style={{ color: "var(--accent)" }}>
                {quickWins}
                <span className="text-sm font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                  resource{quickWins !== 1 ? "s" : ""}
                </span>
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                addressable recommendations
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl">
          <Text className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>MTD Spend</Text>
          <Metric className="" style={{ color: "var(--text-primary)" }}>{$(liveCosts.monthToDate)}</Metric>
          <Text className="text-xs" style={{ color: "var(--text-muted)" }}>
            Forecast: {$(liveCosts.forecastEndOfMonth)}
          </Text>
        </Card>
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl">
          <Text className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Savings Available</Text>
          <Flex alignItems="end" className="gap-2 mt-1">
            <Metric className="" style={{ color: "var(--text-primary)" }}>{$(scan.totalEstimatedSavings)}</Metric>
          </Flex>
          <ProgressBar value={savingsPct} color="amber" className="mt-2 h-1.5" />
        </Card>
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl">
          <Text className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Endpoints Flagged</Text>
          <Metric className="" style={{ color: "var(--text-primary)" }}>
            {scan.endpoints.filter((e) => e.recommendation !== "OK").length}
          </Metric>
          <Text className="text-xs" style={{ color: "var(--text-muted)" }}>of {scan.endpoints.length} endpoints</Text>
        </Card>
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl">
          <Text className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>vs Last Month</Text>
          <Flex alignItems="end" className="gap-2 mt-1">
            <Metric className="" style={{ color: "var(--text-primary)" }}>{Math.abs(liveCosts.vsLastMonth)}%</Metric>
            <BadgeDelta
              deltaType={liveCosts.vsLastMonth > 0 ? "increase" : "decrease"}
              size="sm"
            />
          </Flex>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid rgba(244,162,97,0.25)" }} className="rounded-xl md:col-span-2">
          <Flex alignItems="center">
            <Title className="font-semibold">Daily SageMaker Spend</Title>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(42,157,143,0.15)", color: "var(--accent)" }}>Last 30 days</span>
          </Flex>
          <ResponsiveContainer width="100%" height={210} className="mt-4">
            <ReAreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4A261" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F4A261" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--grid-line, #1C2541)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={48}
              />
              <ReTooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                  fontSize: "12px",
                }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, "Daily Spend"]}
                labelStyle={{ color: "var(--text-muted)" }}
                cursor={{ stroke: "#F4A261", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="Daily Spend"
                stroke="#F4A261"
                strokeWidth={2}
                fill="url(#spendGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#F4A261", stroke: "#1e293b", strokeWidth: 2 }}
              />
            </ReAreaChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl">
          <Title className="font-semibold">Spend by Usage Type</Title>
          <DonutPieChart
            data={donutData}
            valueFormatter={(v) => `$${v.toFixed(0)}`}
            centerLabel="Spend"
            height={200}
          />
          <DonutLegend data={donutData} />
        </Card>
      </div>

      {/* Findings tabs */}
      <TabGroup>
        <TabList className="border-b border-slate-800 mb-4">
          <Tab className="data-[selected]:text-teal-400 data-[selected]:border-teal-400" style={{ color: "var(--text-muted)" }}>
            Endpoints ({scan.endpoints.length})
          </Tab>
          <Tab className="data-[selected]:text-teal-400 data-[selected]:border-teal-400" style={{ color: "var(--text-muted)" }}>
            Training Jobs ({scan.trainingJobs.length})
          </Tab>
          <Tab className="data-[selected]:text-teal-400 data-[selected]:border-teal-400" style={{ color: "var(--text-muted)" }}>
            Notebooks ({scan.notebooks.length})
          </Tab>
          <Tab className="data-[selected]:text-teal-400 data-[selected]:border-teal-400" style={{ color: "var(--text-muted)" }}>
            Storage ({(scan.storageFindings ?? []).length})
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Endpoint</TableHeaderCell>
                    <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Instance</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Utilization</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Monthly Cost</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Est. Savings</TableHeaderCell>
                    <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Action</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...scan.endpoints]
                    .sort((a, b) => b.estimatedSavings - a.estimatedSavings)
                    .map((ep, i) => (
                      <TableRow key={`${ep.endpointName}-${i}`} className="">
                        <TableCell>
                          <Text className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>{ep.endpointName}</Text>
                          {ep.recommendedInstanceType && (
                            <Text className="text-xs" style={{ color: "var(--text-muted)" }}>→ {ep.recommendedInstanceType}</Text>
                          )}
                        </TableCell>
                        <TableCell>
                          <Text className="font-mono text-xs">
                            {ep.instanceType} ×{ep.instanceCount}
                          </Text>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-xs font-bold ${ep.utilizationPct < 20 ? "text-red-400" : ep.utilizationPct < 50 ? "text-yellow-400" : "text-green-400"}`}>
                            {ep.utilizationPct.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Text className="" style={{ color: "var(--text-primary)" }}>{$(ep.monthlyCost)}</Text>
                        </TableCell>
                        <TableCell className="text-right">
                          <Text className="font-semibold" style={{ color: "var(--gold)" }}>
                            {ep.estimatedSavings > 0 ? $(ep.estimatedSavings) : "—"}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <Badge color={ACTION_COLOR[ep.recommendation]} size="xs">
                            {ep.recommendation.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Job</TableHeaderCell>
                    <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Instance</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Hours</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Cost</TableHeaderCell>
                    <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Spot Eligible</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Spot Savings</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scan.trainingJobs.map((j, i) => (
                    <TableRow key={`${j.jobName}-${i}`} className="">
                      <TableCell><Text className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>{j.jobName}</Text></TableCell>
                      <TableCell><Text className="font-mono text-xs">{j.instanceType} ×{j.instanceCount}</Text></TableCell>
                      <TableCell className="text-right"><Text className="" style={{ color: "var(--text-primary)" }}>{j.durationHours.toFixed(1)}h</Text></TableCell>
                      <TableCell className="text-right"><Text className="" style={{ color: "var(--text-primary)" }}>${j.cost.toFixed(2)}</Text></TableCell>
                      <TableCell><Badge color={j.spotEligible ? "green" : "slate"} size="xs">{j.spotEligible ? "Yes" : "No"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Text className="font-semibold" style={{ color: "var(--gold)" }}>
                          {j.estimatedSpotSavings > 0 ? `$${j.estimatedSpotSavings.toFixed(2)}` : "—"}
                        </Text>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Instance</TableHeaderCell>
                    <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Type</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Idle Hours</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Monthly Cost</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Savings</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scan.notebooks.map((nb, i) => (
                    <TableRow key={`${nb.instanceName}-${i}`} className="">
                      <TableCell><Text className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>{nb.instanceName}</Text></TableCell>
                      <TableCell><Text className="font-mono text-xs">{nb.instanceType}</Text></TableCell>
                      <TableCell className="text-right">
                        <Text className={nb.idleHours > 48 ? "text-red-400" : "text-yellow-400"}>{nb.idleHours}h</Text>
                      </TableCell>
                      <TableCell className="text-right"><Text className="" style={{ color: "var(--text-primary)" }}>{$(nb.monthlyCost)}</Text></TableCell>
                      <TableCell className="text-right"><Text className="font-semibold" style={{ color: "var(--gold)" }}>{$(nb.estimatedSavings)}</Text></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell style={{ color: "var(--text-muted)" }}>Bucket</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Cold Objects</TableHeaderCell>
                    <TableHeaderCell style={{ color: "var(--text-muted)" }}>Lifecycle Policy</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Monthly Cost</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: "var(--text-muted)" }}>Savings</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(scan.storageFindings ?? []).map((sf, i) => (
                    <TableRow key={`${sf.bucketName}-${i}`}>
                      <TableCell><Text className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>{sf.bucketName}</Text></TableCell>
                      <TableCell className="text-right"><Text className="font-mono text-xs">{sf.coldObjectCount}</Text></TableCell>
                      <TableCell>
                        <Text className={sf.hasLifecyclePolicy ? "text-green-400" : "text-red-400"}>
                          {sf.hasLifecyclePolicy ? "Yes" : "No"}
                        </Text>
                      </TableCell>
                      <TableCell className="text-right"><Text style={{ color: "var(--text-primary)" }}>{$(sf.monthlyCost)}</Text></TableCell>
                      <TableCell className="text-right"><Text className="font-semibold" style={{ color: "var(--gold)" }}>{$(sf.estimatedSavings)}</Text></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
      {/* Remediation priority queue */}
      <RemediationQueue scan={scan} />
    </div>
  );
}
