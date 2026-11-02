import { useEffect, useState } from "react";

/**
 * True when the device plausibly has biometric hardware:
 * a coarse (touch) pointer and a real touch screen — i.e. phones & tablets.
 * Desktops with a mouse never qualify, so PayFlow hides Face/Fingerprint there.
 */
export function detectBiometricCapable() {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const touch = (navigator.maxTouchPoints || 0) > 0 || "ontouchstart" in window;
  const noHover = window.matchMedia?.("(hover: none)")?.matches ?? false;
  return touch && (coarse || noHover);
}

/** Reactive version — updates if the device switches input modes. */
export function useBiometricCapable() {
  const [capable, setCapable] = useState(detectBiometricCapable);

  useEffect(() => {
    const mqs = [
      window.matchMedia("(pointer: coarse)"),
      window.matchMedia("(hover: none)"),
    ];
    const onChange = () => setCapable(detectBiometricCapable());
    mqs.forEach((m) => m.addEventListener("change", onChange));
    return () => mqs.forEach((m) => m.removeEventListener("change", onChange));
  }, []);

  return capable;
}
