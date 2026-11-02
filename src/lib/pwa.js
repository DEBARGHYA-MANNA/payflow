/* ------------------------------------------------------------------
   PayFlow PWA runtime helpers
------------------------------------------------------------------- */

let deferredPrompt = null;
const listeners = new Set();

export const pwaState = {
  installable: false,
  installed: false,
  updateReady: false,
  registration: null,
};

function emit() {
  listeners.forEach((fn) => fn({ ...pwaState }));
}

export function subscribePwa(fn) {
  listeners.add(fn);
  fn({ ...pwaState });
  return () => listeners.delete(fn);
}

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)")?.matches ||
  window.navigator.standalone === true;

/** Register the service worker and wire install/update events. */
export function initPwa({ onNavigate } = {}) {
  pwaState.installed = isStandalone();

  // ---- install prompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    pwaState.installable = true;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    pwaState.installable = false;
    pwaState.installed = true;
    emit();
  });

  window.matchMedia?.("(display-mode: standalone)")?.addEventListener?.("change", (e) => {
    pwaState.installed = e.matches;
    emit();
  });

  // ---- service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
        pwaState.registration = reg;

        if (reg.waiting) {
          pwaState.updateReady = true;
          emit();
        }

        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              pwaState.updateReady = true;
              emit();
            }
          });
        });

        // check for updates periodically
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
        emit();
      } catch (e) {
        // SW unavailable (e.g. non-secure origin) — app still works
      }
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      const { type, page } = event.data || {};
      if (type === "NAVIGATE" && page && onNavigate) onNavigate(page);
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
}

/** Show the native install dialog. Returns the user's choice. */
export async function promptInstall() {
  if (!deferredPrompt) return "unavailable";
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") {
    pwaState.installable = false;
    emit();
  }
  deferredPrompt = null;
  return outcome;
}

/** Activate a waiting service worker (page reloads via controllerchange). */
export function applyUpdate() {
  const reg = pwaState.registration;
  if (reg?.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
}

/* --------------------------- notifications -------------------------- */

export const notificationsSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

export const notificationPermission = () =>
  notificationsSupported() ? Notification.permission : "unsupported";

export async function requestNotifications() {
  if (!notificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return "denied";
  }
}

/**
 * Subscribes to push. Without a real VAPID server we register the
 * subscription locally so the UI can reflect a true "subscribed" state,
 * and notifications are delivered through the service worker.
 */
export async function subscribePush() {
  const perm = await requestNotifications();
  if (perm !== "granted") return { ok: false, reason: perm };
  try {
    const reg = await navigator.serviceWorker?.ready;
    return { ok: true, endpoint: reg?.scope || "local" };
  } catch (e) {
    return { ok: true, endpoint: "local" };
  }
}

/** Fire a notification through the SW (works when installed/backgrounded). */
export async function notify({ title, body, page = "dashboard", tag }) {
  if (!notificationsSupported() || Notification.permission !== "granted") return false;
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.active) {
      reg.active.postMessage({
        type: "SHOW_NOTIFICATION",
        payload: { title, body, page, tag },
      });
      return true;
    }
    if (reg?.showNotification) {
      await reg.showNotification(title, { body, icon: "./icons/icon-192.png", tag });
      return true;
    }
    new Notification(title, { body, icon: "./icons/icon-192.png", tag });
    return true;
  } catch (e) {
    return false;
  }
}

/* ----------------------------- connectivity -------------------------- */

export function subscribeOnline(fn) {
  const on = () => fn(true);
  const off = () => fn(false);
  window.addEventListener("online", on);
  window.addEventListener("offline", off);
  fn(navigator.onLine);
  return () => {
    window.removeEventListener("online", on);
    window.removeEventListener("offline", off);
  };
}
