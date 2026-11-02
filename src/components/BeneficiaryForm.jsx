import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Landmark, User, Hash } from "lucide-react";
import { useApp } from "../context/AppContext";
import { beneficiarySchema } from "../lib/schemas";
import { Button, Field, inputCls } from "./ui";

export default function BeneficiaryForm({ initial, onClose, onSaved }) {
  const { saveBeneficiary } = useApp();
  const editing = !!initial;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: initial?.name || "",
      bank: initial?.bank || "",
      account: initial?.account || "",
    },
    mode: "onTouched",
  });

  const onSubmit = (values) => {
    const saved = saveBeneficiary(editing ? { ...initial, ...values } : values);
    onSaved?.(saved);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="label-micro">{editing ? "Edit recipient" : "New recipient"}</p>
      <h3 className="mt-1 mb-5 font-display text-xl font-semibold text-ink">
        {editing ? `Update ${initial.name}` : "Add a beneficiary"}
      </h3>

      <div className="space-y-4">
        <Field label="Full name" error={errors.name?.message}>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" />
            <input
              {...register("name")}
              placeholder="e.g. Sarah Chen"
              autoFocus
              className={inputCls + " pl-11"}
            />
          </div>
        </Field>

        <Field label="Bank name" error={errors.bank?.message}>
          <div className="relative">
            <Landmark size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" />
            <input
              {...register("bank")}
              placeholder="e.g. HDFC Bank"
              className={inputCls + " pl-11"}
            />
          </div>
        </Field>

        <Field
          label="Account number"
          error={errors.account?.message}
          hint="Demo only — any 8–17 digits work."
        >
          <div className="relative">
            <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" />
            <input
              {...register("account")}
              placeholder="0123456789"
              inputMode="numeric"
              className={inputCls + " pl-11 tabular"}
            />
          </div>
        </Field>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <Button type="button" variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {editing ? "Save changes" : "Add recipient"}
        </Button>
      </div>
    </form>
  );
}
