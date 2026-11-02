import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildMockTransactions,
  CURRENT_USER,
  SEED_BENEFICIARIES,
  START_BALANCE,
} from "../data/mock";
import { DEFAULT_CREDIT, DEFAULT_DEBIT } from "../data/credit";
import { applyTheme, getTheme } from "../lib/themes";
import { genRef } from "../lib/format";
import {
  notificationPermission,
  notify,
  subscribeOnline,
  subscribePush,
  subscribePwa,
} from "../lib/pwa";

const AppCtx = createContext(null);

// One-time storage migration: clear USD-era demo data when the India build lands.
try {
  if (typeof localStorage !== "undefined" && localStorage.getItem("payflow.v") !== "2") {
    [
      "payflow.balance",
      "payflow.userTx",
      "payflow.beneficiaries",
      "payflow.cards",
      "payflow.card",
      "payflow.hidden",
    ].forEach((k) => localStorage.removeItem(k));
    localStorage.setItem("payflow.v", "2");
  }
} catch (e) {}

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

let toastSeq = 0;

export const DEFAULT_PIN = "1234";

export function AppProvider({ children }) {
  /* ------------------------------ theme ------------------------------ */
  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem("payflow.theme") || "midnight";
    } catch (e) {
      return "midnight";
    }
  });

  const setTheme = useCallback((id) => {
    setThemeId(id);
    applyTheme(id);
  }, []);

  /* ---------------------------- navigation --------------------------- */
  const [nav, setNav] = useState({ page: "dashboard", params: {} });
  const go = useCallback((page, params = {}) => {
    setNav({ page, params });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  /* ------------------------------ PWA -------------------------------- */
  const [pwa, setPwa] = useState({
    installable: false,
    installed: false,
    updateReady: false,
  });
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [notifPerm, setNotifPerm] = useState(() => notificationPermission());

  useEffect(() => subscribePwa((s) => setPwa(s)), []);
  useEffect(() => subscribeOnline((v) => setOnline(v)), []);

  // deep links from notification clicks / app shortcuts
  useEffect(() => {
    const handler = (e) => {
      const page = e.detail;
      if (page) setNav({ page, params: {} });
    };
    window.addEventListener("payflow:navigate", handler);
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action && ["send", "cards", "history", "beneficiaries", "profile"].includes(action)) {
      setNav({ page: action, params: {} });
    }
    return () => window.removeEventListener("payflow:navigate", handler);
  }, []);

  const enableNotifications = useCallback(async () => {
    const res = await subscribePush();
    setNotifPerm(notificationPermission());
    return res;
  }, []);

  /* ------------------------- app lock / security --------------------- */
  // The PIN persists across sessions (demo default 1234 until changed),
  // but the app ALWAYS boots locked — like a real banking app.
  const [security, setSecurity] = useState(() => {
    const saved = read("payflow.security", null);
    return {
      pin: saved?.pin || DEFAULT_PIN,
      pinIsDefault: saved?.pin ? saved.pin === DEFAULT_PIN : true,
      biometric: saved?.biometric ?? true,
      autoLockMins: saved?.autoLockMins ?? 5,
    };
  });

  const saveSecurity = useCallback((patch) => {
    setSecurity((prev) => {
      const next = { ...prev, ...patch };
      if (patch.pin) next.pinIsDefault = patch.pin === DEFAULT_PIN;
      write("payflow.security", {
        pin: next.pin,
        biometric: next.biometric,
        autoLockMins: next.autoLockMins,
      });
      return next;
    });
  }, []);

  // always start locked on a fresh load
  const [locked, setLocked] = useState(true);

  const unlock = useCallback(() => setLocked(false), []);
  const lockNow = useCallback(() => {
    setLocked(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // auto-lock after inactivity
  const lastActive = useRef(Date.now());
  useEffect(() => {
    if (locked) return;
    const bump = () => (lastActive.current = Date.now());
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const timer = setInterval(() => {
      const mins = security.autoLockMins;
      if (!mins) return;
      if (Date.now() - lastActive.current > mins * 60000) setLocked(true);
    }, 5000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      clearInterval(timer);
    };
  }, [locked, security.autoLockMins]);

  /* ----------------------------- balance ----------------------------- */
  const [balance, setBalance] = useState(() => read("payflow.balance", START_BALANCE));
  const [hidden, setHidden] = useState(() => read("payflow.hidden", false));

  const toggleHidden = useCallback(() => {
    setHidden((h) => {
      write("payflow.hidden", !h);
      return !h;
    });
  }, []);

  /* --------------------------- transactions -------------------------- */
  const mockTx = useMemo(() => buildMockTransactions(), []);
  const [userTx, setUserTx] = useState(() => read("payflow.userTx", []));

  const transactions = useMemo(() => {
    return [...userTx, ...mockTx].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [userTx, mockTx]);

  const pushTx = useCallback(
    (t) => {
      setUserTx((prev) => {
        const next = [t, ...prev];
        write("payflow.userTx", next);
        return next;
      });
    },
    []
  );

  /* --------------------------- beneficiaries ------------------------- */
  const [beneficiaries, setBeneficiaries] = useState(() =>
    read("payflow.beneficiaries", SEED_BENEFICIARIES)
  );

  const persistBen = useCallback((next) => {
    setBeneficiaries(next);
    write("payflow.beneficiaries", next);
  }, []);

  const saveBeneficiary = useCallback(
    (data) => {
      let saved;
      if (data.id) {
        persistBen(beneficiaries.map((b) => (b.id === data.id ? { ...b, ...data } : b)));
        saved = data;
      } else {
        saved = {
          ...data,
          id: "ben-" + Math.random().toString(36).slice(2, 9),
          favorite: false,
          lastUsed: null,
          addedAt: new Date().toISOString(),
        };
        persistBen([saved, ...beneficiaries]);
      }
      return saved;
    },
    [beneficiaries, persistBen]
  );

  const deleteBeneficiary = useCallback(
    (id) => persistBen(beneficiaries.filter((b) => b.id !== id)),
    [beneficiaries, persistBen]
  );

  const toggleFavorite = useCallback(
    (id) =>
      persistBen(
        beneficiaries.map((b) => (b.id === id ? { ...b, favorite: !b.favorite } : b))
      ),
    [beneficiaries, persistBen]
  );

  /* ------------------------------ cards ------------------------------ */
  const [cards, setCards] = useState(() => {
    const saved = read("payflow.cards", null);
    if (saved && saved.debit && saved.credit) {
      return {
        debit: { ...DEFAULT_DEBIT, ...saved.debit },
        credit: { ...DEFAULT_CREDIT, ...saved.credit },
      };
    }
    return { debit: DEFAULT_DEBIT, credit: DEFAULT_CREDIT };
  });

  const setCardsPersist = useCallback((updater) => {
    setCards((prev) => {
      const next = updater(prev);
      write("payflow.cards", next);
      return next;
    });
  }, []);

  const updateCard = useCallback(
    (which, patch) => {
      setCardsPersist((prev) => ({ ...prev, [which]: { ...prev[which], ...patch } }));
    },
    [setCardsPersist]
  );

  /* ------------------- linked cards (link-by-mobile) ------------------ */
  const [linkedCards, setLinkedCards] = useState(() => read("payflow.linked", []));

  const persistLinked = useCallback((next) => {
    setLinkedCards(next);
    write("payflow.linked", next);
  }, []);

  const linkCard = useCallback(
    (card) => {
      const exists = linkedCards.some((c) => c.last4 === card.last4 && c.label === card.label);
      if (exists) return null;
      const linked = {
        ...card,
        id: "lnk-" + Math.random().toString(36).slice(2, 9),
        number: "000000000000" + card.last4,
        expiry: "12/29",
        cvv: "•••",
        holder: "DEBARGHYA MANNA",
        frozen: false,
        showDetails: false,
        status: "active",
        linkedAt: new Date().toISOString(),
      };
      persistLinked([linked, ...linkedCards]);
      return linked;
    },
    [linkedCards, persistLinked]
  );

  const unlinkCard = useCallback(
    (id) => persistLinked(linkedCards.filter((c) => c.id !== id)),
    [linkedCards, persistLinked]
  );

  const updateLinked = useCallback(
    (id, patch) =>
      persistLinked(linkedCards.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    [linkedCards, persistLinked]
  );

  /* ------------------------------ toasts ----------------------------- */
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (type, title, description) => {
      const id = ++toastSeq;
      setToasts((t) => [...t.slice(-3), { id, type, title, description }]);
      setTimeout(() => dismiss(id), 4600);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (t, d) => push("success", t, d),
      error: (t, d) => push("error", t, d),
      info: (t, d) => push("info", t, d),
    }),
    [push]
  );

  /* ------------------------- simulated transfer ---------------------- */
  const processingRef = useRef(false);

  const sendTransfer = useCallback(
    ({ beneficiary, amount, note }) => {
      if (processingRef.current) return null;
      processingRef.current = true;

      const tx = {
        id: "tx-user-" + genRef(),
        name: beneficiary.name,
        category: "Transfer",
        amount: -Math.abs(amount),
        date: new Date().toISOString(),
        status: "completed",
        method: "UPI transfer",
        note: note || "",
        reference: genRef(),
        beneficiaryId: beneficiary.id,
      };

      const nextBalance = Math.round(balance - Math.abs(amount));
      setBalance(nextBalance);
      write("payflow.balance", nextBalance);
      pushTx(tx);
      persistBen(
        beneficiaries.map((b) =>
          b.id === beneficiary.id ? { ...b, lastUsed: tx.date } : b
        )
      );
      // real system notification (when permission granted)
      notify({
        title: "Money sent",
        body: `₹${Math.abs(amount).toLocaleString("en-IN")} sent to ${beneficiary.name}. Ref ${tx.reference}.`,
        page: "history",
        tag: "payflow-transfer",
      });

      setTimeout(() => {
        processingRef.current = false;
      }, 300);
      return tx;
    },
    [balance, beneficiaries, persistBen, pushTx]
  );

  /* --------------------------- card actions -------------------------- */

  const freezeCard = useCallback(
    (which, v) => updateCard(which, { frozen: v }),
    [updateCard]
  );

  const resetPin = useCallback(
    (which) => {
      updateCard(which, { pinChangedAt: new Date().toISOString() });
    },
    [updateCard]
  );

  const revokeToken = useCallback(
    (tokenId) => {
      setCardsPersist((prev) => ({
        ...prev,
        credit: {
          ...prev.credit,
          tokens: prev.credit.tokens.map((t) =>
            t.id === tokenId ? { ...t, status: "revoked" } : t
          ),
        },
      }));
    },
    [setCardsPersist]
  );

  const blockAndReissue = useCallback(
    (which, reason) => {
      setCardsPersist((prev) => ({
        ...prev,
        [which]: {
          ...prev[which],
          status: "blocked",
          frozen: false,
          showDetails: false,
          reissue: {
            reason,
            orderedAt: new Date().toISOString(),
            eta: (() => {
              const d = new Date();
              d.setDate(d.getDate() + 4);
              return d.toISOString();
            })(),
            tracking: "PFC" + Math.floor(100000 + Math.random() * 900000),
          },
        },
      }));
      toast.info("Card blocked & replacement ordered", "Your old card no longer works. The new one reaches Kolkata in ~4 days (simulated).");
    },
    [setCardsPersist, toast]
  );

  const activateReplacement = useCallback(
    (which) => {
      setCardsPersist((prev) => {
        const c = prev[which];
        const prefix = c.number.slice(0, 12);
        const suffix = String(Math.floor(1000 + Math.random() * 9000));
        return {
          ...prev,
          [which]: {
            ...c,
            number: prefix + suffix,
            status: "active",
            reissue: null,
            frozen: false,
            showDetails: false,
          },
        };
      });
      toast.success("Replacement card activated", "Note the new last four digits on your card.");
    },
    [setCardsPersist, toast]
  );

  const closeCard = useCallback(
    (which) => {
      setCardsPersist((prev) => ({
        ...prev,
        [which]: {
          ...prev[which],
          status: "closed",
          closedAt: new Date().toISOString(),
          frozen: false,
          showDetails: false,
          autopay: prev[which].autopay
            ? { ...prev[which].autopay, enabled: false }
            : undefined,
        },
      }));
      toast.info("Card closed", "Closure is permanent in the real world — here you can reapply anytime.");
    },
    [setCardsPersist, toast]
  );

  const reopenCard = useCallback(
    (which) => {
      updateCard(which, { status: "active", closedAt: undefined });
      toast.success("Card reinstated", "Demo mode — your card is active again.");
    },
    [updateCard, toast]
  );

  const requestLimitIncrease = useCallback(
    (amount) => {
      updateCard("credit", {
        requestedLimit: { amount, ref: genRef(), at: new Date().toISOString(), status: "Under review" },
      });
      toast.success("Limit increase requested", "Our simulation team will review this in 2 working days.");
    },
    [updateCard, toast]
  );

  const cancelLimitRequest = useCallback(() => {
    updateCard("credit", { requestedLimit: null });
    toast.info("Request withdrawn", "Your credit limit stays unchanged.");
  }, [updateCard, toast]);

  const changeBillingDay = useCallback(
    (day) => {
      updateCard("credit", { billingDay: day });
      toast.success("Billing date updated", `Statements will now generate on the ${day}${ordinal(day)} of each month (next cycle).`);
    },
    [updateCard, toast]
  );

  const setAutopay = useCallback(
    (patch) => {
      setCardsPersist((prev) => ({
        ...prev,
        credit: { ...prev.credit, autopay: { ...prev.credit.autopay, ...patch } },
      }));
    },
    [setCardsPersist]
  );

  const payBill = useCallback(
    (amount) => {
      const amt = Math.round(amount);
      if (amt <= 0) return;
      setCardsPersist((prev) => {
        const out = Math.max(0, prev.credit.outstanding - amt);
        return {
          ...prev,
          credit: { ...prev.credit, outstanding: out, minDue: minDueOf(out) },
        };
      });
      setBalance((b) => {
        const next = Math.round(b - amt);
        write("payflow.balance", next);
        return next;
      });
      pushTx({
        id: "tx-user-" + genRef(),
        name: "PayFlow One credit card bill",
        category: "Bills",
        amount: -amt,
        date: new Date().toISOString(),
        status: "completed",
        method: `Savings •• ${CURRENT_USER.account.slice(-4)}`,
        note: "Credit card payment",
        reference: genRef(),
      });
    },
    [pushTx, setCardsPersist]
  );

  const redeemPoints = useCallback(
    (points) => {
      const credit = Math.round(points * 0.25);
      setCardsPersist((prev) => {
        const out = Math.max(0, prev.credit.outstanding - credit);
        return {
          ...prev,
          credit: {
            ...prev.credit,
            rewards: Math.max(0, prev.credit.rewards - points),
            outstanding: out,
            minDue: minDueOf(out),
          },
        };
      });
      pushTx({
        id: "tx-user-" + genRef(),
        name: "Reward points redemption",
        category: "Bills",
        amount: credit,
        date: new Date().toISOString(),
        status: "completed",
        method: "Statement credit · PayFlow One",
        note: `${points.toLocaleString("en-IN")} points redeemed`,
        reference: genRef(),
      });
    },
    [pushTx, setCardsPersist]
  );

  /* ----------------------------- reset ------------------------------- */
  const resetDemo = useCallback(() => {
    [
      "payflow.balance",
      "payflow.userTx",
      "payflow.beneficiaries",
      "payflow.cards",
      "payflow.card",
      "payflow.linked",
      "payflow.security",
      "payflow.hidden",
    ].forEach((k) => localStorage.removeItem(k));
    setSecurity({ pin: DEFAULT_PIN, pinIsDefault: true, biometric: true, autoLockMins: 5 });
    setBalance(START_BALANCE);
    setUserTx([]);
    setBeneficiaries(SEED_BENEFICIARIES);
    setLinkedCards([]);
    setCards({ debit: DEFAULT_DEBIT, credit: DEFAULT_CREDIT });
    write("payflow.cards", { debit: DEFAULT_DEBIT, credit: DEFAULT_CREDIT });
    setHidden(false);
    toast.info("Demo data reset", "Balance, cards and history restored to defaults.");
  }, [toast]);

  /* ------------------------------------------------------------------ */

  const value = {
    theme: getTheme(themeId),
    themeId,
    setTheme,
    nav,
    go,
    pwa,
    online,
    notifPerm,
    enableNotifications,
    notify,
    security,
    saveSecurity,
    locked,
    unlock,
    lockNow,
    balance,
    hidden,
    toggleHidden,
    transactions,
    beneficiaries,
    saveBeneficiary,
    deleteBeneficiary,
    toggleFavorite,
    cards,
    updateCard,
    linkedCards,
    linkCard,
    unlinkCard,
    updateLinked,
    freezeCard,
    resetPin,
    revokeToken,
    blockAndReissue,
    activateReplacement,
    closeCard,
    reopenCard,
    requestLimitIncrease,
    cancelLimitRequest,
    changeBillingDay,
    setAutopay,
    payBill,
    redeemPoints,
    toasts,
    dismiss,
    toast,
    sendTransfer,
    resetDemo,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

function minDueOf(outstanding) {
  return outstanding <= 0 ? 0 : Math.max(300, Math.round(outstanding * 0.05));
}

function ordinal(n) {
  if (n === 1 || n === 21) return "st";
  if (n === 2 || n === 22) return "nd";
  if (n === 3 || n === 23) return "rd";
  return "th";
}

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
