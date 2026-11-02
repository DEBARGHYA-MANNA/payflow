import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Landmark,
  Loader2,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Avatar, Button, cx, EmptyState, Field, inputCls, Modal } from "../components/ui";
import { fmt, maskAccount, timeAgo } from "../lib/format";
import { downloadReceipt } from "../lib/receipt";
import { buildTransferSchema } from "../lib/schemas";
import BeneficiaryForm from "../components/BeneficiaryForm";
import { CURRENT_USER } from "../data/mock";

const STEPS = ["Recipient", "Amount", "Review", "Done"];
const QUICK = [500, 2000, 5000, 20000];

const stepVariants = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -28, transition: { duration: 0.22 } },
};

export default function SendMoney() {
  const { nav, go, balance, hidden, beneficiaries, sendTransfer, toast } = useApp();
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [sentTx, setSentTx] = useState(null);
  const [processing, setProcessing] = useState(false);

  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const schema = useMemo(() => buildTransferSchema(() => balanceRef.current), []);
  const resolver = useMemo(() => zodResolver(schema), [schema]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    resolver,
    defaultValues: { beneficiaryId: "", amount: "", note: "" },
    mode: "onTouched",
  });

  const beneficiaryId = watch("beneficiaryId");
  const amount = watch("amount");
  const note = watch("note");
  const selected = beneficiaries.find((b) => b.id === beneficiaryId) || null;

  // prefill from quick-transfer shortcuts
  useEffect(() => {
    const pre = nav.params?.beneficiaryId;
    if (pre && beneficiaries.some((b) => b.id === pre)) {
      setValue("beneficiaryId", pre, { shouldValidate: true });
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? beneficiaries.filter(
          (b) =>
            b.name.toLowerCase().includes(q) || b.bank.toLowerCase().includes(q)
        )
      : beneficiaries;
    return [...list].sort(
      (a, b) => new Date(b.lastUsed || 0) - new Date(a.lastUsed || 0)
    );
  }, [beneficiaries, search]);

  const goAmount = async () => {
    const ok = await trigger("beneficiaryId");
    if (ok) setStep(1);
    else toast.error("No recipient selected", "Pick a person to send money to.");
  };

  const goReview = async () => {
    const ok = await trigger(["amount", "note"]);
    if (ok) setStep(2);
  };

  const confirmSend = () => {
    setProcessing(true);
    setStep(3);
    // simulated processing delay
    setTimeout(() => {
      const t = sendTransfer({ beneficiary: selected, amount: Number(amount), note });
      setProcessing(false);
      if (t) {
        setSentTx(t);
        toast.success("Transfer sent", `${fmt(Math.abs(t.amount))} to ${selected.name}`);
      }
    }, 1600);
  };

  const startOver = () => {
    reset({ beneficiaryId: "", amount: "", note: "" });
    setSentTx(null);
    setStep(0);
  };

  const amountNum = Number(amount) || 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
      {/* header + stepper */}
      <div className="mb-8 flex items-center gap-3">
        {step > 0 && step < 3 && (
          <button
            onClick={() => setStep(step - 1)}
            aria-label="Back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink2 transition-colors hover:bg-surface2 hover:text-ink"
          >
            <ArrowLeft size={17} />
          </button>
        )}
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Send money
          </h1>
          <p className="mt-0.5 text-sm text-ink2">
            Instant transfers · Zero fees · Simulated
          </p>
        </div>
      </div>

      <Stepper step={step} />

      <AnimatePresence mode="wait">
        {/* --------------------------- step 1 --------------------------- */}
        {step === 0 && (
          <motion.div key="s0" {...stepVariants}>
            <div className="relative mb-4">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people or banks"
                className={cx(inputCls, "pl-11 py-3.5")}
              />
            </div>

            <div className="card-surface overflow-hidden">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No matches"
                  body="Try a different name, or add this person as a new recipient."
                  action={
                    <Button variant="soft" onClick={() => setAddOpen(true)}>
                      <UserPlus size={16} /> Add recipient
                    </Button>
                  }
                />
              ) : (
                <div className="max-h-[46dvh] divide-y divide-line overflow-y-auto md:max-h-[420px]">
                  {filtered.map((b) => {
                    const active = beneficiaryId === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() =>
                          setValue("beneficiaryId", b.id, { shouldValidate: true })
                        }
                        className={cx(
                          "flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors sm:px-5",
                          active ? "bg-accent/6" : "hover:bg-surface2/60"
                        )}
                      >
                        <Avatar name={b.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14.5px] font-semibold text-ink">{b.name}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink3">
                            <Landmark size={11} /> {b.bank} · {maskAccount(b.account)}
                          </p>
                        </div>
                        {b.lastUsed && (
                          <span className="hidden text-[11px] text-ink3 sm:block">
                            {timeAgo(b.lastUsed)}
                          </span>
                        )}
                        <span
                          className={cx(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                            active
                              ? "border-accent bg-accent text-accentInk"
                              : "border-line text-transparent"
                          )}
                        >
                          <Check size={13} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => setAddOpen(true)}
                className="flex w-full items-center gap-3.5 border-t border-line px-4 py-3.5 text-left transition-colors hover:bg-surface2/60 sm:px-5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-line text-ink3">
                  <UserPlus size={17} />
                </span>
                <span className="text-[14.5px] font-semibold text-ink">Add a new recipient</span>
              </button>
            </div>

            <Button size="lg" className="mt-6 w-full" onClick={goAmount} disabled={!beneficiaryId}>
              Continue <ArrowRight size={17} />
            </Button>
          </motion.div>
        )}

        {/* --------------------------- step 2 --------------------------- */}
        {step === 1 && selected && (
          <motion.div key="s1" {...stepVariants}>
            <RecipientBanner
              b={selected}
              onChange={() => setStep(0)}
            />

            <form
              onSubmit={handleSubmit(goReview)}
              className="card-surface mt-4 p-6 sm:p-8"
            >
              <Field label="Amount" error={errors.amount?.message}>
                <div className="flex items-center justify-center gap-1 py-2">
                  <span className="font-display text-3xl font-medium text-ink3">₹</span>
                  <input
                    {...register("amount")}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    autoFocus
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d*\.?\d{0,2}$/.test(v)) {
                        setValue("amount", v, { shouldValidate: true });
                      }
                    }}
                    className="tabular w-full max-w-[260px] bg-transparent text-center font-display text-5xl font-semibold tracking-tight text-ink placeholder:text-ink3/50 focus:outline-none"
                  />
                </div>
                {!hidden && (
                  <p className="text-center text-[13px] text-ink3">
                    Balance: <span className="tabular font-medium">{fmt(balance)}</span>
                  </p>
                )}
              </Field>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setValue("amount", String(q), { shouldValidate: true })}
                    className={cx(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                      amountNum === q
                        ? "border-accent bg-accent text-accentInk"
                        : "border-line bg-surface2 text-ink2 hover:text-ink"
                    )}
                  >
                    ₹{q.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              <div className="mt-7">
                <Field
                  label="Payment description"
                  error={errors.note?.message}
                  hint="Optional — shows on both statements."
                >
                  <input
                    {...register("note")}
                    placeholder="e.g. Dinner split, rent, Ganesh Chaturthi gift"
                    maxLength={80}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Button type="submit" size="lg" className="mt-8 w-full">
                Review transfer <ArrowRight size={17} />
              </Button>
            </form>
          </motion.div>
        )}

        {/* --------------------------- step 3 --------------------------- */}
        {step === 2 && selected && (
          <motion.div key="s2" {...stepVariants}>
            <div className="card-surface overflow-hidden">
              <div className="border-b border-line bg-surface2/50 px-6 py-5">
                <p className="label-micro">You're sending</p>
                <p className="tabular mt-1 font-display text-4xl font-semibold tracking-tight text-ink">
                  {fmt(amountNum)}
                </p>
              </div>
              <div className="divide-y divide-line">
                <ReviewRow label="From" value={`${CURRENT_USER.name} · Checking ${maskAccount(CURRENT_USER.account)}`} />
                <ReviewRow label="To" value={`${selected.name} · ${selected.bank} ${maskAccount(selected.account)}`} />
                <ReviewRow label="Note" value={note || "—"} />
                <ReviewRow label="Fee" value="$0.00" accent />
                <ReviewRow label="Arrival" value="Instant (simulated)" />
                <ReviewRow label="Date" value={new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/25 bg-accent/6 px-4 py-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-[13px] leading-snug text-ink2">
                This is a simulation. No real money will move and no bank is contacted.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
                Edit amount
              </Button>
              <Button size="lg" onClick={confirmSend}>
                Confirm &amp; send <ArrowRight size={17} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ------------------------ step 4: result ----------------------- */}
        {step === 3 && (
          <motion.div key="s3" {...stepVariants} className="pt-6">
            {processing ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Loader2 size={44} className="animate-spin text-accent" />
                <p className="mt-5 font-display text-xl font-semibold text-ink">
                  Sending {fmt(amountNum)}…
                </p>
                <p className="mt-1 text-sm text-ink2">
                  Contacting {selected?.bank} (simulated)
                </p>
              </div>
            ) : (
              sentTx && (
                <div className="flex flex-col items-center py-4 text-center">
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="success-ring flex h-20 w-20 items-center justify-center rounded-full bg-good/15 text-good"
                  >
                    <Check size={38} strokeWidth={2.6} />
                  </motion.div>
                  <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink">
                    {fmt(Math.abs(sentTx.amount))} sent
                  </h2>
                  <p className="mt-1.5 text-[15px] text-ink2">
                    to {selected?.name} · {maskAccount(selected?.account || "")}
                  </p>
                  <span className="mt-4 rounded-full border border-line bg-surface2 px-4 py-1.5 font-mono text-xs text-ink2">
                    Ref {sentTx.reference}
                  </span>

                  <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button
                      variant="soft"
                      size="lg"
                      onClick={() => {
                        downloadReceipt(sentTx);
                        toast.success("Receipt downloaded");
                      }}
                    >
                      <Download size={17} /> Receipt (PDF)
                    </Button>
                    <Button size="lg" onClick={startOver}>
                      Send again <ArrowRight size={16} />
                    </Button>
                  </div>
                  <button
                    onClick={() => go("dashboard")}
                    className="mt-5 text-sm font-semibold text-ink3 transition-colors hover:text-ink"
                  >
                    Back to dashboard
                  </button>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={addOpen} onClose={() => setAddOpen(false)}>
        <BeneficiaryForm
          onClose={() => setAddOpen(false)}
          onSaved={(saved) => {
            setValue("beneficiaryId", saved.id, { shouldValidate: true });
            toast.success("Recipient added", `${saved.name} is ready to pay.`);
          }}
        />
      </Modal>
    </div>
  );
}

function Stepper({ step }) {
  const shown = Math.min(step, 2);
  return (
    <div className="mb-7 flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-1 items-center gap-2">
          <div
            className={cx(
              "h-1.5 flex-1 overflow-hidden rounded-full transition-colors duration-500",
              step > i || (step === 3 && i < 3) ? "bg-accent" : "bg-surface2"
            )}
          >
            {i === shown && step < 3 && (
              <motion.div
                layoutId="step-glow"
                className="h-full w-full rounded-full bg-accent"
              />
            )}
          </div>
        </div>
      ))}
      <span className="ml-2 text-xs font-semibold text-ink3">
        {step < 3 ? STEPS[step] : "Complete"}
      </span>
    </div>
  );
}

function RecipientBanner({ b, onChange }) {
  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-line bg-surface px-4 py-3">
      <Avatar name={b.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{b.name}</p>
        <p className="text-xs text-ink3">
          {b.bank} · {maskAccount(b.account)}
        </p>
      </div>
      <button
        onClick={onChange}
        className="text-xs font-semibold text-accent transition-opacity hover:opacity-75"
      >
        Change
      </button>
    </div>
  );
}

function ReviewRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-4">
      <span className="text-[13px] text-ink3">{label}</span>
      <span
        className={cx(
          "text-right text-[13.5px] font-semibold",
          accent ? "text-good" : "text-ink"
        )}
      >
        {value}
      </span>
    </div>
  );
}
