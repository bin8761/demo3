import express, { Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';
import authRouter from './routes/auth';
import { authenticateJWT, requireRole, isManagerOrAdminUser, AuthenticatedRequest } from './middleware/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Logging helper
async function logAction(staffId: string, action: string, target: string) {
  try {
    await prisma.activityLog.create({
      data: { staffId, action, target }
    });
  } catch (e) {
    console.error('Failed to log action:', e);
  }
}

// ----------------------------------------------------
// AUTH ROUTER (/api/auth)
// ----------------------------------------------------
app.use('/api/auth', authRouter);

// ----------------------------------------------------
// DASHBOARD ENDPOINT (Có RBAC)
// ----------------------------------------------------
app.get('/api/dashboard', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);

    // Xây dựng điều kiện lọc dữ liệu theo quyền RBAC
    let profileWhere: any = {};
    let lawsuitWhere: any = {};
    let taskWhere: any = {};

    if (user.role === 'Nhân viên' || user.role === 'Luật sư') {
      profileWhere = { managerId: user.id };
      lawsuitWhere = { lawyerId: user.id };
      taskWhere = { assigneeId: user.id };
    } else if (user.role === 'Trưởng phòng') {
      profileWhere = {
        OR: [
          { managerId: user.id },
          { serviceType: user.departmentId === 'doanh-nghiep' ? 'Doanh nghiệp' : { not: 'Doanh nghiệp' } }
        ]
      };
      lawsuitWhere = user.departmentId === 'to-tung' ? {} : { lawyerId: user.id };
      taskWhere = { OR: [{ departmentId: user.departmentId }, { assigneeId: user.id }] };
    }

    const totalCustomers = await prisma.customer.count();
    const activeProfiles = await prisma.serviceProfile.count({
      where: { ...profileWhere, status: { notIn: ['Hoàn thành', 'Đóng hồ sơ'] } }
    });
    const activeLawsuits = await prisma.lawsuit.count({
      where: { ...lawsuitWhere, status: { notIn: ['Hoàn thành', 'Đóng hồ sơ'] } }
    });

    const pendingTasks = await prisma.task.findMany({
      where: { ...taskWhere, status: { notIn: ['Hoàn thành', 'Hủy'] } }
    });
    const overdueTasksCount = pendingTasks.filter(t => t.deadline < todayStr).length;

    // Doanh thu & chi phí (Chỉ thống kê nếu có quyền tài chính)
    let monthlyRevenue = 0;
    let monthlyExpense = 0;
    let totalDebt = 0;

    if (isManagerOrAdminUser(user)) {
      const revenues = await prisma.revenue.findMany({
        where: { date: { startsWith: currentMonthStr } }
      });
      monthlyRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

      const expenses = await prisma.expense.findMany({
        where: { date: { startsWith: currentMonthStr } }
      });
      monthlyExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

      const debts = await prisma.debt.findMany();
      totalDebt = debts.reduce((sum, d) => sum + d.remainAmount, 0);
    }

    const schedulesToday = await prisma.schedule.findMany({
      where: { date: todayStr }
    });

    const recentActivities = await prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      totalCustomers,
      activeProfiles,
      activeLawsuits,
      pendingTasksCount: pendingTasks.length,
      overdueTasksCount,
      monthlyRevenue,
      monthlyExpense,
      totalDebt,
      schedulesToday,
      recentActivities
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Lỗi tải thống kê Dashboard từ CSDL MySQL' });
  }
});

// ----------------------------------------------------
// STAFF APIs (Quản lý Nhân sự - RBAC)
// ----------------------------------------------------
app.get('/api/staff', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const staff = await prisma.staff.findMany({
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
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(staff);
});

app.post('/api/staff', authenticateJWT, requireRole(['Giám đốc', 'Phó Giám đốc', 'Trưởng phòng']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const hashedPassword = await bcrypt.hash(data.password || '123456', 10);

    const newStaff = await prisma.staff.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        departmentId: data.departmentId,
        phone: data.phone || '',
        hireDate: data.hireDate || new Date().toISOString().split('T')[0],
        status: data.status || 'Đang làm việc'
      }
    });

    await logAction(req.user!.id, 'Thêm nhân sự mới', newStaff.name);
    const { password, ...result } = newStaff;
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: 'Tạo nhân sự mới thất bại. Email có thể đã tồn tại.' });
  }
});

app.put('/api/staff/:id', authenticateJWT, requireRole(['Giám đốc', 'Phó Giám đốc', 'Trưởng phòng']), async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const data = req.body;

  try {
    let updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.staff.update({
      where: { id },
      data: updateData
    });

    await logAction(req.user!.id, 'Cập nhật nhân sự', updated.name);
    const { password, ...result } = updated;
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: 'Cập nhật nhân sự thất bại' });
  }
});

// ----------------------------------------------------
// CUSTOMERS APIs
// ----------------------------------------------------
app.get('/api/customers', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(customers);
});

