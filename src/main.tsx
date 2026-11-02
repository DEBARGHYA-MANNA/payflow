import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initPwa } from "./lib/pwa";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register the service worker, install prompt and push handlers.
initPwa({
  onNavigate: (page: string) => {
    window.dispatchEvent(new CustomEvent("payflow:navigate", { detail: page }));
  },
});
