import { z } from "zod";

export const beneficiarySchema = z.object({
  name: z.string().trim().min(2, "Enter a full name").max(40, "Name is too long"),
  bank: z.string().trim().min(2, "Enter a bank name").max(40, "Bank name is too long"),
  account: z
    .string()
    .trim()
    .regex(/^\d{8,17}$/, "Account number must be 8–17 digits"),
});

export const NOTE_MAX = 80;

export function buildTransferSchema(getBalance) {
  return z
    .object({
      beneficiaryId: z.string().min(1, "Choose someone to pay"),
      amount: z.coerce
        .number({ invalid_type_error: "Enter an amount" })
        .positive("Enter an amount greater than ₹0")
        .max(5_000_000, "Amount is too large"),
      note: z
        .string()
        .trim()
        .max(NOTE_MAX, `Keep the note under ${NOTE_MAX} characters`)
        .optional()
        .or(z.literal("")),
    })
    .superRefine((values, ctx) => {
      if (values.amount > getBalance()) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "This exceeds your available balance",
        });
      }
    });
}
