import { NextRequest, NextResponse } from "next/server";
import type {
  DashboardPayload,
  ClientEntitlements,
  CostScan,
  SecurityScan,
  CostExplorerData,
  ScanHistory,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// DEMO BUILD — STATIC JSON IMPORTS
//
// Production SaaS fetches data from DynamoDB + S3 + Cost Explorer at request
// time. This demo bundles synthetic JSON into the build instead. No AWS calls,
// no filesystem reads at request time — the data is serialized into the
// Lambda bundle by Next.js's module graph.
//
// To change which scenario renders, swap the entitlements import:
//   - entitlements-both.json          → Overview + Cost + Security + History
//   - entitlements-cost-only.json     → Cost + History only
//   - entitlements-security-only.json → Security + History only
// ─────────────────────────────────────────────────────────────────────────────

import entitlementsJson from "@/mock-data/entitlements-both.json";
import costScanJson from "@/mock-data/cost-scan.json";
import securityScanJson from "@/mock-data/security-scan.json";
import liveCostsJson from "@/mock-data/live-costs.json";
import historyJson from "@/mock-data/history.json";

const entitlements = entitlementsJson as ClientEntitlements;
const costScan = costScanJson as CostScan;
const securityScan = securityScanJson as SecurityScan;
const liveCosts = liveCostsJson as CostExplorerData;
const history = historyJson as ScanHistory;

export const dynamic = "force-static";

// The clientId param is accepted for URL compatibility with the SaaS build
// but ignored — this route always returns the demo payload.
export async function GET(_req: NextRequest) {
  const hasCost = entitlements.modules.includes("cost");
  const hasSecurity = entitlements.modules.includes("security");

  const payload: DashboardPayload = {
    entitlements,
    ...(hasCost ? { cost: costScan } : {}),
    ...(hasSecurity ? { security: securityScan } : {}),
    ...(hasCost ? { livecosts: liveCosts } : {}),
    history,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
