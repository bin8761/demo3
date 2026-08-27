import express, { Request, Response } from 'express';
import cors from 'cors';
import { db, initMockData } from './db';
import { Customer, ServiceProfile, Lawsuit, Task, Revenue, Expense, Debt, Schedule, ChatMessage, Document, Contract } from './types';

// Khởi tạo data 1 lần duy nhất (tránh init lại khi hot-reload)
if (db.customers.length === 0) {
  initMockData();
}

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

function logAction(staffId: string, staffName: string, action: string, target: string) {
  db.systemLogs.unshift({
    id: `LOG-${Date.now()}`,
    staffId,
    staffName,
    action,
    target,
    timestamp: new Date().toISOString()
  });
}

app.get('/api/dashboard', (req: Request, res: Response) => {
  const totalCustomers = db.customers.length;
  const activeProfiles = db.serviceProfiles.filter(p => p.status !== 'Hoàn thành' && p.status !== 'Đóng hồ sơ').length;
  const activeLawsuits = db.lawsuits.filter(l => l.status !== 'Hoàn thành' && l.status !== 'Đóng hồ sơ').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = db.tasks.filter(t => t.status !== 'Hoàn thành' && t.status !== 'Hủy');
  const overdueTasksCount = pendingTasks.filter(t => t.deadline < todayStr).length;
  const currentMonthStr = todayStr.substring(0, 7);
  const monthlyRevenue = db.revenues.filter(r => r.date.startsWith(currentMonthStr)).reduce((sum, r) => sum + r.amount, 0);
  const monthlyExpense = db.expenses.filter(e => e.date.startsWith(currentMonthStr)).reduce((sum, e) => sum + e.amount, 0);
  const totalDebt = db.debts.reduce((sum, d) => sum + d.remainAmount, 0);
  const schedulesToday = db.schedules.filter(s => s.dateTime.startsWith(todayStr));
  const recentActivities = db.systemLogs.slice(0, 5);
  res.json({ totalCustomers, activeProfiles, activeLawsuits, overdueTasksCount, monthlyRevenue, monthlyExpense, totalDebt, schedulesToday, recentActivities });
});

app.get('/api/customers', (req: Request, res: Response) => { res.json(db.customers); });
app.get('/api/customers/:id', (req: Request, res: Response) => {
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
  const profiles = db.serviceProfiles.filter(p => p.customerId === customer.id);
  const lawsuits = db.lawsuits.filter(l => l.customerId === customer.id);
  const contracts = db.contracts.filter(c => c.customerId === customer.id);
  const debts = db.debts.filter(d => d.customerId === customer.id);
  const revenues = db.revenues.filter(r => r.customerId === customer.id);
  const schedules = db.schedules.filter(s => s.customerId === customer.id);
  res.json({ ...customer, profiles, lawsuits, contracts, debts, revenues, schedules });
});
app.post('/api/customers', (req: Request, res: Response) => {
  const newCustomer: Customer = { id: `KH-${String(db.customers.length + 1).padStart(3, '0')}`, createdAt: new Date().toISOString().split('T')[0], ...req.body };
  db.customers.push(newCustomer);
  logAction('NV-001', 'Admin', 'Thêm khách hàng', newCustomer.name);
  res.status(201).json(newCustomer);
});
app.put('/api/customers/:id', (req: Request, res: Response) => {
  const index = db.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
  db.customers[index] = { ...db.customers[index], ...req.body };
  logAction('NV-001', 'Admin', 'Cập nhật khách hàng', db.customers[index].name);
  res.json(db.customers[index]);
});
app.delete('/api/customers/:id', (req: Request, res: Response) => {
  const index = db.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
  const deleted = db.customers.splice(index, 1)[0];
  logAction('NV-001', 'Admin', 'Xóa khách hàng', deleted.name);
  res.json({ message: 'Xóa khách hàng thành công' });
});

