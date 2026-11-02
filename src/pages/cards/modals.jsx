import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  CircleAlert,
  Fingerprint,
  KeyRound,
  Lock,
  OctagonX,
  ShieldAlert,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { Button, cx, Field, inputCls, Modal } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { fmt, fmtFullDate } from "../../lib/format";

/* ---------------------------- PIN reset ----------------------------- */

export function PinResetModal({ open, onClose, card, which }) {
  const { resetPin, toast } = useApp();
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (open) {
      setStep(0);
      setPin("");
      setPin2("");
      setOtpInput("");
      setOtp(String(Math.floor(100000 + Math.random() * 900000)));
    }
  }, [open]);

  const pinValid = /^\d{4}$/.test(pin) && pin === pin2;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface2 text-ink">
        <KeyRound size={20} />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">Reset card PIN</h3>
      <p className="mt-1 text-sm text-ink2">
        {card?.label} · •• {card?.number.slice(-4)}
      </p>

      {step === 0 && (
        <>
          <p className="mt-4 text-sm leading-relaxed text-ink2">
            You'll set a new 4-digit PIN for this {which === "credit" ? "credit" : "debit"} card.
            The change applies to ATMs, POS terminals and online verification.
          </p>
          <Button size="lg" className="mt-6 w-full" onClick={() => setStep(1)}>
            Continue
          </Button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="mt-5 space-y-4">
            <Field label="New PIN">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                autoFocus
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={cx(inputCls, "tabular text-center text-lg tracking-[0.5em]")}
                placeholder="••••"
              />
            </Field>
            <Field label="Confirm new PIN" error={pin2 && pin !== pin2 ? "PINs don't match" : ""}>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin2}
                onChange={(e) => setPin2(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={cx(inputCls, "tabular text-center text-lg tracking-[0.5em]")}
                placeholder="••••"
              />
            </Field>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="ghost" size="lg" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button size="lg" disabled={!pinValid} onClick={() => setStep(2)}>
              Get OTP
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/25 bg-accent/6 px-4 py-3">
            <Fingerprint size={15} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-[13px] leading-snug text-ink2">
              An OTP was "sent" to +91 98XXXXXX21. For this demo your OTP is{" "}
              <span className="tabular font-mono font-semibold text-ink">{otp}</span>.
            </p>
          </div>
          <Field label="Enter 6-digit OTP">
            <div className="mt-4">
              <input
                inputMode="numeric"
                maxLength={6}
                value={otpInput}
                autoFocus
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={cx(inputCls, "tabular text-center text-lg tracking-[0.5em]")}
                placeholder="••••••"
              />
            </div>
          </Field>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              size="lg"
              disabled={otpInput !== otp}
              onClick={() => {
                resetPin(which);
                toast.success("PIN updated", "Your new card PIN is active immediately (simulated).");
                onClose();
              }}
            >
              <Lock size={16} /> Set PIN
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ------------------------- Block & reissue --------------------------- */

const BLOCK_REASONS = [
  { id: "lost", label: "Card lost", desc: "You can't find the physical or virtual card" },
  { id: "stolen", label: "Card stolen", desc: "Confirmed or suspected theft" },
  { id: "fraud", label: "Suspicious activity", desc: "Transactions you don't recognise" },
  { id: "damaged", label: "Card damaged", desc: "Chip or contactless no longer works" },
];

export function BlockReissueModal({ open, onClose, card, which }) {
  const { blockAndReissue } = useApp();
  const [reason, setReason] = useState("lost");

  useEffect(() => {
    if (open) setReason("lost");
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bad/12 text-bad">
        <OctagonX size={20} />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">Block &amp; reissue card</h3>
      <p className="mt-1 text-sm text-ink2">
        {card?.label} · •• {card?.number.slice(-4)} — the card stops working instantly. A
        replacement ships free to Kolkata in ~4 days (simulated).
      </p>

      <div className="mt-5 space-y-2">
        {BLOCK_REASONS.map((r) => (
          <button
            key={r.id}
            onClick={() => setReason(r.id)}
            className={cx(
              "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
              reason === r.id ? "border-accent bg-accent/6" : "border-line hover:bg-surface2"
            )}
          >
            <span
              className={cx(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                reason === r.id ? "border-accent bg-accent" : "border-ink3"
              )}
            >
              {reason === r.id && (
                <span className="h-2 w-2 rounded-full bg-accentInk" />
              )}
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{r.label}</span>
              <span className="block text-xs text-ink3">{r.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          size="lg"
          onClick={() => {
            blockAndReissue(which, reason);
            onClose();
          }}
        >
          Block card
        </Button>
      </div>
    </Modal>
  );
}

/* ------------------------- Limit increase ---------------------------- */

export function LimitIncreaseModal({ open, onClose }) {
  const { cards, requestLimitIncrease } = useApp();
  const credit = cards.credit;
  const [amount, setAmount] = useState(credit.limit);

  useEffect(() => {
    if (open) setAmount(credit.limit + 50000);
  }, [open, credit.limit]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/12 text-accent">
        <Wallet size={20} />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">Request limit increase</h3>
      <p className="mt-1 text-sm text-ink2">
        Current limit <span className="tabular font-semibold text-ink">{fmt(credit.limit, { maximumFractionDigits: 0 })}</span>.
        Approvals consider income and CIBIL score (742 — Good).
      </p>

      <div className="mt-6">
        <p className="tabular text-center font-display text-4xl font-semibold text-ink">
          {fmt(amount, { maximumFractionDigits: 0 })}
        </p>
        <input
          type="range"
          min={credit.limit}
          max={credit.limit + 500000}
          step={10000}
          value={amount}
          style={{ "--fill": `${((amount - credit.limit) / 500000) * 100}%` }}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-4"
          aria-label="Requested limit"
        />
        <div className="mt-1 flex justify-between text-xs text-ink3">
          <span>Current</span>
          <span>+₹5,00,000</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="lg"
          disabled={amount <= credit.limit}
          onClick={() => {
            requestLimitIncrease(amount);
            onClose();
          }}
        >
          Submit request
        </Button>
      </div>
    </Modal>
  );
}

/* ------------------------------ Pay bill ----------------------------- */

export function PayBillModal({ open, onClose }) {
  const { cards, balance, payBill, toast } = useApp();
  const credit = cards.credit;
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (open) setAmount(String(credit.outstanding));
  }, [open, credit.outstanding]);

  const amt = Number(amount) || 0;
  const error =
    amt <= 0
      ? "Enter an amount"
      : amt > credit.outstanding
        ? "You can't pay more than the outstanding"
        : amt > balance
          ? "This exceeds your savings balance"
          : "";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/12 text-accent">
        <Wallet size={20} />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">Pay card bill</h3>
      <p className="mt-1 text-sm text-ink2">
        From Savings •• 3654 · Balance{" "}
        <span className="tabular font-semibold text-ink">{fmt(balance, { maximumFractionDigits: 0 })}</span>
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Choice
          label="Total due"
          value={fmt(credit.outstanding, { maximumFractionDigits: 0 })}
          active={amt === credit.outstanding}
          onClick={() => setAmount(String(credit.outstanding))}
        />
        <Choice
          label="Minimum due"
          value={fmt(credit.minDue, { maximumFractionDigits: 0 })}
          active={amt === credit.minDue}
          onClick={() => setAmount(String(credit.minDue))}
        />
      </div>

      <div className="mt-4">
        <Field label="Custom amount" error={amount && error ? error : ""}>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 8))}
            className={cx(inputCls, "tabular text-lg font-semibold")}
            placeholder="₹0"
          />
        </Field>
      </div>

      {amt > 0 && amt === credit.minDue && credit.outstanding > amt && (
        <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-snug text-warn">
          <CircleAlert size={14} className="mt-0.5 shrink-0" />
          Paying only the minimum means the rest revolves at 3.49%/month.
        </p>
      )}

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={!!error}
        onClick={() => {
          payBill(amt);
          toast.success("Bill paid", `${fmt(amt)} toward your PayFlow One bill.`);
          onClose();
        }}
      >
        Pay {amt > 0 ? fmt(amt, { maximumFractionDigits: 0 }) : "bill"}
      </Button>
    </Modal>
  );
}

function Choice({ label, value, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "rounded-lg border px-4 py-3 text-left transition-all",
        active ? "border-accent bg-accent/6" : "border-line hover:bg-surface2"
      )}
    >
      <span className="block text-xs font-medium text-ink3">{label}</span>
      <span className="tabular mt-0.5 block font-display text-lg font-semibold text-ink">
        {value}
      </span>
    </button>
  );
}

