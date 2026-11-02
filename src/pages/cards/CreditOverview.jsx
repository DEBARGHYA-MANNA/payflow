import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  Crown,
  Fingerprint,
  Plane,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { Button, cx } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import {
  CIBIL_SCORE,
  CIBIL_TIPS,
  cibilBand,
  cibilHistory,
  getTier,
  nextTierHint,
} from "../../data/credit";
import { fmt, fmtDate, fmtFullDate } from "../../lib/format";
import { LimitIncreaseModal } from "./modals";
import { Note, Ring, SectionCard, SemiGauge, Sparkline, Stat } from "./shared";

export default function CreditOverview() {
  const { cards, hidden, cancelLimitRequest } = useApp();
  const card = cards.credit;
  const [limitOpen, setLimitOpen] = useState(false);

  const available = Math.max(0, card.limit - card.outstanding);
  const util = card.limit > 0 ? (card.outstanding / card.limit) * 100 : 0;
  const tier = getTier(util);
  const better = nextTierHint(util);
  const band = cibilBand(CIBIL_SCORE);
  const history = cibilHistory();

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* utilization + tier */}
      <SectionCard
        className="lg:col-span-7"
        title="Credit overview"
        desc="Utilisation decides your benefits tier."
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <Ring pct={util / 100} color={tier.color}>
            <p className="tabular font-display text-[28px] font-semibold leading-none text-ink">
              {util.toFixed(1)}%
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink3">
              utilised
            </p>
          </Ring>
          <div className="grid flex-1 grid-cols-3 gap-4 sm:gap-5">
            <Stat label="Total limit" value={hidden ? "••••" : fmt(card.limit, { maximumFractionDigits: 0 })} />
            <Stat label="Used" value={hidden ? "••••" : fmt(card.outstanding, { maximumFractionDigits: 0 })} />
            <Stat label="Available" value={hidden ? "••••" : fmt(available, { maximumFractionDigits: 0 })} sub="credit" />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-line bg-surface2/40 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: tier.color + "22", color: tier.color }}
            >
              <Crown size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-ink">{tier.name} tier</p>
              <p className="text-xs text-ink3">
                {tier.multiplier} rewards · {tier.lounges} lounge visits
              </p>
            </div>
            {better && (
              <p className="text-right text-xs text-ink2">
                Keep utilisation under{" "}
                <span className="font-semibold text-accent">{better.maxBelow}%</span> to reach{" "}
                <span className="font-semibold" style={{ color: better.color }}>
                  {better.name}
                </span>
              </p>
            )}
          </div>
          <ul className="mt-3 space-y-1.5">
            {tier.perks.map((p) => (
              <li key={p} className="flex items-start gap-2 text-[13px] text-ink2">
                <Check size={14} className="mt-0.5 shrink-0 text-good" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {card.requestedLimit && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 rounded-lg border border-warn/30 bg-warn/8 px-4 py-3"
          >
            <TrendingUp size={16} className="shrink-0 text-warn" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink">
                Limit increase under review
              </p>
              <p className="text-xs text-ink3">
                {fmt(card.requestedLimit.amount, { maximumFractionDigits: 0 })} · Ref{" "}
                {card.requestedLimit.ref}
              </p>
            </div>
            <button
              onClick={cancelLimitRequest}
              className="flex items-center gap-1 text-xs font-semibold text-ink3 transition-colors hover:text-ink"
            >
              <X size={12} /> Withdraw
            </button>
          </motion.div>
        )}
      </SectionCard>

      {/* CIBIL */}
      <SectionCard className="lg:col-span-5" title="CIBIL score" desc="Refreshed monthly (demo).">
        <SemiGauge fraction={(CIBIL_SCORE - 300) / 600} color={band.color}>
          <p className="tabular -mt-4 font-display text-4xl font-semibold text-ink">{CIBIL_SCORE}</p>
          <p className="text-xs font-semibold" style={{ color: band.color }}>
            {band.label}
          </p>
        </SemiGauge>
        <div className="mt-4 flex items-center justify-between text-[10px] font-semibold text-ink3">
          <span>300 POOR</span>
          <span>900 EXCELLENT</span>
        </div>

        <div className="mt-4">
          <p className="label-micro mb-1">Last 6 months</p>
          <Sparkline points={history.map((h) => h.score)} color={band.color} />
          <div className="flex justify-between text-[10px] text-ink3">
            <span>{history[0].label}</span>
            <span className="text-good">+38 pts</span>
            <span>{history[history.length - 1].label}</span>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5">
          {CIBIL_TIPS.slice(0, 3).map((t) => (
            <li key={t} className="flex items-start gap-2 text-[12.5px] text-ink2">
              <Check size={13} className="mt-0.5 shrink-0 text-accent" />
              {t}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* About this card */}
      <SectionCard
        className="lg:col-span-12"
        title="About this card"
        desc="Product, fees and identification."
        right={
          <Button
            variant="soft"
            size="sm"
            onClick={() => setLimitOpen(true)}
            disabled={!!card.requestedLimit}
          >
            <TrendingUp size={14} /> Request limit increase
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          <AboutRow icon={Fingerprint} k="Network" v="RuPay Platinum" sub="NPCI India" />
          <AboutRow icon={CalendarDays} k="Issued" v={fmtDate(card.issuedAt)} sub={fmtFullDate(card.issuedAt).split(",")[0]} />
          <AboutRow icon={Wallet} k="Annual fee" v="₹2,999 + GST" sub="Waived on ₹3L+ annual spends" />
          <AboutRow icon={Plane} k="Forex markup" v="3.5%" sub="On international usage" />
        </div>
      </SectionCard>

      <LimitIncreaseModal open={limitOpen} onClose={() => setLimitOpen(false)} />
    </div>
  );
}

function AboutRow({ icon: Icon, k, v, sub }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-surface2/40 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink2">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="label-micro">{k}</p>
        <p className="mt-0.5 truncate text-[14px] font-semibold text-ink">{v}</p>
        {sub && <p className="mt-0.5 truncate text-[11px] text-ink3">{sub}</p>}
      </div>
    </div>
  );
}
