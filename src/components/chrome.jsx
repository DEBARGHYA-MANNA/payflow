import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  CreditCard,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  Palette,
  ReceiptText,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { THEMES } from "../lib/themes";
import { CURRENT_USER } from "../data/mock";
import { Avatar, cx, IconButton, Logo, Modal } from "./ui";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "send", label: "Send", icon: Send },
  { id: "beneficiaries", label: "People", icon: Users },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "history", label: "Activity", icon: ReceiptText },
];

// bottom nav order — Send gets the raised centre slot
const MOBILE_ORDER = ["dashboard", "beneficiaries", "send", "cards", "history"];

/* --------------------------- Theme content -------------------------- */

function ThemeList({ onPick }) {
  const { themeId, setTheme, toast } = useApp();
  return (
    <div className="space-y-1.5">
      {THEMES.map((t) => {
        const active = t.id === themeId;
        return (
          <button
            key={t.id}
            onClick={() => {
              setTheme(t.id);
              onPick?.();
              toast.info(`Theme: ${t.name}`, t.hint);
            }}
            className={cx(
              "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
              active
                ? "border-accent bg-accent/5"
                : "border-line hover:bg-surface2"
            )}
          >
            <span
              className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line"
              style={{ background: t.bg }}
            >
              <span
                className="absolute bottom-0 right-0 h-5 w-5 rounded-full"
                style={{ background: t.swatch, transform: "translate(25%, 25%)" }}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{t.name}</span>
              <span className="block truncate text-xs text-ink3">{t.hint}</span>
            </span>
            {active && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accentInk">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ThemeMenu({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <p className="label-micro">Appearance</p>
      <h3 className="mt-1 mb-4 font-display text-xl font-semibold text-ink">
        Choose your theme
      </h3>
      <ThemeList onPick={onClose} />
    </Modal>
  );
}

/* ------------------------------ Sidebar ----------------------------- */

export function Sidebar() {
  const { nav, go, lockNow } = useApp();
  return (
    <aside className="sticky top-0 z-30 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-6 backdrop-blur-xl lg:w-[264px] md:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-9 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = nav.page === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={cx(
                "group relative flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                active ? "text-ink" : "text-ink3 hover:text-ink"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-lg bg-surface2"
                />
              )}
              {active && (
                <motion.span
                  layoutId="nav-edge"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent"
                />
              )}
              <Icon size={18} className={cx("relative z-10", active && "text-accent")} />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div>
          <p className="label-micro mb-2 px-2">Theme</p>
          <ThemeList />
        </div>

        {/* profile + lock */}
        <div className="space-y-1 border-t border-line pt-3">
          <button
            onClick={() => go("profile")}
            className={cx(
              "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
              nav.page === "profile" ? "bg-surface2" : "hover:bg-surface2"
            )}
          >
            <Avatar name={CURRENT_USER.name} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-ink">
                {CURRENT_USER.name}
              </span>
              <span className="block truncate text-[11px] text-ink3">
                View profile &amp; accounts
              </span>
            </span>
          </button>
          <button
            onClick={lockNow}
            className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2 text-[13px] font-medium text-ink3 transition-colors hover:text-ink"
          >
            <Lock size={15} /> Lock app
          </button>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-accent/20 bg-accent/5 px-3.5 py-3">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-[11.5px] leading-snug text-ink2">
            Simulation mode — no real money, credentials, or card data involved.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------- Mobile top bar ------------------------ */

export function MobileTopBar() {
  const { hidden, toggleHidden, go, nav } = useApp();
  const [themeOpen, setThemeOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <Logo size={28} />
        <div className="flex items-center gap-2">
          <IconButton label={hidden ? "Show balances" : "Hide balances"} onClick={toggleHidden}>
            {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
          </IconButton>
          <IconButton label="Change theme" onClick={() => setThemeOpen(true)}>
            <Palette size={17} />
          </IconButton>
          <button
            onClick={() => go("profile")}
            aria-label="Open profile"
            className={cx(
              "rounded-full transition-all active:scale-95",
              nav.page === "profile" && "ring-2 ring-accent ring-offset-2 ring-offset-bg"
            )}
          >
            <Avatar name={CURRENT_USER.name} size="sm" />
          </button>
        </div>
      </header>
      <ThemeMenu open={themeOpen} onClose={() => setThemeOpen(false)} />
    </>
  );
}

/* ---------------------------- Bottom nav ---------------------------- */

export function BottomNav() {
  const { nav, go } = useApp();
  const items = MOBILE_ORDER.map((id) => NAV_ITEMS.find((n) => n.id === id));
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/85 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const active = nav.page === item.id;
          const Icon = item.icon;
          const isSend = item.id === "send";
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className="relative flex flex-col items-center justify-end gap-1 py-1.5"
            >
              {isSend ? (
                <>
                  <span className="absolute -top-9 left-1/2 flex h-15 w-15 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-accentInk shadow-[0_12px_30px_-4px_var(--c-accent)] ring-[5px] ring-bg transition-transform active:scale-95">
                    <Icon size={23} strokeWidth={2.2} />
                  </span>
                  <span className="mt-7 text-[10.5px] font-semibold text-ink">
                    {item.label}
                  </span>
                </>
              ) : (
                <>
                  <span
                    className={cx(
                      "flex h-8 items-center justify-center rounded-full transition-colors",
                      active ? "text-accent" : "text-ink3"
                    )}
                  >
                    <Icon size={21} strokeWidth={active ? 2.3 : 1.8} />
                  </span>
                  <span
                    className={cx(
                      "text-[10.5px] font-semibold transition-colors",
                      active ? "text-ink" : "text-ink3"
                    )}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="bn-dot"
                      className="absolute -top-1 h-1 w-1 rounded-full bg-accent"
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
