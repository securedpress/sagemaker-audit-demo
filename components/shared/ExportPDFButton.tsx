"use client";

import type { DashboardPayload } from "@/types";

interface Props {
  payload: DashboardPayload;
}

export function ExportPDFButton({ payload }: Props) {
  const handleExport = () => {
    window.print();
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all print:hidden"
      style={{
        backgroundColor: "rgba(244,162,97,0.15)",
        border: "1px solid rgba(244,162,97,0.4)",
        color: "var(--gold)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M4 12H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4 1h8v5H4V1zM4 10h8v5H4v-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="13" cy="8" r="0.75" fill="currentColor"/>
      </svg>
      Export PDF
    </button>
  );
}
