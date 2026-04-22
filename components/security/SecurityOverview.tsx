"use client";

import { ComplianceScorecard } from "@/components/security/ComplianceScorecard";
import { PrintSecurityReport } from "@/components/security/PrintSecurityReport";
import {
  Card,
  Title,
  Text,
  Badge,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Flex,
  Metric,
  ProgressBar,
} from "@tremor/react";
import type { SecurityScan, Severity, SecurityCategory } from "@/types";
import { DonutPieChart, DonutLegend } from "@/components/shared/DonutPieChart";

const SEVERITY_COLORS: Record<Severity, "red" | "orange" | "yellow" | "teal" | "slate"> = {
  CRITICAL: "red",
  HIGH: "orange",
  MEDIUM: "yellow",
  LOW: "teal",
  INFO: "slate",
};

const SEVERITY_HEX: Record<Severity, string> = {
  CRITICAL: "#bf1922",
  HIGH:     "#F4A261",
  MEDIUM:   "#EAB308",
  LOW:      "#2A9D8F",
  INFO:     "#6C757D",
};

// Background and foreground colors per severity, for both themes
const SEVERITY_BADGE: Record<Severity, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "#bf1922",  text: "#FFFFFF", border: "#8B0000" },
  HIGH:     { bg: "#F4A261",  text: "#1a0a00", border: "#C46A30" },
  MEDIUM:   { bg: "#EAB308",  text: "#1a1000", border: "#B38A00" },
  LOW:      { bg: "#2A9D8F",  text: "#FFFFFF", border: "#1a6b60" },
  INFO:     { bg: "#6C757D",  text: "#FFFFFF", border: "#4a5259" },
};

function SeverityBadge({ severity }: { severity: Severity }) {
  const { bg, text, border } = SEVERITY_BADGE[severity];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase"
      style={{ backgroundColor: bg, color: text, border: `1px solid ${border}` }}
    >
      {severity}
    </span>
  );
}

const EFFORT_COLOR: Record<string, string> = {
  LOW:    "var(--accent)",
  MEDIUM: "#EAB308",
  HIGH:   "var(--danger)",
};

interface Props {
  scan: SecurityScan;
}

export function SecurityOverview({ scan }: Props) {
  const openFindings = scan.findings.filter((f) => f.status === "OPEN");
  const criticalAndHigh = openFindings.filter(
    (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
  );

  const donutData = (
    Object.entries(scan.byCategory) as [SecurityCategory, number][]
  )
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, count]) => ({ name: cat.replace("_", " "), value: count }));

  return (
    <div className="space-y-6">
      {/* Print-only report — hidden on screen, shown in @media print */}
      <PrintSecurityReport scan={scan} />
      {/* Screen-only UI — hidden in @media print */}
      <div className="screen-only space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl p-5">
          <Text className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Risk Score</Text>
          <Metric
            style={{
              color: scan.riskScore >= 70 ? "var(--danger)"
                   : scan.riskScore >= 40 ? "#EAB308"
                   : "var(--accent)"
            }}
          >
            {scan.riskScore}<span className="text-lg" style={{ color: "var(--text-muted)" }}>/100</span>
          </Metric>
        </Card>
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl p-5">
          <Text className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Critical / High</Text>
          <Metric style={{ color: criticalAndHigh.length > 0 ? "var(--danger)" : "var(--accent)" }}>
            {criticalAndHigh.length}
          </Metric>
          <Text className="text-xs" style={{ color: "var(--text-muted)" }}>{scan.totalFindings} total findings</Text>
        </Card>
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl p-5">
          <Text className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Checks Passed</Text>
          <Metric className="" style={{ color: "var(--text-primary)" }}>{scan.passedChecks}</Metric>
          <Text className="text-xs" style={{ color: "var(--text-muted)" }}>of {scan.totalChecks} total</Text>
          <ProgressBar
            value={Math.round((scan.passedChecks / scan.totalChecks) * 100)}
            color="green"
            className="mt-2 h-1.5"
          />
        </Card>
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl p-5">
          <Text className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Open Findings</Text>
          <Metric className="" style={{ color: "var(--text-primary)" }}>{openFindings.length}</Metric>
          <Text className="text-xs" style={{ color: "var(--text-muted)" }}>
            {scan.findings.filter((f) => f.status === "RESOLVED").length} resolved
          </Text>
        </Card>
      </div>

      {/* Breakdown chart + category list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl md:col-span-1 p-5">
          <Title className="font-semibold">Findings by Category</Title>
          <DonutPieChart
            data={donutData}
            centerLabel="Findings"
            height={200}
          />
          <DonutLegend data={donutData} />
        </Card>

        {/* Critical findings quick list */}
        <Card style={{ backgroundColor: "rgba(191,25,34,0.05)", border: "1px solid rgba(191,25,34,0.25)" }} className="rounded-xl md:col-span-2 p-5">
          <Flex>
            <Title className="font-semibold">Critical &amp; High Findings</Title>
            <Badge color="red">{criticalAndHigh.length} open</Badge>
          </Flex>
          <div className="mt-4 space-y-4">
            {criticalAndHigh.slice(0, 6).map((f) => (
              <div
                key={f.findingId}
                className="border-l-2 pl-4 py-2" style={{ borderColor: "var(--danger)" }}
              >
                <Flex>
                  <Text className="text-sm font-medium">{f.title}</Text>
                  <SeverityBadge severity={f.severity} />
                </Flex>
                <Text className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>
                  {f.resource.length > 60
                    ? `...${f.resource.slice(-60)}`
                    : f.resource}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Compliance scorecard */}
      <ComplianceScorecard scan={scan} />

      {/* All findings table */}
      <Card style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }} className="rounded-xl p-5">
        <Title className="font-semibold">All Findings</Title>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Finding</TableHeaderCell>
              <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Severity</TableHeaderCell>
              <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Category</TableHeaderCell>
              <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Resource</TableHeaderCell>
              <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Effort</TableHeaderCell>
              <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Compliance</TableHeaderCell>
              <TableHeaderCell className="" style={{ color: "var(--text-muted)" }}>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scan.findings
              .sort((a, b) => {
                const order: Severity[] = ["CRITICAL","HIGH","MEDIUM","LOW","INFO"];
                return order.indexOf(a.severity) - order.indexOf(b.severity);
              })
              .map((f) => (
                <TableRow key={f.findingId} className="transition-colors">
                  <TableCell>
                    <Text className="text-sm" style={{ color: "var(--text-primary)" }}>{f.title}</Text>
                    <Text className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{f.description}</Text>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={f.severity} />
                  </TableCell>
                  <TableCell>
                    <Text className="text-xs" style={{ color: "var(--text-primary)" }}>
                      {f.category.replace("_", " ")}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {f.resourceType}
                    </Text>
                    <Text className="text-xs truncate max-w-[180px]" style={{ color: "var(--text-muted)" }}>
                      {f.resource}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text className={"text-xs font-semibold"} style={{ color: EFFORT_COLOR[f.remediationEffort] }}>
                      {f.remediationEffort}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {f.complianceFrameworks.map((fw) => (
                        <Badge key={`${f.findingId}-${fw}`} color="slate" size="xs">{fw}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={
                        f.status === "OPEN"
                          ? "red"
                          : f.status === "IN_PROGRESS"
                          ? "yellow"
                          : f.status === "RESOLVED"
                          ? "green"
                          : "slate"
                      }
                      size="xs"
                    >
                      {f.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
      </div> {/* end screen-only */}
    </div>
  );
}