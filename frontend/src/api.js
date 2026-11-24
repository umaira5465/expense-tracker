import axios from "axios";

const API = "http://localhost:5000/api/expenses";

// Turns any axios error into a readable message
export const getErrorMessage = (err) =>
  err?.response?.data?.message ||
  (err?.code === "ERR_NETWORK"
    ? "Backend connection failed. Please start your backend server."
    : err?.message) ||
  "Something went wrong";

// Every function returns plain data, so each state manager
// (Zustand, Redux Toolkit, Redux Thunk) can use it the same way.
export const api = {
  getAll: async () => (await axios.get(API)).data,

  saveBalance: async (startingBalance) =>
    (await axios.put(`${API}/balance`, { startingBalance })).data
      .startingBalance,

  add: async (expense) => (await axios.post(API, expense)).data.expense,

  update: async (id, expense) =>
    (await axios.put(`${API}/${encodeURIComponent(id)}`, expense)).data
      .expense,

  remove: async (id) => {
    await axios.delete(`${API}/${encodeURIComponent(id)}`);
    return id;
  },
};
