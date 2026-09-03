import axios from 'axios';

// Khi gom BE vào FE (single Vercel project): dùng '/api' cùng origin
// Khi deploy BE riêng: set NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardApi = {
  getStats: () => api.get('/dashboard').then(res => res.data),
};

export const customerApi = {
  getAll: () => api.get('/customers').then(res => res.data),
  getById: (id: string) => api.get(`/customers/${id}`).then(res => res.data),
  create: (data: any) => api.post('/customers', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/customers/${id}`).then(res => res.data),
};

export const serviceProfileApi = {
  getAll: () => api.get('/service-profiles').then(res => res.data),
  getById: (id: string) => api.get(`/service-profiles/${id}`).then(res => res.data),
  create: (data: any) => api.post('/service-profiles', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/service-profiles/${id}`, data).then(res => res.data),
};

export const lawsuitApi = {
  getAll: () => api.get('/lawsuits').then(res => res.data),
  getById: (id: string) => api.get(`/lawsuits/${id}`).then(res => res.data),
  create: (data: any) => api.post('/lawsuits', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/lawsuits/${id}`, data).then(res => res.data),
};

export const taskApi = {
  getAll: () => api.get('/tasks').then(res => res.data),
  getById: (id: string) => api.get(`/tasks/${id}`).then(res => res.data),
  create: (data: any) => api.post('/tasks', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/tasks/${id}`).then(res => res.data),
};

export const scheduleApi = {
  getAll: () => api.get('/schedules').then(res => res.data),
  getById: (id: string) => api.get(`/schedules/${id}`).then(res => res.data),
  create: (data: any) => api.post('/schedules', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/schedules/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/schedules/${id}`).then(res => res.data),
};

export const chatApi = {
  getMessages: (channelType: string, channelId: string) => 
    api.get(`/chat?channelType=${channelType}&channelId=${channelId}`).then(res => res.data),
  sendMessage: (data: any) => api.post('/chat', data).then(res => res.data),
};

export const documentApi = {
  getAll: () => api.get('/documents').then(res => res.data),
  create: (data: any) => api.post('/documents', data).then(res => res.data),
  delete: (id: string) => api.delete(`/documents/${id}`).then(res => res.data),
};

export const folderApi = {
  getAll: () => api.get('/folders').then(res => res.data),
  create: (data: any) => api.post('/folders', data).then(res => res.data),
  delete: (id: string) => api.delete(`/folders/${id}`).then(res => res.data),
  rename: (id: string, data: any) => api.patch(`/folders/${id}`, data).then(res => res.data),
};

export const financeApi = {
  getRevenues: () => api.get('/revenues').then(res => res.data),
  createRevenue: (data: any) => api.post('/revenues', data).then(res => res.data),
  getExpenses: () => api.get('/expenses').then(res => res.data),
  createExpense: (data: any) => api.post('/expenses', data).then(res => res.data),
  getDebts: () => api.get('/debts').then(res => res.data),
};

export const contractApi = {
  getAll: () => api.get('/contracts').then(res => res.data),
  getById: (id: string) => api.get(`/contracts/${id}`).then(res => res.data),
  create: (data: any) => api.post('/contracts', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/contracts/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/contracts/${id}`).then(res => res.data),
};

export const hrApi = {
  getStaff: () => api.get('/staff').then(res => res.data),
  getStaffById: (id: string) => api.get(`/staff/${id}`).then(res => res.data),
  createStaff: (data: any) => api.post('/staff', data).then(res => res.data),
  updateStaff: (id: string, data: any) => api.put(`/staff/${id}`, data).then(res => res.data),
  deleteStaff: (id: string) => api.delete(`/staff/${id}`).then(res => res.data),
  getDepartments: () => api.get('/departments').then(res => res.data),
  getDepartmentById: (id: string) => api.get(`/departments/${id}`).then(res => res.data),
  getTimekeeping: () => api.get('/timekeeping').then(res => res.data),
  createTimekeeping: (data: any) => api.post('/timekeeping', data).then(res => res.data),
  getLeaveRequests: () => api.get('/leave-requests').then(res => res.data),
  createLeaveRequest: (data: any) => api.post('/leave-requests', data).then(res => res.data),
  updateLeaveRequest: (id: string, data: any) => api.put(`/leave-requests/${id}`, data).then(res => res.data),
};

export const logApi = {
  getAll: () => api.get('/logs').then(res => res.data),
};

export default api;
