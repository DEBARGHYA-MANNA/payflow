import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Copy,
  Eye,
  EyeOff,
  FileDown,
  Plus,
  Send,
  Snowflake,
} from "lucide-react";
import BankCard from "../components/BankCard";
import { CategoryBars, SpendingChart } from "../components/charts";
import TransactionDrawer from "../components/TransactionDrawer";
import TxRow from "../components/TxRow";
import { Avatar, Button, cx, IconButton } from "../components/ui";
import { useApp } from "../context/AppContext";
import { fmt, maskAccount } from "../lib/format";
import { CURRENT_USER } from "../data/mock";

function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

export default function Dashboard() {
  const { go, balance, hidden, toggleHidden, transactions, beneficiaries, cards, freezeCard, toast } =
    useApp();
  const [selected, setSelected] = useState(null);
  const animatedBalance = useCountUp(balance);
  const credit = cards.credit;
  const availableCredit = Math.max(0, credit.limit - credit.outstanding);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const recent = transactions.slice(0, 6);

  const monthSpend = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return transactions
      .filter((t) => t.status === "completed" && t.amount < 0 && new Date(t.date) >= cutoff)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
  }, [transactions]);

  const quickPeople = useMemo(() => {
    return [...beneficiaries]
      .sort((a, b) => {
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
        return new Date(b.lastUsed || 0) - new Date(a.lastUsed || 0);
      })
      .slice(0, 5);
  }, [beneficiaries]);

  const copyAccount = () => {
    navigator.clipboard?.writeText(CURRENT_USER.account).catch(() => {});
    toast.success("Account number copied", maskAccount(CURRENT_USER.account));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
      {/* header */}
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="label-micro">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1.5 font-display text-[28px] font-semibold tracking-tight text-ink sm:text-4xl">
            {greeting}, {CURRENT_USER.name.split(" ")[0]}
          </h1>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <IconButton label={hidden ? "Show balances" : "Hide balances"} onClick={toggleHidden}>
            {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
          </IconButton>
          <button
            onClick={() => go("profile")}
            aria-label="Open profile and accounts"
            title="Profile & accounts"
            className="rounded-full transition-transform hover:scale-105 active:scale-95"
          >
            <Avatar name={CURRENT_USER.name} size="md" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* ------------------------- balance hero ------------------------ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card-surface relative overflow-hidden p-6 sm:p-8 lg:col-span-7"
        >
          <div
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full opacity-[0.13] blur-3xl"
            style={{ background: "var(--c-accent)" }}
          />
          <div className="relative">
            <div className="flex items-center gap-2">
              <p className="label-micro">Available balance</p>
              <button
                onClick={toggleHidden}
                className="text-ink3 transition-colors hover:text-ink"
                aria-label={hidden ? "Show balance" : "Hide balance"}
              >
                {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="tabular mt-3 font-display text-[44px] font-semibold leading-none tracking-tight text-ink sm:text-[58px]">
              {hidden ? "••••••" : fmt(animatedBalance)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-line bg-surface2 px-3 py-1.5 text-xs font-medium text-ink2">
                Savings {maskAccount(CURRENT_USER.account)}
              </span>
              <span className="rounded-full border border-line bg-surface2 px-3 py-1.5 text-xs font-medium text-ink2">
                IFSC {CURRENT_USER.ifsc}
              </span>
              <span className="rounded-full border border-line bg-surface2 px-3 py-1.5 text-xs font-medium text-ink2">
                Kolkata, WB
              </span>
              <button
                onClick={copyAccount}
                className="flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-3 py-1.5 text-xs font-medium text-ink2 transition-colors hover:text-ink"
              >
                <Copy size={12} /> Copy
              </button>
            </div>

            {/* quick actions */}
            <div className="mt-7 grid grid-cols-4 gap-2 sm:gap-3">
              <QuickAction
                label="Send"
                icon={Send}
                accent
                onClick={() => go("send")}
              />
              <QuickAction
                label="Add person"
                icon={Plus}
                onClick={() => go("beneficiaries", { add: true })}
              />
              <QuickAction
                label={credit.frozen ? "Unfreeze" : "Freeze"}
                icon={Snowflake}
                active={credit.frozen}
                onClick={() => {
                  freezeCard("credit", !credit.frozen);
                  toast[credit.frozen ? "success" : "info"](
                    credit.frozen ? "Card unfrozen" : "Card frozen",
                    credit.frozen ? "All channels active again." : "All card payments are paused."
                  );
                }}
              />
              <QuickAction
                label="Statement"
                icon={FileDown}
                onClick={() =>
                  toast.info("Statement requested", "A simulated PDF statement would be emailed to you.")
                }
              />
            </div>
          </div>
        </motion.section>

        {/* --------------------------- card mini -------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5"
        >
          <div className="card-surface h-full p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="label-micro">PayFlow One · Credit</p>
              <button
                onClick={() => go("cards")}
                className="flex items-center gap-1 text-xs font-semibold text-accent transition-opacity hover:opacity-80"
              >
                Manage <ArrowRight size={13} />
              </button>
            </div>
            <BankCard card={credit} variant="credit" compact />
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-center">
              <div className="rounded-lg bg-surface2/50 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink3">Available credit</p>
                <p className="tabular mt-0.5 text-sm font-semibold text-ink">
                  {hidden ? "••••" : fmt(availableCredit, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="rounded-lg bg-surface2/50 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink3">Bill due</p>
                <p className="tabular mt-0.5 text-sm font-semibold text-ink">
                  {hidden ? "••••" : fmt(credit.outstanding, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* -------------------------- send again -------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="card-surface p-5 sm:p-6 lg:col-span-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <p className="label-micro">Quick transfer</p>
            <button
              onClick={() => go("beneficiaries")}
              className="flex items-center gap-1 text-xs font-semibold text-accent transition-opacity hover:opacity-80"
            >
              All people <ArrowRight size={13} />
            </button>
          </div>
          <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
            <button
              onClick={() => go("send")}
              className="group flex w-[76px] shrink-0 flex-col items-center gap-2"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-line text-ink3 transition-colors group-hover:border-accent group-hover:text-accent">
                <Plus size={20} />
              </span>
              <span className="text-xs font-medium text-ink2">New</span>
            </button>
            {quickPeople.map((b) => (
              <button
                key={b.id}
                onClick={() => go("send", { beneficiaryId: b.id })}
                className="group flex w-[76px] shrink-0 flex-col items-center gap-2"
              >
                <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.05]">
                  <Avatar name={b.name} size="lg" />
                </span>
                <span className="w-full truncate text-center text-xs font-medium text-ink2 group-hover:text-ink">
                  {b.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-baseline justify-between">
              <p className="label-micro">Top categories · 30 days</p>
              <p className="tabular text-sm font-semibold text-ink">
                {hidden ? "••••" : fmt(monthSpend, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <CategoryBars transactions={transactions} />
          </div>
        </motion.section>

        {/* ------------------------- spending chart ------------------------ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="card-surface p-5 sm:p-6 lg:col-span-7"
        >
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="label-micro">Spending overview</p>
              <p className="mt-1 text-sm text-ink2">
                Weekly outflow for the last 8 weeks
              </p>
            </div>
            <span className="rounded-full bg-surface2 px-3 py-1.5 text-xs font-semibold text-ink2">
              Last 8 weeks
            </span>
          </div>
          <SpendingChart transactions={transactions} />
        </motion.section>

        {/* ------------------------- recent payments ----------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="card-surface overflow-hidden lg:col-span-12"
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-5 sm:px-6">
            <p className="label-micro">Recent payments</p>
            <Button variant="ghost" size="sm" onClick={() => go("history")}>
              View all <ArrowRight size={14} />
            </Button>
          </div>
          <div className="divide-y divide-line pb-2">
            {recent.map((t, i) => (
              <TxRow key={t.id} t={t} index={i} onClick={() => setSelected(t)} />
            ))}
          </div>
        </motion.section>
      </div>

      <TransactionDrawer tx={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function QuickAction({ label, icon: Icon, accent, active, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="group flex flex-col items-center gap-2"
    >
      <span
        className={cx(
          "flex h-12 w-full items-center justify-center rounded-lg border transition-all duration-200 sm:h-13",
          accent
            ? "border-transparent bg-accent text-accentInk shadow-[0_8px_20px_-6px_var(--c-accent)] group-hover:-translate-y-0.5"
            : active
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-line bg-surface2 text-ink2 group-hover:-translate-y-0.5 group-hover:text-ink"
        )}
      >
        <Icon size={18} />
      </span>
      <span className="text-[11px] font-semibold text-ink2 group-hover:text-ink sm:text-xs">
        {label}
      </span>
    </motion.button>
  );
}
