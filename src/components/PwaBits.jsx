import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, RefreshCw, WifiOff, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { applyUpdate, promptInstall } from "../lib/pwa";
import { Button, cx } from "./ui";

/* --------------------------- offline banner -------------------------- */

export function OfflineBanner() {
  const { online } = useApp();
  const [wasOffline, setWasOffline] = useState(false);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (!online) {
      setWasOffline(true);
      setShowBack(false);
    } else if (wasOffline) {
      setShowBack(true);
      const t = setTimeout(() => setShowBack(false), 2600);
      return () => clearTimeout(t);
    }
  }, [online, wasOffline]);

  return (
    <AnimatePresence>
      {(!online || showBack) && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className={cx(
            "fixed inset-x-0 top-0 z-[110] flex items-center justify-center gap-2 px-4 py-2 text-[12.5px] font-semibold",
            online ? "bg-good text-white" : "bg-bad text-white"
          )}
          style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
        >
          {online ? (
            <>
              <RefreshCw size={13} /> Back online — everything's in sync
            </>
          ) : (
            <>
              <WifiOff size={13} /> You're offline · PayFlow is running from cache
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* --------------------------- install prompt -------------------------- */

export function InstallPrompt() {
  const { pwa, toast } = useApp();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("payflow.installDismissed") === "1";
    } catch (e) {
      return false;
    }
  });

  const hide = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("payflow.installDismissed", "1");
    } catch (e) {}
  };

  const show = pwa.installable && !pwa.installed && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-3 bottom-[96px] z-[90] mx-auto max-w-md rounded-2xl border border-line bg-surface p-4 shadow-pop md:bottom-6 md:left-auto md:right-6 md:mx-0"
        >
          <div className="flex items-center gap-3.5">
            <img
              src="./icons/icon-192.png"
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-semibold text-ink">Install PayFlow</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-ink2">
                Add it to your home screen for offline access and a full-screen app feel.
              </p>
            </div>
            <button
              onClick={hide}
              aria-label="Dismiss"
              className="shrink-0 self-start text-ink3 transition-colors hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            <Button variant="ghost" size="sm" onClick={hide}>
              Not now
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                const outcome = await promptInstall();
                if (outcome === "accepted") {
                  toast.success("Installing PayFlow", "Look for the icon on your home screen.");
                } else if (outcome === "dismissed") {
                  hide();
                }
              }}
            >
              <Download size={14} /> Install
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* --------------------------- update available ------------------------ */

export function UpdateBanner() {
  const { pwa } = useApp();
  const [hidden, setHidden] = useState(false);
  const show = pwa.updateReady && !hidden;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          className="fixed inset-x-3 bottom-[96px] z-[92] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-accent/30 bg-surface p-3.5 shadow-pop md:bottom-6 md:left-auto md:right-6 md:mx-0"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
            <RefreshCw size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-ink">Update available</p>
            <p className="text-[12.5px] text-ink2">A newer version of PayFlow is ready.</p>
          </div>
          <Button size="sm" onClick={applyUpdate}>
            Reload
          </Button>
          <button
            onClick={() => setHidden(true)}
            aria-label="Dismiss"
            className="shrink-0 text-ink3 hover:text-ink"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
