const express = require("express");
const router = express.Router();

const {
  getExpenses,
  setBalance,
  addExpense,
  updateExpense,
  deleteExpense
} = require("../controllers/expenseController");

router.get("/", getExpenses);
router.put("/balance", setBalance);
router.post("/", addExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;