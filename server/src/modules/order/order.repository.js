import Order from "./order.model.js";

export const orderRepository = {
  create: (data) => Order.create(data),
  findById: (orderId) => Order.findById(orderId),
  findByIdempotencyKey: (userId, idempotencyKey) => Order.findOne({ userId, idempotencyKey }),
  findForUser: (orderId, userId) => Order.findOne({ _id: orderId, userId }),
  listForUser: (userId) => Order.find({ userId }).sort({ createdAt: -1 }).limit(100),
  listAll: () => Order.find().sort({ createdAt: -1 }).limit(100),
  changeStatus: (orderId, filter, update) =>
    Order.findOneAndUpdate(
      { _id: orderId, ...filter },
      { $set: update },
      { new: true, runValidators: true },
    ),
  delete: (orderId) => Order.findByIdAndDelete(orderId),
};
