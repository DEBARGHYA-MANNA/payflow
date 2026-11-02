import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Gift, OctagonX, Recycle, Sparkles, Timer } from "lucide-react";
import { Button, cx } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { CHARGES, EMI_OFFERS } from "../../data/credit";
import { downloadCharges } from "../../lib/statement";
import { fmt } from "../../lib/format";
import { BlockReissueModal, CloseCardModal } from "./modals";
import { Note, SectionCard } from "./shared";

export default function CreditExtras() {
  const { cards, redeemPoints, toast, reopenCard } = useApp();
  const card = cards.credit;
  const [blockOpen, setBlockOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const ptsValue = card.rewards * 0.25;
  const denominations = [2000, 5000];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* rewards */}
      <SectionCard className="lg:col-span-6" title="Rewards & EMI" desc="1 point = ₹0.25 statement credit.">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/12 text-accent">
            <Sparkles size={22} />
          </span>
          <div>
            <p className="tabular font-display text-[30px] font-semibold leading-none text-ink">
              {card.rewards.toLocaleString("en-IN")} <span className="text-base text-ink3">pts</span>
            </p>
            <p className="mt-1 text-[13px] text-ink2">
              worth {fmt(ptsValue, { maximumFractionDigits: 0 })} as statement credit
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {denominations.map((p) => (
            <Button
              key={p}
              variant="soft"
              disabled={card.rewards < p || card.outstanding === 0}
              onClick={() => {
                redeemPoints(p);
                toast.success("Points redeemed", `${fmt(p * 0.25, { maximumFractionDigits: 0 })} credited to your statement.`);
              }}
            >
              <Gift size={14} /> Redeem {p.toLocaleString("en-IN")}
            </Button>
          ))}
          <Button
            disabled={card.rewards === 0 || card.outstanding === 0}
            onClick={() => {
              const p = card.rewards;
              redeemPoints(p);
              toast.success("All points redeemed", `${fmt(p * 0.25, { maximumFractionDigits: 0 })} credited.`);
            }}
          >
            <Recycle size={14} /> Redeem all
          </Button>
        </div>
        {card.outstanding === 0 && (
          <p className="mt-3 text-xs text-ink3">No outstanding bill — points will apply to your next statement.</p>
        )}

        <div className="mt-6 border-t border-line pt-5">
          <p className="label-micro mb-3">EMI conversion offers</p>
          <div className="space-y-2">
            {EMI_OFFERS.map((e) => (
              <div
                key={e.merchant}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface2/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{e.merchant}</p>
                  <p className="text-xs text-ink3">
                    {e.note} · {e.rate} · {e.tenures.join("/")}m
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast.info("EMI conversion requested", "Pick an eligible transaction in your statement (simulated).")}
                >
                  <Timer size={13} /> Convert
                </Button>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* charges */}
      <SectionCard
        className="lg:col-span-6"
        title="Charges & terms"
        desc="Schedule effective Jan 2026 · Illustrative."
        right={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              downloadCharges();
              toast.success("Schedule of charges downloaded");
            }}
          >
            <Download size={14} /> PDF
          </Button>
        }
      >
        <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
          {CHARGES.slice(0, 7).map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 px-4 py-3">
              <span className="text-[13px] text-ink3">{k}</span>
              <span className="max-w-[58%] text-right text-[13px] font-medium leading-snug text-ink">{v}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-snug text-ink3">
          GST at 18% applies on all fees and charges. Interest is computed on average daily
          balance.
        </p>
      </SectionCard>

      {/* danger zone */}
      <SectionCard
        className="lg:col-span-12"
        title="Card safety"
        desc="Block a lost card or close the account permanently."
        danger
      >
        {card.status === "closed" ? (
          <div className="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface2/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink">This card is closed</p>
              <p className="mt-0.5 text-[13px] text-ink2">
                In a real closure you'd reapply for a fresh product. Demo mode lets you
                reinstate this one.
              </p>
            </div>
            <Button variant="soft" onClick={() => reopenCard("credit")}>
              Reinstate card (demo)
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Note icon={OctagonX} tone="bad">
              Blocked cards report to no one; closures report to CIBIL and lower your total
              available credit — which can raise utilisation.
            </Note>
            <div className="flex shrink-0 gap-3">
              <Button
                variant="ghost"
                onClick={() => setBlockOpen(true)}
                disabled={card.status === "blocked"}
              >
                <OctagonX size={15} /> Block &amp; reissue
              </Button>
              <Button variant="danger" onClick={() => setCloseOpen(true)}>
                Close permanently
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      <BlockReissueModal open={blockOpen} onClose={() => setBlockOpen(false)} card={card} which="credit" />
      <CloseCardModal open={closeOpen} onClose={() => setCloseOpen(false)} />
    </div>
  );
}