/* --------------------------- Billing day ----------------------------- */

export function ChangeBillingModal({ open, onClose }) {
  const { cards, changeBillingDay } = useApp();
  const current = cards.credit.billingDay;
  const [day, setDay] = useState(current);

  useEffect(() => {
    if (open) setDay(current);
  }, [open, current]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface2 text-ink">
        <CalendarClock size={20} />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">Change billing date</h3>
      <p className="mt-1 text-sm text-ink2">
        Statements generate on this date; the due date stays 18 days later. Applies
        from the next cycle.
      </p>

      <div className="mt-5 grid grid-cols-7 gap-1.5">
        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={cx(
              "tabular flex h-10 items-center justify-center rounded-md border text-sm font-semibold transition-all",
              day === d
                ? "border-accent bg-accent text-accentInk"
                : "border-line text-ink2 hover:bg-surface2 hover:text-ink"
            )}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink3">Days 29–31 are unavailable so the date is valid every month.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="lg"
          onClick={() => {
            changeBillingDay(day);
            onClose();
          }}
        >
          Save date
        </Button>
      </div>
    </Modal>
  );
}

/* ------------------------- Close permanently ------------------------- */

export function CloseCardModal({ open, onClose }) {
  const { cards, payBill, redeemPoints, setAutopay, closeCard, toast } = useApp();
  const credit = cards.credit;
  const [sure, setSure] = useState(false);

  useEffect(() => {
    if (open) setSure(false);
  }, [open]);

  if (!credit) return null;

  const checks = [
    {
      ok: credit.outstanding === 0,
      label: "Pay the total outstanding",
      detail: `${fmt(credit.outstanding, { maximumFractionDigits: 0 })} pending`,
      action: { label: "Pay now", run: () => { payBill(credit.outstanding); toast.success("Outstanding cleared"); } },
    },
    {
      ok: credit.rewards === 0,
      label: "Redeem remaining reward points",
      detail: `${credit.rewards.toLocaleString("en-IN")} points left`,
      action: { label: "Redeem all", run: () => { redeemPoints(credit.rewards); toast.success("Points redeemed as statement credit"); } },
    },
    {
      ok: !credit.autopay.enabled,
      label: "Turn off autopay mandate",
      detail: credit.autopay.enabled ? "Autopay is active" : "Autopay disabled",
      action: { label: "Turn off", run: () => setAutopay({ enabled: false }) },
    },
  ];
  const allOk = checks.every((c) => c.ok);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bad/12 text-bad">
        <ShieldAlert size={20} />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">Close card permanently</h3>
      <p className="mt-1 text-sm text-ink2">
        {credit.label} · •• {credit.number.slice(-4)} — this mirrors a real closure request.
      </p>

      <div className="mt-5 space-y-2">
        {checks.map((c, i) => (
          <div
            key={i}
            className={cx(
              "flex items-center justify-between gap-3 rounded-lg border px-4 py-3",
              c.ok ? "border-good/30 bg-good/5" : "border-line"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  c.ok ? "bg-good text-white" : "bg-surface2 text-ink3"
                )}
              >
                {c.ok ? "✓" : i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{c.label}</p>
                <p className="text-xs text-ink3">{c.detail}</p>
              </div>
            </div>
            {!c.ok && (
              <Button size="sm" variant="soft" onClick={c.action.run}>
                {c.action.label}
              </Button>
            )}
          </div>
        ))}
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-ink2">
        <input
          type="checkbox"
          checked={sure}
          onChange={(e) => setSure(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--c-accent)]"
        />
        I understand closure is permanent, delinks UPI/tokenised merchants, and is
        reported to credit bureaus. (This is a demo — nothing is real.)
      </label>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="ghost" size="lg" onClick={onClose}>
          Keep card
        </Button>
        <Button
          variant="danger"
          size="lg"
          disabled={!allOk || !sure}
          onClick={() => {
            closeCard("credit");
            onClose();
          }}
        >
          <OctagonX size={16} /> Close card
        </Button>
      </div>
    </Modal>
  );
}

/* ------------------------ Blocked / replacement ----------------------- */

export function ReissueBanner({ which }) {
  const { cards, activateReplacement } = useApp();
  const card = cards[which];
  if (!card?.reissue) return null;
  const { reason, eta, tracking } = card.reissue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 flex flex-col gap-3 rounded-xl border border-warn/30 bg-warn/8 p-4 sm:flex-row sm:items-center"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warn/15 text-warn">
        <TriangleAlert size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">
          Card blocked ({reason}) · replacement on the way
        </p>
        <p className="mt-0.5 text-[12.5px] text-ink2">
          Tracking <span className="font-mono">{tracking}</span> · expected{" "}
          {fmtFullDate(eta)} · Kolkata, West Bengal
        </p>
      </div>
      <Button size="sm" className="shrink-0" onClick={() => activateReplacement(which)}>
        Simulate delivery &amp; activate
      </Button>
    </motion.div>
  );
}
