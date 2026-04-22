"use client";

import { useState, useEffect } from "react";

interface Props {
  scannedAt: string;
  fetchedAt: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function LastScannedIndicator({ scannedAt, fetchedAt, onRefresh, isLoading }: Props) {
  const [, setTick] = useState(0);

  // Re-render every 30s so "X minutes ago" stays current
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const scanDate = new Date(scannedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const scanTime = new Date(scannedAt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {/* Pulse dot */}
        <div className="relative w-2 h-2">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: "var(--accent)", opacity: 0.4 }}
          />
          <div
            className="relative rounded-full w-2 h-2"
            style={{ backgroundColor: "var(--accent)" }}
          />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--header-text)" }}>
            Scan data from {scanDate} at {scanTime}
          </p>
          {fetchedAt && (
            <p className="text-sm" style={{ color: "var(--header-muted)" }}>
              Dashboard loaded {timeAgo(fetchedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
        style={{
          backgroundColor: "rgba(42,157,143,0.1)",
          border: "1px solid rgba(42,157,143,0.3)",
          color: "var(--accent)",
        }}
      >
        <svg
          className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
          viewBox="0 0 16 16" fill="none"
        >
          <path
            d="M13.5 8A5.5 5.5 0 1 1 8 2.5"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          />
          <path d="M8 2.5L10.5 5M8 2.5L10.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isLoading ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}
