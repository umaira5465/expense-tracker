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