app.get('/api/service-profiles', (req: Request, res: Response) => { res.json(db.serviceProfiles); });
app.get('/api/service-profiles/:id', (req: Request, res: Response) => {
  const profile = db.serviceProfiles.find(p => p.id === req.params.id);
  if (!profile) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
  const customer = db.customers.find(c => c.id === profile.customerId);
  const manager = db.staff.find(s => s.id === profile.managerId);
  const tasks = db.tasks.filter(t => t.profileId === profile.id);
  const chatMessages = db.chatMessages.filter(msg => msg.channelType === 'profile' && msg.channelId === profile.id);
  const documents = db.documents.filter(doc => doc.profileId === profile.id);
  const revenues = db.revenues.filter(rev => rev.profileId === profile.id);
  const expenses = db.expenses.filter(exp => exp.profileId === profile.id);
  const debt = db.debts.find(d => d.profileId === profile.id);
  res.json({ ...profile, customer, manager, tasks, chatMessages, documents, revenues, expenses, debt });
});
app.post('/api/service-profiles', (req: Request, res: Response) => {
  const id = `HS-2026-${String(db.serviceProfiles.length + 1).padStart(3, '0')}`;
  const newProfile: ServiceProfile = { id, createdAt: new Date().toISOString().split('T')[0], ...req.body };
  db.serviceProfiles.push(newProfile);
  const newDebt: Debt = { id: `CN-${Date.now()}`, customerId: newProfile.customerId, profileId: newProfile.id, totalAmount: newProfile.price, paidAmount: 0, remainAmount: newProfile.price, deadline: newProfile.deadline, status: 'Chưa thanh toán' };
  db.debts.push(newDebt);
  logAction('NV-001', 'Admin', 'Tạo hồ sơ dịch vụ', newProfile.title);
  res.status(201).json(newProfile);
});
app.put('/api/service-profiles/:id', (req: Request, res: Response) => {
  const index = db.serviceProfiles.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
  db.serviceProfiles[index] = { ...db.serviceProfiles[index], ...req.body };
  const debt = db.debts.find(d => d.profileId === req.params.id);
  if (debt) {
    debt.totalAmount = db.serviceProfiles[index].price;
    debt.remainAmount = debt.totalAmount - debt.paidAmount;
    if (debt.remainAmount <= 0) debt.status = 'Đã thanh toán';
    else if (debt.paidAmount > 0) debt.status = 'Đã thanh toán một phần';
    else debt.status = 'Chưa thanh toán';
  }
  logAction('NV-001', 'Admin', 'Cập nhật hồ sơ dịch vụ', db.serviceProfiles[index].title);
  res.json(db.serviceProfiles[index]);
});