app.post('/api/customers', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const newCust = await prisma.customer.create({
      data: {
        name: data.name,
        type: data.type || 'Cá nhân',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        taxId: data.taxId || data.cccd || '',
        representative: data.representative || ''
      }
    });
    await logAction(req.user!.id, 'Tạo khách hàng mới', newCust.name);
    res.status(201).json(newCust);
  } catch (e) {
    res.status(400).json({ error: 'Thêm khách hàng thất bại' });
  }
});

// ----------------------------------------------------
// SERVICE PROFILES APIs (Hồ sơ dịch vụ - RBAC)
// ----------------------------------------------------
app.get('/api/service-profiles', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let whereCondition: any = {};

  if (user.role === 'Nhân viên' || user.role === 'Luật sư') {
    whereCondition = { managerId: user.id };
  } else if (user.role === 'Trưởng phòng') {
    whereCondition = {
      OR: [
        { managerId: user.id },
        { serviceType: user.departmentId === 'doanh-nghiep' ? 'Doanh nghiệp' : { not: 'Doanh nghiệp' } }
      ]
    };
  }

  const profiles = await prisma.serviceProfile.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' }
  });
  res.json(profiles);
});

app.post('/api/service-profiles', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const newProfile = await prisma.serviceProfile.create({
      data: {
        title: data.title,
        customerId: data.customerId,
        contractNumber: data.contractNumber || '',
        serviceType: data.serviceType || 'Khác',
        managerId: data.managerId || req.user!.id,
        price: parseFloat(data.price || 0),
        status: data.status || 'Mới tiếp nhận',
        notes: data.notes || '',
        receiveDate: data.receiveDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || ''
      }
    });
    await logAction(req.user!.id, 'Tạo hồ sơ dịch vụ', newProfile.title);
    res.status(201).json(newProfile);
  } catch (e) {
    res.status(400).json({ error: 'Tạo hồ sơ dịch vụ thất bại' });
  }
});

app.put('/api/service-profiles/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const data = req.body;
  try {
    const updated = await prisma.serviceProfile.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.status && { status: data.status }),
        ...(data.contractNumber !== undefined && { contractNumber: data.contractNumber }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.price !== undefined && { price: parseFloat(data.price || 0) }),
        ...(data.managerId && { managerId: data.managerId })
      }
    });
    await logAction(req.user!.id, 'Cập nhật hồ sơ dịch vụ', updated.title);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'Cập nhật thất bại' });
  }
});

// ----------------------------------------------------
// LAWSUITS APIs (Vụ án tố tụng - RBAC)
// ----------------------------------------------------
app.get('/api/lawsuits', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let whereCondition: any = {};

  if (user.role === 'Nhân viên' || user.role === 'Luật sư') {
    whereCondition = { lawyerId: user.id };
  } else if (user.role === 'Trưởng phòng' && user.departmentId !== 'to-tung') {
    whereCondition = { lawyerId: user.id };
  }

  const lawsuits = await prisma.lawsuit.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' }
  });
  res.json(lawsuits);
});

app.post('/api/lawsuits', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const newLawsuit = await prisma.lawsuit.create({
      data: {
        title: data.title,
        customerId: data.customerId,
        contractNumber: data.contractNumber || '',
        lawyerId: data.lawyerId || req.user!.id,
        advancePayment: parseFloat(data.advancePayment || 0),
        status: data.status || 'Mới tiếp nhận',
        notes: data.notes || '',
        receiveDate: data.receiveDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || ''
      }
    });
    await logAction(req.user!.id, 'Tạo vụ án mới', newLawsuit.title);
    res.status(201).json(newLawsuit);
  } catch (e) {
    res.status(400).json({ error: 'Tạo vụ án thất bại' });
  }
});

// ----------------------------------------------------
// TASKS APIs (Công việc - RBAC)
// ----------------------------------------------------
app.get('/api/tasks', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let whereCondition: any = {};

  if (user.role === 'Nhân viên' || user.role === 'Luật sư') {
    whereCondition = { assigneeId: user.id };
  } else if (user.role === 'Trưởng phòng') {
    whereCondition = { OR: [{ departmentId: user.departmentId }, { assigneeId: user.id }] };
  }

  const tasks = await prisma.task.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' }
  });
  res.json(tasks);
});

app.post('/api/tasks', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const newTask = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || '',
        assigneeId: data.assigneeId,
        departmentId: data.departmentId || req.user!.departmentId,
        deadline: data.deadline || new Date().toISOString().split('T')[0],
        priority: data.priority || 'Trung bình',
        status: data.status || 'Chưa bắt đầu'
      }
    });
    await logAction(req.user!.id, 'Giao công việc mới', newTask.title);
    res.status(201).json(newTask);
  } catch (e) {
    res.status(400).json({ error: 'Tạo công việc thất bại' });
  }
});

// ----------------------------------------------------
// REVENUES, EXPENSES, DEBTS APIs (Tài chính - Chỉ cho Admin/Manager)
// ----------------------------------------------------
app.get('/api/revenues', authenticateJWT, requireRole(['Giám đốc', 'Phó Giám đốc', 'Trưởng phòng']), async (req: AuthenticatedRequest, res: Response) => {
  const revenues = await prisma.revenue.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(revenues);
});

