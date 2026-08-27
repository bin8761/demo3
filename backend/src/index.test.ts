import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from './index';
import { db, initMockData, resetDB } from './db';

describe('Backend API Tests', () => {
  beforeAll(() => {
    resetDB();
    initMockData();
  });

  describe('GET /api/dashboard', () => {
    it('should return dashboard statistics', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalCustomers');
      expect(res.body).toHaveProperty('activeProfiles');
      expect(res.body).toHaveProperty('activeLawsuits');
      expect(res.body).toHaveProperty('monthlyRevenue');
      expect(res.body).toHaveProperty('monthlyExpense');
      expect(res.body).toHaveProperty('totalDebt');
      expect(res.body.totalCustomers).toBeGreaterThan(0);
    });
  });

  describe('Customers API', () => {
    it('should return list of customers', async () => {
      const res = await request(app).get('/api/customers');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should create a new customer', async () => {
      const newCustomer = {
        name: 'Lê Văn C',
        phone: '0933333333',
        email: 'lvc@gmail.com',
        cccd: '012345678999',
        address: '789 Nguyễn Chí Thanh, Hà Nội',
        type: 'Cá nhân',
        notes: 'Khách hàng test'
      };
      const res = await request(app).post('/api/customers').send(newCustomer);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Lê Văn C');
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('Tài chính & Tự động cập nhật Công nợ', () => {
    it('should automatically update Debt when a new Revenue is recorded', async () => {
      // 1. Lấy thông tin công nợ ban đầu của HS-2026-001
      // HS-2026-001 ban đầu trị giá 15M, đã trả 10M, còn nợ 5M.
      const initialDebt = db.debts.find(d => d.profileId === 'HS-2026-001');
      expect(initialDebt).toBeDefined();
      expect(initialDebt?.remainAmount).toBe(5000000);

      // 2. Ghi nhận doanh thu mới 5,000,000đ cho HS-2026-001
      const newRevenue = {
        customerId: 'KH-001',
        profileId: 'HS-2026-001',
        amount: 5000000,
        collectorId: 'NV-004',
        paymentMethod: 'Chuyển khoản',
        notes: 'Thu nốt công nợ còn lại'
      };

      const res = await request(app).post('/api/revenues').send(newRevenue);
      expect(res.status).toBe(201);

      // 3. Kiểm tra công nợ sau khi thu tiền
      const updatedDebt = db.debts.find(d => d.profileId === 'HS-2026-001');
      expect(updatedDebt?.paidAmount).toBe(15000000);
      expect(updatedDebt?.remainAmount).toBe(0);
      expect(updatedDebt?.status).toBe('Đã thanh toán');
    });
  });
});