app.get('/api/lawsuits', (req: Request, res: Response) => { res.json(db.lawsuits); });
app.get('/api/lawsuits/:id', (req: Request, res: Response) => {
  const lawsuit = db.lawsuits.find(l => l.id === req.params.id);
  if (!lawsuit) return res.status(404).json({ message: 'Không tìm thấy vụ án' });
  const customer = db.customers.find(c => c.id === lawsuit.customerId);
  const lawyer = db.staff.find(s => s.id === lawsuit.lawyerId);
  const support = db.staff.find(s => s.id === lawsuit.supportId);
  const tasks = db.tasks.filter(t => t.lawsuitId === lawsuit.id);
  const chatMessages = db.chatMessages.filter(msg => msg.channelType === 'lawsuit' && msg.channelId === lawsuit.id);
  const documents = db.documents.filter(doc => doc.lawsuitId === lawsuit.id);
  const revenues = db.revenues.filter(rev => rev.lawsuitId === lawsuit.id);
  const expenses = db.expenses.filter(exp => exp.lawsuitId === lawsuit.id);
  const debt = db.debts.find(d => d.lawsuitId === lawsuit.id);
  const schedules = db.schedules.filter(s => s.lawsuitId === lawsuit.id);
  res.json({ ...lawsuit, customer, lawyer, support, tasks, chatMessages, documents, revenues, expenses, debt, schedules });
});
app.post('/api/lawsuits', (req: Request, res: Response) => {
  const id = `VA-2026-${String(db.lawsuits.length + 1).padStart(3, '0')}`;
  const newLawsuit: Lawsuit = { id, createdAt: new Date().toISOString().split('T')[0], ...req.body };
  db.lawsuits.push(newLawsuit);
  const price = req.body.price || 30000000;
  const newDebt: Debt = { id: `CN-${Date.now()}`, customerId: newLawsuit.customerId, lawsuitId: newLawsuit.id, totalAmount: price, paidAmount: 0, remainAmount: price, deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], status: 'Chưa thanh toán' };
  db.debts.push(newDebt);
  logAction('NV-001', 'Admin', 'Tạo vụ án tố tụng', newLawsuit.title);
  res.status(201).json(newLawsuit);
});
app.put('/api/lawsuits/:id', (req: Request, res: Response) => {
  const index = db.lawsuits.findIndex(l => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy vụ án' });
  db.lawsuits[index] = { ...db.lawsuits[index], ...req.body };
  logAction('NV-001', 'Admin', 'Cập nhật vụ án', db.lawsuits[index].title);
  res.json(db.lawsuits[index]);
});

app.get('/api/tasks', (req: Request, res: Response) => {
  const todayStr = new Date().toISOString().split('T')[0];
  db.tasks.forEach(task => { if (task.status !== 'Hoàn thành' && task.status !== 'Hủy' && task.deadline < todayStr) task.status = 'Quá hạn'; });
  res.json(db.tasks);
});
app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Không tìm thấy công việc' });
  res.json(task);
});
app.post('/api/tasks', (req: Request, res: Response) => {
  const newTask: Task = { id: `CV-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], ...req.body };
  db.tasks.push(newTask);
  logAction('NV-001', 'Admin', 'Giao công việc mới', newTask.title);
  res.status(201).json(newTask);
});
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy công việc' });
  db.tasks[index] = { ...db.tasks[index], ...req.body };
  logAction('NV-001', 'Admin', 'Cập nhật công việc', db.tasks[index].title);
  res.json(db.tasks[index]);
});
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy công việc' });
  db.tasks.splice(index, 1);
  res.json({ message: 'Xóa công việc thành công' });
});

app.get('/api/schedules', (req: Request, res: Response) => { res.json(db.schedules); });
app.get('/api/schedules/:id', (req: Request, res: Response) => {
  const schedule = db.schedules.find(s => s.id === req.params.id);
  if (!schedule) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
  res.json(schedule);
});
app.post('/api/schedules', (req: Request, res: Response) => {
  const newSchedule: Schedule = { id: `L-${Date.now()}`, ...req.body };
  db.schedules.push(newSchedule);
  logAction('NV-001', 'Admin', 'Tạo lịch làm việc mới', newSchedule.title);
  res.status(201).json(newSchedule);
});
app.put('/api/schedules/:id', (req: Request, res: Response) => {
  const index = db.schedules.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
  db.schedules[index] = { ...db.schedules[index], ...req.body };
  res.json(db.schedules[index]);
});
app.delete('/api/schedules/:id', (req: Request, res: Response) => {
  const index = db.schedules.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
  db.schedules.splice(index, 1);
  res.json({ message: 'Xóa lịch hẹn thành công' });
});

app.get('/api/chat', (req: Request, res: Response) => {
  const { channelType, channelId } = req.query;
  if (!channelType || !channelId) return res.json(db.chatMessages);
  const messages = db.chatMessages.filter(m => m.channelType === channelType && m.channelId === channelId);
  res.json(messages);
});
app.post('/api/chat', (req: Request, res: Response) => {
  const sender = db.staff.find(s => s.id === req.body.senderId) || { name: 'Người dùng' };
  const newMessage: ChatMessage = { id: `MSG-${Date.now()}`, senderName: sender.name, createdAt: new Date().toISOString(), ...req.body };
  db.chatMessages.push(newMessage);
  res.status(201).json(newMessage);
});

app.get('/api/documents', (req: Request, res: Response) => { res.json(db.documents); });
app.post('/api/documents', (req: Request, res: Response) => {
  const newDoc: Document = { id: `DOC-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], ...req.body };
  db.documents.push(newDoc);
  logAction(newDoc.uploadedBy, 'Nhân viên', 'Tải lên tài liệu', newDoc.name);
  res.status(201).json(newDoc);
});

app.get('/api/revenues', (req: Request, res: Response) => { res.json(db.revenues); });
app.post('/api/revenues', (req: Request, res: Response) => {
  const newRev: Revenue = { id: `REV-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...req.body };
  db.revenues.push(newRev);
  const debt = db.debts.find(d => {
    if (newRev.profileId) return d.profileId === newRev.profileId;
    if (newRev.lawsuitId) return d.lawsuitId === newRev.lawsuitId;
    return d.customerId === newRev.customerId && !d.profileId && !d.lawsuitId;
  });
  if (debt) {
    debt.paidAmount += newRev.amount;
    debt.remainAmount = debt.totalAmount - debt.paidAmount;
    if (debt.remainAmount <= 0) { debt.remainAmount = 0; debt.status = 'Đã thanh toán'; } else debt.status = 'Đã thanh toán một phần';
  }
  logAction(newRev.collectorId, 'Kế toán', 'Ghi nhận doanh thu', `Thu ${newRev.amount.toLocaleString()}đ từ khách hàng`);
  res.status(201).json(newRev);
});
app.get('/api/expenses', (req: Request, res: Response) => { res.json(db.expenses); });
app.post('/api/expenses', (req: Request, res: Response) => {
  const newExp: Expense = { id: `EXP-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...req.body };
  db.expenses.push(newExp);
  logAction(newExp.spenderId, 'Nhân viên', 'Ghi nhận chi phí', `${newExp.content} (${newExp.amount.toLocaleString()}đ)`);
  res.status(201).json(newExp);
});
app.get('/api/debts', (req: Request, res: Response) => {
  const todayStr = new Date().toISOString().split('T')[0];
  db.debts.forEach(d => { if (d.status !== 'Đã thanh toán' && d.deadline < todayStr) d.status = 'Quá hạn'; });
  res.json(db.debts);
});

