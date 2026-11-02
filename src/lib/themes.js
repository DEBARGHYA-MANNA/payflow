// Theme registry — JS mirror of the CSS variables in index.css.
// Used by charts (Recharts needs concrete colors) and the theme picker.

export const THEMES = [
  {
    id: "midnight",
    name: "Midnight",
    hint: "Neon lime on deep navy",
    swatch: "#C9F24F",
    bg: "#06080E",
    chart: {
      accent: "#C9F24F",
      good: "#46D997",
      grid: "rgba(255,255,255,0.06)",
      tick: "#677183",
      tooltipBg: "#141B29",
      tooltipLine: "rgba(255,255,255,0.10)",
    },
  },
  {
    id: "porcelain",
    name: "Porcelain",
    hint: "Royal blue on soft white",
    swatch: "#2B59FF",
    bg: "#F3F2EE",
    chart: {
      accent: "#2B59FF",
      good: "#0CA678",
      grid: "rgba(17,17,22,0.07)",
      tick: "#9B9EA8",
      tooltipBg: "#FFFFFF",
      tooltipLine: "rgba(17,17,22,0.10)",
    },
  },
  {
    id: "evergreen",
    name: "Evergreen",
    hint: "Mint glow in deep forest",
    swatch: "#62F2A6",
    bg: "#07110C",
    chart: {
      accent: "#62F2A6",
      good: "#62F2A6",
      grid: "rgba(235,255,244,0.07)",
      tick: "#67826F",
      tooltipBg: "#13251B",
      tooltipLine: "rgba(235,255,244,0.12)",
    },
  },
  {
    id: "ember",
    name: "Ember",
    hint: "Molten amber on charcoal",
    swatch: "#FF9A3D",
    bg: "#120A08",
    chart: {
      accent: "#FF9A3D",
      good: "#69DC9E",
      grid: "rgba(255,240,230,0.07)",
      tick: "#8F7461",
      tooltipBg: "#261811",
      tooltipLine: "rgba(255,240,230,0.12)",
    },
  },
  {
    id: "paper",
    name: "Paper",
    hint: "Terracotta on warm cream",
    swatch: "#E4572E",
    bg: "#F6F1E7",
    chart: {
      accent: "#E4572E",
      good: "#1E9E6A",
      grid: "rgba(52,38,24,0.08)",
      tick: "#A2917D",
      tooltipBg: "#FFFDF7",
      tooltipLine: "rgba(52,38,24,0.12)",
    },
  },
];

export const getTheme = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

export function applyTheme(id) {
  document.documentElement.setAttribute("data-theme", id);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", getTheme(id).bg);
  try {
    localStorage.setItem("payflow.theme", id);
  } catch (e) {}
}

export const hexA = (hex, alpha) => {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};
