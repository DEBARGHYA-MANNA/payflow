// ------------------------------------------------------------------
//  PayFlow One — Indian credit card presets, tiers and fee schedule.
//  All demo data.
// ------------------------------------------------------------------

function ago(days, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const DEFAULT_TOKENS = [
  { id: "tok-amazon", merchant: "Amazon Pay", network: "RuPay", device: "Chrome · MacBook Air", createdAt: ago(180), lastUsed: ago(2), status: "active" },
  { id: "tok-swiggy", merchant: "Swiggy", network: "RuPay", device: "PayFlow App · Android", createdAt: ago(150), lastUsed: ago(1), status: "active" },
  { id: "tok-zomato", merchant: "Zomato", network: "RuPay", device: "PayFlow App · Android", createdAt: ago(140), lastUsed: ago(6), status: "active" },
  { id: "tok-netflix", merchant: "Netflix India", network: "RuPay", device: "netflix.com", createdAt: ago(220), lastUsed: ago(12), status: "active" },
  { id: "tok-uber", merchant: "Uber India", network: "RuPay", device: "Uber App · Android", createdAt: ago(96), lastUsed: ago(9), status: "active" },
  { id: "tok-flipkart", merchant: "Flipkart", network: "RuPay", device: "Chrome · MacBook Air", createdAt: ago(64), lastUsed: ago(20), status: "active" },
];

export const DEFAULT_DEBIT = {
  id: "debit",
  label: "PayFlow Debit",
  sub: "Virtual debit · Savings a/c",
  network: "VISA",
  holder: "DEBARGHYA MANNA",
  number: "4242985610374413",
  expiry: "09/29",
  cvv: "214",
  issuedAt: ago(1200),
  frozen: false,
  showDetails: false,
  status: "active", // active | blocked
  limits: { daily: 50000, monthly: 250000, atm: 25000 },
  channels: { online: true, pos: true, atm: true, nfc: true, nfcLimit: 5000, intl: false, intlLimit: 100000 },
  reissue: null,
  pinChangedAt: null,
};

export const DEFAULT_CREDIT = {
  id: "credit",
  label: "PayFlow One Metal",
  sub: "Signature credit · RuPay",
  network: "RuPay",
  holder: "DEBARGHYA MANNA",
  number: "6522384199047310",
  expiry: "03/30",
  cvv: "568",
  issuedAt: ago(420),
  frozen: false,
  showDetails: false,
  status: "active", // active | blocked | closed
  limit: 250000,
  perTxnLimit: 100000,
  outstanding: 38420,
  minDue: 1921,
  billingDay: 2,
  autopay: { enabled: true, mode: "total", fixed: 25000 },
  rewards: 12480,
  channels: {
    pos: true,
    online: true,
    atm: false,
    intlPos: false,
    intlOnline: false,
    intlAtm: false,
    nfc: true,
    nfcLimit: 5000,
    intlLimit: 50000,
  },
  tokens: DEFAULT_TOKENS,
  requestedLimit: null,
  reissue: null,
  closedAt: null,
  pinChangedAt: null,
};

/* -------------------- Card registry (link-by-mobile demo) -------------------- */

/** Pools of fictional cards "registered" with banks for the linking demo. */
export const CARD_REGISTRY = [
  { label: "HDFC Regalia Gold", bank: "HDFC Bank", network: "VISA", type: "credit", last4: "7731" },
  { label: "SBI SimplySAVE", bank: "State Bank of India", network: "RuPay", type: "credit", last4: "2092" },
  { label: "ICICI Platinum", bank: "ICICI Bank", network: "Mastercard", type: "debit", last4: "8845" },
  { label: "Kotak 811 Debit", bank: "Kotak Mahindra Bank", network: "VISA", type: "debit", last4: "5507" },
  { label: "Axis Flipkart Credit", bank: "Axis Bank", network: "VISA", type: "credit", last4: "3360" },
  { label: "PNB Global Debit", bank: "Punjab National Bank", network: "RuPay", type: "debit", last4: "9148" },
];

/* --------------------------- Utilization tiers --------------------------- */

export const TIERS = [
  {
    id: "platinum",
    maxBelow: 10,
    name: "Platinum",
    multiplier: "5x",
    lounges: 8,
    perks: ["5x reward points on all spends", "8 airport lounge visits / year", "0% fuel surcharge", "Free card replacement, priority support"],
    color: "#B48CFF",
  },
  {
    id: "gold",
    maxBelow: 30,
    name: "Gold",
    multiplier: "3x",
    lounges: 4,
    perks: ["3x reward points on all spends", "4 airport lounge visits / year", "1% fuel surcharge waived"],
    color: "#FFB84C",
  },
  {
    id: "silver",
    maxBelow: 60,
    name: "Silver",
    multiplier: "2x",
    lounges: 2,
    perks: ["2x reward points on dining & travel", "2 airport lounge visits / year"],
    color: "#9BA7B4",
  },
  {
    id: "basic",
    maxBelow: 85,
    name: "Basic",
    multiplier: "1x",
    lounges: 0,
    perks: ["1x reward points", "Utilisation is getting high — it can pinch your CIBIL score"],
    color: "#8FA3F0",
  },
  {
    id: "watch",
    maxBelow: 200,
    name: "Watch",
    multiplier: "0x",
    lounges: 0,
    perks: ["Perks paused above 85% utilisation", "Pay down the balance to restore benefits"],
    color: "#FF6B6B",
  },
];

export function getTier(util) {
  return TIERS.find((t) => util < t.maxBelow) || TIERS[TIERS.length - 1];
}

export function nextTierHint(util) {
  const tiers = [...TIERS].reverse();
  const current = getTier(util);
  const better = TIERS[TIERS.indexOf(current) - 1];
  if (!better) return null;
  return better;
}

/* ------------------------------ Fee schedule ---------------------------- */

export const CHARGES = [
  ["Annual fee", "₹2,999 + GST · waived on ₹3,00,000+ annual spends"],
  ["Finance charges", "3.49% per month (41.88% APR) on revolving balances"],
  ["Late payment fee", "Up to ₹1,200 depending on outstanding amount"],
  ["Cash advance at ATMs", "2.5% of amount (min ₹500) + interest from day one"],
  ["Foreign currency markup", "3.5% on international transactions"],
  ["Card replacement (lost / damaged)", "₹250 · first reissue free"],
  ["Exceeded-limit fee", "₹500, only if over-limit is opted in"],
  ["Reward redemption fee", "Nil"],
  ["Statement duplicate (physical)", "₹100 per copy"],
];

/* ------------------------------ EMI offers ------------------------------ */

export const EMI_OFFERS = [
  { merchant: "Amazon.in", note: "Convert purchases above ₹5,000", rate: "13.9% p.a.", tenures: [3, 6, 9, 12] },
  { merchant: "Flipkart", note: "No-cost EMI on electronics", rate: "0% (no-cost)", tenures: [3, 6] },
  { merchant: "BookMyShow", note: "Travel bookings above ₹10,000", rate: "14.5% p.a.", tenures: [3, 6, 9] },
];

/* ------------------------------- CIBIL ---------------------------------- */

export const CIBIL_SCORE = 742;

export function cibilHistory() {
  const base = [704, 712, 721, 726, 733, 742];
  const now = new Date();
  return base.map((score, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleDateString("en-IN", { month: "short" }), score };
  });
}

