// ------------------------------------------------------------------
//  PayFlow demo dataset — India edition. All entries are fictional
//  simulations. No real funds, credentials or card data.
// ------------------------------------------------------------------

import { genRef } from "../lib/format";

export const CURRENT_USER = {
  name: "Debarghya Manna",
  email: "debarghya.manna@payflow.in",
  city: "Kolkata, West Bengal",
  account: "50100472183654",
  ifsc: "PYFL0090102",
  currency: "INR",
};

export const START_BALANCE = 284350;

export const SEED_BENEFICIARIES = [
  {
    id: "ben-priya",
    name: "Priya Sharma",
    bank: "HDFC Bank",
    account: "50100445511220",
    ifsc: "HDFC0001207",
    favorite: true,
    lastUsed: daysAgoISO(1),
    addedAt: daysAgoISO(210),
  },
  {
    id: "ben-arjun",
    name: "Arjun Mehta",
    bank: "State Bank of India",
    account: "30887445210",
    ifsc: "SBIN0004556",
    favorite: true,
    lastUsed: daysAgoISO(0),
    addedAt: daysAgoISO(160),
  },
  {
    id: "ben-rohan",
    name: "Rohan Das",
    bank: "ICICI Bank",
    account: "244501883902",
    ifsc: "ICIC0000441",
    favorite: false,
    lastUsed: daysAgoISO(9),
    addedAt: daysAgoISO(140),
  },
  {
    id: "ben-sneha",
    name: "Sneha Banerjee",
    bank: "Axis Bank",
    account: "912010045733821",
    ifsc: "UTIB0000123",
    favorite: false,
    lastUsed: daysAgoISO(24),
    addedAt: daysAgoISO(120),
  },
  {
    id: "ben-vikram",
    name: "Vikram Reddy",
    bank: "Kotak Mahindra Bank",
    account: "6642295401",
    ifsc: "KKBK0000688",
    favorite: true,
    lastUsed: daysAgoISO(31),
    addedAt: daysAgoISO(96),
  },
  {
    id: "ben-rima",
    name: "Rima Dutta (Landlord)",
    bank: "Punjab National Bank",
    account: "402100110005438",
    ifsc: "PUNB0402100",
    favorite: false,
    lastUsed: daysAgoISO(13),
    addedAt: daysAgoISO(88),
  },
];