app.post('/api/revenues', authenticateJWT, requireRole(['Giám đốc', 'Phó Giám đốc', 'Trưởng phòng']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const newRev = await prisma.revenue.create({
      data: {
        customerId: data.customerId,
        amount: parseFloat(data.amount || 0),
        date: data.date || new Date().toISOString().split('T')[0],
        paymentMethod: data.paymentMethod || 'Chuyển khoản',
        notes: data.notes || ''
      }
    });
    await logAction(req.user!.id, 'Ghi nhận doanh thu mới', `${newRev.amount.toLocaleString()}đ`);
    res.status(201).json(newRev);
  } catch (e) {
    res.status(400).json({ error: 'Ghi nhận khoản thu thất bại' });
  }
});

app.get('/api/expenses', authenticateJWT, requireRole(['Giám đốc', 'Phó Giám đốc', 'Trưởng phòng']), async (req: AuthenticatedRequest, res: Response) => {
  const expenses = await prisma.expense.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(expenses);
});

app.get('/api/debts', authenticateJWT, requireRole(['Giám đốc', 'Phó Giám đốc', 'Trưởng phòng']), async (req: AuthenticatedRequest, res: Response) => {
  const debts = await prisma.debt.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(debts);
});

// ----------------------------------------------------
// CONTRACTS & SCHEDULES APIs
// ----------------------------------------------------
app.get('/api/contracts', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const contracts = await prisma.contract.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(contracts);
});

app.get('/api/schedules', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const schedules = await prisma.schedule.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(schedules);
});

app.get('/api/departments', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const departments = await prisma.department.findMany();
  res.json(departments);
});

// ----------------------------------------------------
// DOCUMENTS & FOLDERS APIs
// ----------------------------------------------------
app.get('/api/documents', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const documents = await prisma.document.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(documents);
});

app.post('/api/documents', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const newDoc = await prisma.document.create({
      data: {
        name: data.name,
        fileType: data.fileType || 'pdf',
        fileSize: data.fileSize || '1.2 MB',
        url: data.url || '/uploads/sample.pdf',
        uploadedBy: req.user!.name,
        folderId: data.folderId || null
      }
    });
    await logAction(req.user!.id, 'Tải lên tài liệu', newDoc.name);
    res.status(201).json(newDoc);
  } catch (e) {
    res.status(400).json({ error: 'Tạo tài liệu thất bại' });
  }
});

app.get('/api/folders', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const folders = await prisma.folder.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(folders);
});

app.post('/api/folders', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const newFolder = await prisma.folder.create({
      data: {
        name: data.name,
        parentId: data.parentId || null
      }
    });
    await logAction(req.user!.id, 'Tạo thư mục mới', newFolder.name);
    res.status(201).json(newFolder);
  } catch (e) {
    res.status(400).json({ error: 'Tạo thư mục thất bại' });
  }
});

// ----------------------------------------------------
// ACTIVITY LOGS API
// ----------------------------------------------------
app.get('/api/logs', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json(logs);
});

// ----------------------------------------------------
// TIMEKEEPING & LEAVE REQUESTS APIs
// ----------------------------------------------------
app.get('/api/timekeeping', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const timekeeping = await prisma.timekeeping.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(timekeeping);
});

app.post('/api/timekeeping', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const newTk = await prisma.timekeeping.create({
      data: {
        staffId: req.user!.id,
        date: data.date || new Date().toISOString().split('T')[0],
        checkIn: data.checkIn || '08:00',
        checkOut: data.checkOut || '17:30',
        status: data.status || 'Đúng giờ'
      }
    });
    res.status(201).json(newTk);
  } catch (e) {
    res.status(400).json({ error: 'Chấm công thất bại' });
  }
});

app.get('/api/leave-requests', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const leaveRequests = await prisma.leaveRequest.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(leaveRequests);
});

app.post('/api/leave-requests', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const newLv = await prisma.leaveRequest.create({
      data: {
        staffId: req.user!.id,
        fromDate: data.fromDate,
        toDate: data.toDate,
        reason: data.reason,
        status: 'Chờ duyệt'
      }
    });
    res.status(201).json(newLv);
  } catch (e) {
    res.status(400).json({ error: 'Gửi đơn nghỉ phép thất bại' });
  }
});

// ----------------------------------------------------
// CHAT API
// ----------------------------------------------------
app.get('/api/chat', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { channelType, channelId } = req.query;
  const messages = await prisma.chatMessage.findMany({
    where: {
      ...(channelType && { channelType: String(channelType) }),
      ...(channelId && { channelId: String(channelId) })
    },
    orderBy: { createdAt: 'asc' }
  });
  res.json(messages);
});

app.post('/api/chat', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { channelType, channelId, content } = req.body;
    const newMsg = await prisma.chatMessage.create({
      data: {
        channelType: channelType || 'direct',
        channelId: channelId || 'all',
        senderId: req.user!.id,
        content
      }
    });
    res.status(201).json(newMsg);
  } catch (e) {
    res.status(400).json({ error: 'Gửi tin nhắn thất bại' });
  }
});

// Node/Express Server listen
app.listen(port, () => {
  console.log(`🚀 Backend Express Server running with MySQL & Prisma ORM at http://localhost:${port}`);
});

export default app;
