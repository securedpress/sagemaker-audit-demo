"use client";

import { useState } from "react";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels, Flex } from "@tremor/react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { SkeletonDashboard } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { LastScannedIndicator } from "@/components/shared/LastScannedIndicator";
import { ScanHistoryTimeline } from "@/components/shared/ScanHistoryTimeline";
import { CostOverview } from "@/components/cost/CostOverview";
import { SecurityOverview } from "@/components/security/SecurityOverview";
import { OverviewSummary } from "@/components/shared/OverviewSummary";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { AboutDemoModal } from "@/components/demo/AboutDemoModal";

interface Props {
  clientId: string;
}

function ThemeToggle({ theme, onToggle }: { theme: "dark" | "light"; onToggle: () => void }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      style={{
        backgroundColor: "rgba(42,157,143,0.15)",
        border: "1px solid rgba(205,237,234,0.4)",
        color: "var(--header-muted)",
      }}
    >
      <span className="text-base leading-none">{isDark ? "🌙" : "☀️"}</span>
      <span style={{ color: "#CDEDEA" }}>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

/**
 * PDF Export — demo build.
 *
 * In the SaaS, ExportPDFButton generates a real audit-grade PDF. For the public
 * demo, the button is visible (so prospects see the deliverable exists) but
 * disabled — preventing synthetic-data PDFs from circulating as if they were
 * real audit reports.
 */
function DisabledExportPDFButton() {
  return (
    <button
      type="button"
      disabled
      title="PDF export available in real audit engagements. Learn more at securedpress.com"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-not-allowed"
      style={{
        backgroundColor: "rgba(244,162,97,0.1)",
        border: "1px solid rgba(244,162,97,0.3)",
        color: "rgba(244,162,97,0.6)",
        opacity: 0.7,
      }}
      aria-label="PDF export — available in real audit engagements"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      <span>Export PDF</span>
    </button>
  );
}

export function DashboardShell({ clientId }: Props) {
  const { payload, state, error, lastFetched, refresh } = useDashboard(clientId);
  const [tabIndex, setTabIndex] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [aboutOpen, setAboutOpen] = useState(false);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const isLoading = state === "loading";

  const entitlements = payload?.entitlements;
  const hasCost = entitlements?.modules.includes("cost") ?? false;
  const hasSecurity = entitlements?.modules.includes("security") ?? false;
  const hasBoth = hasCost && hasSecurity;

  const tabs = [
    ...(hasBoth ? [{ id: "overview", label: "Overview", shortLabel: "Overview" }] : []),
    ...(hasCost ? [{ id: "cost", label: "Cost Optimization", shortLabel: "Cost" }] : []),
    ...(hasSecurity ? [{ id: "security", label: "Security Audit", shortLabel: "Security" }] : []),
    { id: "history", label: "Scan History", shortLabel: "History" },
  ];

  const scanTimestamp =
    payload?.cost?.scanTimestamp ??
    payload?.security?.scanTimestamp ??
    payload?.generatedAt ?? "";

  return (
    <div
      data-theme={theme}
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: "var(--navy)", color: "var(--text-primary)" }}
    >
      {/* ── Demo Banner ───────────────────────────────────────────────────── */}
      <DemoBanner onAboutClick={() => setAboutOpen(true)} />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header
        className="border-b px-4 md:px-8 py-4 md:py-5 transition-colors duration-200"
        style={{ borderColor: "var(--header-border)", backgroundColor: "var(--header-bg)" }}
      >
        {/* Row 1 — logo + branding + action buttons (always visible) */}
        <div className="flex items-center justify-between gap-3 flex-wrap">

          {/* Left — logo + branding */}
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/securedpress-logo.png"
              alt="SecuredPress"
              width={40}
              height={40}
              className="rounded-full flex-shrink-0"
              priority
            />
            <div className="min-w-0">
              <p
                className="text-xs font-bold tracking-[0.2em] uppercase mb-0.5 truncate"
                style={{ color: "var(--accent-light)" }}
              >
                SecuredPress LLC · SageMaker Audit
              </p>
              <h1
                className="text-lg md:text-xl font-bold truncate"
                style={{ color: "var(--header-text)" }}
              >
                {entitlements?.clientName ?? "Loading…"}
              </h1>
            </div>
          </div>

          {/* Right — action buttons */}
          {/* Module badges removed (redundant with tab bar). PDF disabled for demo. */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {payload && <DisabledExportPDFButton />}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {/* Row 2 — scan indicator + account meta (collapses gracefully on mobile) */}
        {entitlements && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-3 pt-3"
            style={{ borderTop: "1px solid rgba(42,157,143,0.2)" }}
          >
            {scanTimestamp && (
              <LastScannedIndicator
                scannedAt={scanTimestamp}
                fetchedAt={lastFetched}
                onRefresh={refresh}
                isLoading={isLoading}
              />
            )}
            <p className="text-sm" style={{ color: "var(--header-muted)" }}>
              Account{" "}
              <span className="font-mono" style={{ color: "var(--header-text)" }}>
                {entitlements.accountId}
              </span>
            </p>
          </div>
        )}
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="px-4 md:px-8 py-4 md:py-6 max-w-[1400px] mx-auto space-y-6">

        {/* Error state */}
        {state === "error" && (
          <EmptyState
            type={error?.includes("expired") ? "expired" : "error"}
            message={error ?? undefined}
            onRetry={refresh}
          />
        )}

        {/* Loading skeleton */}
        {isLoading && !payload && <SkeletonDashboard />}

        {/* Loaded */}
        {payload && (
          <TabGroup index={tabIndex} onIndexChange={setTabIndex}>
            <TabList
              className="mb-6"
              style={{ borderBottom: "1px solid var(--card-border)" }}
            >
              {tabs.map((t) => (
                <Tab
                  key={t.id}
                  className="pb-3 text-sm font-medium transition-colors data-[selected]:text-teal-400 data-[selected]:border-teal-400"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.shortLabel ?? t.label}</span>
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {/* Overview tab */}
              {hasBoth && (
                <TabPanel>
                  <OverviewSummary payload={payload} />
                </TabPanel>
              )}

              {/* Cost tab */}
              {hasCost && (
                <TabPanel>
                  {payload.cost && payload.livecosts ? (
                    <CostOverview scan={payload.cost} liveCosts={payload.livecosts} />
                  ) : (
                    <EmptyState type="no-cost" />
                  )}
                </TabPanel>
              )}

              {/* Security tab */}
              {hasSecurity && (
                <TabPanel>
                  {payload.security ? (
                    <SecurityOverview scan={payload.security} />
                  ) : (
                    <EmptyState type="no-security" />
                  )}
                </TabPanel>
              )}

              {/* History tab */}
              <TabPanel>
                {payload.history &&
                (payload.history.cost.length > 0 || payload.history.security.length > 0) ? (
                  <ScanHistoryTimeline history={payload.history} />
                ) : (
                  <EmptyState
                    type="no-scans"
                    message="No scan history yet. History will appear here after multiple scans have been run."
                  />
                )}
              </TabPanel>
            </TabPanels>
          </TabGroup>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      {payload && (
        <footer
          className="px-8 pt-4 pb-8 transition-colors duration-200"
          style={{ borderTop: "1px solid var(--card-border)" }}
        >
          <Flex>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              © {new Date().getFullYear()} SecuredPress LLC · Live Demo — Synthetic Data
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Generated {new Date(payload.generatedAt).toLocaleString()}
            </p>
          </Flex>
        </footer>
      )}

      {/* ── About Demo Modal ──────────────────────────────────────────────── */}
      <AboutDemoModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
