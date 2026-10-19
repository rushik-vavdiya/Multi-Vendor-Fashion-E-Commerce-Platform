import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    sku: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
    variantName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

const orderAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    addressLine1: { type: String, required: true, trim: true, maxlength: 200 },
    addressLine2: { type: String, trim: true, maxlength: 200, default: null },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    postalCode: { type: String, required: true, trim: true, maxlength: 20 },
    country: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: () => randomUUID(),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "An order must contain at least one item",
      },
    },
    shippingAddress: {
      type: orderAddressSchema,
      required: true,
    },
    billingAddress: {
      type: orderAddressSchema,
      default: null,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
      match: /^[A-Z]{3}$/,
      default: "INR",
    },
    subtotalAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, trim: true, uppercase: true, default: null },
    taxAmount: { type: Number, default: 0, min: 0 },
    shippingAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "partially_refunded", "refunded"],
      default: "unpaid",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    placedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    cancelledAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    strict: "throw",
  },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } },
);

const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

orderSchema.pre("validate", function () {
  for (const [index, item] of this.items.entries()) {
    if (roundMoney(item.unitPrice * item.quantity) !== roundMoney(item.lineTotal)) {
      this.invalidate(
        `items.${index}.lineTotal`,
        "Line total must equal unit price multiplied by quantity",
      );
    }
  }

  if (this.discountAmount > this.subtotalAmount) {
    this.invalidate("discountAmount", "Discount cannot be greater than the subtotal");
  }

  const calculatedSubtotal = roundMoney(
    this.items.reduce((total, item) => total + item.lineTotal, 0),
  );
  if (calculatedSubtotal !== roundMoney(this.subtotalAmount)) {
    this.invalidate("subtotalAmount", "Subtotal must equal the sum of item line totals");
  }

  const calculatedTotal = roundMoney(
    this.subtotalAmount - this.discountAmount + this.taxAmount + this.shippingAmount,
  );
  if (calculatedTotal !== roundMoney(this.totalAmount)) {
    this.invalidate("totalAmount", "Total must match subtotal, discount, tax, and shipping");
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
