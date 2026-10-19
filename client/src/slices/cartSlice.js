import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as cartService from '../services/cartService';

const getError = (error) => error.response?.data?.message || error.message;
const createRequest = (name, serviceCall) => createAsyncThunk(name, async (args, { rejectWithValue }) => {
  try { return await serviceCall(args); } catch (error) { return rejectWithValue(getError(error)); }
});

export const fetchCart = createRequest('cart/fetch', cartService.getCart);
export const addToCart = createRequest('cart/add', cartService.addCartProduct);
export const changeCartQuantity = createRequest('cart/update', ({ itemId, quantity }) => cartService.updateCartProduct(itemId, quantity));
export const removeFromCart = createRequest('cart/remove', cartService.removeCartProduct);
export const emptyCart = createRequest('cart/clear', cartService.clearCart);

const cartSlice = createSlice({
  name: 'cart',
  initialState: { cart: null, loading: false, error: null },
  reducers: {
    resetCart: (state) => { state.cart = null; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload.data; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addToCart.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload.data; })
      .addCase(addToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(changeCartQuantity.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(changeCartQuantity.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload.data; })
      .addCase(changeCartQuantity.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(removeFromCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(removeFromCart.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload.data; })
      .addCase(removeFromCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(emptyCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(emptyCart.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload.data; })
      .addCase(emptyCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
