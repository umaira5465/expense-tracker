import { legacy_createStore as createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import { api, getErrorMessage } from "../../api";

// Classic Redux + redux-thunk: nothing is generated for you.
// You write action types, action creators, the reducer, and thunks by hand.

// 1) Action types
export const REQUEST_START = "expenses/REQUEST_START";
export const REQUEST_FAILED = "expenses/REQUEST_FAILED";
export const FETCH_SUCCESS = "expenses/FETCH_SUCCESS";
export const BALANCE_SAVED = "expenses/BALANCE_SAVED";
export const EXPENSE_ADDED = "expenses/EXPENSE_ADDED";
export const EXPENSE_UPDATED = "expenses/EXPENSE_UPDATED";
export const EXPENSE_DELETED = "expenses/EXPENSE_DELETED";

// 2) Reducer (must return NEW objects, no mutation)
const initialState = {
  startingBalance: 0,
  transactions: [],
  loading: false,
  error: null,
};

export function expenseReducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_START:
      return { ...state, loading: true, error: null };

    case REQUEST_FAILED:
      return { ...state, loading: false, error: action.payload };

    case FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        startingBalance: Number(action.payload.startingBalance),
        transactions: action.payload.transactions,
      };

    case BALANCE_SAVED:
      return {
        ...state,
        loading: false,
        startingBalance: Number(action.payload),
      };

    case EXPENSE_ADDED:
      return {
        ...state,
        loading: false,
        transactions: [...state.transactions, action.payload],
      };

    case EXPENSE_UPDATED:
      return {
        ...state,
        loading: false,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case EXPENSE_DELETED:
      return {
        ...state,
        loading: false,
        transactions: state.transactions.filter(
          (t) => t.id !== action.payload
        ),
      };

    default:
      return state;
  }
}

// 3) Thunks: functions that receive (dispatch, getState) and can be async
export const fetchExpenses = () => async (dispatch) => {
  dispatch({ type: REQUEST_START });
  try {
    const data = await api.getAll();
    dispatch({ type: FETCH_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: REQUEST_FAILED, payload: getErrorMessage(err) });
  }
};

export const saveBalance = (balance) => async (dispatch) => {
  dispatch({ type: REQUEST_START });
  try {
    const value = await api.saveBalance(Number(balance));
    dispatch({ type: BALANCE_SAVED, payload: value });
  } catch (err) {
    dispatch({ type: REQUEST_FAILED, payload: getErrorMessage(err) });
  }
};

export const addExpense = (expense) => async (dispatch) => {
  dispatch({ type: REQUEST_START });
  try {
    const created = await api.add(expense);
    dispatch({ type: EXPENSE_ADDED, payload: created });
  } catch (err) {
    dispatch({ type: REQUEST_FAILED, payload: getErrorMessage(err) });
  }
};

export const updateExpense = (id, expense) => async (dispatch) => {
  dispatch({ type: REQUEST_START });
  try {
    const updated = await api.update(id, expense);
    dispatch({ type: EXPENSE_UPDATED, payload: updated });
  } catch (err) {
    dispatch({ type: REQUEST_FAILED, payload: getErrorMessage(err) });
  }
};

export const deleteExpense = (id) => async (dispatch) => {
  dispatch({ type: REQUEST_START });
  try {
    await api.remove(id);
    dispatch({ type: EXPENSE_DELETED, payload: id });
  } catch (err) {
    dispatch({ type: REQUEST_FAILED, payload: getErrorMessage(err) });
  }
};

// 4) Store: thunk middleware is added manually
export const thunkStore = createStore(
  expenseReducer,
  applyMiddleware(thunk)
);
