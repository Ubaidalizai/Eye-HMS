import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const moveItemAPI = createAsyncThunk(
  "inventory/moveItem",
  async ({ item, quantity }) => {
    // Extract the required fields
    const { name } = item;
    const salePrice = 40;
    // Prepare the payload with only the needed fields
    const payload = { name, quantity, salePrice };

    // Send the request with the payload
    const response = await fetch(`http://localhost:4000/api/product/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload), // Send only name, quantity, and salePrice
    });

    if (!response.ok) {
      throw new Error("Failed to move item");
    }

    return { ...payload }; // Ensure this matches the expected API response
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    products: [],
    movedItems: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(moveItemAPI.pending, (state) => {
        state.loading = true;
      })
      .addCase(moveItemAPI.fulfilled, (state, action) => {
        const { _id, quantity } = action.payload;

        // Update product stock
        const productIndex = state.products.findIndex(
          (product) => product._id === _id
        );
        if (productIndex !== -1) {
          state.products[productIndex].stock -= quantity;
        }

        // Update movedItems
        const movedItemIndex = state.movedItems.findIndex(
          (item) => item._id === _id
        );
        if (movedItemIndex !== -1) {
          state.movedItems[movedItemIndex].quantity += quantity;
        } else {
          state.movedItems.push({ ...action.payload, quantity });
        }
        state.loading = false;
      })
      .addCase(moveItemAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default inventorySlice.reducer;