app.get('/api/contracts', (req: Request, res: Response) => { res.json(db.contracts); });
app.get('/api/contracts/:id', (req: Request, res: Response) => {
  const contract = db.contracts.find(c => c.id === req.params.id);
  if (!contract) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
  res.json(contract);
});
app.post('/api/contracts', (req: Request, res: Response) => {
  const newContract: Contract = { id: `HD-${Date.now()}`, ...req.body };
  db.contracts.push(newContract);
  logAction('NV-001', 'Admin', 'Tạo hợp đồng mới', newContract.title);
  res.status(201).json(newContract);
});
app.put('/api/contracts/:id', (req: Request, res: Response) => {
  const index = db.contracts.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
  db.contracts[index] = { ...db.contracts[index], ...req.body };
  res.json(db.contracts[index]);
});
app.delete('/api/contracts/:id', (req: Request, res: Response) => {
  const index = db.contracts.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
  db.contracts.splice(index, 1);
  res.json({ message: 'Xóa hợp đồng thành công' });
});

app.get('/api/staff', (req: Request, res: Response) => { res.json(db.staff); });
app.get('/api/staff/:id', (req: Request, res: Response) => {
  const staff = db.staff.find(s => s.id === req.params.id);
  if (!staff) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
  res.json(staff);
});
app.post('/api/staff', (req: Request, res: Response) => {
  const newId = `NV-${String(db.staff.length + 1).padStart(3, '0')}`;
  const newStaff = { id: newId, ...req.body };
  db.staff.push(newStaff);
  res.status(201).json(newStaff);
});
app.put('/api/staff/:id', (req: Request, res: Response) => {
  const index = db.staff.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
  db.staff[index] = { ...db.staff[index], ...req.body };
  res.json(db.staff[index]);
});
app.delete('/api/staff/:id', (req: Request, res: Response) => {
  const index = db.staff.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
  db.staff.splice(index, 1);
  res.json({ message: 'Xóa nhân viên thành công' });
});
app.get('/api/departments', (req: Request, res: Response) => { res.json(db.departments); });
app.get('/api/departments/:id', (req: Request, res: Response) => {
  const dept = db.departments.find(d => d.id === req.params.id);
  if (!dept) return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
  const staff = db.staff.filter(s => s.departmentId === dept.id);
  const tasks = db.tasks.filter(t => t.departmentId === dept.id);
  const profiles = db.serviceProfiles.filter(p => { const mgr = db.staff.find(s => s.id === p.managerId); return mgr?.departmentId === dept.id; });
  const lawsuits = db.lawsuits.filter(l => { const lawyer = db.staff.find(s => s.id === l.lawyerId); return lawyer?.departmentId === dept.id; });
  res.json({ ...dept, staff, tasks, profiles, lawsuits });
});

app.get('/api/timekeeping', (req: Request, res: Response) => { res.json(db.timekeeping); });
app.post('/api/timekeeping', (req: Request, res: Response) => {
  const newTk = { id: `CC-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...req.body };
  db.timekeeping.push(newTk);
  res.status(201).json(newTk);
});
app.get('/api/leave-requests', (req: Request, res: Response) => { res.json(db.leaveRequests); });
app.post('/api/leave-requests', (req: Request, res: Response) => {
  const newLeave = { id: `NP-${Date.now()}`, ...req.body };
  db.leaveRequests.push(newLeave);
  res.status(201).json(newLeave);
});
app.put('/api/leave-requests/:id', (req: Request, res: Response) => {
  const index = db.leaveRequests.findIndex(l => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy đơn xin nghỉ' });
  db.leaveRequests[index] = { ...db.leaveRequests[index], ...req.body };
  res.json(db.leaveRequests[index]);
});
app.get('/api/logs', (req: Request, res: Response) => { res.json(db.systemLogs); });
app.get('/api/health', (req: Request, res: Response) => { res.json({ status: 'ok' }); });

export default app;
