import { z } from "zod";

export const addressSchema = z
  .object({
    addressLine1: z.string().trim().min(3).max(200),
    addressLine2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(3).max(20),
    country: z.string().trim().min(2).max(100),
    default: z.boolean().optional(),
    type: z.enum(["home", "work", "other"]).optional(),
  })
  .strict();

export const addressUpdateSchema = addressSchema
  .partial()
  .refine((address) => Object.keys(address).length > 0, "At least one address field is required");
