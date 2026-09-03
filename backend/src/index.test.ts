import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from './index';

describe('Backend Express API & JWT Auth & RBAC Tests', () => {
  let adminToken = '';
  let staffToken = '';

  beforeAll(async () => {
    // 1. Đăng nhập tài khoản Giám đốc (NV-001)
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'truong.nv@lawfirm.com',
      password: '123456'
    });
    expect(adminRes.status).toBe(200);
    expect(adminRes.body).toHaveProperty('token');
    adminToken = adminRes.body.token;

    // 2. Đăng nhập tài khoản Nhân viên (NV-005)
    const staffRes = await request(app).post('/api/auth/login').send({
      email: 'su.hv@lawfirm.com',
      password: '123456'
    });
    expect(staffRes.status).toBe(200);
    expect(staffRes.body).toHaveProperty('token');
    staffToken = staffRes.body.token;
  });

  describe('AUTH APIs (/api/auth)', () => {
    it('should return user info for valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('truong.nv@lawfirm.com');
      expect(res.body.user.role).toBe('Giám đốc');
    });

    it('should reject unauthorized request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('DASHBOARD API (/api/dashboard)', () => {
    it('should return dashboard statistics for authenticated user', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalCustomers');
      expect(res.body).toHaveProperty('activeProfiles');
      expect(res.body).toHaveProperty('activeLawsuits');
    });
  });

  describe('CUSTOMERS API (/api/customers)', () => {
    it('should return list of customers for authenticated user', async () => {
      const res = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should create a new customer', async () => {
      const newCustomer = {
        name: 'Lê Văn Test',
        phone: '0933333333',
        email: 'lvt@gmail.com',
        cccd: '012345678999',
        address: '789 Nguyễn Chí Thanh, Hà Nội',
        type: 'Cá nhân'
      };
      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCustomer);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Lê Văn Test');
    });
  });

  describe('RBAC PERMISSIONS (Tài chính & Doanh thu)', () => {
    it('should allow Admin/Manager to access revenues', async () => {
      const res = await request(app)
        .get('/api/revenues')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should block regular staff from accessing revenues', async () => {
      const res = await request(app)
        .get('/api/revenues')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });
  });
});
