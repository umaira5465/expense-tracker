
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/expenses";

const expenseTypes = [
  "Food",
  "Transport",
  "Shopping",
  "Rent",
  "Electricity",
  "Water Bill",
  "Internet",
  "Education",
  "Healthcare",
  "Entertainment",
  "Other"
];

const stateDescriptions = {
  Zustand: "Simple and lightweight global state management.",
  "Redux Toolkit": "Modern Redux with less boilerplate and simpler reducers.",
  "Redux Thunk": "Classic Redux: hand-written action types, reducer and thunks."
};

function App() {
  const [activeTab, setActiveTab] = useState("Redux Thunk");

  const [balance, setBalance] = useState("0");
  const [balanceInput, setBalanceInput] = useState("0");
  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const [editingExpense, setEditingExpense] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    try {
      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load expenses");
      }

      setBalance(String(data.startingBalance ?? 0));
      setBalanceInput(String(data.startingBalance ?? 0));

      setExpenses(
        Array.isArray(data.expenses)
          ? data.expenses.map((item) => ({
              ...item,
              quantity: Number(item.quantity || 1)
            }))
          : []
      );
    } catch (error) {
      console.error("Loading error:", error);
      alert("Cannot connect to backend. Make sure server.js is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const totalExpenses = expenses.reduce(
    (total, item) =>
      total + Number(item.amount) * Number(item.quantity || 1),
    0
  );

  const remainingBalance = Number(balance) - totalExpenses;

  const formatMoney = (value) =>
    Number(value).toLocaleString("en-PK", {
      maximumFractionDigits: 2
    });

  const saveBalance = async () => {
    const newBalance = Number(balanceInput);

    if (
      balanceInput.trim() === "" ||
      !Number.isFinite(newBalance) ||
      newBalance < 0
    ) {
      alert("Enter a valid starting balance");
      return;
    }

    try {
      const response = await fetch(`${API}/balance`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          startingBalance: newBalance
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Balance could not be saved");
      }

      setBalance(String(data.startingBalance));
      setBalanceInput(String(data.startingBalance));

      alert("Starting balance saved successfully!");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const addExpense = async (event) => {
    event.preventDefault();

    if (!title || amount.trim() === "" || Number(amount) <= 0) {
      alert("Select an expense type and enter a valid amount");
      return;
    }

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          amount: Number(amount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Expense could not be added");
      }

      setTitle("");
      setAmount("");

      await loadExpenses();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const updateQuantity = async (item, change) => {
    const newQuantity = Number(item.quantity || 1) + change;

    if (newQuantity < 1) return;

    try {
      const response = await fetch(`${API}/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: item.title,
          amount: Number(item.amount),
          quantity: newQuantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Quantity update failed");
      }

      await loadExpenses();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const openEditPopup = (item) => {
    setEditingExpense(item);
    setEditTitle(item.title);
    setEditAmount(String(item.amount));
  };

  const saveEdit = async (event) => {
    event.preventDefault();

    if (
      !editTitle ||
      editAmount.trim() === "" ||
      Number(editAmount) <= 0
    ) {
      alert("Select an expense type and enter a valid amount");
      return;
    }

    try {
      const response = await fetch(`${API}/${editingExpense.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: editTitle,
          amount: Number(editAmount),
          quantity: Number(editingExpense.quantity || 1)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Expense update failed");
      }

      setEditingExpense(null);
      await loadExpenses();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const deleteExpense = async () => {
    if (deleteId === null) return;

    try {
      const response = await fetch(`${API}/${deleteId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setDeleteId(null);
      await loadExpenses();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) {
    return <h2 className="loading">Loading Expense Tracker...</h2>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <p>Global state management comparison</p>
      </header>

      <nav className="state-tabs">
        {["Zustand", "Redux Toolkit", "Redux Thunk"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`state-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <p className="state-description">
        {stateDescriptions[activeTab]}
      </p>

      <section className="summary-container">
        <div className="summary-card">
          <h3>Starting Balance</h3>
          <p>Rs. {formatMoney(balance)}</p>
        </div>

        <div className="summary-card expense-card">
          <h3>Total Expenses</h3>
          <p>Rs. {formatMoney(totalExpenses)}</p>
        </div>

        <div className="summary-card remaining-card">
          <h3>Remaining Balance</h3>
          <p>Rs. {formatMoney(remainingBalance)}</p>
        </div>
      </section>

      <section className="balance-section">
        <h2>Starting Balance</h2>

        <div className="balance-form">
          <input
            type="number"
            min="0"
            step="0.01"
            value={balanceInput}
            onChange={(event) => setBalanceInput(event.target.value)}
            placeholder="Enter starting balance"
          />

          <button type="button" onClick={saveBalance}>
            Save Balance
          </button>
        </div>
      </section>

      <section className="expense-section">
        <h2>Add Expense</h2>

        <form onSubmit={addExpense} className="expense-form">
          <select
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          >
            <option value="">Select Expense Type</option>

            {expenseTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter Amount"
            required
          />

          <button type="submit">Add Expense</button>
        </form>
      </section>

      <section className="list-section">
        <h2>Expense List</h2>

        {expenses.length === 0 ? (
          <p className="empty-message">No expenses added yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Expense Type</th>
                  <th>Amount</th>
                  <th>Quantity</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>

                    <td>
                      Rs.{" "}
                      {formatMoney(
                        Number(item.amount) * Number(item.quantity || 1)
                      )}
                    </td>

                    <td>
                      <div className="quantity-control">
                        <button
                          type="button"
                          className="quantity-btn minus"
                          onClick={() => updateQuantity(item, -1)}
                          disabled={Number(item.quantity || 1) <= 1}
                        >
                          −
                        </button>

                        <span className="quantity-number">
                          {item.quantity || 1}
                        </span>

                        <button
                          type="button"
                          className="quantity-btn plus"
                          onClick={() => updateQuantity(item, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => openEditPopup(item)}
                      >
                        Edit
                      </button>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => setDeleteId(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingExpense && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Expense</h2>

            <form onSubmit={saveEdit}>
              <label>Expense Type</label>

              <select
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                required
              >
                <option value="">Select Expense Type</option>

                {expenseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <label>Amount</label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={editAmount}
                onChange={(event) => setEditAmount(event.target.value)}
                required
              />

              <div className="modal-buttons">
                <button type="submit" className="save-btn">
                  Update
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingExpense(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <h2>Confirm Delete</h2>

            <p>Are you sure you want to delete this expense?</p>

            <div className="modal-buttons">
              <button
                type="button"
                className="confirm-delete-btn"
                onClick={deleteExpense}
              >
                Yes, Delete
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
