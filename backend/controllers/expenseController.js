const fs = require("fs");
const path = require("path");

const dataFolder = path.join(__dirname, "../data");
const filePath = path.join(dataFolder, "expenses.json");

// Read data
const readData = () => {
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        startingBalance: 0,
        expenses: []
      },
      null,
      2
    )
  );
}

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

return {
  startingBalance: Number(data.startingBalance ?? 0),
  expenses: Array.isArray(data.expenses)
    ? data.expenses.map((item) => ({
        ...item,
        quantity: Number(item.quantity || 1)
      }))
    : []
};
};

// Write data
const writeData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Get all expenses and balance
const getExpenses = (req, res) => {
  try {
    res.json(readData());
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Unable to load expenses" });
  }
};

// Save starting balance
const setBalance = (req, res) => {
  try {
    const startingBalance = Number(req.body.startingBalance);

    if (!Number.isFinite(startingBalance) || startingBalance < 0) {
      return res.status(400).json({
        message: "Enter a valid starting balance"
      });
    }

    const data = readData();
    data.startingBalance = startingBalance;

    writeData(data);

    res.json({
      message: "Balance saved successfully",
      ...data
    });
  } catch (error) {
    console.error("Balance error:", error);
    res.status(500).json({ message: "Balance could not be saved" });
  }
};

// Add expense
const addExpense = (req, res) => {
  try {
    const { title, amount } = req.body;

    if (
      !title ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        message: "Enter a valid expense type and amount"
      });
    }

    const data = readData();

    const expense = {
      id: Date.now().toString(),
      title: String(title).trim(),
      amount: Number(amount),
      quantity: 1
    };

    data.expenses.push(expense);
    writeData(data);

    res.status(201).json({
      message: "Expense added successfully",
      expense
    });
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({ message: "Unable to add expense" });
  }
};

// Update expense and quantity
const updateExpense = (req, res) => {
  try {
    const data = readData();

    const expense = data.expenses.find(
      (item) => String(item.id) === String(req.params.id)
    );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    const { title, amount, quantity } = req.body;

    const newTitle = title === undefined ? expense.title : String(title).trim();
    const newAmount = amount === undefined ? expense.amount : Number(amount);
    const newQuantity =
      quantity === undefined
        ? Number(expense.quantity || 1)
        : Number(quantity);

    if (!newTitle || !Number.isFinite(newAmount) || newAmount <= 0) {
      return res.status(400).json({
        message: "Enter valid expense details"
      });
    }

    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1"
      });
    }

    expense.title = newTitle;
    expense.amount = newAmount;
    expense.quantity = newQuantity;

    writeData(data);

    res.json({
      message: "Expense updated successfully",
      expense
    });
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({ message: "Unable to update expense" });
  }
};

// Delete expense
const deleteExpense = (req, res) => {
  try {
    const data = readData();
    const oldLength = data.expenses.length;

    data.expenses = data.expenses.filter(
      (item) => String(item.id) !== String(req.params.id)
    );

    if (data.expenses.length === oldLength) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    writeData(data);

    res.json({
      message: "Expense deleted successfully"
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Unable to delete expense" });
  }
};

module.exports = {
  getExpenses,
  setBalance,
  addExpense,
  updateExpense,
  deleteExpense
};