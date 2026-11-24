function WhatsAppButton({
  startingBalance,
  totalExpenses,
  remainingBalance,
  transactions = [],
}) {
  const PHONE = ""; // optional, e.g. "923001234567" (country code, no + or spaces)

  const lines = transactions.map((t, i) => {
    const qty = Number(t.quantity || 1);
    const total = Number(t.amount || 0) * qty;
    return `${i + 1}. ${t.title || t.type} x${qty}: Rs. ${total.toLocaleString()}`;
  });

  const message =
    `Expense Tracker Summary\n` +
    `Starting Balance: Rs. ${Number(startingBalance || 0).toLocaleString()}\n` +
    `Total Expenses: Rs. ${Number(totalExpenses || 0).toLocaleString()}\n` +
    `Remaining: Rs. ${Number(remainingBalance || 0).toLocaleString()}\n\n` +
    (lines.length ? `Expenses:\n${lines.join("\n")}` : "No expenses yet.");

  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;

  return (
    <a
      className="whatsapp-btn"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      Share on WhatsApp
    </a>
  );
}

export default WhatsAppButton;