export const CIBIL_TIPS = [
  "Keep credit utilisation under 30% to protect your score",
  "Always pay the total due — not just the minimum",
  "Avoid multiple card applications in a short window",
  "Autopay keeps missed payments off your report",
];

export function cibilBand(score) {
  if (score >= 750) return { label: "Excellent", color: "#46D997" };
  if (score >= 700) return { label: "Good", color: "#C9F24F" };
  if (score >= 650) return { label: "Fair", color: "#FFB84C" };
  return { label: "Needs work", color: "#FF6B6B" };
}

/* ---------------------------- Billing cycle ----------------------------- */

export function cycleInfo(billingDay) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = Math.min(28, Math.max(1, billingDay));

  const stmtFor = (y, m) => new Date(y, m, day);
  let lastStmt = stmtFor(today.getFullYear(), today.getMonth());
  if (lastStmt > today) lastStmt = stmtFor(today.getFullYear(), today.getMonth() - 1);

  const nextStmt = stmtFor(lastStmt.getFullYear(), lastStmt.getMonth() + 1);
  const cycleStart = new Date(lastStmt);
  cycleStart.setDate(cycleStart.getDate() + 0);
  const cycleEnd = new Date(nextStmt);
  cycleEnd.setDate(cycleEnd.getDate() - 1);

  const dueDate = new Date(lastStmt);
  dueDate.setDate(dueDate.getDate() + 18);

  const daysToNext = Math.max(0, Math.ceil((nextStmt - today) / 86400000));
  const daysToDue = Math.ceil((dueDate - today) / 86400000);

  return { lastStmt, nextStmt, cycleStart, cycleEnd, dueDate, daysToNext, daysToDue };
}
