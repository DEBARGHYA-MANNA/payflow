import React from "react";
import { ArrowDownLeft, ArrowUpRight, Download, Flag, ShieldAlert } from "lucide-react";
import { useApp } from "../context/AppContext";
import { fmt, fmtDateTime } from "../lib/format";
import { downloadReceipt } from "../lib/receipt";
import { Button, CategoryIcon, cx, Sheet, StatusPill } from "./ui";

export default function TransactionDrawer({ tx, onClose }) {
  const { toast, beneficiaries } = useApp();
  const open = !!tx;
  if (tx === undefined) return null;

  const t = tx || {};
  const incoming = t.amount > 0;
  const ben = t.beneficiaryId
    ? beneficiaries.find((b) => b.id === t.beneficiaryId)
    : null;

  const rows = [
    ["Date", t.date ? fmtDateTime(t.date) : "—"],
    ["Method", t.method || "—"],
    ["Category", t.category || "—"],
    ["Reference", t.reference || "—"],
  ];
  if (ben) rows.splice(1, 0, ["Account", `${ben.bank} •••• ${ben.account.slice(-4)}`]);
  if (t.note) rows.push(["Note", t.note]);

  return (
    <Sheet open={open} onClose={onClose} title="Transaction">
      {open && (
        <div className="px-6 py-6">
          {/* hero */}
          <div className="flex flex-col items-center pb-6 pt-2 text-center">
            <CategoryIcon category={t.category} size="lg" />
            <p className="mt-3 text-[15px] font-medium text-ink2">{t.name}</p>
            <p
              className={cx(
                "tabular mt-1 font-display text-[40px] font-semibold tracking-tight",
                incoming ? "text-good" : "text-ink"
              )}
            >
              {incoming ? "+" : "−"}
              {fmt(Math.abs(t.amount || 0)).replace("$", "$")}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <StatusPill status={t.status} />
              <span
                className={cx(
                  "inline-flex items-center gap-1 rounded-full bg-surface2 px-2.5 py-1 text-[11px] font-semibold text-ink2"
                )}
              >
                {incoming ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                {incoming ? "Incoming" : "Outgoing"}
              </span>
            </div>
          </div>

          {/* failure reason */}
          {t.status === "failed" && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-bad/25 bg-bad/8 px-4 py-3">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-bad" />
              <p className="text-[13px] leading-snug text-ink2">
                {t.failureReason || "The payment could not be completed."} No funds
                were moved.
              </p>
            </div>
          )}

          {/* meta rows */}
          <div className="overflow-hidden rounded-lg border border-line">
            {rows.map(([k, v], i) => (
              <div
                key={k}
                className={cx(
                  "flex items-center justify-between gap-4 px-4 py-3.5",
                  i > 0 && "border-t border-line"
                )}
              >
                <span className="text-[13px] text-ink3">{k}</span>
                <span className="text-right text-[13px] font-medium text-ink">{v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3.5">
              <span className="text-[13px] text-ink3">Fee</span>
              <span className="text-[13px] font-medium text-good">$0.00</span>
            </div>
          </div>

          {/* actions */}
          <div className="mt-6 space-y-2.5">
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                downloadReceipt(t);
                toast.success("Receipt downloaded", `${t.reference}.pdf saved.`);
              }}
            >
              <Download size={17} /> Download receipt (PDF)
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() =>
                toast.info("Dispute opened", "Our simulation team will pretend to investigate.")
              }
            >
              <Flag size={16} /> Report an issue
            </Button>
          </div>

          <p className="mt-5 text-center text-[11px] leading-snug text-ink3">
            Simulated transaction. No real funds were moved.
          </p>
        </div>
      )}
    </Sheet>
  );
}
