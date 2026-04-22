"use client";

import type { CSSProperties } from "react";

// Animated skeleton primitives for loading states

function Shimmer({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded ${className ?? ""}`}
      style={{
        backgroundColor: "var(--navy-light)",
        opacity: 0.7,
        ...style,
      }}
    />
  );
}

export function SkeletonKPIRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-4"
          style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
        >
          <Shimmer className="h-3 w-20 mb-3" />
          <Shimmer className="h-8 w-24 mb-2" />
          <Shimmer className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <Shimmer className="h-5 w-48" />
        <Shimmer className="h-5 w-20 rounded-full" />
      </div>
      {/* Fake chart bars */}
      <div className="flex items-end gap-1 h-40 mt-2">
        {[60, 80, 55, 90, 70, 85, 65, 95, 75, 88, 62, 78,
          58, 92, 68, 82, 72, 86, 66, 96, 74, 89, 63, 79,
          59, 93, 69, 83, 73, 87].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm animate-pulse"
            style={{
              height: `${h}%`,
              backgroundColor: "var(--accent)",
              opacity: 0.15,
              animationDelay: `${i * 30}ms`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <Shimmer className="h-3 w-12" />
        <Shimmer className="h-3 w-12" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
    >
      <Shimmer className="h-5 w-40 mb-4" />
      {/* Header row */}
      <div className="flex gap-4 mb-3">
        {[120, 80, 60, 80, 80, 60].map((w, i) => (
          <Shimmer key={i} className="h-3" style={{ width: w }} />
        ))}
      </div>
      {/* Data rows */}
      {[...Array(rows)].map((_, r) => (
        <div
          key={r}
          className="flex gap-4 py-3"
          style={{ borderTop: "1px solid var(--card-border)" }}
        >
          {[120, 80, 60, 80, 80, 60].map((w, i) => (
            <Shimmer
              key={i}
              className="h-4"
              style={{ width: w, animationDelay: `${r * 50 + i * 20}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <SkeletonKPIRow />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2"><SkeletonChart /></div>
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "var(--navy-light)", border: "1px solid var(--card-border)" }}
        >
          <Shimmer className="h-5 w-36 mb-4" />
          <div className="flex items-center justify-center h-40">
            <div
              className="w-32 h-32 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--accent)", opacity: 0.1 }}
            />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 mt-2">
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent)", opacity: 0.3 }} />
              <Shimmer className="h-3 flex-1" />
            </div>
          ))}
        </div>
      </div>
      <SkeletonTable />
    </div>
  );
}
