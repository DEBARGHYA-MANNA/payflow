import React, { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ReceiptText, Search, X } from "lucide-react";
import TransactionDrawer from "../components/TransactionDrawer";
import TxRow from "../components/TxRow";
import { Button, cx, EmptyState } from "../components/ui";
import { useApp } from "../context/AppContext";
import { dayLabel, fmt } from "../lib/format";
import { CATEGORIES } from "../data/mock";

const PAGE = 18;

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

export default function History() {
  const { transactions, hidden } = useApp();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [dir, setDir] = useState("all");
  const [shown, setShown] = useState(PAGE);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (category !== "all" && t.category !== category) return false;
      if (dir === "in" && t.amount <= 0) return false;
      if (dir === "out" && t.amount >= 0) return false;
      if (q) {
        const hay = `${t.name} ${t.category} ${t.method} ${t.reference} ${t.note || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, query, status, category, dir]);

  const totals = useMemo(() => {
    let inSum = 0,
      outSum = 0;
    filtered.forEach((t) => {
      if (t.status === "failed") return;
      if (t.amount > 0) inSum += t.amount;
      else outSum += Math.abs(t.amount);
    });
    return { inSum, outSum };
  }, [filtered]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.slice(0, shown).forEach((t) => {
      const label = dayLabel(t.date);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(t);
    });
    return [...map.entries()];
  }, [filtered, shown]);

  const hasFilters = query || status !== "all" || category !== "all" || dir !== "all";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
      <div className="mb-6">
        <p className="label-micro">Payment history</p>
        <h1 className="mt-1.5 font-display text-[28px] font-semibold tracking-tight text-ink sm:text-4xl">
          Activity
        </h1>
        <p className="mt-1 text-sm text-ink2">
          {filtered.length} payment{filtered.length === 1 ? "" : "s"}
          {hasFilters ? " match your filters" : " in total"}
        </p>
      </div>

      {/* search */}
      <div className="relative mb-3">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShown(PAGE);
          }}
          placeholder="Search by name, category, reference…"
          className="w-full rounded-lg border border-line bg-surface py-3.5 pl-11 pr-11 text-[15px] text-ink placeholder:text-ink3 transition-colors focus:border-accent focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink3 transition-colors hover:text-ink"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* filters */}
      <div className="no-scrollbar -mx-4 mb-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {STATUS_FILTERS.map((s) => (
          <FilterChip key={s.id} active={status === s.id} onClick={() => { setStatus(s.id); setShown(PAGE); }}>
            {s.label}
          </FilterChip>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        <FilterChip active={dir === "in"} onClick={() => setDir(dir === "in" ? "all" : "in")}>
          <ArrowDownLeft size={13} className="text-good" /> Money in
        </FilterChip>
        <FilterChip active={dir === "out"} onClick={() => setDir(dir === "out" ? "all" : "out")}>
          <ArrowUpRight size={13} /> Money out
        </FilterChip>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setShown(PAGE); }}
          className="h-9 shrink-0 appearance-none rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink2 transition-colors focus:border-accent focus:outline-none"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setQuery("");
              setStatus("all");
              setCategory("all");
              setDir("all");
              setShown(PAGE);
            }}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-accent transition-opacity hover:opacity-75"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* totals strip */}
      {filtered.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="card-surface flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-good/12 text-good">
              <ArrowDownLeft size={17} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink3">Money in</p>
              <p className="tabular font-display text-lg font-semibold text-ink">
                {hidden ? "••••" : fmt(totals.inSum, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="card-surface flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface2 text-ink2">
              <ArrowUpRight size={17} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink3">Money out</p>
              <p className="tabular font-display text-lg font-semibold text-ink">
                {hidden ? "••••" : fmt(totals.outSum, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* grouped list */}
      {groups.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={ReceiptText}
            title="Nothing here"
            body="No payments match the current filters. Try widening your search."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([label, txs]) => (
            <section key={label}>
              <p className="label-micro mb-2 px-1">{label}</p>
              <div className="card-surface divide-y divide-line overflow-hidden">
                {txs.map((t, i) => (
                  <TxRow key={t.id} t={t} index={i} onClick={() => setSelected(t)} />
                ))}
              </div>
            </section>
          ))}

          {shown < filtered.length && (
            <div className="pt-1 text-center">
              <Button variant="ghost" size="lg" onClick={() => setShown((s) => s + PAGE)}>
                Show more payments
              </Button>
            </div>
          )}
        </div>
      )}

      <TransactionDrawer tx={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition-all",
        active
          ? "border-ink bg-ink text-bg"
          : "border-line bg-surface text-ink2 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
