// ─────────────────────────────────────────────────────────────────────────────
// ENTITLEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export type AuditModule = "cost" | "security";

export interface ClientEntitlements {
  clientId: string;
  clientName: string;
  accountId: string;
  region: string;
  modules: AuditModule[];
  contractStart: string;
  contractEnd: string;
  contactEmail: string;
  logoUrl?: string;
  brandColor?: string; // v1.6 white-label
}

// ─────────────────────────────────────────────────────────────────────────────
// COST FINDINGS
// ─────────────────────────────────────────────────────────────────────────────

export type CostRecommendation =
  | "RIGHT_SIZE" | "SCALE_DOWN" | "DELETE"
  | "CONSOLIDATE" | "USE_SERVERLESS" | "ENABLE_SPOT" | "OPTIMIZE" | "OK";

export interface EndpointFinding {
  endpointName: string;
  instanceType: string;
  instanceCount: number;
  utilizationPct: number;
  idleHours: number;
  monthlyCost: number;
  recommendation: CostRecommendation;
  recommendedInstanceType?: string;
  estimatedSavings: number;
  region: string;
  lastInvoked?: string;
}

export interface TrainingJobFinding {
  jobName: string;
  instanceType: string;
  instanceCount: number;
  durationHours: number;
  cost: number;
  spotEligible: boolean;
  estimatedSpotSavings: number;
  status: string;
  createdAt: string;
}

export interface NotebookFinding {
  instanceName: string;
  instanceType: string;
  idleHours: number;
  monthlyCost: number;
  estimatedSavings: number;
  region: string;
}

export interface StorageFindings {
  unusedModelArtifactsGB: number;
  storageCostMonthly: number;
  estimatedSavings: number;
}

export interface StorageFinding {
  bucketName: string;
  coldObjectCount: number;
  monthlyCost: number;
  estimatedSavings: number;
  recommendation: CostRecommendation;
  hasLifecyclePolicy: boolean;
  region: string;
}

export interface CostScan {
  scanId: string;
  scanTimestamp: string;
  totalCurrentSpend: number;
  totalEstimatedSavings: number;
  endpoints: EndpointFinding[];
  trainingJobs: TrainingJobFinding[];
  notebooks: NotebookFinding[];
  storage: StorageFindings;
  storageFindings: StorageFinding[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY FINDINGS
// ─────────────────────────────────────────────────────────────────────────────

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type SecurityCategory =
  | "IAM" | "ENCRYPTION" | "NETWORK" | "LOGGING"
  | "DATA_PROTECTION" | "ACCESS_CONTROL" | "COMPLIANCE";

export interface SecurityFinding {
  findingId: string;
  title: string;
  description: string;
  severity: Severity;
  category: SecurityCategory;
  resource: string;
  resourceType: string;
  region: string;
  remediation: string;
  remediationEffort: "LOW" | "MEDIUM" | "HIGH";
  complianceFrameworks: string[];
  detectedAt: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ACCEPTED_RISK";
}

export interface SecurityScan {
  scanId: string;
  scanTimestamp: string;
  totalFindings: number;
  bySeverity: Record<Severity, number>;
  byCategory: Partial<Record<SecurityCategory, number>>;
  riskScore: number;
  findings: SecurityFinding[];
  passedChecks: number;
  totalChecks: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// COST EXPLORER
// ─────────────────────────────────────────────────────────────────────────────

export interface CostDataPoint {
  date: string;
  amount: number;
}

export interface CostExplorerData {
  dailyCosts: CostDataPoint[];
  serviceBreakdown: { service: string; amount: number; pct: number }[];
  monthToDate: number;
  forecastEndOfMonth: number;
  vsLastMonth: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCAN HISTORY (v1.2)
// ─────────────────────────────────────────────────────────────────────────────

export interface ScanHistoryEntry {
  scanId: string;
  scanTimestamp: string;
  type: "cost" | "security";
  // Cost delta fields
  totalCurrentSpend?: number;
  totalEstimatedSavings?: number;
  spendDelta?: number;       // vs previous scan
  savingsDelta?: number;
  // Security delta fields
  riskScore?: number;
  riskDelta?: number;        // vs previous scan (negative = improved)
  totalFindings?: number;
  findingsDelta?: number;
}

export interface ScanHistory {
  clientId: string;
  cost: ScanHistoryEntry[];
  security: ScanHistoryEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PAYLOAD
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardPayload {
  entitlements: ClientEntitlements;
  cost?: CostScan;
  security?: SecurityScan;
  livecosts?: CostExplorerData;
  history?: ScanHistory;
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI STATE
// ─────────────────────────────────────────────────────────────────────────────

export type LoadingState = "idle" | "loading" | "success" | "error";
