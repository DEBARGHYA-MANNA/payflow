import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { cx, fmt, fmtTime } from "../lib/format";
import { CategoryIcon, StatusPill } from "./ui";

export default function TxRow({ t, onClick, showDate = true, index = 0 }) {
  const { hidden } = useApp();
  const incoming = t.amount > 0;
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.3), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors hover:bg-surface2/60 sm:px-5"
    >
      <CategoryIcon category={t.category} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-semibold text-ink">{t.name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          {showDate && (
            <span className="text-xs text-ink3">
              {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" · "}
              {fmtTime(t.date)}
            </span>
          )}
          {t.status !== "completed" && <StatusPill status={t.status} />}
        </div>
      </div>
      <div className="text-right">
        <p
          className={cx(
            "tabular text-[14.5px] font-semibold",
            incoming ? "text-good" : t.status === "failed" ? "text-ink3 line-through" : "text-ink"
          )}
        >
          {incoming ? "+" : "−"}
          {hidden ? "••••" : fmt(Math.abs(t.amount))}
        </p>
        <p className="mt-0.5 text-xs text-ink3">{t.category}</p>
      </div>
    </motion.button>
  );
}
