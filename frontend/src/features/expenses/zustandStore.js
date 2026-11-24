import { create } from "zustand";
import { api, getErrorMessage } from "../../api";

// Zustand: state AND actions live together in one store.
// No Provider, no action types, no reducers. `set` merges state.
export const useExpenseStore = create((set) => ({
  startingBalance: 0,
  transactions: [],
  loading: false,
  error: null,

  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getAll();
      set({
        startingBalance: Number(data.startingBalance),
        transactions: data.transactions,
        loading: false,
      });
    } catch (err) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  saveBalance: async (balance) => {
    try {
      const startingBalance = await api.saveBalance(Number(balance));
      set({ startingBalance: Number(startingBalance), error: null });
    } catch (err) {
      set({ error: getErrorMessage(err) });
    }
  },

  addExpense: async (expense) => {
    try {
      const created = await api.add(expense);
      set((state) => ({
        transactions: [...state.transactions, created],
        error: null,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err) });
    }
  },

  updateExpense: async (id, expense) => {
    try {
      const updated = await api.update(id, expense);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === updated.id ? updated : t
        ),
        error: null,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err) });
    }
  },

  deleteExpense: async (id) => {
    try {
      await api.remove(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        error: null,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err) });
    }
  },
}));
