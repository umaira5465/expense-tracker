function WhatsAppButton({ startingBalance, totalExpenses, remainingBalance, transactions }) {
  const PHONE = ""; // optional, e.g. "923001234567" (country code, no + or spaces)

  const lines = transactions.map(
    (t, i) => `${i + 1}. ${t.title || t.type}: Rs. ${Number(t.amount).toLocaleString()}`
  );

  const message =
    `Expense Tracker Summary\n` +
    `Starting Balance: Rs. ${Number(startingBalance).toLocaleString()}\n` +
    `Total Expenses: Rs. ${Number(totalExpenses).toLocaleString()}\n` +
    `Remaining: Rs. ${Number(remainingBalance).toLocaleString()}\n\n` +
    (lines.length ? `Expenses:\n${lines.join("\n")}` : "No expenses yet.");

  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;

  return (
    <a className="whatsapp-btn" href={url} target="_blank" rel="noopener noreferrer">
      Share on WhatsApp
    </a>
  );
}

export default WhatsAppButton;