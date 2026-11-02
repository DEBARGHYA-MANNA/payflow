export const fmt = (n, opts = {}) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    ...opts,
  }).format(n);

export const fmtAbs = (n, opts = {}) => fmt(Math.abs(n), opts);

/** Plain number in Indian grouping — used inside PDFs (jsPDF lacks ₹ glyph). */
export const fmtPlain = (n, opts = {}) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...opts,
  }).format(n);

export const fmtINR = (n) => "INR " + fmtPlain(n);

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });

export const fmtFullDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

export function dayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Today";
  if (same(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });
}

export function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(iso);
}

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

// deterministic gradient pairs for avatars
const PALETTES = [
  ["#7C6CFF", "#4ECDC4"],
  ["#FF8C5A", "#FF5C8A"],
  ["#4E9BFF", "#7CF2CB"],
  ["#FFB84C", "#FF7A45"],
  ["#B48CFF", "#6C8CFF"],
  ["#5AD8A6", "#2BB3A3"],
  ["#FF7AB8", "#B86CFF"],
  ["#6CD0FF", "#4E7BFF"],
];

export const avatarPalette = (seed = "") => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
};

export const maskAccount = (acc = "") => `•••• ${acc.slice(-4)}`;

export const maskCard = (num = "") =>
  num.replace(/\d(?=\d{4})/g, "•").replace(/(.{4})/g, "$1 ").trim();

export const groupDigits = (num = "") => num.replace(/(.{4})/g, "$1 ").trim();

export const genRef = () =>
  "PF-" + Math.random().toString(36).slice(2, 8).toUpperCase();

export const cx = (...args) => args.filter(Boolean).join(" ");
