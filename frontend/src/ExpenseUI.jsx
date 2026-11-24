import { useEffect, useRef, useState } from "react";
import WhatsAppButton from "./WhatsAppButton";

const EXPENSE_TYPES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Other",
];

function ExpenseUI({
  startingBalance,
  transactions = [],
  loading,
  error,
  onSaveBalance,
  onAdd,
  onUpdate,
  onDelete,
}) {
  // Form inputs
  const [balanceInput, setBalanceInput] = useState("");
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");

  // Edit popup
  const [editing, setEditing] = useState(null); // transaction being edited
  const [editType, setEditType] = useState("");
  const [editAmount, setEditAmount] = useState("");

  // Delete popup
  const [deleting, setDeleting] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, kind = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, kind });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Show the saved balance in the input once it loads
  useEffect(() => {
    if (Number(startingBalance) > 0) setBalanceInput(String(startingBalance));
  }, [startingBalance]);

  // ---------- Totals (quantity aware) ----------
  const getQty = (t) => Number(t.quantity || 1);
  const lineTotal = (t) => Number(t.amount || 0) * getQty(t);

  const totalExpenses = transactions.reduce((sum, t) => sum + lineTotal(t), 0);
  const remainingBalance = Number(startingBalance || 0) - totalExpenses;

  // RTK dispatch returns an action with .error on failure; others return nothing
  const failed = (result) => Boolean(result && result.error);

  // ---------- Save balance ----------
  const handleBalance = async (e) => {
    e.preventDefault();
    if (!balanceInput || Number(balanceInput) <= 0) {
      showToast("Enter a valid balance", "error");
      return;
    }
    try {
      const res = await onSaveBalance(Number(balanceInput));
      if (failed(res)) throw new Error();
      showToast("Balance saved successfully!");
    } catch {
      showToast("Balance could not be saved", "error");
    }
  };

  // ---------- Add expense ----------
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!type || !amount || Number(amount) <= 0) {
      showToast("Please select a type and enter an amount", "error");
      return;
    }
    if (Number(amount) > remainingBalance) {
      showToast("Insufficient balance", "error");
      return;
    }
    try {
      const res = await onAdd({
        title: type,
        amount: Number(amount),
        quantity: 1,
      });
      if (failed(res)) throw new Error();
      setType("");
      setAmount("");
      showToast("Expense added successfully!");
    } catch {
      showToast("Expense not added", "error");
    }
  };

  // ---------- Quantity + / - ----------
  const changeQty = async (t, delta) => {
    const newQty = getQty(t) + delta;
    if (newQty < 1) return;

    const others = transactions
      .filter((x) => String(x.id) !== String(t.id))
      .reduce((sum, x) => sum + lineTotal(x), 0);

    if (others + Number(t.amount) * newQty > Number(startingBalance)) {
      showToast("Insufficient balance", "error");
      return;
    }

    try {
      const res = await onUpdate(t.id, { ...t, quantity: newQty });
      if (failed(res)) throw new Error();
    } catch {
      showToast("Update failed", "error");
    }
  };

  // ---------- Edit ----------
  const openEdit = (t) => {
    setEditing(t);
    setEditType(t.title || t.type || "");
    setEditAmount(String(t.amount));
  };

  const closeEdit = () => {
    setEditing(null);
    setEditType("");
    setEditAmount("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editType || !editAmount || Number(editAmount) <= 0) {
      showToast("Please enter valid details", "error");
      return;
    }

    const others = transactions
      .filter((x) => String(x.id) !== String(editing.id))
      .reduce((sum, x) => sum + lineTotal(x), 0);

    if (others + Number(editAmount) * getQty(editing) > Number(startingBalance)) {
      showToast("Insufficient balance", "error");
      return;
    }

    try {
      const res = await onUpdate(editing.id, {
        ...editing,
        title: editType,
        amount: Number(editAmount),
      });
      if (failed(res)) throw new Error();
      closeEdit();
      showToast("Expense updated successfully!");
    } catch {
      showToast("Update failed", "error");
    }
  };

  // ---------- Delete ----------
  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      const res = await onDelete(deleting.id);
      if (failed(res)) throw new Error();
      setDeleting(null);
      showToast("Expense deleted successfully!");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <>
      {/* SUMMARY */}
      <div className="summary">
        <div className="summary-card">
          <h3>Starting Balance</h3>
          <p>Rs. {Number(startingBalance || 0).toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p>Rs. {totalExpenses.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Remaining Balance</h3>
          <p>Rs. {remainingBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* WHATSAPP (outside any condition, so it always shows) */}
      <WhatsAppButton
        startingBalance={startingBalance}
        totalExpenses={totalExpenses}
        remainingBalance={remainingBalance}
        transactions={transactions}
      />

      {/* STARTING BALANCE */}
      <h2>Starting Balance</h2>
      <form className="row" onSubmit={handleBalance}>
        <input
          type="number"
          min="1"
          placeholder="Enter starting balance"
          value={balanceInput}
          onChange={(e) => setBalanceInput(e.target.value)}
        />
        <button type="submit">Save Balance</button>
      </form>

      {/* ADD EXPENSE */}
      <h2>Add Expense</h2>
      <form className="row" onSubmit={handleAdd}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Select Expense Type</option>
          {EXPENSE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit">Add Expense</button>
      </form>

      {/* EXPENSE LIST */}
      <h2>Expense List</h2>

      {loading && transactions.length === 0 && <p>Loading...</p>}
      {error && <p className="error">{String(error)}</p>}

      {!loading && transactions.length === 0 ? (
        <p className="empty">No expenses added yet.</p>
      ) : (
        <table className="expense-table">
          <thead>
            <tr>
              <th>Expense Type</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.title || t.type}</td>
                <td>
                  <div className="qty">
                    <button type="button" onClick={() => changeQty(t, -1)}>
                      −
                    </button>
                    <span>{getQty(t)}</span>
                    <button type="button" onClick={() => changeQty(t, 1)}>
                      +
                    </button>
                  </div>
                </td>
                <td>Rs. {lineTotal(t).toLocaleString()}</td>
                <td>
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => openEdit(t)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => setDeleting(t)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* EDIT POPUP */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Expense</h2>
            <form onSubmit={handleUpdate}>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
              >
                <option value="">Select Expense Type</option>
                {EXPENSE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Amount"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
              <div className="modal-actions">
                <button type="submit">Update</button>
                <button type="button" className="delete-btn" onClick={closeEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE POPUP */}
      {deleting && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this expense?</p>
            <div className="modal-actions">
              <button type="button" className="delete-btn" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button type="button" onClick={() => setDeleting(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className={`toast ${toast.kind}`}>{toast.message}</div>}
    </>
  );
}

export default ExpenseUI;