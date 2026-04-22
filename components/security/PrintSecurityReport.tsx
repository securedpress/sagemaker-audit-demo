"use client";

// This component is ONLY visible in @media print.
// On screen it is display:none. The existing SecurityOverview UI is hidden
// in print via .screen-only { display: none } in globals.css.

import type { SecurityScan, SecurityFinding, Severity } from "@/types";

interface Props {
  scan: SecurityScan;
}

const SEVERITY_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

const SEVERITY_PRINT_COLORS: Record<Severity, { bg: string; text: string }> = {
  CRITICAL: { bg: "#bf1922", text: "#FFFFFF" },
  HIGH:     { bg: "#F4A261", text: "#1a0a00" },
  MEDIUM:   { bg: "#EAB308", text: "#1a1000" },
  LOW:      { bg: "#2A9D8F", text: "#FFFFFF" },
  INFO:     { bg: "#6C757D", text: "#FFFFFF" },
};

const STATUS_COLORS: Record<string, string> = {
  OPEN:          "#bf1922",
  IN_PROGRESS:   "#EAB308",
  RESOLVED:      "#2A9D8F",
  ACCEPTED_RISK: "#6C757D",
};

function SeverityPill({ severity }: { severity: Severity }) {
  const { bg, text } = SEVERITY_PRINT_COLORS[severity];
  return (
    <span style={{
      backgroundColor: bg,
      color: text,
      padding: "2px 7px",
      borderRadius: "4px",
      fontSize: "9px",
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      {severity}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "#6C757D";
  return (
    <span style={{
      color,
      fontSize: "9px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      whiteSpace: "nowrap",
    }}>
      {status.replace("_", " ")}
    </span>
  );
}

// ── Section 1: Summary table ───────────────────────────────────────────────
function SummaryTable({ findings }: { findings: SecurityFinding[] }) {
  const sorted = [...findings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  return (
    <div style={{ marginBottom: "24px" }}>
      <h2 style={{
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "#0A1128",
        borderBottom: "2px solid #2A9D8F",
        paddingBottom: "6px",
        marginBottom: "10px",
      }}>
        Findings Summary — {findings.length} total
      </h2>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "9px",
        tableLayout: "fixed",
      }}>
        <colgroup>
          <col style={{ width: "38%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "16%" }} />
        </colgroup>
        <thead>
          <tr style={{ backgroundColor: "#F0F4F8" }}>
            {["Finding", "Severity", "Category", "Effort", "Status"].map((h) => (
              <th key={h} style={{
                padding: "6px 8px",
                textAlign: "left",
                fontSize: "8px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6C757D",
                borderBottom: "1px solid #DEE2E6",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((f, i) => (
            <tr key={f.findingId} style={{
              backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F8F9FA",
              borderBottom: "1px solid #EEF0F2",
            }}>
              <td style={{ padding: "6px 8px", color: "#0A1128", fontWeight: 500, lineHeight: 1.3 }}>
                {f.title}
              </td>
              <td style={{ padding: "6px 8px" }}>
                <SeverityPill severity={f.severity} />
              </td>
              <td style={{ padding: "6px 8px", color: "#495057", fontSize: "8px" }}>
                {f.category.replace("_", " ")}
              </td>
              <td style={{ padding: "6px 8px", color: "#495057", fontSize: "8px" }}>
                {f.remediationEffort}
              </td>
              <td style={{ padding: "6px 8px" }}>
                <StatusPill status={f.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Section 2: Detail cards ────────────────────────────────────────────────
function DetailCards({ findings }: { findings: SecurityFinding[] }) {
  const sorted = [...findings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  return (
    <div>
      <h2 style={{
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "#0A1128",
        borderBottom: "2px solid #2A9D8F",
        paddingBottom: "6px",
        marginBottom: "12px",
        pageBreakBefore: "always",
        paddingTop: "20px",
      }}>
        Finding Details
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", paddingTop: "20px" }}>
        {sorted.map((f) => {
          const { bg, text } = SEVERITY_PRINT_COLORS[f.severity];
          const statusColor = STATUS_COLORS[f.status] ?? "#6C757D";
          return (
            <div
              key={f.findingId}
              style={{
                border: "1px solid #DEE2E6",
                borderRadius: "6px",
                padding: "10px",
                breakInside: "avoid",
                pageBreakInside: "avoid",
                backgroundColor: "#FFFFFF",
                marginTop: "8px",
                borderLeft: `3px solid ${bg}`,
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", gap: "8px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#0A1128", lineHeight: 1.3, margin: 0, flex: 1 }}>
                  {f.title}
                </p>
                <SeverityPill severity={f.severity} />
              </div>

              {/* Description */}
              <p style={{ fontSize: "9px", color: "#495057", lineHeight: 1.4, margin: "0 0 6px 0" }}>
                {f.description}
              </p>

              {/* Resource */}
              <p style={{ fontSize: "8.5px", fontFamily: "monospace", color: "#6C757D", margin: "0 0 6px 0",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.resource}
              </p>

              {/* Remediation */}
              <div style={{ backgroundColor: "#F0F9F7", borderRadius: "4px", padding: "5px 7px", marginBottom: "6px" }}>
                <p style={{ fontSize: "8.5px", fontWeight: 700, color: "#2A9D8F", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Remediation
                </p>
                <p style={{ fontSize: "9px", color: "#0A1128", margin: 0, lineHeight: 1.3 }}>
                  {f.remediation}
                </p>
              </div>

              {/* Footer row — compliance + status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {f.complianceFrameworks.map((fw) => (
                    <span key={fw} style={{
                      fontSize: "8px",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      backgroundColor: "#EDF3F8",
                      color: "#0A1128",
                      fontWeight: 600,
                    }}>{fw}</span>
                  ))}
                </div>
                <StatusPill status={f.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── KPI bar at top of report ───────────────────────────────────────────────
function KPIBar({ scan }: { scan: SecurityScan }) {
  const kpis = [
    { label: "Risk Score", value: `${scan.riskScore}/100`,
      color: scan.riskScore >= 70 ? "#bf1922" : scan.riskScore >= 40 ? "#EAB308" : "#2A9D8F" },
    { label: "Total Findings", value: String(scan.totalFindings), color: "#0A1128" },
    { label: "Checks Passed", value: `${scan.passedChecks}/${scan.totalChecks}`, color: "#2A9D8F" },
    { label: "Critical / High", value: String((scan.bySeverity.CRITICAL ?? 0) + (scan.bySeverity.HIGH ?? 0)),
      color: "#bf1922" },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "10px",
      marginBottom: "20px",
    }}>
      {kpis.map(({ label, value, color }) => (
        <div key={label} style={{
          border: "1px solid #DEE2E6",
          borderRadius: "6px",
          padding: "8px 12px",
          backgroundColor: "#F8F9FA",
        }}>
          <p style={{ fontSize: "8px", color: "#6C757D", textTransform: "uppercase",
            letterSpacing: "0.08em", margin: "0 0 3px 0", fontWeight: 600 }}>
            {label}
          </p>
          <p style={{ fontSize: "18px", fontWeight: 700, color, margin: 0, lineHeight: 1 }}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Root export ────────────────────────────────────────────────────────────
export function PrintSecurityReport({ scan }: Props) {
  return (
    <div className="print-security-report" style={{ display: "none", padding: "0 4px" }}>
      {/* Report header */}
      <div style={{
        borderBottom: "2px solid #0A1128",
        paddingBottom: "10px",
        marginBottom: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
      }}>
        <div>
          <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#2A9D8F", margin: "0 0 2px 0" }}>
            SecuredPress LLC · SageMaker Security Audit Report
          </p>
          <p style={{ fontSize: "8px", color: "#6C757D", margin: 0 }}>
            Scan ID: {scan.scanId} · {new Date(scan.scanTimestamp).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric"
            })}
          </p>
        </div>
        <p style={{ fontSize: "8px", color: "#6C757D", margin: 0 }}>
          Generated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <KPIBar scan={scan} />
      <SummaryTable findings={scan.findings} />
      <DetailCards findings={scan.findings} />
    </div>
  );
}
