export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const profile = db.serviceProfiles.find(p => p.id === id);
  if (!profile) return NextResponse.json({ message: 'Không tìm thấy hồ sơ' }, { status: 404 });

  const customer = db.customers.find(c => c.id === profile.customerId);
  const manager = db.staff.find(s => s.id === profile.managerId);
  const tasks = db.tasks.filter(t => t.profileId === profile.id);
  const chatMessages = db.chatMessages.filter(m => m.channelType === 'profile' && m.channelId === profile.id);
  const documents = db.documents.filter(d => d.profileId === profile.id);
  const revenues = db.revenues.filter(r => r.profileId === profile.id);
  const expenses = db.expenses.filter(e => e.profileId === profile.id);
  const debt = db.debts.find(d => d.profileId === profile.id);

  return NextResponse.json({ ...profile, customer, manager, tasks, chatMessages, documents, revenues, expenses, debt });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.serviceProfiles.findIndex(p => p.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy hồ sơ' }, { status: 404 });
  const body = await request.json();
  db.serviceProfiles[index] = { ...db.serviceProfiles[index], ...body };

  const debt = db.debts.find(d => d.profileId === id);
  if (debt) {
    debt.totalAmount = db.serviceProfiles[index].price;
    debt.remainAmount = debt.totalAmount - debt.paidAmount;
    debt.status = debt.remainAmount <= 0 ? 'Đã thanh toán' : debt.paidAmount > 0 ? 'Đã thanh toán một phần' : 'Chưa thanh toán';
  }

  logAction('NV-001', 'Admin', 'Cập nhật hồ sơ dịch vụ', db.serviceProfiles[index].title);
  return NextResponse.json(db.serviceProfiles[index]);
}
