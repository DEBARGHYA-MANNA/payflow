import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav, MobileTopBar, Sidebar } from "./components/chrome";
import LockScreen from "./components/LockScreen";
import { InstallPrompt, OfflineBanner, UpdateBanner } from "./components/PwaBits";
import { Toasts } from "./components/ui";
import { AppProvider, useApp } from "./context/AppContext";
import Beneficiaries from "./pages/Beneficiaries";
import Cards from "./pages/Cards";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Profile from "./pages/Profile";
import SendMoney from "./pages/SendMoney";

const PAGES = {
  dashboard: Dashboard,
  send: SendMoney,
  beneficiaries: Beneficiaries,
  cards: Cards,
  history: History,
  profile: Profile,
};

function Shell() {
  const { nav, locked } = useApp();
  const Page = PAGES[nav.page] || Dashboard;

  return (
    <div className="grain relative min-h-screen bg-bg text-ink">
      {/* ambient themed glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-[0.07] blur-3xl transition-colors duration-700"
          style={{ background: "var(--c-accent)" }}
        />
        <div
          className="absolute -bottom-52 -left-40 h-[380px] w-[380px] rounded-full opacity-[0.05] blur-3xl transition-colors duration-700"
          style={{ background: "var(--c-accent)" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar />
          <main className="relative flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={nav.page}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <Page />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* footer (desktop) */}
          <footer className="hidden border-t border-line px-6 py-5 md:block">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs text-ink3">
              <p className="font-display font-semibold text-ink2">PayFlow</p>
              <p>
                A banking &amp; payments simulation. All data is fictional and stored
                locally in your browser.
              </p>
            </div>
          </footer>
        </div>
      </div>

      <BottomNav />
      <Toasts />
      <OfflineBanner />
      {!locked && <InstallPrompt />}
      {!locked && <UpdateBanner />}

      <AnimatePresence>{locked && <LockScreen />}</AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
