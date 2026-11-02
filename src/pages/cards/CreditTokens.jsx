import React, { useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, ShieldCheck, Trash2 } from "lucide-react";
import { Button, cx, Modal } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { timeAgo } from "../../lib/format";
import { Note, SectionCard } from "./shared";

export default function CreditTokens() {
  const { cards, revokeToken, toast } = useApp();
  const card = cards.credit;
  const [confirm, setConfirm] = useState(null);

  const active = card.tokens.filter((t) => t.status === "active");

  return (
    <SectionCard
      title="Card tokens"
      desc="RBI tokenisation (CoF) — merchants store tokens, never your real card number."
      right={
        <span className="rounded-full bg-good/10 px-3 py-1.5 text-xs font-semibold text-good">
          {active.length} active
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {card.tokens.map((t, i) => {
          const revoked = t.status === "revoked";
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cx(
                "flex items-center gap-3 rounded-lg border border-line p-4",
                revoked && "opacity-50"
              )}
            >
              <span
                className={cx(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  revoked ? "bg-surface2 text-ink3" : "bg-accent/10 text-accent"
                )}
              >
                <Fingerprint size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{t.merchant}</p>
                <p className="truncate text-[11.5px] text-ink3">
                  {t.device} · used {timeAgo(t.lastUsed)}
                </p>
              </div>
              {revoked ? (
                <span className="rounded-full bg-surface2 px-2.5 py-1 text-[10.5px] font-semibold text-ink3">
                  Revoked
                </span>
              ) : (
                <button
                  onClick={() => setConfirm(t)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink3 transition-colors hover:bg-bad/10 hover:text-bad"
                  aria-label={`Revoke ${t.merchant} token`}
                  title="Revoke token"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4">
        <Note icon={ShieldCheck}>
          Since October 2022, Indian merchants can't store real card numbers. Each token
          here is bound to one merchant + device pair — deleting it forces a fresh setup
          on that app.
        </Note>
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)}>
        {confirm && (
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bad/12 text-bad">
              <Fingerprint size={20} />
            </div>
            <h3 className="font-display text-xl font-semibold text-ink">
              Revoke {confirm.merchant} token?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink2">
              Saved payments and subscriptions on {confirm.merchant} via card
              •• {card.number.slice(-4)} will stop until you re-save the card there.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="ghost" size="lg" onClick={() => setConfirm(null)}>
                Keep
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={() => {
                  revokeToken(confirm.id);
                  toast.success("Token revoked", confirm.merchant + " no longer has your card.");
                  setConfirm(null);
                }}
              >
                Revoke token
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </SectionCard>
  );
}
