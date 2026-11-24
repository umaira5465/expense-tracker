import { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import "./App.css";

import ExpenseUI from "./ExpenseUI";

// Approach 1: Zustand
import { useExpenseStore } from "./features/expenses/zustandStore";

// Approach 2: Redux Toolkit
import { store as rtkStore } from "./app/store";
import * as rtk from "./features/expenses/expenseSlice";

// Approach 3: Redux + redux-thunk (hand-written)
import * as thunk from "./features/expenses/thunkStore";

/* ---------------------------------------------------------------
   1) ZUSTAND
---------------------------------------------------------------- */
function ZustandView() {
  const startingBalance = useExpenseStore((s) => s.startingBalance);
  const transactions = useExpenseStore((s) => s.transactions);
  const loading = useExpenseStore((s) => s.loading);
  const error = useExpenseStore((s) => s.error);

  const fetchExpenses = useExpenseStore((s) => s.fetchExpenses);
  const saveBalance = useExpenseStore((s) => s.saveBalance);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <ExpenseUI
      startingBalance={startingBalance}
      transactions={transactions}
      loading={loading}
      error={error}
      onSaveBalance={saveBalance}
      onAdd={addExpense}
      onUpdate={updateExpense}
      onDelete={deleteExpense}
    />
  );
}

/* ---------------------------------------------------------------
   2) REDUX TOOLKIT
---------------------------------------------------------------- */
function RtkInner() {
  const dispatch = useDispatch();
  const { startingBalance, transactions, loading, error } = useSelector(
    (state) => state.expenses
  );

  useEffect(() => {
    dispatch(rtk.fetchExpenses());
  }, [dispatch]);

  return (
    <ExpenseUI
      startingBalance={startingBalance}
      transactions={transactions}
      loading={loading}
      error={error}
      onSaveBalance={(b) => dispatch(rtk.saveBalance(b))}
      onAdd={(e) => dispatch(rtk.addTransaction(e))}
      onUpdate={(id, e) => dispatch(rtk.updateTransaction({ id, ...e }))}
      onDelete={(id) => dispatch(rtk.deleteTransaction(id))}
    />
  );
}

function RtkView() {
  return (
    <Provider store={rtkStore}>
      <RtkInner />
    </Provider>
  );
}

/* ---------------------------------------------------------------
   3) REDUX THUNK
---------------------------------------------------------------- */
function ThunkInner() {
  const dispatch = useDispatch();
  const { startingBalance, transactions, loading, error } = useSelector(
    (state) => state
  );

  useEffect(() => {
    dispatch(thunk.fetchExpenses());
  }, [dispatch]);

  return (
    <ExpenseUI
      startingBalance={startingBalance}
      transactions={transactions}
      loading={loading}
      error={error}
      onSaveBalance={(b) => dispatch(thunk.saveBalance(b))}
      onAdd={(e) => dispatch(thunk.addExpense(e))}
      onUpdate={(id, e) => dispatch(thunk.updateExpense(id, e))}
      onDelete={(id) => dispatch(thunk.deleteExpense(id))}
    />
  );
}

function ThunkView() {
  return (
    <Provider store={thunk.thunkStore}>
      <ThunkInner />
    </Provider>
  );
}

/* ---------------------------------------------------------------
   Tabs
---------------------------------------------------------------- */
const APPROACHES = {
  zustand: {
    label: "Zustand",
    note: "One store holds state + async actions. No Provider, no reducers.",
    View: ZustandView,
  },
  rtk: {
    label: "Redux Toolkit",
    note: "createSlice + createAsyncThunk: reducers and action types are generated.",
    View: RtkView,
  },
  thunk: {
    label: "Redux Thunk",
    note: "Classic Redux: hand-written action types, reducer and thunks.",
    View: ThunkView,
  },
};

/* ---------------------------------------------------------------
   Floating WhatsApp icon (inline styles, so it never depends on CSS)
---------------------------------------------------------------- */
function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/?text=Check%20out%20my%20Expense%20Tracker"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on WhatsApp"
      title="Share on WhatsApp"
      style={{
        position: "fixed",
      bottom: "24px",
      right: "24px",
        width: "56px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#25d366",
        borderRadius: "50%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        zIndex: 99999,
      }}
    >
      <svg viewBox="0 0 24 24" width="30" height="30" fill="#fff" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    </a>
  );
}

function App() {
  const [active, setActive] = useState("zustand");
  const { View, note } = APPROACHES[active];

  return (
    <div className="page">
      <div className="container">
        <h1>Expense Tracker</h1>
        <p className="subtitle">Global state management comparison</p>

        <div className="tabs">
          {Object.entries(APPROACHES).map(([key, item]) => (
            <button
              key={key}
              className={`tab-btn ${active === key ? "active" : ""}`}
              onClick={() => setActive(key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="approach-note">{note}</p>

        {/* key forces a fresh mount (and a fresh fetch) when switching */}
        <View key={active} />
      </div>

      {/* Floating WhatsApp icon on the right side */}
      <WhatsAppFloat />
    </div>
  );
}

export default App;