"use client";

import dynamic from "next/dynamic";

const DashboardShell = dynamic(
  () => import("@/components/shared/DashboardShell").then((m) => m.DashboardShell),
  { ssr: false }
);

export function DashboardShellClient({ clientId }: { clientId: string }) {
  return <DashboardShell clientId={clientId} />;
}
