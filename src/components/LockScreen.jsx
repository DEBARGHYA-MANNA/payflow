import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Delete, Fingerprint, ScanFace, ShieldCheck, TriangleAlert } from "lucide-react";
import { useApp } from "../context/AppContext";
import { CURRENT_USER } from "../data/mock";
import { useBiometricCapable } from "../lib/device";
import { Avatar, cx } from "./ui";

export default function LockScreen() {
  const { security, unlock, toast } = useApp();
  const deviceCapable = useBiometricCapable();
  const bioOn = deviceCapable && security.biometric;
  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", bioOn ? "bio" : "spacer", "0", "del"];

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const shakeRef = useRef(0);

  const frozen = cooldown > 0;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // lock the page itself so nothing behind can scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const finish = useCallback(() => {
    setSuccess(true);
    setTimeout(() => {
      unlock();
      toast.success(
        `Welcome back, ${CURRENT_USER.name.split(" ")[0]}`,
        "Session secured — auto-locks when idle."
      );
    }, 600);
  }, [unlock, toast]);

  const submit = useCallback(
    (value) => {
      if (value === security.pin) {
        setError("");
        finish();
      } else {
        const next = attempts + 1;
        setAttempts(next);
        shakeRef.current += 1;
        setPin("");
        if (next >= 3) {
          setCooldown(30);
          setAttempts(0);
          setError("Too many attempts · locked 30s");
        } else {
          setError(`Incorrect PIN · ${3 - next} attempt${3 - next === 1 ? "" : "s"} left`);
        }
      }
    },
    [attempts, finish, security.pin]
  );

  const tap = useCallback(
    (k) => {
      if (frozen || scanning || success || k === "spacer") return;
      if (k === "del") {
        setPin((p) => p.slice(0, -1));
        setError("");
        return;
      }
      if (k === "bio") {
        if (!bioOn) return;
        setScanning(true);
        setTimeout(() => {
          setScanning(false);
          finish();
        }, 1300);
        return;
      }
      setPin((p) => {
        if (p.length >= 4) return p;
        const next = p + k;
        if (next.length === 4) setTimeout(() => submit(next), 150);
        return next;
      });
    },
    [frozen, scanning, success, bioOn, finish, submit]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (/^\d$/.test(e.key)) tap(e.key);
      if (e.key === "Backspace") tap("del");
      if (e.key === "Enter" && bioOn) tap("bio");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tap, bioOn]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.32 } }}
      className="fixed inset-0 z-[120] overflow-hidden bg-bg"
    >
      {/* ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="float-slow absolute -top-32 left-1/2 h-[380px] w-[560px] -translate-x-1/2 rounded-full opacity-[0.1] blur-3xl"
          style={{ background: "var(--c-accent)" }}
        />
        <div
          className="absolute -bottom-32 -right-20 h-[260px] w-[260px] rounded-full opacity-[0.07] blur-3xl"
          style={{ background: "var(--c-accent)" }}
        />
      </div>

      {/* full-height flex column, everything scales to fit */}
      <div
        className="relative mx-auto flex h-[100dvh] w-full max-w-[360px] flex-col items-center justify-between px-6"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 14px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 14px)",
        }}
      >
        {/* ---------- top: brand ---------- */}
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <img
            src="./icons/icon-192.png"
            alt=""
            className="h-7 w-7 rounded-lg"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="font-display text-[19px] font-semibold tracking-tight text-ink">
            PayFlow
          </span>
        </div>

        {/* ---------- middle: identity + dots ---------- */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-1">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="ok"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="success-ring flex h-16 w-16 items-center justify-center rounded-full bg-good/15 text-good">
                  <ShieldCheck size={30} />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-ink">Unlocked</p>
              </motion.div>
            ) : (
              <motion.div key="lock" className="flex flex-col items-center">
                <div className="scale-90 sm:scale-100">
                  <Avatar name={CURRENT_USER.name} size="lg" />
                </div>
                <p className="mt-3 font-display text-[19px] font-semibold tracking-tight text-ink">
                  {CURRENT_USER.name}
                </p>
                <p className="mt-0.5 text-center text-[12.5px] text-ink2">
                  {scanning ? "Scanning biometrics…" : "Enter your 4-digit PIN"}
                </p>

                <motion.div
                  key={shakeRef.current}
                  animate={shakeRef.current ? { x: [0, -10, 9, -6, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="mt-5 flex items-center gap-3.5"
                >
                  {[0, 1, 2, 3].map((i) => {
                    const filled = pin.length > i;
                    return (
                      <motion.span
                        key={i}
                        animate={{ scale: filled ? 1.12 : 1 }}
                        transition={{ type: "spring", stiffness: 520, damping: 22 }}
                        className={cx(
                          "h-[13px] w-[13px] rounded-full border-2 transition-colors",
                          error
                            ? "border-bad bg-bad"
                            : filled
                              ? "border-accent bg-accent"
                              : "border-line bg-transparent"
                        )}
                      />
                    );
                  })}
                </motion.div>

                <div className="mt-2.5 flex h-4 items-center">
                  {error ? (
                    <p className="flex items-center gap-1 text-[12px] font-medium text-bad">
                      <TriangleAlert size={12} /> {error}
                    </p>
                  ) : frozen ? (
                    <p className="text-[12px] font-medium text-warn">
                      Try again in {cooldown}s
                    </p>
                  ) : security.pinIsDefault ? (
                    <p className="text-[11.5px] text-ink3">Demo PIN · 1234</p>
                  ) : (
                    <p className="text-[11.5px] text-ink3">Using your custom PIN</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---------- bottom: keypad ---------- */}
        <div className="w-full shrink-0">
          <div
            className={cx(
              "grid grid-cols-3 gap-2 transition-opacity sm:gap-2.5",
              (frozen || success) && "pointer-events-none opacity-40"
            )}
          >
            {KEYS.map((k) => {
              if (k === "spacer")
                return <span key="spacer" aria-hidden className="h-[56px] sm:h-[62px]" />;

              if (k === "bio")
                return (
                  <motion.button
                    key={k}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => tap(k)}
                    aria-label="Unlock with biometrics"
                    className={cx(
                      "relative flex h-[56px] items-center justify-center rounded-2xl transition-colors sm:h-[62px]",
                      scanning ? "text-accent" : "text-ink2 active:bg-surface2"
                    )}
                  >
                    {scanning && (
                      <motion.span
                        className="absolute inset-0 rounded-2xl border-2 border-accent"
                        animate={{ opacity: [0.25, 1, 0.25] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                    <Fingerprint size={25} />
                  </motion.button>
                );

              if (k === "del")
                return (
                  <motion.button
                    key={k}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => tap(k)}
                    aria-label="Delete"
                    className="flex h-[56px] items-center justify-center rounded-2xl text-ink2 transition-colors active:bg-surface2 sm:h-[62px]"
                  >
                    <Delete size={22} />
                  </motion.button>
                );

              return (
                <motion.button
                  key={k}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => tap(k)}
                  className="tabular flex h-[56px] items-center justify-center rounded-2xl border border-line bg-surface font-display text-[23px] font-semibold text-ink transition-colors active:bg-surface2 sm:h-[62px] sm:text-[25px]"
                >
                  {k}
                </motion.button>
              );
            })}
          </div>

          {bioOn && !success && (
            <button
              onClick={() => tap("bio")}
              className="mx-auto mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-accent"
            >
              <ScanFace size={15} /> Use Face / Fingerprint
            </button>
          )}

          <p className="mt-2.5 text-center text-[10.5px] leading-tight text-ink3">
            Simulated security screen · no biometric data is read
          </p>
        </div>
      </div>
    </motion.div>
  );
}
