import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  CarFront,
  CheckCircle2,
  Clapperboard,
  Coffee,
  HeartPulse,
  Home,
  IndianRupee,
  Info,
  Repeat,
  ShoppingBag,
  ShoppingBasket,
  TriangleAlert,
  UtensilsCrossed,
  X,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { avatarPalette, cx, initials } from "../lib/format";

export { cx };

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/* ------------------------------- Logo ------------------------------ */

export function Logo({ size = 34 }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 64 64" className="shrink-0">
        <rect width="64" height="64" rx="18" fill="var(--c-accent)" />
        <path
          d="M22 46V18h12.5c6 0 10.2 3.9 10.2 9.4 0 5.6-4.2 9.5-10.2 9.5h-6.2V46H22zm6.3-13.6h5.7c2.7 0 4.3-1.8 4.3-4.9 0-3-1.6-4.8-4.3-4.8h-5.7v9.7z"
          fill="var(--c-accent-ink)"
        />
      </svg>
      <span className="font-display text-[22px] font-semibold tracking-tight text-ink">
        PayFlow
      </span>
    </div>
  );
}

/* ------------------------------ Buttons ---------------------------- */

const btnBase =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 select-none disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const variants = {
    primary:
      "bg-accent text-accentInk shadow-[0_8px_24px_-6px_var(--c-accent)] hover:brightness-105 hover:-translate-y-px active:translate-y-0",
    ghost: "border border-line text-ink hover:bg-surface2",
    soft: "bg-surface2 text-ink hover:brightness-[1.04]",
    danger: "border border-bad/25 bg-bad/10 text-bad hover:bg-bad/15",
  };
  const sizes = {
    sm: "text-[13px] px-4 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-[15px] px-7 py-3.5",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cx(btnBase, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function IconButton({
  className = "",
  label,
  bare = false,
  danger = false,
  size = "md",
  children,
  ...props
}) {
  const sizes = { sm: "h-9 w-9", md: "h-10 w-10" };
  const skin = danger
    ? "text-ink2 hover:bg-bad/10 hover:text-bad"
    : bare
      ? "text-ink2 hover:bg-surface2 hover:text-ink"
      : "border border-line text-ink2 hover:bg-surface2 hover:text-ink";
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
        sizes[size],
        skin,
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/* ------------------------------ Avatar ----------------------------- */

const AV_SIZES = {
  sm: "h-9 w-9 text-[11px]",
  md: "h-11 w-11 text-[13px]",
  lg: "h-14 w-14 text-base",
  xl: "h-[72px] w-[72px] text-xl",
};

export function Avatar({ name, size = "md", className = "" }) {
  const [c1, c2] = avatarPalette(name);
  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white",
        AV_SIZES[size],
        className
      )}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      {initials(name)}
    </div>
  );
}

/* ------------------------------ Switch ----------------------------- */

export function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cx(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
        disabled && "cursor-not-allowed opacity-45",
        checked ? "bg-accent" : "bg-surface2 border border-line"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cx(
          "absolute top-[3px] h-[22px] w-[22px] rounded-full shadow",
          checked ? "right-[3px] bg-accentInk" : "left-[3px] bg-ink3"
        )}
      />
    </button>
  );
}

/* --------------------------- Status pill --------------------------- */

export function StatusPill({ status, className = "" }) {
  const map = {
    completed: ["bg-good/12 text-good", "bg-good", "Completed"],
    pending: ["bg-warn/12 text-warn", "bg-warn", "Pending"],
    failed: ["bg-bad/12 text-bad", "bg-bad", "Failed"],
  };
  const [pill, dot, text] = map[status] || map.completed;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        pill,
        className
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", dot)} />
      {text}
    </span>
  );
}

/* --------------------------- Category icon ------------------------- */

const CATEGORY_MAP = {
  Groceries: [ShoppingBasket, "#46D997"],
  Dining: [UtensilsCrossed, "#FF9A5C"],
  Coffee: [Coffee, "#C98F5E"],
  Transport: [CarFront, "#5CA8FF"],
  Shopping: [ShoppingBag, "#B48CFF"],
  Bills: [IndianRupee, "#8CE0C8"],
  Subscriptions: [Repeat, "#FF7AB8"],
  Housing: [Home, "#FFC14E"],
  Utilities: [Zap, "#FFE066"],
  Health: [HeartPulse, "#6CD0FF"],
  Entertainment: [Clapperboard, "#FF8C8C"],
  Transfer: [ArrowLeftRight, "#8CE0C8"],
  Income: [ArrowDownLeft, "#46D997"],
};

export function CategoryIcon({ category, size = "md", className = "" }) {
  const [Icon, color] = CATEGORY_MAP[category] || [ArrowLeftRight, "#8CE0C8"];
  const sizes = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-12 w-12" };
  const iconSizes = { sm: 15, md: 18, lg: 20 };
  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center rounded-full",
        sizes[size],
        className
      )}
      style={{ background: color + "1F", color }}
    >
      <Icon size={iconSizes[size]} strokeWidth={2} />
    </div>
  );
}

/* ------------------------------- Field ----------------------------- */

export function Field({ label, error, hint, children }) {
  return (
    <div>
      {label && (
        <label className="label-micro mb-2 block">{label}</label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-[13px] font-medium text-bad">
          <TriangleAlert size={13} /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-ink3">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputCls =
  "w-full rounded-lg border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink3 transition-colors focus:border-accent focus:outline-none";

/* --------------------------- Modal / Sheet -------------------------- */

function Backdrop({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-black/55 backdrop-blur-[6px]"
    />
  );
}

export function Modal({ open, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
          <Backdrop onClose={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 56, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className={cx(
              "relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-line bg-surface p-6 shadow-pop sm:rounded-[28px]",
              wide ? "sm:max-w-2xl" : "sm:max-w-md"
            )}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface2 text-ink2 transition-colors hover:text-ink"
            >
              <X size={16} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Sheet({ open, onClose, children, title }) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <Backdrop onClose={onClose} />
          <motion.div
            initial={isMobile ? { y: "100%" } : { x: "110%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "110%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className={cx(
              "absolute z-10 flex flex-col border-line bg-surface shadow-pop",
              isMobile
                ? "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[28px] border-t"
                : "right-0 top-0 h-full w-full max-w-[440px] border-l"
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface2 text-ink2 transition-colors hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ Toasts ----------------------------- */

const TOAST_ICON = {
  success: [CheckCircle2, "text-good"],
  error: [TriangleAlert, "text-bad"],
  info: [Info, "text-accent"],
};

export function Toasts() {
  const { toasts, dismiss } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[92px] z-[95] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px]">
      <AnimatePresence>
        {toasts.map((t) => {
          const [Icon, color] = TOAST_ICON[t.type] || TOAST_ICON.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-pop"
            >
              <Icon size={19} className={cx("mt-px shrink-0", color)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-[13px] leading-snug text-ink2">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-ink3 transition-colors hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------- Empty state --------------------------- */

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface2 text-ink3">
        {Icon && <Icon size={22} />}
      </div>
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-[280px] text-sm text-ink2">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
