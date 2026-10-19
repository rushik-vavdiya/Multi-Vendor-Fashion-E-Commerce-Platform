import api from './api';

export const getOrders = async () => (await api.get('/orders')).data;
export const getOrder = async (orderId) => (await api.get(`/orders/${orderId}`)).data;
export const createOrder = async (order) => (await api.post('/orders', order)).data;
export const cancelOrder = async (orderId) => (await api.post(`/orders/${orderId}/cancel`)).data;
export const updateOrderStatus = async ({ orderId, orderStatus }) =>
  (await api.patch(`/orders/${orderId}/status`, { orderStatus })).data;
