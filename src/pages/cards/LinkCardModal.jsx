import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CreditCard,
  Fingerprint,
  Link2,
  Loader2,
  Phone,
  Search,
} from "lucide-react";
import { Button, cx, Modal } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { CARD_REGISTRY } from "../../data/credit";

/**
 * "Link card by registered mobile number" — a fully simulated flow that
 * mirrors how banks let you fetch & link cards associated with your number:
 * 1. enter registered mobile → 2. registry search → 3. pick cards → 4. OTP.
 */
export default function LinkCardModal({ open, onClose }) {
  const { linkCard, linkedCards, toast, go } = useApp();
  const [step, setStep] = useState(0);
  const [mobile, setMobile] = useState("");
  const [found, setFound] = useState([]);
  const [picked, setPicked] = useState([]);
  const [otp, setOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [done, setDone] = useState([]);

  useEffect(() => {
    if (open) {
      setStep(0);
      setMobile("");
      setFound([]);
      setPicked([]);
      setOtp(String(Math.floor(100000 + Math.random() * 900000)));
      setOtpInput("");
      setDone([]);
    }
  }, [open]);

  const mobileValid = /^[6-9]\d{9}$/.test(mobile);

  const search = () => {
    setStep(1);
    // simulated registry lookup — deterministic picks from the demo registry
    setTimeout(() => {
      let seed = 0;
      for (const ch of mobile) seed += ch.charCodeAt(0);
      const pool = CARD_REGISTRY.filter(
        (c) => !linkedCards.some((l) => l.last4 === c.last4 && l.label === c.label)
      );
      const count = Math.min(2 + (seed % 2), Math.max(pool.length, 0));
      const rotated = pool.length ? Array.from({ length: count }, (_, i) => pool[(seed + i) % pool.length]) : [];
      setFound(rotated);
      setPicked(rotated.map((_, i) => i)); // preselect all
      setStep(2);
    }, 1600);
  };

  const confirmLink = () => {
    const linked = picked
      .map((i) => found[i])
      .filter(Boolean)
      .map((c) => linkCard(c))
      .filter(Boolean);
    setDone(linked);
    setStep(3);
    toast.success(
      `${linked.length} card${linked.length === 1 ? "" : "s"} linked`,
      `Verified via +91 ${mobile}. Controls are read-through demos.`
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/12 text-accent">
        <Link2 size={20} />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">Link a card</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink2">
        Find cards registered to your mobile number and link them for a unified view.
        Entirely simulated — no registry is contacted.
      </p>

      <AnimatePresence mode="wait">
        {/* ------------------------- step 0: number ------------------------- */}
        {step === 0 && (
          <motion.div key="l0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="mt-6">
              <label className="label-micro mb-2 block">Registered mobile number</label>
              <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 transition-colors focus-within:border-accent">
                <Phone size={16} className="shrink-0 text-ink3" />
                <span className="text-[15px] font-semibold text-ink2">+91</span>
                <input
                  inputMode="numeric"
                  autoFocus
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98XXXXXX21"
                  className="tabular w-full bg-transparent text-[15px] font-medium tracking-wide text-ink placeholder:text-ink3 focus:outline-none"
                />
              </div>
              {mobile && !mobileValid && (
                <p className="mt-1.5 text-[13px] font-medium text-bad">
                  Enter a valid 10-digit Indian mobile number.
                </p>
              )}
            </div>
            <Button size="lg" className="mt-6 w-full" disabled={!mobileValid} onClick={search}>
              <Search size={16} /> Find my cards
            </Button>
          </motion.div>
        )}

        {/* ------------------------ step 1: searching ------------------------ */}
        {step === 1 && (
          <motion.div key="l1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-10 text-center">
            <Loader2 size={36} className="animate-spin text-accent" />
            <p className="mt-4 text-sm font-semibold text-ink">Searching issuer registry…</p>
            <p className="mt-1 text-xs text-ink3">Matching cards against +91 {mobile}</p>
          </motion.div>
        )}

        {/* ------------------------ step 2: results ------------------------- */}
        {step === 2 && (
          <motion.div key="l2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {found.length === 0 ? (
              <div className="mt-4 rounded-lg border border-line bg-surface2/50 px-4 py-5 text-center">
                <p className="text-sm font-semibold text-ink">No unlinked cards found</p>
                <p className="mt-1 text-[13px] text-ink2">
                  Every card on this number is already linked. Try a different demo number
                  (e.g. 9830012345) to see more results.
                </p>
                <Button variant="soft" className="mt-4" onClick={() => setStep(0)}>
                  Try another number
                </Button>
              </div>
            ) : (
              <>
                <p className="mt-5 text-[13px] font-medium text-ink2">
                  {found.length} card{found.length === 1 ? "" : "s"} registered under{" "}
                  <span className="font-semibold text-ink">+91 {mobile}</span>:
                </p>
                <div className="mt-3 space-y-2">
                  {found.map((c, i) => {
                    const on = picked.includes(i);
                    return (
                      <button
                        key={c.label + c.last4}
                        onClick={() =>
                          setPicked((p) => (on ? p.filter((x) => x !== i) : [...p, i]))
                        }
                        className={cx(
                          "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
                          on ? "border-accent bg-accent/6" : "border-line hover:bg-surface2"
                        )}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface2 text-ink2">
                          <CreditCard size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {c.label} · •• {c.last4}
                          </span>
                          <span className="block text-xs text-ink3">
                            {c.bank} · {c.network} · {c.type === "credit" ? "Credit" : "Debit"}
                          </span>
                        </span>
                        <span
                          className={cx(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            on ? "border-accent bg-accent text-accentInk" : "border-line text-transparent"
                          )}
                        >
                          <Check size={13} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-accent/25 bg-accent/6 px-4 py-3">
                  <Fingerprint size={15} className="mt-0.5 shrink-0 text-accent" />
                  <p className="text-[12.5px] leading-snug text-ink2">
                    To verify ownership, enter the OTP "sent" to +91 {mobile}. Demo OTP:{" "}
                    <span className="tabular font-mono font-semibold text-ink">{otp}</span>
                  </p>
                </div>
                <input
                  inputMode="numeric"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="tabular mt-4 w-full rounded-lg border border-line bg-surface px-4 py-3 text-center text-lg tracking-[0.4em] text-ink placeholder:text-ink3 focus:border-accent focus:outline-none"
                />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button variant="ghost" size="lg" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button
                    size="lg"
                    disabled={picked.length === 0 || otpInput !== otp}
                    onClick={confirmLink}
                  >
                    Link {picked.length || ""} card{picked.length === 1 ? "" : "s"}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ------------------------- step 3: success ------------------------ */}
        {step === 3 && (
          <motion.div key="l3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-6 text-center">
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="success-ring mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-good/15 text-good"
            >
              <Check size={30} strokeWidth={2.6} />
            </motion.div>
            <p className="mt-5 font-display text-xl font-semibold text-ink">
              {done.length} card{done.length === 1 ? "" : "s"} linked
            </p>
            <p className="mx-auto mt-1 max-w-[280px] text-[13px] text-ink2">
              {done.map((c) => `${c.label} •• ${c.last4}`).join(", ")} now appear
              above alongside your PayFlow cards.
            </p>
            <Button size="lg" className="mt-6" onClick={onClose}>
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
