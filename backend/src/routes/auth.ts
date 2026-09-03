import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lawfirm_backend_express_secret_jwt_key_2026';

// 1. POST /api/auth/login
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập Email và Mật khẩu' });
    }

    const staff = await prisma.staff.findUnique({
      where: { email }
    });

    if (!staff) {
      return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    if (staff.status === 'Đã nghỉ việc') {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa' });
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const payload = {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      departmentId: staff.departmentId
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    return res.json({
      message: 'Đăng nhập thành công',
      user: payload,
      token
    });
  } catch (error: any) {
    console.error('Express Login Error:', error);
    return res.status(500).json({ error: 'Lỗi đăng nhập hệ thống' });
  }
});

// 2. POST /api/auth/logout
router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Đăng xuất thành công' });
});

// 3. GET /api/auth/me
router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  const staff = await prisma.staff.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      phone: true,
      hireDate: true,
      status: true,
      avatar: true
    }
  });

  if (!staff) {
    return res.status(404).json({ error: 'Không tìm thấy thông tin tài khoản' });
  }

  return res.json({ user: staff });
});

// 4. POST /api/auth/register
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role, departmentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu' });
    }

    const existingStaff = await prisma.staff.findUnique({
      where: { email }
    });

    if (existingStaff) {
      return res.status(400).json({ error: 'Email này đã được đăng ký trên hệ thống' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = await prisma.staff.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'Nhân viên',
        departmentId: departmentId || 'van-phong',
        phone: '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'Đang làm việc'
      }
    });

    const payload = {
      id: newStaff.id,
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      departmentId: newStaff.departmentId
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      user: payload,
      token
    });
  } catch (error: any) {
    console.error('Express Register Error:', error);
    return res.status(500).json({ error: 'Đăng ký tài khoản thất bại' });
  }
});

export default router;
