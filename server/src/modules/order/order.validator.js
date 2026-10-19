import { z } from "zod";
import { idParams, objectIdSchema } from "../../validators/common.validator.js";

export const createOrderSchema = z
  .object({
    shippingAddressId: objectIdSchema,
    billingAddressId: objectIdSchema.optional(),
    couponCode: z.string().trim().min(1).max(40).optional(),
    idempotencyKey: z.string().trim().min(8).max(200).optional(),
  })
  .strict();

export const orderStatusSchema = z
  .object({
    orderStatus: z.enum([
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ]),
  })
  .strict();
export const orderIdParams = idParams("orderId");
