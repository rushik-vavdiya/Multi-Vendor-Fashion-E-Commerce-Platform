import api from './api';

export const createPayment = async (payment) => (await api.post('/payments', payment)).data;
export const verifyPayment = async (payment) => (await api.post('/payments/verify', payment)).data;
export const refundPayment = async ({ paymentId, amount }) =>
  (await api.post(`/payments/${paymentId}/refund`, { amount })).data;
