import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dashboardApi = {
  getDashboard: () => API.get("/dashboard"),
  getAnalytics: () => API.get("/dashboard/analytics"),
  getCampaigns: (query = "") =>
    API.get("/campaigns", {
      params: query ? { q: query } : {},
    }),
  createCampaign: (campaign) => API.post("/campaigns", campaign),
  getNotifications: () => API.get("/notifications"),
  markNotificationRead: (id) => API.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => API.patch("/notifications/read-all"),
  getTemplates: () => API.get("/templates"),
  createTemplate: (template) => API.post("/templates", template),
  updateTemplate: (id, template) => API.put(`/templates/${id}`, template),
  deleteTemplate: (id) => API.delete(`/templates/${id}`),
  getActivityLogs: () => API.get("/activity"),
};

export const authApi = {
  register: (payload) => API.post("/auth/register", payload),
  login: (payload) => API.post("/auth/login", payload),
  verifyOtp: (payload) => API.post("/auth/verify-otp", payload),
  resendOtp: (payload) => API.post("/auth/resend-otp", payload),
  forgotPassword: (payload) => API.post("/auth/forgot-password", payload),
  resetPassword: (token, payload) => API.post(`/auth/reset-password/${token}`, payload),
};

export const contactApi = {
  getContacts: (search = "") =>
    API.get("/contacts", {
      params: search ? { search } : {},
    }),
  getContactLists: () => API.get("/contacts/lists"),
  createContactList: (payload) => API.post("/contacts/lists", payload),
  updateContactList: (id, payload) => API.put(`/contacts/lists/${id}`, payload),
  deleteContactList: (id) => API.delete(`/contacts/lists/${id}`),
  addContactsToList: (id, payload) => API.post(`/contacts/lists/${id}/contacts`, payload),
  removeContactsFromList: (id, payload) =>
    API.delete(`/contacts/lists/${id}/contacts`, { data: payload }),
  createContact: (payload) => API.post("/contacts", payload),
  updateContact: (id, payload) => API.put(`/contacts/${id}`, payload),
  deleteContact: (id) => API.delete(`/contacts/${id}`),
  getStats: () => API.get("/contacts/stats"),
  sendSms: (id, payload) => API.post(`/contacts/${id}/sms`, payload),
  sendBulkSms: (payload) => API.post("/contacts/sms", payload),
};

export default API;
