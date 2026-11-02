import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Landmark,
  Pencil,
  Search,
  Send,
  Star,
  Trash2,
  TriangleAlert,
  UserPlus,
  Users,
} from "lucide-react";
import BeneficiaryForm from "../components/BeneficiaryForm";
import {
  Avatar,
  Button,
  cx,
  EmptyState,
  IconButton,
  Modal,
} from "../components/ui";
import { useApp } from "../context/AppContext";
import { maskAccount, timeAgo } from "../lib/format";

export default function Beneficiaries() {
  const { nav, beneficiaries, deleteBeneficiary, toggleFavorite, go, toast } = useApp();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // open "add" straight from dashboard quick action
  useEffect(() => {
    if (nav.params?.add) setAddOpen(true);
  }, [nav.params]);

  const recent = useMemo(
    () =>
      [...beneficiaries]
        .filter((b) => b.lastUsed)
        .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
        .slice(0, 6),
    [beneficiaries]
  );

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? beneficiaries.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.bank.toLowerCase().includes(q) ||
            b.account.includes(q)
        )
      : beneficiaries;
    return [...filtered].sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [beneficiaries, search]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="label-micro">People &amp; businesses</p>
          <h1 className="mt-1.5 font-display text-[28px] font-semibold tracking-tight text-ink sm:text-4xl">
            Beneficiaries
          </h1>
          <p className="mt-1 text-sm text-ink2">
            {beneficiaries.length} saved recipient{beneficiaries.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="shrink-0">
          <UserPlus size={16} />
          <span className="hidden sm:inline">Add recipient</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* recently used rail */}
      {recent.length > 0 && (
        <div className="mb-6">
          <p className="label-micro mb-3">Recently used</p>
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {recent.map((b) => (
              <button
                key={b.id}
                onClick={() => go("send", { beneficiaryId: b.id })}
                className="group flex w-[84px] shrink-0 flex-col items-center gap-2"
              >
                <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.05]">
                  <Avatar name={b.name} size="lg" />
                </span>
                <span className="w-full truncate text-center text-xs font-medium text-ink2 group-hover:text-ink">
                  {b.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* search */}
      <div className="relative mb-4">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, bank or account"
          className="w-full rounded-lg border border-line bg-surface py-3.5 pl-11 pr-4 text-[15px] text-ink placeholder:text-ink3 transition-colors focus:border-accent focus:outline-none"
        />
      </div>

      {/* list */}
      <div className="card-surface overflow-hidden">
        {list.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "No matches found" : "No beneficiaries yet"}
            body={
              search
                ? "Try another name, or add them as a new recipient."
                : "Add someone to start sending them simulated money."
            }
            action={
              <Button variant="soft" onClick={() => setAddOpen(true)}>
                <UserPlus size={16} /> Add recipient
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {list.map((b, i) => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -60, transition: { duration: 0.22 } }}
                  transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-surface2/50 sm:px-5"
                >
                  <Avatar name={b.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[14.5px] font-semibold text-ink">{b.name}</p>
                      {b.favorite && (
                        <Star size={12} className="shrink-0 fill-warn text-warn" />
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink3">
                      <Landmark size={11} className="shrink-0" />
                      {b.bank} · {maskAccount(b.account)}
                      {b.lastUsed && (
                        <span className="hidden sm:inline">· paid {timeAgo(b.lastUsed)}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <IconButton
                      label={b.favorite ? "Unfavorite" : "Favorite"}
                      bare
                      size="sm"
                      onClick={() => {
                        toggleFavorite(b.id);
                        toast.info(b.favorite ? "Removed from favorites" : "Added to favorites", b.name);
                      }}
                    >
                      <Star
                        size={16}
                        className={b.favorite ? "fill-warn text-warn" : ""}
                      />
                    </IconButton>
                    <IconButton
                      label="Edit"
                      bare
                      size="sm"
                      onClick={() => setEditTarget(b)}
                    >
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton
                      label="Delete"
                      bare
                      danger
                      size="sm"
                      onClick={() => setDeleteTarget(b)}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                    <Button size="sm" className="ml-1" onClick={() => go("send", { beneficiaryId: b.id })}>
                      <Send size={13} /> Pay
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)}>
        <BeneficiaryForm
          onClose={() => setAddOpen(false)}
          onSaved={(saved) => toast.success("Recipient added", `${saved.name} · ${saved.bank}`)}
        />
      </Modal>

      {/* edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)}>
        {editTarget && (
          <BeneficiaryForm
            initial={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={(saved) => toast.success("Recipient updated", saved.name)}
          />
        )}
      </Modal>

      {/* delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bad/12 text-bad">
              <TriangleAlert size={20} />
            </div>
            <h3 className="font-display text-xl font-semibold text-ink">
              Remove {deleteTarget.name}?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink2">
              They'll be removed from your beneficiaries. Past payment history is
              kept. This is a simulation — nothing real happens.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="ghost" size="lg" onClick={() => setDeleteTarget(null)}>
                Keep
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={() => {
                  deleteBeneficiary(deleteTarget.id);
                  toast.success("Recipient removed", deleteTarget.name);
                  setDeleteTarget(null);
                }}
              >
                <Trash2 size={16} /> Remove
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
