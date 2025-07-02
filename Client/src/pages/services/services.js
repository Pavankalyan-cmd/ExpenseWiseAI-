import axios from "axios";
import { auth } from "../../firebase";
const BASE_URL = process.env.REACT_APP_BASE_URL;;

const api = axios.create({
  baseURL: BASE_URL,
});
export const fetchIncome = async (userId) => {
  const user = auth.currentUser;
  const token = await user.getIdToken(true);
  return api.get(`/incomes/${userId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchExpenses = async (userId) => {
  const user = auth.currentUser;
  const token = await user.getIdToken(true);
  return api.get(`/expenses/${userId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addIncome = async (incomeData) => {
  const user = auth.currentUser;
  const token = await user.getIdToken(true);
  return api.post(`/incomes/`, incomeData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addExpense = async (expenseData) => {
  const user = auth.currentUser;
  const token = await user.getIdToken(true);
  return api.post(`/expenses/`, expenseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addUser = async (userdata) => {
  const user = auth.currentUser;
  const token = await user.getIdToken(true);
  return api.post(`/users/`, userdata, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchuser = async (id) => {
  const user = auth.currentUser;
  const token = await user.getIdToken(true);
  return api.get(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteData = async (type, id) => {
  const user = auth.currentUser;
  const token = await user.getIdToken(true);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  if (type === "Income") {
    return api.delete(`/incomes/${id}/`, config);
  } else if (type === "Expenses") {
    return api.delete(`/expenses/${id}/`, config);
  } else {
    return api.delete(`/users/${id}/`, config);
  }
};

export const resetAllTransactions = async () => {
  const user = auth.currentUser;
  const token = await user.getIdToken(true);

  return api.delete(`/reset-transactions/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const sendAgentQuery = async ({ query,  chatHistory }) => {
  const user = auth.currentUser;
  const token = await user.getIdToken(true);
  const response = await axios.post(
    `${BASE_URL}/ai/agent/`,
    {
      query,
      chat_history: chatHistory,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};



export async function uploadBankStatement(formData) {
  const user = auth.currentUser;
  const token = await user.getIdToken(true);
  const res = await fetch(`${BASE_URL}/transactions/upload/`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Add token
      // ❌ Don't add 'Content-Type' here — let the browser handle it!
    },
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return await res.json();
}
