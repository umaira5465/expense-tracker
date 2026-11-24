import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, getErrorMessage } from "../../api";

// Redux Toolkit: createAsyncThunk generates pending / fulfilled / rejected
// actions automatically. createSlice lets reducers "mutate" state (Immer).

export const fetchExpenses = createAsyncThunk(
  "expenses/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getAll();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const saveBalance = createAsyncThunk(
  "expenses/saveBalance",
  async (balance, { rejectWithValue }) => {
    try {
      return await api.saveBalance(Number(balance));
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const addTransaction = createAsyncThunk(
  "expenses/add",
  async (expense, { rejectWithValue }) => {
    try {
      return await api.add(expense);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateTransaction = createAsyncThunk(
  "expenses/update",
  async ({ id, title, amount }, { rejectWithValue }) => {
    try {
      return await api.update(id, { title, amount });
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  "expenses/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await api.remove(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const expenseSlice = createSlice({
  name: "expenses",

  initialState: {
    startingBalance: 0,
    transactions: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.startingBalance = Number(action.payload.startingBalance);
        state.transactions = action.payload.transactions;
      })

      .addCase(saveBalance.fulfilled, (state, action) => {
        state.startingBalance = Number(action.payload);
      })

      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions.push(action.payload);
      })

      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) state.transactions[index] = action.payload;
      })

      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (item) => item.id !== action.payload
        );
      })

      // Shared loading / error handling for every thunk above
      .addMatcher(
        (action) =>
          action.type.startsWith("expenses/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("expenses/") &&
          action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("expenses/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export default expenseSlice.reducer;
