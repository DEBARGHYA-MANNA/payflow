import { jsPDF } from "jspdf";
import { fmtINR, fmtDateTime } from "./format";
import { CHARGES, cycleInfo } from "../data/credit";
import { CURRENT_USER } from "../data/mock";

const INK = [14, 17, 23];
const MUTED = [110, 118, 132];
const LINE = [226, 229, 235];
const ACCENT = [201, 242, 79];
const BAND = [10, 14, 20];

function head(doc, subtitle) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BAND);
  doc.rect(0, 0, W, 100, "F");
  doc.setFillColor(...ACCENT);
  doc.rect(0, 100, W, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("PayFlow", 56, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(160, 168, 180);
  doc.text("PAYFLOW ONE · RUPAY CREDIT · SIMULATION", 56, 62);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ACCENT);
  doc.text(subtitle, W - 56, 44, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(160, 168, 180);
  doc.text(`A/c ${maskTail(CURRENT_USER.account)} · IFSC ${CURRENT_USER.ifsc}`, W - 56, 62, {
    align: "right",
  });
}

const maskTail = (s) => "XXXX" + s.slice(-4);

function foot(doc, y) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFontSize(8);
  doc.setTextColor(170, 176, 186);
  doc.text(
    `Simulated document · payflow.in · Generated ${fmtDateTime(new Date().toISOString())}`,
    W / 2,
    y,
    { align: "center" }
  );
}

/** Monthly e-statement PDF for the credit card. */
export function downloadStatement(card, txns) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 56;
  const cy = cycleInfo(card.billingDay);
  head(doc, "E-STATEMENT");

  let y = 160;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text(CURRENT_USER.name, M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Kolkata, West Bengal · ${card.label} •• ${card.number.slice(-4)}`, M, y + 16);

  y += 46;
  const stats = [
    ["Credit limit", fmtINR(card.limit)],
    ["Total due", fmtINR(card.outstanding)],
    ["Minimum due", fmtINR(card.minDue)],
    ["Due date", dateOnly(cy.dueDate)],
    ["Statement period", `${dateOnly(cy.lastStmt)} – ${dateOnly(cy.nextStmt)}`],
    ["Reward points", card.rewards.toLocaleString("en-IN")],
  ];
  const colW = (W - M * 2) / 3;
  stats.forEach(([k, v], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + col * colW;
    const yy = y + row * 52;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(k.toUpperCase(), x, yy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(String(v), x, yy + 16);
  });

  y += 120;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Transactions on this card", M, y);
  y += 8;
  txns.slice(0, 14).forEach((t) => {
    y += 26;
    doc.setDrawColor(...LINE);
    doc.line(M, y - 12, W - M, y - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(dateOnly(new Date(t.date)), M, y);
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(t.name, 240), M + 78, y);
    doc.setFont("helvetica", "bold");
    doc.text((t.amount < 0 ? "" : "+") + fmtINR(Math.abs(t.amount)), W - M, y, {
      align: "right",
    });
  });

  foot(doc, 800);
  doc.save(`PayFlow-One-statement-${dateSlug(cy.nextStmt)}.pdf`);
}

/** Schedule of charges PDF. */
export function downloadCharges() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const M = 56;
  head(doc, "SCHEDULE OF CHARGES");

  let y = 150;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text("PayFlow One Metal — Fees & Charges", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("Effective 01 January 2026 · All values are illustrative", M, y + 16);

  y += 44;
  CHARGES.forEach(([k, v]) => {
    doc.setDrawColor(...LINE);
    doc.line(M, y - 14, doc.internal.pageSize.getWidth() - M, y - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(k, M, y);
    doc.setTextColor(...INK);
    const wrapped = doc.splitTextToSize(v, 300);
    doc.text(wrapped, doc.internal.pageSize.getWidth() - M, y, { align: "right" });
    y += wrapped.length > 1 ? 38 : 32;
  });

  foot(doc, 800);
  doc.save("PayFlow-One-charges.pdf");
}

const dateOnly = (d) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const dateSlug = (d) => d.toISOString().slice(0, 10);
