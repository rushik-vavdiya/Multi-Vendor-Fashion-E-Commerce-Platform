import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as orderService from '../services/orderService';

const request = (name, call) => createAsyncThunk(name, async (args, { rejectWithValue }) => {
  try { return await call(args); } catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const fetchOrders = request('orders/fetch', orderService.getOrders);
export const fetchOrder = request('orders/fetchOne', orderService.getOrder);
export const addOrder = request('orders/create', orderService.createOrder);
export const cancelOrder = request('orders/cancel', orderService.cancelOrder);
export const changeOrderStatus = request('orders/status', orderService.updateOrderStatus);
const requests = [fetchOrders, fetchOrder, addOrder, cancelOrder, changeOrderStatus];

const orderSlice = createSlice({
  name: 'orders', initialState: { items: [], selected: null, loading: false, error: null },
  reducers: { clearOrderError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    requests.forEach((action) => builder
      .addCase(action.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(action.rejected, (state, result) => { state.loading = false; state.error = result.payload; }));
    builder
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data; })
      .addCase(fetchOrder.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload.data; })
      .addCase(addOrder.fulfilled, (state, action) => { state.loading = false; state.items.unshift(action.payload.data); state.selected = action.payload.data; })
      .addCase(cancelOrder.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload.data; })
      .addCase(changeOrderStatus.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload.data; });
  },
});
export const { clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
