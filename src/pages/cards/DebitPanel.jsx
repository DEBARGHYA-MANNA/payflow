import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Copy,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Nfc,
  OctagonX,
  ShieldCheck,
  Snowflake,
  Store,
} from "lucide-react";
import BankCard from "../../components/BankCard";
import TransactionDrawer from "../../components/TransactionDrawer";
import TxRow from "../../components/TxRow";
import { cx } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { LimitSlider, Note, SectionCard, ToggleRow } from "./shared";
import { BlockReissueModal, PinResetModal, ReissueBanner } from "./modals";
import { fmt } from "../../lib/format";

const LIMITS = [
  { key: "daily", label: "Daily spend", min: 5000, max: 200000, step: 5000, hint: "Resets every day at midnight" },
  { key: "monthly", label: "Monthly spend", min: 25000, max: 1000000, step: 25000, hint: "Total debit spend per calendar month" },
  { key: "atm", label: "ATM withdrawals", min: 0, max: 100000, step: 5000, hint: "Cash limit per day" },
];

export default function DebitPanel() {
  const { cards, freezeCard, updateCard, transactions, hidden, toast } = useApp();
  const card = cards.debit;
  const [pinOpen, setPinOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const monthSpend = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          t.status === "completed" &&
          t.amount < 0 &&
          t.method?.includes("Debit") &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0);
  }, [transactions]);

  const cardTx = useMemo(
    () => transactions.filter((t) => t.method?.includes("Debit") && t.amount < 0).slice(0, 5),
    [transactions]
  );

  const pct = Math.min(100, Math.round((monthSpend / card.limits.monthly) * 100));
  const blocked = card.status === "blocked";

  const copyNumber = () => {
    navigator.clipboard?.writeText(card.number).catch(() => {});
    toast.success("Card number copied", "Demo card — not real data.");
  };

  const actions = [
    {
      icon: Snowflake,
      label: card.frozen ? "Unfreeze" : "Freeze",
      active: card.frozen,
      disabled: blocked,
      onClick: () => {
        freezeCard("debit", !card.frozen);
        toast[card.frozen ? "success" : "info"](
          card.frozen ? "Debit card unfrozen" : "Debit card frozen",
          card.frozen ? "Your card is active again." : "All debit card payments are paused."
        );
      },
    },
    {
      icon: card.showDetails ? EyeOff : Eye,
      label: card.showDetails ? "Hide" : "Reveal",
      active: card.showDetails,
      disabled: blocked,
      onClick: () => {
        updateCard("debit", { showDetails: !card.showDetails });
        toast.info(card.showDetails ? "Details hidden" : "Details revealed", card.showDetails ? undefined : "Demo data — keep even these private.");
      },
    },
    { icon: KeyRound, label: "Reset PIN", disabled: blocked, onClick: () => setPinOpen(true) },
    { icon: Copy, label: "Copy no.", disabled: blocked, onClick: copyNumber },
    { icon: OctagonX, label: "Block & reissue", danger: true, disabled: blocked, onClick: () => setBlockOpen(true) },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <ReissueBanner which="debit" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card-surface p-5 sm:p-7"
        >
          <div className="mx-auto max-w-md">
            <BankCard card={card} variant="debit" />
          </div>

          <div className="mx-auto mt-6 grid max-w-md grid-cols-5 gap-2">
            {actions.map((a) => (
              <button
                key={a.label}
                disabled={a.disabled}
                onClick={a.onClick}
                className={cx(
                  "flex flex-col items-center gap-1.5 rounded-lg border py-3 transition-all disabled:opacity-40",
                  a.danger
                    ? "border-bad/25 bg-bad/8 text-bad"
                    : a.active
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-line bg-surface2 text-ink2 hover:text-ink"
                )}
              >
                <a.icon size={17} />
                <span className="text-[10.5px] font-semibold leading-tight text-center">{a.label}</span>
              </button>
            ))}
          </div>
          {card.pinChangedAt && (
            <p className="mt-4 text-center text-xs text-ink3">
              PIN last changed {new Date(card.pinChangedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          )}

          {/* monthly usage */}
          <div className="mx-auto mt-6 max-w-md rounded-lg border border-line bg-surface2/50 p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-medium text-ink2">Spent this month</p>
              <p className="tabular text-sm font-semibold text-ink">
                {hidden ? "••••" : fmt(monthSpend, { maximumFractionDigits: 0 })}
                <span className="text-ink3"> / {fmt(card.limits.monthly, { maximumFractionDigits: 0 })}</span>
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className={cx("h-full rounded-full", pct > 95 ? "bg-bad" : "bg-accent")}
              />
            </div>
            <p className="mt-2 text-xs text-ink3">{100 - pct}% of your monthly limit remaining.</p>
          </div>
        </motion.div>

        {/* recent debit activity */}
        <div className="card-surface mt-5 overflow-hidden">
          <p className="label-micro px-5 pt-5">Recent debit card activity</p>
          <div className="divide-y divide-line pb-2 pt-2">
            {cardTx.map((t, i) => (
              <TxRow key={t.id} t={t} index={i} onClick={() => setSelected(t)} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-5">
        <SectionCard title="Spending limits" desc="Drag to adjust. Changes apply instantly.">
          <div className="space-y-6">
            {LIMITS.map((l) => (
              <LimitSlider
                key={l.key}
                label={l.label}
                min={l.min}
                max={l.max}
                step={l.step}
                hint={l.hint}
                value={card.limits[l.key]}
                format={(v) => (hidden ? "••••" : fmt(v, { maximumFractionDigits: 0 }))}
                onChange={(v) => updateCard("debit", { limits: { ...card.limits, [l.key]: v } })}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Transaction channels" desc="Choose where this card works.">
          <ToggleRow icon={Globe} title="Online payments" desc="E-commerce and in-app purchases" checked={card.channels.online && !blocked} onChange={(v) => { updateCard("debit", { channels: { ...card.channels, online: v } }); toast[v ? "success" : "info"](`Online payments ${v ? "enabled" : "disabled"}`); }} disabled={blocked} />
          <ToggleRow icon={Store} title="In-store (POS)" desc="Chip & PIN at terminals" checked={card.channels.pos && !blocked} onChange={(v) => updateCard("debit", { channels: { ...card.channels, pos: v } })} disabled={blocked} />
          <ToggleRow icon={Nfc} title="NFC / Tap to pay" desc="Contactless payments" checked={card.channels.nfc && !blocked} onChange={(v) => updateCard("debit", { channels: { ...card.channels, nfc: v } })} disabled={blocked} />
          {card.channels.nfc && (
            <div className="px-1 pb-3">
              <LimitSlider
                label="NFC per-transaction cap"
                min={500}
                max={10000}
                step={500}
                value={card.channels.nfcLimit}
                format={(v) => fmt(v, { maximumFractionDigits: 0 })}
                hint="PIN-less taps are capped — RBI allows up to ₹5,000 per tap."
                onChange={(v) => updateCard("debit", { channels: { ...card.channels, nfcLimit: v } })}
                disabled={blocked}
              />
            </div>
          )}
          <ToggleRow icon={Banknote} title="ATM withdrawals" desc="Cash access in India" checked={card.channels.atm && !blocked} onChange={(v) => updateCard("debit", { channels: { ...card.channels, atm: v } })} disabled={blocked} />
          <ToggleRow icon={Globe} title="International usage" desc="Enable before travelling or foreign sites" checked={card.channels.intl && !blocked} onChange={(v) => { updateCard("debit", { channels: { ...card.channels, intl: v } }); toast.info(`International usage ${v ? "enabled" : "disabled"}`, v ? "A 3.5% forex markup applies." : undefined); }} disabled={blocked} />
          {card.channels.intl && (
            <div className="px-1 pb-2">
              <LimitSlider
                label="International limit / txn"
                min={5000}
                max={200000}
                step={5000}
                value={card.channels.intlLimit}
                format={(v) => fmt(v, { maximumFractionDigits: 0 })}
                onChange={(v) => updateCard("debit", { channels: { ...card.channels, intlLimit: v } })}
                disabled={blocked}
              />
            </div>
          )}
        </SectionCard>

        <Note icon={ShieldCheck}>
          RBI tip: keeping international usage off when not travelling is the strongest
          card fraud protection.
        </Note>
      </div>

      <TransactionDrawer tx={selected} onClose={() => setSelected(null)} />
      <PinResetModal open={pinOpen} onClose={() => setPinOpen(false)} card={card} which="debit" />
      <BlockReissueModal open={blockOpen} onClose={() => setBlockOpen(false)} card={card} which="debit" />
    </div>
  );
}
