import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lawfirm_backend_express_secret_jwt_key_2026';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Bearer Header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập để truy cập tài nguyên này' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token xác thực không hợp lệ hoặc đã hết hạn' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa xác thực người dùng' });
    }

    // Giám đốc luôn có toàn quyền
    if (req.user.role === 'Giám đốc' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này' });
  };
}

export function isManagerOrAdminUser(user?: AuthUser): boolean {
  if (!user) return false;
  return ['Giám đốc', 'Phó Giám đốc', 'Trưởng phòng'].includes(user.role);
}
