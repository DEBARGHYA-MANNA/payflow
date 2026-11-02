import React from "react";
import { motion } from "framer-motion";
import { cx, Switch } from "../../components/ui";

/* --------------------------- Section card --------------------------- */

export function SectionCard({ title, desc, right, children, className = "", danger = false }) {
  return (
    <section
      className={cx("card-surface p-5 sm:p-6", danger && "border-bad/25", className)}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={cx("label-micro", danger && "text-bad!")}>{title}</p>
          {desc && <p className="mt-1 text-[13px] text-ink2">{desc}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------ Stat ------------------------------ */

export function Stat({ label, value, sub }) {
  return (
    <div>
      <p className="label-micro">{label}</p>
      <p className="tabular mt-1 font-display text-[22px] font-semibold tracking-tight text-ink">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-ink3">{sub}</p>}
    </div>
  );
}

/* ----------------------------- Ring gauge --------------------------- */

export function Ring({ pct, size = 148, stroke = 13, color, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--c-surface2)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, Math.max(0, pct))) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ----------------------------- Semi gauge --------------------------- */

export function SemiGauge({ fraction, color, children }) {
  const r = 80;
  const c = Math.PI * r;
  return (
    <div className="relative mx-auto" style={{ width: 200, height: 112 }}>
      <svg width={200} height={110} viewBox="0 0 200 110">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--c-surface2)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, Math.max(0, fraction))) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">{children}</div>
    </div>
  );
}

/* ----------------------------- Toggle row --------------------------- */

export function ToggleRow({ icon: Icon, title, desc, checked, onChange, disabled }) {
  return (
    <div
      className={cx(
        "flex items-center justify-between gap-3 rounded-lg px-1 py-3",
        disabled && "opacity-45"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface2 text-ink2">
            <Icon size={17} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink">{title}</p>
          {desc && <p className="text-xs text-ink3">{desc}</p>}
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} disabled={disabled} />
    </div>
  );
}

/* ---------------------------- Limit slider --------------------------- */

export function LimitSlider({ label, min, max, step, value, onChange, hint, disabled, format }) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className={cx(disabled && "opacity-45")}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[14px] font-medium text-ink">{label}</p>
        <p className="tabular font-display text-lg font-semibold text-accent">
          {format ? format(value) : value}
        </p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        style={{ "--fill": `${fill}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      {hint && <p className="mt-1.5 text-xs text-ink3">{hint}</p>}
    </div>
  );
}

/* ------------------------------- Note -------------------------------- */

export function Note({ icon: Icon, children, tone = "accent" }) {
  const tones = {
    accent: "border-accent/25 bg-accent/6",
    warn: "border-warn/25 bg-warn/8",
    bad: "border-bad/25 bg-bad/8",
  };
  return (
    <div className={cx("flex items-start gap-2.5 rounded-lg border px-4 py-3", tones[tone])}>
      {Icon && <Icon size={15} className="mt-0.5 shrink-0 text-ink2" />}
      <p className="text-[12.5px] leading-snug text-ink2">{children}</p>
    </div>
  );
}

/* ------------------------------ Sparkline ---------------------------- */

export function Sparkline({ points, color = "var(--c-accent)", width = 220, height = 56 }) {
  if (!points.length) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map(
    (p, i) => `${i * step},${height - 6 - ((p - min) / span) * (height - 14)}`
  );
  const path = "M" + coords.join(" L");
  return (
    <svg width={width} height={height} className="w-full">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${width},${height} L 0,${height} Z`} fill="url(#sparkFill)" />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}
