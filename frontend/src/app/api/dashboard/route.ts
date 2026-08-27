export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized } from '@/lib/db';

export async function GET() {
  ensureInitialized();
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const totalCustomers = db.customers.length;
  const activeProfiles = db.serviceProfiles.filter(p => p.status !== 'Hoàn thành' && p.status !== 'Đóng hồ sơ').length;
  const activeLawsuits = db.lawsuits.filter(l => l.status !== 'Hoàn thành' && l.status !== 'Đóng hồ sơ').length;

  const pendingTasks = db.tasks.filter(t => t.status !== 'Hoàn thành' && t.status !== 'Hủy');
  const overdueTasksCount = pendingTasks.filter(t => t.deadline < todayStr).length;

  const monthlyRevenue = db.revenues
    .filter(r => r.date.startsWith(currentMonthStr))
    .reduce((sum, r) => sum + r.amount, 0);

  const monthlyExpense = db.expenses
    .filter(e => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalDebt = db.debts.reduce((sum, d) => sum + d.remainAmount, 0);
  const schedulesToday = db.schedules.filter(s => s.dateTime.startsWith(todayStr));
  const recentActivities = db.systemLogs.slice(0, 5);

  return NextResponse.json({
    totalCustomers, activeProfiles, activeLawsuits, overdueTasksCount,
    monthlyRevenue, monthlyExpense, totalDebt, schedulesToday, recentActivities,
  });
}
