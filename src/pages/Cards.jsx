import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Landmark,
  Link2,
  OctagonX,
  Plus,
  ShieldAlert,
  Snowflake,
} from "lucide-react";
import BankCard from "../components/BankCard";
import TransactionDrawer from "../components/TransactionDrawer";
import TxRow from "../components/TxRow";
import { cx, Modal, Button } from "../components/ui";
import { useApp } from "../context/AppContext";
import { fmt, fmtDate } from "../lib/format";
import CreditBilling from "./cards/CreditBilling";
import CreditControls from "./cards/CreditControls";
import CreditExtras from "./cards/CreditExtras";
import CreditOverview from "./cards/CreditOverview";
import CreditTokens from "./cards/CreditTokens";
import DebitPanel from "./cards/DebitPanel";
import LinkCardModal from "./cards/LinkCardModal";
import { BlockReissueModal, PinResetModal, ReissueBanner } from "./cards/modals";
import { Note } from "./cards/shared";

export default function Cards() {
  const { linkedCards } = useApp();
  const [tab, setTab] = useState("credit");
  const [linkOpen, setLinkOpen] = useState(false);

  const tabs = [
    { id: "credit", label: "Credit · One Metal" },
    { id: "debit", label: "Debit · Virtual" },
    ...linkedCards.map((c) => ({
      id: c.id,
      label: `${c.bank.split(" ")[0]} •• ${c.last4}`,
      card: c,
    })),
  ];
  const current = tabs.find((t) => t.id === tab) || tabs[0];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-micro">Card management</p>
          <h1 className="mt-1.5 font-display text-[28px] font-semibold tracking-tight text-ink sm:text-4xl">
            Cards
          </h1>
          <p className="mt-1 text-sm text-ink2">
            Debit controls plus the full PayFlow One credit hub.
          </p>
        </div>
        <Button variant="soft" onClick={() => setLinkOpen(true)}>
          <Plus size={16} /> Link card by number
        </Button>
      </div>

      {/* card switcher */}
      <div className="no-scrollbar -mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex rounded-full border border-line bg-surface p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cx(
                "relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
                current.id === t.id ? "text-accentInk" : "text-ink2 hover:text-ink"
              )}
            >
              {current.id === t.id && (
                <motion.span
                  layoutId="card-tab"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-accent"
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {current.id === "debit" ? (
            <DebitPanel />
          ) : current.id === "credit" ? (
            <CreditPanel />
          ) : (
            <LinkedPanel card={current.card} />
          )}
        </motion.div>
      </AnimatePresence>

      <LinkCardModal open={linkOpen} onClose={() => setLinkOpen(false)} />
    </div>
  );
}

/* ----------------------------- Credit panel --------------------------- */

