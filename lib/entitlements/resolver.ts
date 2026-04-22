import type { ClientEntitlements, AuditModule } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// ENTITLEMENTS HELPERS
// Demo build — entitlements come from static JSON, not DynamoDB.
// See app/api/summary/route.ts for the data source.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a client's contract is still active.
 */
export function isContractActive(entitlements: ClientEntitlements): boolean {
  return new Date(entitlements.contractEnd) >= new Date();
}

/**
 * Check if a client has access to a specific module.
 */
export function hasModule(
  entitlements: ClientEntitlements,
  module: AuditModule
): boolean {
  return entitlements.modules.includes(module);
}
