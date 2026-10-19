// Order status rules, mirroring server/src/modules/order/order.service.js so the
// admin dashboard only offers transitions the backend accepts.
const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export const nextOrderStatuses = (status) => TRANSITIONS[status] ?? [];

// A paid order has to be refunded before it can be cancelled, which the backend
// rejects with "Paid orders require a refund before cancellation".
export const canCancelOrder = (order) =>
  ['pending', 'confirmed'].includes(order?.orderStatus) &&
  ['unpaid', 'failed'].includes(order?.paymentStatus);