function CreditPanel() {
  const { cards, freezeCard, updateCard, transactions, hidden, toast } = useApp();
  const card = cards.credit;
  const [pinOpen, setPinOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const cardTx = useMemo(
    () => transactions.filter((t) => t.method?.includes("Credit") && t.amount !== 0).slice(0, 5),
    [transactions]
  );

  const active = card.status === "active";
  const closed = card.status === "closed";

  const copyNumber = () => {
    navigator.clipboard?.writeText(card.number).catch(() => {});
    toast.success("Card number copied", "Demo card — not real data.");
  };

  return (
    <div className="space-y-5">
      <ReissueBanner which="credit" />

      {/* hero */}
      <div className="card-surface p-5 sm:p-7">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="mx-auto w-full max-w-md">
            <BankCard card={card} variant="credit" />
            {card.pinChangedAt && !closed && (
              <p className="mt-3 text-center text-xs text-ink3">
                PIN last changed{" "}
                {new Date(card.pinChangedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <span
                className={cx(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  active ? "bg-accent/10 text-accent" : closed ? "bg-surface2 text-ink3" : "bg-warn/15 text-warn"
                )}
              >
                <CreditCard size={18} />
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-ink">{card.label}</p>
                <p className="text-xs text-ink3">
                  {card.network} · •• {card.number.slice(-4)} ·{" "}
                  {closed
                    ? "Closed"
                    : card.status === "blocked"
                      ? "Blocked"
                      : card.frozen
                        ? "Frozen"
                        : "Active"}
                </p>
              </div>
            </div>

            <CardActions
              actions={[
                {
                  icon: Snowflake,
                  label: card.frozen ? "Unfreeze" : "Freeze",
                  active: card.frozen,
                  disabled: !active,
                  onClick: () => {
                    freezeCard("credit", !card.frozen);
                    toast[card.frozen ? "success" : "info"](
                      card.frozen ? "Card unfrozen" : "Card frozen",
                      card.frozen ? "All channels active again." : "Spending paused until you unfreeze."
                    );
                  },
                },
                {
                  icon: card.showDetails ? EyeOff : Eye,
                  label: card.showDetails ? "Hide" : "Reveal",
                  active: card.showDetails,
                  disabled: !active,
                  onClick: () => {
                    updateCard("credit", { showDetails: !card.showDetails });
                    toast.info(card.showDetails ? "Details hidden" : "Details revealed");
                  },
                },
                { icon: KeyRound, label: "Reset PIN", disabled: !active, onClick: () => setPinOpen(true) },
                { icon: Copy, label: "Copy no.", disabled: !active, onClick: copyNumber },
                { icon: OctagonX, label: "Block", danger: true, disabled: !active, onClick: () => setBlockOpen(true) },
              ]}
            />

            {!closed && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surface2/40 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink3">
                    Available credit
                  </p>
                  <p className="tabular mt-0.5 font-display text-xl font-semibold text-ink">
                    {hidden ? "••••" : fmt(Math.max(0, card.limit - card.outstanding), { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="rounded-lg bg-surface2/40 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink3">
                    Bill due
                  </p>
                  <p className="tabular mt-0.5 font-display text-xl font-semibold text-ink">
                    {hidden ? "••••" : fmt(card.outstanding, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {closed ? (
        <Note icon={ShieldAlert} tone="bad">
          This card is closed. Rewards were redeemed, autopay detached, and tokens revoked.
          Use "Card safety" below to reinstate it in demo mode.
        </Note>
      ) : card.status === "blocked" ? (
        <Note icon={OctagonX} tone="warn">
          Blocked cards can't spend. Controls stay visible below but transactions will
          decline until the replacement activates.
        </Note>
      ) : null}

      {!closed && (
        <>
          <CreditOverview />
          <CreditBilling />
          <CreditControls />
          <CreditTokens />
        </>
      )}
      <CreditExtras />

      {/* recent credit activity */}
      <div className="card-surface overflow-hidden">
        <p className="label-micro px-5 pt-5">Recent credit card activity</p>
        <div className="divide-y divide-line pb-2 pt-2">
          {cardTx.map((t, i) => (
            <TxRow key={t.id} t={t} index={i} onClick={() => setSelected(t)} />
          ))}
        </div>
      </div>

      <TransactionDrawer tx={selected} onClose={() => setSelected(null)} />
      <PinResetModal open={pinOpen} onClose={() => setPinOpen(false)} card={card} which="credit" />
      <BlockReissueModal open={blockOpen} onClose={() => setBlockOpen(false)} card={card} which="credit" />
    </div>
  );
}

/* ----------------------------- Linked card ---------------------------- */

function LinkedPanel({ card }) {
  const { updateLinked, unlinkCard, toast } = useApp();
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const copyNumber = () => {
    navigator.clipboard?.writeText(card.number.slice(-4)).catch(() => {});
    toast.success("Last 4 digits copied", "Full numbers of third-party cards aren't fetched in the demo.");
  };

  const actions = [
    {
      icon: Snowflake,
      label: card.frozen ? "Unfreeze" : "Freeze",
      active: card.frozen,
      onClick: () => {
        updateLinked(card.id, { frozen: !card.frozen });
        toast[card.frozen ? "success" : "info"](
          card.frozen ? "Card unfrozen" : "Card frozen",
          `Simulation for ${card.label} •• ${card.last4}.`
        );
      },
    },
    {
      icon: card.showDetails ? EyeOff : Eye,
      label: card.showDetails ? "Hide" : "Reveal",
      active: card.showDetails,
      onClick: () => updateLinked(card.id, { showDetails: !card.showDetails }),
    },
    { icon: Copy, label: "Copy no.", onClick: copyNumber },
    { icon: Link2, label: "Unlink", danger: true, onClick: () => setConfirmUnlink(true) },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="card-surface p-5 sm:p-7">
          <div className="mx-auto max-w-md">
            <BankCard
              card={{
                ...card,
                number: card.number.padStart(16, "0"),
                status: "active",
              }}
              variant={card.type === "credit" ? "credit" : "debit"}
            />
          </div>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-4 gap-2">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className={cx(
                  "flex flex-col items-center gap-1.5 rounded-lg border py-3 transition-all",
                  a.danger
                    ? "border-bad/25 bg-bad/8 text-bad"
                    : a.active
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-line bg-surface2 text-ink2 hover:text-ink"
                )}
              >
                <a.icon size={17} />
                <span className="text-center text-[10.5px] font-semibold leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-5">
        <div className="card-surface p-5 sm:p-6">
          <p className="label-micro mb-4">Linked card details</p>
          <div className="space-y-1">
            {[
              [CreditCard, "Product", card.label],
              [Landmark, "Issuer", card.bank],
              [CreditCard, "Network", `${card.network} · ${card.type === "credit" ? "Credit" : "Debit"}`],
              [CalendarDays, "Linked on", fmtDate(card.linkedAt)],
            ].map(([Icon, k, v], i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg px-1 py-2.5">
                <span className="flex items-center gap-2.5 text-[13px] text-ink3">
                  <Icon size={14} /> {k}
                </span>
                <span className="text-[13px] font-semibold text-ink">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <Note icon={ShieldAlert}>
          Third-party cards fetched by registered number are view-only in this demo.
          Limits, spend controls and statements stay with the issuing bank.
        </Note>
      </div>

      <Modal open={confirmUnlink} onClose={() => setConfirmUnlink(false)}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bad/12 text-bad">
          <Link2 size={20} />
        </div>
        <h3 className="font-display text-xl font-semibold text-ink">
          Unlink {card.label} •• {card.last4}?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink2">
          It disappears from this list. You can find it again later with your registered
          mobile number.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="ghost" size="lg" onClick={() => setConfirmUnlink(false)}>
            Keep
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => {
              unlinkCard(card.id);
              toast.info("Card unlinked", card.label);
              setConfirmUnlink(false);
            }}
          >
            Unlink
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/* --------------------------- Shared action grid ------------------------ */

function CardActions({ actions }) {
  return (
    <div className="grid grid-cols-5 gap-2">
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
          <a.icon size={16} />
          <span className="text-center text-[10.5px] font-semibold leading-tight">{a.label}</span>
        </button>
      ))}
    </div>
  );
}