function daysAgoISO(days, hour = 12, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const DEBIT_LAST4 = "4413";
export const CREDIT_LAST4 = "7310";

// deterministic pseudo-random for a stable dataset between reloads
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MERCHANTS = [
  { name: "BigBasket", category: "Groceries", min: 500, max: 2400, card: "credit" },
  { name: "Blinkit", category: "Groceries", min: 180, max: 950, card: "debit" },
  { name: "DMart Ready", category: "Groceries", min: 450, max: 1800, card: "debit" },
  { name: "Blue Tokai Coffee", category: "Coffee", min: 190, max: 520, card: "debit" },
  { name: "Third Wave Coffee", category: "Coffee", min: 240, max: 580, card: "credit" },
  { name: "6 Ballygunge Place", category: "Dining", min: 900, max: 2600, card: "credit" },
  { name: "Peter Cat, Kolkata", category: "Dining", min: 600, max: 1900, card: "credit" },
  { name: "Arsalan Biryani", category: "Dining", min: 350, max: 900, card: "debit" },
  { name: "Swiggy", category: "Dining", min: 260, max: 850, card: "debit" },
  { name: "Zomato", category: "Dining", min: 300, max: 990, card: "credit" },
  { name: "Ola Cabs", category: "Transport", min: 120, max: 480, card: "debit" },
  { name: "Uber India", category: "Transport", min: 150, max: 520, card: "debit" },
  { name: "Indian Oil Petrol Pump", category: "Transport", min: 800, max: 2600, card: "debit" },
  { name: "Metro Railway Kolkata", category: "Transport", min: 20, max: 90, card: "debit" },
  { name: "Flipkart", category: "Shopping", min: 700, max: 4500, card: "credit" },
  { name: "Amazon.in", category: "Shopping", min: 900, max: 6000, card: "credit" },
  { name: "Myntra", category: "Shopping", min: 800, max: 3800, card: "credit" },
  { name: "Decathlon Kolkata", category: "Shopping", min: 1200, max: 5000, card: "debit" },
  { name: "PharmEasy", category: "Health", min: 260, max: 1250, card: "debit" },
  { name: "Apollo Pharmacy", category: "Health", min: 300, max: 1500, card: "debit" },
  { name: "BookMyShow", category: "Entertainment", min: 300, max: 950, card: "credit" },
  { name: "PVR INOX South City", category: "Entertainment", min: 450, max: 1300, card: "credit" },
];

const SUBSCRIPTIONS = [
  { name: "Netflix India", category: "Subscriptions", amount: 649 },
  { name: "Spotify Premium", category: "Subscriptions", amount: 119 },
  { name: "iCloud+", category: "Subscriptions", amount: 219 },
  { name: "cult.fit South City", category: "Health", amount: 1470 },
  { name: "Tata Play DTH", category: "Subscriptions", amount: 359 },
];

const SENDS = [
  { name: "Priya Sharma", category: "Transfer", min: 500, max: 5000 },
  { name: "Arjun Mehta", category: "Transfer", min: 800, max: 4000 },
  { name: "Rohan Das", category: "Transfer", min: 1500, max: 8000 },
  { name: "Sneha Banerjee", category: "Transfer", min: 500, max: 3000 },
];

const cardMethod = (which) =>
  which === "credit" ? `Credit card •• ${CREDIT_LAST4}` : `Debit card •• ${DEBIT_LAST4}`;

let seq = 0;
function tx(daysAgo, hour, name, category, amount, extra = {}) {
  seq += 1;
  return {
    id: `tx-${String(seq).padStart(4, "0")}`,
    name,
    category,
    amount: Math.round(amount),
    date: daysAgoISO(daysAgo, hour, 10 + (seq * 7) % 49),
    status: "completed",
    method: amount > 0 ? "Bank transfer" : cardMethod("debit"),
    note: "",
    reference: genRef(),
    ...extra,
  };
}

export function buildMockTransactions() {
  const rnd = mulberry32(20250614);
  seq = 0;
  const list = [];

  // 13 weeks of card purchases
  for (let w = 0; w < 13; w++) {
    const count = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < count; i++) {
      const m = MERCHANTS[Math.floor(rnd() * MERCHANTS.length)];
      const day = w * 7 + Math.floor(rnd() * 6.9);
      const amount = -(m.min + rnd() * (m.max - m.min));
      list.push(tx(day, 8 + Math.floor(rnd() * 12), m.name, m.category, amount, {
        method: cardMethod(m.card),
      }));
    }
    // a peer UPI transfer every other week
    if (w % 2 === 1) {
      const s = SENDS[Math.floor(rnd() * SENDS.length)];
      list.push(
        tx(w * 7 + 2, 18, s.name, s.category, -(s.min + rnd() * (s.max - s.min)), {
          method: "UPI transfer",
        })
      );
    }
  }

  // subscriptions + rent + utilities every 30 days
  for (let m = 0; m < 3; m++) {
    SUBSCRIPTIONS.forEach((s) => {
      if (m * 30 < 95)
        list.push(
          tx(m * 30 + Math.floor(rnd() * 3), 6, s.name, s.category, -s.amount, {
            method: cardMethod("credit"),
          })
        );
    });
    list.push(
      tx(m * 30 + 1, 9, "Rima Dutta (Landlord)", "Housing", -18500, {
        method: "NEFT transfer",
        note: "Monthly rent — Kestopur flat",
      })
    );
    list.push(
      tx(m * 30 + 6, 7, "CESC Limited", "Utilities", -(950 + rnd() * 850), {
        method: "Direct debit",
      })
    );
    list.push(
      tx(m * 30 + 4, 7, "JioFiber Broadband", "Utilities", -999, {
        method: cardMethod("debit"),
      })
    );
    // monthly salary
    list.push(
      tx(m * 30 + 1, 5, "TechNova Digital Pvt Ltd — Salary", "Income", 162000, {
        method: "Bank transfer",
        note: "Salary credit",
      })
    );
  }

  // refund + side income
  list.push(tx(20, 14, "Flipkart Refund", "Shopping", 1050, { method: cardMethod("credit"), note: "Order #OD4821 return" }));
  list.push(tx(44, 16, "Priya Sharma", "Transfer", 1800, { method: "UPI transfer", note: "Dinner split" }));
  list.push(tx(58, 11, "FD Interest Payout", "Income", 3240, { method: "Bank transfer" }));

  // recent pending + failed items
  list.push(
    tx(0, 9, "Arjun Mehta", "Transfer", -2500, {
      status: "pending",
      method: "UPI transfer",
      note: "Weekend trip split",
    })
  );
  list.push(
    tx(0, 8, "Blue Tokai Coffee", "Coffee", -380, {
      status: "pending",
      method: cardMethod("debit"),
    })
  );
  list.push(
    tx(1, 19, "Sneha Banerjee", "Transfer", -6400, {
      status: "failed",
      method: "UPI transfer",
      note: "Reimbursement",
      failureReason: "Recipient bank server busy (UPI switch timeout)",
    })
  );
  list.push(
    tx(26, 21, "Myntra", "Shopping", -3249, {
      status: "failed",
      method: cardMethod("credit"),
      failureReason: "3-D Secure verification timed out",
    })
  );

  return list.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export const CATEGORIES = [
  "Groceries",
  "Dining",
  "Coffee",
  "Transport",
  "Shopping",
  "Bills",
  "Subscriptions",
  "Housing",
  "Utilities",
  "Health",
  "Entertainment",
  "Transfer",
  "Income",
];
