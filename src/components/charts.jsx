import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../context/AppContext";
import { fmt } from "../lib/format";
import { hexA } from "../lib/themes";

function weekLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Weekly outflow of completed transactions for the last 8 weeks. */
export function SpendingChart({ transactions }) {
  const { theme } = useApp();
  const c = theme.chart;

  const data = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (i + 1) * 7 + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7 + 1);
      end.setHours(0, 0, 0, 0);
      weeks.push({ start, end, label: weekLabel(start), spent: 0 });
    }
    transactions.forEach((t) => {
      if (t.status === "failed" || t.amount >= 0) return;
      const d = new Date(t.date);
      for (const w of weeks) {
        if (d >= w.start && d < w.end) {
          w.spent += Math.abs(t.amount);
          break;
        }
      }
    });
    return weeks.map((w) => ({ label: w.label, spent: Math.round(w.spent) }));
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -14 }}>
        <defs>
          <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.accent} stopOpacity={0.32} />
            <stop offset="100%" stopColor={c.accent} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="3 6" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: c.tick, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={8}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis
          tick={{ fontSize: 11, fill: c.tick, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`)}
        />
        <Tooltip content={<ChartTip accent={c.accent} />} cursor={{ stroke: c.grid }} />
        <Area
          type="monotone"
          dataKey="spent"
          stroke={c.accent}
          strokeWidth={2.5}
          fill="url(#spendFill)"
          dot={false}
          activeDot={{ r: 5, fill: c.accent, stroke: c.tooltipBg, strokeWidth: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChartTip({ active, payload, label, accent }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3.5 py-2.5 shadow-pop"
      style={{
        background: "var(--c-surface2)",
        borderColor: "var(--c-line)",
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink3">
        Week of {label}
      </p>
      <p className="tabular mt-0.5 font-display text-lg font-semibold" style={{ color: accent }}>
        {fmt(payload[0].value)}
      </p>
    </div>
  );
}

/** Top spending categories for the trailing 30 days, as animated bars. */
export function CategoryBars({ transactions, limit = 5 }) {
  const { hidden } = useApp();
  const rows = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const totals = {};
    transactions.forEach((t) => {
      if (t.status !== "completed" || t.amount >= 0) return;
      if (new Date(t.date) < cutoff) return;
      totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }, [transactions, limit]);

  const max = rows[0]?.value || 1;

  return (
    <div className="space-y-4">
      {rows.map((r, i) => (
        <div key={r.name}>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[13px] font-medium text-ink">{r.name}</span>
            <span className="tabular text-[13px] font-semibold text-ink">
              {hidden ? "••••" : fmt(r.value, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(6, (r.value / max) * 100)}%`,
                background: "var(--c-accent)",
                opacity: 1 - i * 0.17,
                transitionDelay: `${i * 60}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function hexAlpha(hex, a) {
  return hexA(hex, a);
}
