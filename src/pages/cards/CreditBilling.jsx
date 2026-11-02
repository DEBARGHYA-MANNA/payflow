import React, { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  Download,
  IndianRupee,
  Repeat,
  Wallet,
} from "lucide-react";
import { Button, cx, Switch } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { cycleInfo } from "../../data/credit";
import { fmt, fmtFullDate } from "../../lib/format";
import { downloadStatement } from "../../lib/statement";
import { CREDIT_LAST4 } from "../../data/mock";
import { ChangeBillingModal, PayBillModal } from "./modals";
import { Note, SectionCard } from "./shared";

const AUTOPAY_MODES = [
  { id: "total", label: "Total due", desc: "Avoid all interest" },
  { id: "minimum", label: "Minimum due", desc: "5% of outstanding" },
  { id: "fixed", label: "Custom", desc: "Fixed amount monthly" },
];

export default function CreditBilling() {
  const { cards, hidden, setAutopay, transactions, toast } = useApp();
  const card = cards.credit;
  const [payOpen, setPayOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);

  const cy = cycleInfo(card.billingDay);

  const creditTxns = useMemo(
    () => transactions.filter((t) => t.method?.includes(`Credit`)),
    [transactions]
  );

  const dateStr = (d) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const dueUrgent = cy.daysToDue >= 0 && cy.daysToDue <= 5 && card.outstanding > 0;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* statement */}
      <SectionCard
        className="lg:col-span-7"
        title="Current statement"
        desc={`Cycle ${dateStr(cy.lastStmt)} – ${dateStr(cy.cycleEnd)}`}
        right={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              downloadStatement(card, creditTxns);
              toast.success("E-statement downloaded", "PDF saved to your device.");
            }}
          >
            <Download size={14} /> PDF
          </Button>
        }
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-micro">Total due</p>
            <p className="tabular mt-1 font-display text-[38px] font-semibold leading-none tracking-tight text-ink">
              {hidden ? "••••••" : fmt(card.outstanding, { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-2 text-[13px] text-ink2">
              Minimum due{" "}
              <span className="tabular font-semibold text-ink">
                {hidden ? "••••" : fmt(card.minDue, { maximumFractionDigits: 0 })}
              </span>
            </p>
          </div>
          <div className={cx("shrink-0", dueUrgent && "text-bad")}>
            <p className={cx("label-micro", dueUrgent && "!text-bad")}>Due date</p>
            <p className={cx("tabular mt-1 font-display text-xl font-semibold", dueUrgent ? "text-bad" : "text-ink")}>
              {dateStr(cy.dueDate)}
            </p>
            <p className={cx("mt-0.5 text-xs", dueUrgent ? "text-bad" : "text-ink3")}>
              {card.outstanding === 0
                ? "Nothing due right now"
                : cy.daysToDue >= 0
                  ? `${cy.daysToDue} day${cy.daysToDue === 1 ? "" : "s"} left`
                  : "Overdue — pay immediately"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Generated", dateStr(cy.lastStmt)],
            ["Next statement", dateStr(cy.nextStmt)],
            ["Days to next", `${cy.daysToNext} days`],
            ["Interest-free days", `up to ${Math.max(0, cy.daysToNext + 18)} more`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-surface2/40 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink3">{k}</p>
              <p className="tabular mt-0.5 text-[13.5px] font-semibold text-ink">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={() => setPayOpen(true)} disabled={card.outstanding === 0}>
            <IndianRupee size={16} /> {card.outstanding === 0 ? "Nothing due" : "Pay bill"}
          </Button>
          <button
            onClick={() => setBillingOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-accent transition-opacity hover:opacity-80"
          >
            <CalendarClock size={15} /> Change billing date
          </button>
        </div>
        <p className="mt-3 text-xs text-ink3">
          Statements generate on the {card.billingDay}
          {suffix(card.billingDay)} · due 18 days later.
        </p>
      </SectionCard>

      {/* autopay */}
      <SectionCard
        className="lg:col-span-5"
        title="Autopay"
        desc="e-Mandate on your PayFlow savings account."
        right={
          <Switch
            checked={card.autopay.enabled}
            onChange={(v) => {
              setAutopay({ enabled: v });
              toast[v ? "success" : "info"](
                `Autopay ${v ? "enabled" : "disabled"}`,
                v ? `Bill auto-debits ${dateStr(cy.dueDate)}.` : "You'll pay manually each cycle."
              );
            }}
            label="Autopay"
          />
        }
      >
        <div className="space-y-2">
          {AUTOPAY_MODES.map((m) => {
            const active = card.autopay.mode === m.id;
            return (
              <button
                key={m.id}
                disabled={!card.autopay.enabled}
                onClick={() => setAutopay({ mode: m.id })}
                className={cx(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all disabled:opacity-45",
                  active ? "border-accent bg-accent/6" : "border-line hover:bg-surface2"
                )}
              >
                <span
                  className={cx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    active ? "border-accent bg-accent" : "border-ink3"
                  )}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-accentInk" />}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink">{m.label}</span>
                  <span className="block text-xs text-ink3">
                    {m.id === "fixed"
                      ? hidden
                        ? "••••"
                        : `${fmt(card.autopay.fixed, { maximumFractionDigits: 0 })} / month`
                      : m.desc}
                  </span>
                </span>
                {m.id === "fixed" && active && (
                  <input
                    inputMode="numeric"
                    value={card.autopay.fixed}
                    onChange={(e) =>
                      setAutopay({ fixed: Number(e.target.value.replace(/\D/g, "").slice(0, 7)) || 0 })
                    }
                    className="tabular w-24 rounded-md border border-line bg-surface px-2 py-1.5 text-right text-sm font-semibold text-ink focus:border-accent focus:outline-none"
                    aria-label="Fixed autopay amount"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-lg bg-surface2/40 px-4 py-3">
          <Repeat size={15} className="shrink-0 text-ink3" />
          <p className="text-[12.5px] text-ink2">
            Debits from <span className="font-semibold text-ink">Savings •••• 3654</span> on the
            due date via NACH e-mandate.
          </p>
        </div>

        {card.autopay.enabled ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-good">
            <CalendarDays size={13} /> Next auto-debit {dateStr(cy.dueDate)}
          </p>
        ) : (
          <Note icon={CalendarDays} tone="warn">
            Autopay is off — missed due dates hurt your CIBIL score.
          </Note>
        )}
      </SectionCard>

      <PayBillModal open={payOpen} onClose={() => setPayOpen(false)} />
      <ChangeBillingModal open={billingOpen} onClose={() => setBillingOpen(false)} />
    </div>
  );
}

function suffix(d) {
  if (d === 1 || d === 21) return "st";
  if (d === 2 || d === 22) return "nd";
  if (d === 3 || d === 23) return "rd";
  return "th";
}
