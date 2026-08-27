import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './page';

// Mock các module API để tránh gọi HTTP thực tế
vi.mock('../api', () => ({
  dashboardApi: {
    getStats: vi.fn().mockResolvedValue({
      totalCustomers: 2,
      activeProfiles: 1,
      activeLawsuits: 1,
      overdueTasksCount: 0,
      monthlyRevenue: 10000000,
      monthlyExpense: 2000000,
      totalDebt: 35000000,
      schedulesToday: [],
      recentActivities: []
    })
  },
  customerApi: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue({})
  },
  serviceProfileApi: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue({})
  },
  lawsuitApi: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue({})
  },
  taskApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  scheduleApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  chatApi: {
    getMessages: vi.fn().mockResolvedValue([])
  },
  documentApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  financeApi: {
    getRevenues: vi.fn().mockResolvedValue([]),
    getExpenses: vi.fn().mockResolvedValue([]),
    getDebts: vi.fn().mockResolvedValue([])
  },
  contractApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  hrApi: {
    getStaff: vi.fn().mockResolvedValue([
      { id: 'NV-001', name: 'Nguyễn Văn Trưởng', role: 'Giám đốc', departmentId: 'hanh-chinh' }
    ]),
    getDepartments: vi.fn().mockResolvedValue([]),
    getTimekeeping: vi.fn().mockResolvedValue([]),
    getLeaveRequests: vi.fn().mockResolvedValue([])
  },
  logApi: {
    getAll: vi.fn().mockResolvedValue([])
  }
}));

describe('Frontend page render test', () => {
  it('should render the application dashboard layout', async () => {
    render(<App />);
    
    // Kiểm tra xem logo ứng dụng "LAWFIRM ERP" có xuất hiện không
    const logoText = screen.getByText(/LAWFIRM ERP/i);
    expect(logoText).toBeInTheDocument();

    // Kiểm tra các nhãn thông số trên dashboard có tồn tại hay không
    const customerLabels = screen.getAllByText(/Khách hàng/i);
    expect(customerLabels.length).toBeGreaterThan(0);
  });
});
