import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken,
          });
          localStorage.setItem("access_token", data.data.accessToken);
          localStorage.setItem("refresh_token", data.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
};

// Invoices
export const invoicesApi = {
  list: (params?: Record<string, unknown>) => api.get("/invoices", { params }),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: unknown) => api.post("/invoices", data),
  update: (id: string, data: unknown) => api.put(`/invoices/${id}`, data),
  send: (id: string, message?: string) =>
    api.post(`/invoices/${id}/send`, { customMessage: message }),
  void: (id: string, reason: string) =>
    api.post(`/invoices/${id}/void`, { reason }),
  markPaid: (id: string, data: unknown) =>
    api.post(`/invoices/${id}/mark-paid`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
};

// Customers
export const customersApi = {
  list: (params?: Record<string, unknown>) => api.get("/customers", { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: unknown) => api.post("/customers", data),
};

// Vendors
export const vendorsApi = {
  list: (params?: Record<string, unknown>) => api.get("/vendors", { params }),
  get: (id: string) => api.get(`/vendors/${id}`),
  create: (data: unknown) => api.post("/vendors", data),
};

// Expenses
export const expensesApi = {
  list: (params?: Record<string, unknown>) => api.get("/expenses", { params }),
  get: (id: string) => api.get(`/expenses/${id}`),
  approve: (id: string) => api.post(`/expenses/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.post(`/expenses/${id}/reject`, { reason }),
};

// Banking
export const bankingApi = {
  accounts: () => api.get("/banking/accounts"),
  transactions: (accountId: string, params?: Record<string, unknown>) =>
    api.get(`/banking/accounts/${accountId}/transactions`, { params }),
};

// Dashboard
export const dashboardApi = {
  stats: (period = "thisMonth") =>
    api.get("/dashboard/stats", { params: { period } }),
};

// Reports
export const reportsApi = {
  profitLoss: (fromDate: string, toDate: string) =>
    api.get("/reports/profit-loss", { params: { fromDate, toDate } }),
  balanceSheet: (asOfDate: string) =>
    api.get("/reports/balance-sheet", { params: { asOfDate } }),
  cashFlow: (fromDate: string, toDate: string) =>
    api.get("/reports/cash-flow", { params: { fromDate, toDate } }),
  aging: (type = "Receivable") =>
    api.get("/reports/aging", { params: { type } }),
};
