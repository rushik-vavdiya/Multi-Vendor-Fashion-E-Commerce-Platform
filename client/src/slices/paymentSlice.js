import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as paymentService from '../services/paymentService';

const request = (name, call) => createAsyncThunk(name, async (args, { rejectWithValue }) => {
  try { return await call(args); } catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const startPayment = request('payments/create', paymentService.createPayment);
export const confirmPayment = request('payments/verify', paymentService.verifyPayment);
export const requestRefund = request('payments/refund', paymentService.refundPayment);
const requests = [startPayment, confirmPayment, requestRefund];

const paymentSlice = createSlice({
  name: 'payments', initialState: { current: null, loading: false, error: null },
  reducers: { clearPaymentError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    requests.forEach((action) => builder
      .addCase(action.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(action.rejected, (state, result) => { state.loading = false; state.error = result.payload; }));
    [startPayment, confirmPayment, requestRefund].forEach((action) => builder
      .addCase(action.fulfilled, (state, result) => { state.loading = false; state.current = result.payload.data; }));
  },
});
export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
