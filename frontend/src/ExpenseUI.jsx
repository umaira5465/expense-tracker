const getQty = (t) => Number(t.quantity || 1);
const lineTotal = (t) => Number(t.amount || 0) * getQty(t);

// Total expenses now counts quantity
const totalExpenses = transactions.reduce((sum, t) => sum + lineTotal(t), 0);
const remainingBalance = Number(startingBalance || 0) - totalExpenses;

const changeQty = (t, delta) => {
  const newQty = getQty(t) + delta;
  if (newQty < 1) return; // minimum quantity is 1

  const others = transactions
    .filter((x) => String(x.id) !== String(t.id))
    .reduce((sum, x) => sum + lineTotal(x), 0);

  if (others + Number(t.amount) * newQty > Number(startingBalance)) {
    alert("Insufficient balance"); // swap for your own message
    return;
  }

  onUpdate(t.id, { ...t, quantity: newQty });
};
import { useState } from "react";
import WhatsAppButton from "./WhatsAppButton";        // 1. import at the top

function ExpenseUI({ startingBalance, transactions, loading, error,
                     onSaveBalance, onAdd, onUpdate, onDelete }) {

  // ... your existing useState hooks (inputs, edit, popups) stay here ...

  // 2. Paste your snippet here, inside the component, before the return.
  //    It replaces your old totalExpenses / remainingBalance lines.
  const getQty = (t) => Number(t.quantity || 1);
  const lineTotal = (t) => Number(t.amount || 0) * getQty(t);

  const totalExpenses = transactions.reduce((sum, t) => sum + lineTotal(t), 0);
  const remainingBalance = Number(startingBalance || 0) - totalExpenses;

  const changeQty = (t, delta) => {
    const newQty = getQty(t) + delta;
    if (newQty < 1) return;

    const others = transactions
      .filter((x) => String(x.id) !== String(t.id))
      .reduce((sum, x) => sum + lineTotal(x), 0);

    if (others + Number(t.amount) * newQty > Number(startingBalance)) {
      alert("Insufficient balance");
      return;
    }

    onUpdate(t.id, { ...t, quantity: newQty });
  };

  return (
    <>
      {/* summary cards */}

      {/* 3. WhatsApp button goes here, under the summary cards */}
      <WhatsAppButton
        startingBalance={startingBalance}
        totalExpenses={totalExpenses}
        remainingBalance={remainingBalance}
        transactions={transactions}
      />

      {/* balance form, add expense form */}

      {/* expense table: use the +/- cells inside each row */}
      {/* <td><div className="qty">
             <button type="button" onClick={() => changeQty(t, -1)}>−</button>
             <span>{getQty(t)}</span>
             <button type="button" onClick={() => changeQty(t, 1)}>+</button>
           </div></td>
           <td>Rs. {lineTotal(t).toLocaleString()}</td> */}
    </>
  );
}