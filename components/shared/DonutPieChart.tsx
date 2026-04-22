"use client";

import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector,
} from "recharts";

const CHART_COLORS = [
  "#2A9D8F", // teal (primary accent)
  "#F4A261", // gold
  "#CDEDEA", // accent-light
  "#bf1922", // danger
  "#4DB6AC", // teal lighter
  "#F4B8BC", // danger-light
  "#6C757D", // gray
  "#7E9BB5", // muted blue
];

interface DataItem {
  name: string;
  value: number;
}

interface Props {
  data: DataItem[];
  valueFormatter?: (v: number) => string;
  centerLabel?: string;   // static label shown in donut hole
  height?: number;
}

// ── Active slice — lifts out and adds drop shadow on hover ─────────────────
function ActiveSlice(props: any) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
  } = props;
  return (
    <g>
      {/* Glow ring behind active slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.15}
      />
      {/* Lifted slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.35))"
      />
    </g>
  );
}

// ── Center label — shows total at rest, hovered value on hover ─────────────
function CenterLabel({
  cx, cy, hoveredIndex, data, valueFormatter, centerLabel,
}: {
  cx: number;
  cy: number;
  hoveredIndex: number | null;
  data: DataItem[];
  valueFormatter?: (v: number) => string;
  centerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const isHovered = hoveredIndex !== null;
  const hovered = isHovered ? data[hoveredIndex] : null;

  const displayValue = isHovered
    ? (valueFormatter ? valueFormatter(hovered!.value) : String(hovered!.value))
    : (valueFormatter ? valueFormatter(total) : String(total));

  const displayLabel = isHovered
    ? hovered!.name
    : (centerLabel ?? "Total");

  const color = isHovered
    ? CHART_COLORS[hoveredIndex! % CHART_COLORS.length]
    : "var(--text-primary)";

  return (
    <g>
      {/* Main value */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fill: color,
          fontSize: "18px",
          fontWeight: 700,
          transition: "fill 0.2s ease",
        }}
      >
        {displayValue}
      </text>
      {/* Sub-label */}
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fill: "var(--text-muted)",
          fontSize: "10px",
          fontWeight: 500,
        }}
      >
        {displayLabel}
      </text>
    </g>
  );
}

// ── Tooltip ────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, valueFormatter }: any) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: itemPayload } = payload[0];
  const color = itemPayload?.fill ?? "var(--accent)";
  return (
    <div
      className="rounded px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: "var(--header-bg)",
        border: `1px solid ${color}`,
        color: "#FFFFFF",
      }}
    >
      <p className="font-medium" style={{ color: "#CDEDEA" }}>{name}</p>
      <p className="font-bold" style={{ color }}>
        {valueFormatter ? valueFormatter(value) : value}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function DonutPieChart({ data, valueFormatter, centerLabel, height = 200 }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <defs>
          {/* Drop shadow filter */}
          <filter id="slice-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>

        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="52%"
          outerRadius="75%"
          paddingAngle={3}
          dataKey="value"
          activeIndex={hoveredIndex ?? undefined}
          activeShape={<ActiveSlice />}
          onMouseEnter={(_, index) => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          isAnimationActive
          animationBegin={100}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              stroke="transparent"
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.45}
            />
          ))}
        </Pie>

        {/* Center label rendered as custom label on Pie */}
        <Pie
          data={[{ value: 1 }]}
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius={0}
          dataKey="value"
          isAnimationActive={false}
          label={(props) => (
            <CenterLabel
              cx={props.cx}
              cy={props.cy}
              hoveredIndex={hoveredIndex}
              data={data}
              valueFormatter={valueFormatter}
              centerLabel={centerLabel}
            />
          )}
          labelLine={false}
        >
          <Cell fill="transparent" stroke="transparent" />
        </Pie>

        <Tooltip
          content={<CustomTooltip valueFormatter={valueFormatter} />}
          isAnimationActive={false}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────
export function DonutLegend({ data }: { data: DataItem[] }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
      {data.map((item, i) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
          />
          <span
            className="text-xs truncate max-w-[120px]"
            style={{ color: "var(--text-muted)" }}
          >
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}
