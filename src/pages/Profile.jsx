import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  Check,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Landmark,
  Laptop,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Smartphone,
  Sparkles,
  Timer,
  TrendingUp,
  Wallet,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Avatar, Button, cx, Field, inputCls, Modal, Switch } from "../components/ui";
import { useApp } from "../context/AppContext";
import { CURRENT_USER } from "../data/mock";
import { CIBIL_SCORE, cibilBand, getTier } from "../data/credit";
import { fmt, maskAccount } from "../lib/format";
import { useBiometricCapable } from "../lib/device";
import { promptInstall } from "../lib/pwa";
import { Note, SectionCard } from "./cards/shared";
import { THEMES } from "../lib/themes";

const AUTO_LOCK = [
  { v: 1, label: "1 min" },
  { v: 5, label: "5 min" },
  { v: 15, label: "15 min" },
  { v: 0, label: "Never" },
];

const DEVICES = [
  { icon: Smartphone, name: "Pixel 8 · PayFlow App", meta: "Kolkata, WB · current session", current: true },
  { icon: Laptop, name: "MacBook Air · Chrome", meta: "Kolkata, WB · 2 hours ago" },
  { icon: Smartphone, name: "iPad Air · Safari", meta: "Howrah, WB · 6 days ago" },
];

export default function Profile() {
  const {
    balance,
    hidden,
    toggleHidden,
    cards,
    linkedCards,
    transactions,
    security,
    saveSecurity,
    lockNow,
    resetDemo,
    themeId,
    setTheme,
    go,
    toast,
    pwa,
    online,
    notifPerm,
    enableNotifications,
    notify,
  } = useApp();

  const [pinOpen, setPinOpen] = useState(false);
  const bioCapable = useBiometricCapable();
  const credit = cards.credit;
  const util = credit.limit ? (credit.outstanding / credit.limit) * 100 : 0;
  const tier = getTier(util);
  const band = cibilBand(CIBIL_SCORE);

  const { inSum, outSum } = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    let i = 0,
      o = 0;
    transactions.forEach((t) => {
      if (t.status !== "completed" || new Date(t.date) < cutoff) return;
      if (t.amount > 0) i += t.amount;
      else o += Math.abs(t.amount);
    });
    return { inSum: i, outSum: o };
  }, [transactions]);

  const netWorth = balance - credit.outstanding;

  const copy = (text, label) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast.success(`${label} copied`);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
      {/* ---------------------------- hero ---------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-surface relative overflow-hidden p-6 sm:p-8"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-[0.12] blur-3xl"
          style={{ background: "var(--c-accent)" }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={CURRENT_USER.name} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink sm:text-3xl">
                {CURRENT_USER.name}
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-good/12 px-2.5 py-1 text-[11px] font-semibold text-good">
                <BadgeCheck size={12} /> KYC verified
              </span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink2">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} /> {CURRENT_USER.city}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={12} /> Member since Mar 2021
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip icon={Sparkles} label={`${tier.name} tier`} color={tier.color} />
              <Chip icon={TrendingUp} label={`CIBIL ${CIBIL_SCORE} · ${band.label}`} color={band.color} />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" onClick={toggleHidden}>
              {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
              {hidden ? "Show" : "Hide"}
            </Button>
            <Button variant="soft" onClick={lockNow}>
              <Lock size={16} /> Lock
            </Button>
          </div>
        </div>

        {/* net position */}
        <div className="relative mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Net position" value={hidden ? "••••••" : fmt(netWorth, { maximumFractionDigits: 0 })} accent />
          <Metric label="Savings balance" value={hidden ? "••••••" : fmt(balance, { maximumFractionDigits: 0 })} />
          <Metric label="In · 30 days" value={hidden ? "••••" : fmt(inSum, { maximumFractionDigits: 0 })} tone="good" />
          <Metric label="Out · 30 days" value={hidden ? "••••" : fmt(outSum, { maximumFractionDigits: 0 })} />
        </div>
      </motion.div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* ------------------------- accounts ------------------------- */}
        <SectionCard
          className="lg:col-span-7"
          title="Accounts & products"
          desc="Everything held under this profile."
        >
          <div className="space-y-2.5">
            <AccountRow
              icon={Landmark}
              title="PayFlow Savings"
              meta={`A/c ${maskAccount(CURRENT_USER.account)} · IFSC ${CURRENT_USER.ifsc}`}
              value={hidden ? "••••••" : fmt(balance, { maximumFractionDigits: 0 })}
              tag="Primary"
              onCopy={() => copy(CURRENT_USER.account, "Account number")}
            />
            <AccountRow
              icon={CreditCard}
              title={credit.label}
              meta={`${credit.network} •• ${credit.number.slice(-4)} · ${fmt(Math.max(0, credit.limit - credit.outstanding), { maximumFractionDigits: 0 })} available`}
              value={hidden ? "••••" : `−${fmt(credit.outstanding, { maximumFractionDigits: 0 })}`}
              tone="bad"
              tag={credit.status === "active" ? "Active" : credit.status}
              onClick={() => go("cards")}
            />
            <AccountRow
              icon={Wallet}
              title="PayFlow Debit"
              meta={`${cards.debit.network} •• ${cards.debit.number.slice(-4)} · linked to savings`}
              value={cards.debit.frozen ? "Frozen" : "Active"}
              tag="Virtual"
              onClick={() => go("cards")}
            />
            {linkedCards.map((c) => (
              <AccountRow
                key={c.id}
                icon={Building2}
                title={c.label}
                meta={`${c.bank} · ${c.network} •• ${c.last4}`}
                value="Linked"
                tag="External"
                onClick={() => go("cards")}
              />
            ))}
          </div>
          {linkedCards.length === 0 && (
            <div className="mt-3">
              <Note icon={Building2}>
                Link cards from other banks using your registered mobile number — head to
                Cards → "Link card by number".
              </Note>
            </div>
          )}
        </SectionCard>

        {/* ------------------------- personal ------------------------- */}
        <SectionCard className="lg:col-span-5" title="Personal details" desc="KYC-verified information.">
          <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
            <DetailRow icon={Mail} k="Email" v={CURRENT_USER.email} onCopy={() => copy(CURRENT_USER.email, "Email")} />
            <DetailRow icon={Phone} k="Mobile" v="+91 98XXXXXX21" />
            <DetailRow icon={MapPin} k="Address" v="Kestopur, Kolkata 700102" />
            <DetailRow icon={BadgeCheck} k="PAN" v="ABXPM••••F" />
            <DetailRow icon={Landmark} k="Home branch" v="Salt Lake Sector V" />
          </div>
          <Button
            variant="ghost"
            className="mt-4 w-full"
            onClick={() => toast.info("Profile edit", "KYC-linked fields need branch verification (simulated).")}
          >
            Request detail update
          </Button>
        </SectionCard>

        {/* ------------------------- security ------------------------- */}
        <SectionCard
          className="lg:col-span-7"
          title="Security & app lock"
          desc="Controls how PayFlow unlocks on this device."
        >
          <div className="space-y-1">
            <Row
              icon={KeyRound}
              title="App PIN"
              desc="4-digit code required to open PayFlow"
              action={
                <Button size="sm" variant="soft" onClick={() => setPinOpen(true)}>
                  Change
                </Button>
              }
            />
            <Row
              icon={Fingerprint}
              title="Biometric unlock"
              desc={
                bioCapable
                  ? "Face / fingerprint instead of typing a PIN"
                  : "Unavailable — no biometric sensor on this device"
              }
              action={
                <Switch
                  checked={bioCapable && security.biometric}
                  disabled={!bioCapable}
                  label="Biometric unlock"
                  onChange={(v) => {
                    saveSecurity({ biometric: v });
                    toast[v ? "success" : "info"](`Biometric unlock ${v ? "enabled" : "disabled"}`);
                  }}
                />
              }
            />
            <Row
              icon={Lock}
              title="Lock on every launch"
              desc="Always on — PayFlow opens to the lock screen"
              action={
                <span className="flex items-center gap-1.5 rounded-full bg-good/12 px-2.5 py-1 text-[11px] font-semibold text-good">
                  <Check size={12} /> Enforced
                </span>
              }
            />
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <p className="label-micro mb-3 flex items-center gap-1.5">
              <Timer size={12} /> Auto-lock after inactivity
            </p>
            <div className="flex flex-wrap gap-2">
              {AUTO_LOCK.map((o) => (
                <button
                  key={o.v}
                  onClick={() => {
                    saveSecurity({ autoLockMins: o.v });
                    toast.info("Auto-lock updated", o.v ? `Locks after ${o.label} idle.` : "Auto-lock disabled.");
                  }}
                  className={cx(
                    "rounded-full border px-4 py-2 text-[13px] font-semibold transition-all",
                    security.autoLockMins === o.v
                      ? "border-accent bg-accent text-accentInk"
                      : "border-line bg-surface2 text-ink2 hover:text-ink"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {!bioCapable && (
            <div className="mt-4">
              <Note icon={Fingerprint}>
                Face / fingerprint unlock appears only on phones and tablets with a
                biometric sensor. On desktop, PayFlow always asks for your PIN.
              </Note>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="soft" onClick={lockNow}>
              <Lock size={15} /> Lock now
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast.success("Signed out of other devices", "2 sessions ended (simulated).")}
            >
              <LogOut size={15} /> Sign out other devices
            </Button>
          </div>
        </SectionCard>

        {/* ----------------------- notifications ---------------------- */}
        <SectionCard
          className="lg:col-span-12"
          title="Notifications & app"
          desc="Push alerts, offline mode and installation."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <Row
                icon={Bell}
                title="Push notifications"
                desc={
                  notifPerm === "granted"
                    ? "Enabled — you'll get payment alerts"
                    : notifPerm === "denied"
                      ? "Blocked in browser settings"
                      : notifPerm === "unsupported"
                        ? "Not supported on this browser"
                        : "Get alerts for payments and due dates"
                }
                action={
                  notifPerm === "granted" ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-good/12 px-2.5 py-1 text-[11px] font-semibold text-good">
                      <Check size={12} /> On
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="soft"
                      disabled={notifPerm === "denied" || notifPerm === "unsupported"}
                      onClick={async () => {
                        const res = await enableNotifications();
                        if (res.ok) {
                          toast.success("Notifications enabled", "We'll alert you about payments.");
                          notify({
                            title: "PayFlow notifications on",
                            body: "You'll now get alerts for transfers and bill due dates.",
                            page: "dashboard",
                          });
                        } else {
                          toast.error("Permission not granted", "Enable notifications in browser settings.");
                        }
                      }}
                    >
                      Enable
                    </Button>
                  )
                }
              />
              {notifPerm === "granted" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    notify({
                      title: "Bill reminder",
                      body: `Your ${credit.label} bill of ${fmt(credit.outstanding, { maximumFractionDigits: 0 })} is due soon.`,
                      page: "cards",
                      tag: "payflow-bill",
                    });
                    toast.info("Test notification sent");
                  }}
                >
                  <Bell size={14} /> Send a test notification
                </Button>
              )}
            </div>

            <div>
              <Row
                icon={online ? Wifi : WifiOff}
                title={online ? "Online" : "Offline mode"}
                desc={
                  online
                    ? "Connected — app shell is cached for offline use"
                    : "Running from cache; your data is stored locally"
                }
                action={
                  <span
                    className={cx(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      online ? "bg-good/12 text-good" : "bg-bad/12 text-bad"
                    )}
                  >
                    <span className={cx("h-1.5 w-1.5 rounded-full", online ? "bg-good" : "bg-bad")} />
                    {online ? "Connected" : "No network"}
                  </span>
                }
              />
              <Row
                icon={Download}
                title="Install PayFlow"
                desc={
                  pwa.installed
                    ? "Installed — running as an app"
                    : pwa.installable
                      ? "Add to your home screen"
                      : "Use your browser menu → Add to Home Screen"
                }
                action={
                  pwa.installed ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-good/12 px-2.5 py-1 text-[11px] font-semibold text-good">
                      <Check size={12} /> Installed
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="soft"
                      disabled={!pwa.installable}
                      onClick={async () => {
                        const r = await promptInstall();
                        if (r === "accepted") toast.success("Installing PayFlow");
                      }}
                    >
                      Install
                    </Button>
                  )
                }
              />
            </div>
          </div>
        </SectionCard>

        {/* -------------------------- devices ------------------------- */}
        <SectionCard className="lg:col-span-5" title="Active sessions" desc="Where your account is signed in.">
          <div className="space-y-1">
            {DEVICES.map((d) => (
              <div key={d.name} className="flex items-center gap-3 rounded-lg px-1 py-3">
                <span
                  className={cx(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    d.current ? "bg-good/12 text-good" : "bg-surface2 text-ink2"
                  )}
                >
                  <d.icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">{d.name}</p>
                  <p className="truncate text-xs text-ink3">{d.meta}</p>
                </div>
                {d.current ? (
                  <span className="rounded-full bg-good/12 px-2.5 py-1 text-[10.5px] font-semibold text-good">
                    This device
                  </span>
                ) : (
                  <button
                    onClick={() => toast.info("Session ended", d.name)}
                    className="text-xs font-semibold text-ink3 transition-colors hover:text-bad"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ------------------------ preferences ----------------------- */}
        <SectionCard className="lg:col-span-12" title="Preferences" desc="Appearance and demo data.">
          <p className="label-micro mb-3">Theme</p>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cx(
                  "flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-all",
                  themeId === t.id ? "border-accent bg-accent/6 text-ink" : "border-line text-ink2 hover:text-ink"
                )}
              >
                <span
                  className="relative h-5 w-5 overflow-hidden rounded-full border border-line"
                  style={{ background: t.bg }}
                >
                  <span
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full"
                    style={{ background: t.swatch, transform: "translate(25%,25%)" }}
                  />
                </span>
                {t.name}
                {themeId === t.id && <Check size={13} className="text-accent" />}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[14px] font-semibold text-ink">Reset demo data</p>
              <p className="text-[13px] text-ink2">
                Restores balance, cards, beneficiaries, security settings and history.
              </p>
            </div>
            <Button variant="danger" onClick={resetDemo} className="shrink-0">
              <RotateCcw size={15} /> Reset everything
            </Button>
          </div>
        </SectionCard>
      </div>

      <p className="mt-6 text-center text-[11.5px] leading-snug text-ink3">
        PayFlow is a simulation built for demonstration. No real accounts, KYC records,
        biometrics or money are involved.
      </p>

      <ChangePinModal open={pinOpen} onClose={() => setPinOpen(false)} />
    </div>
  );
}

/* ------------------------------ atoms ------------------------------- */

function Chip({ icon: Icon, label, color }) {
  return (
    <span
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
      style={{ background: color + "1F", color }}
    >
      <Icon size={12} /> {label}
    </span>
  );
}

function Metric({ label, value, accent, tone }) {
  return (
    <div
      className={cx(
        "rounded-xl border px-4 py-3.5",
        accent ? "border-accent/30 bg-accent/6" : "border-line bg-surface2/40"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink3">{label}</p>
      <p
        className={cx(
          "tabular mt-1 font-display text-[19px] font-semibold tracking-tight sm:text-xl",
          tone === "good" ? "text-good" : "text-ink"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function AccountRow({ icon: Icon, title, meta, value, tag, tone, onClick, onCopy }) {
  return (
    <div
      onClick={onClick}
      className={cx(
        "flex items-center gap-3.5 rounded-lg border border-line px-4 py-3.5 transition-colors",
        onClick && "cursor-pointer hover:bg-surface2/60"
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface2 text-ink2">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14.5px] font-semibold text-ink">{title}</p>
          {tag && (
            <span className="shrink-0 rounded-full bg-surface2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink3">
              {tag}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-ink3">{meta}</p>
      </div>
      {onCopy && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
          className="shrink-0 text-ink3 transition-colors hover:text-ink"
          aria-label="Copy"
        >
          <Copy size={14} />
        </button>
      )}
      <p className={cx("tabular shrink-0 text-[14px] font-semibold", tone === "bad" ? "text-bad" : "text-ink")}>
        {value}
      </p>
    </div>
  );
}

function DetailRow({ icon: Icon, k, v, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="flex items-center gap-2.5 text-[13px] text-ink3">
        <Icon size={14} /> {k}
      </span>
      <span className="flex items-center gap-2 text-right text-[13px] font-medium text-ink">
        <span className="truncate">{v}</span>
        {onCopy && (
          <button onClick={onCopy} className="shrink-0 text-ink3 hover:text-ink" aria-label="Copy">
            <Copy size={12} />
          </button>
        )}
      </span>
    </div>
  );
}

function Row({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-1 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface2 text-ink2">
          <Icon size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink">{title}</p>
          <p className="text-xs text-ink3">{desc}</p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

/* --------------------------- change PIN ----------------------------- */

function ChangePinModal({ open, onClose }) {
  const { security, saveSecurity, toast } = useApp();
  const [curr, setCurr] = useState("");
  const [next, setNext] = useState("");
  const [conf, setConf] = useState("");

  React.useEffect(() => {
    if (open) {
      setCurr("");
      setNext("");
      setConf("");
    }
  }, [open]);

  const currErr = curr.length === 4 && curr !== security.pin ? "Current PIN is incorrect" : "";
  const confErr = conf.length === 4 && conf !== next ? "PINs don't match" : "";
  const valid = curr === security.pin && /^\d{4}$/.test(next) && next === conf && next !== curr;

  const box = "tabular text-center text-lg tracking-[0.5em]";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface2 text-ink">
        <KeyRound size={20} />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">Change app PIN</h3>
      <p className="mt-1 text-sm text-ink2">
        This PIN unlocks PayFlow on every launch and is remembered on this device.
        {security.pinIsDefault && " You're still on the demo PIN 1234."}
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Current PIN" error={currErr}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            autoFocus
            value={curr}
            onChange={(e) => setCurr(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className={cx(inputCls, box)}
            placeholder="••••"
          />
        </Field>
        <Field
          label="New PIN"
          error={next.length === 4 && next === curr ? "Choose a different PIN" : ""}
        >
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={next}
            onChange={(e) => setNext(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className={cx(inputCls, box)}
            placeholder="••••"
          />
        </Field>
        <Field label="Confirm new PIN" error={confErr}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={conf}
            onChange={(e) => setConf(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className={cx(inputCls, box)}
            placeholder="••••"
          />
        </Field>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="lg"
          disabled={!valid}
          onClick={() => {
            saveSecurity({ pin: next });
            toast.success("App PIN updated", "Use your new PIN at the next unlock.");
            onClose();
          }}
        >
          Save PIN
        </Button>
      </div>
    </Modal>
  );
}
