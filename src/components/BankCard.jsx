import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { OctagonX, Snowflake, Wifi } from "lucide-react";
import { useApp } from "../context/AppContext";
import { hexA } from "../lib/themes";
import { cx, groupDigits } from "../lib/format";

/**
 * PayFlow virtual card — pointer tilt, holographic sheen,
 * freeze / blocked / closed states. Debit uses the theme accent,
 * credit uses a fixed dark-metal finish.
 */
export default function BankCard({
  card,
  variant = "debit",
  compact = false,
  tilt = true,
  className = "",
}) {
  const { theme } = useApp();
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 180, damping: 22 });
  const sy = useSpring(my, { stiffness: 180, damping: 22 });
  const rotateY = useTransform(sx, [0, 1], [-9, 9]);
  const rotateX = useTransform(sy, [0, 1], [8, -8]);

  const onMove = (e) => {
    if (!tilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    mx.set(x);
    my.set(y);
    ref.current.style.setProperty("--mx", `${x * 100}%`);
    ref.current.style.setProperty("--my", `${y * 100}%`);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const isCredit = variant === "credit";
  const accent = theme.chart.accent;
  const secret = !card.showDetails;
  const digits = secret
    ? "•••• •••• •••• " + card.number.slice(-4)
    : groupDigits(card.number);

  const blocked = card.status === "blocked";
  const closed = card.status === "closed";
  const bg = isCredit
    ? "linear-gradient(130deg, #17181d 0%, #262a36 45%, #101116 100%)"
    : `linear-gradient(128deg, ${accent} 0%, ${hexA(accent, 0.85)} 38%, ${mixBlack(accent, 0.55)} 88%)`;
  const ink = isCredit ? "#F1EEEA" : "var(--c-accent-ink)";

  return (
    <div style={{ perspective: 1200 }} className={className}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cx(
          "pf-card relative aspect-[1.586] w-full select-none overflow-hidden rounded-[22px] p-5 sm:p-6",
          (card.frozen || blocked || closed) && "frozen"
        )}
      >
        <div className="absolute inset-0" style={{ background: bg }} />
        {isCredit && (
          <>
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white opacity-[0.05]" />
            <div
              className="absolute -bottom-28 -left-12 h-72 w-72 rounded-full opacity-[0.1]"
              style={{ background: accent }}
            />
          </>
        )}
        {!isCredit && (
          <>
            <div
              className="absolute -right-16 -top-24 h-64 w-64 rounded-full opacity-30"
              style={{ background: "var(--c-accent-ink)" }}
            />
            <div
              className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full opacity-15"
              style={{ background: "var(--c-accent-ink)" }}
            />
          </>
        )}
        <div className="pf-card-sheen" />

        <div
          className="relative flex h-full flex-col justify-between"
          style={{ color: ink, transform: "translateZ(30px)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-[15px] font-semibold tracking-tight opacity-90">
                {isCredit ? "PayFlow One" : "PayFlow"}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">
                {isCredit ? "Metal · Credit" : "Virtual Debit"}
              </p>
            </div>
            {/* status / network */}
            {closed ? (
              <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
                <OctagonX size={12} /> Closed
              </span>
            ) : blocked ? (
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-red-100 backdrop-blur-sm">
                <OctagonX size={12} /> Blocked
              </span>
            ) : card.frozen ? (
              <span className="flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
                <Snowflake size={12} /> Frozen
              </span>
            ) : (
              <p className="font-display text-base font-bold italic tracking-tight opacity-90">
                {card.network}
              </p>
            )}
          </div>

          <div className={cx(compact && "hidden sm:block")}>
            <div
              className="mb-3 h-9 w-12 rounded-md"
              style={{
                background: isCredit
                  ? "linear-gradient(135deg, #E8C56A, #B8923A)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.18))",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.22)",
              }}
            />
            <p
              className="font-mono text-[15px] font-medium tracking-[0.12em] sm:text-lg"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
            >
              {digits}
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-60">
                Card holder
              </p>
              <p className="truncate text-[13px] font-bold tracking-wide">{card.holder}</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-60">
                Expires
              </p>
              <p className="text-[13px] font-bold">{secret ? "••/••" : card.expiry}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-60">
                CVV
              </p>
              <p className="text-[13px] font-bold">{secret ? "•••" : card.cvv}</p>
            </div>
            {!card.frozen && !blocked && !closed && (
              <Wifi size={20} className="rotate-90 opacity-70" />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function mixBlack(hex, amt) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const f = (v) => Math.round(v * (1 - amt));
  return `rgb(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}
