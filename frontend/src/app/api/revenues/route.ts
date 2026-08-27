export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';
import type { Revenue } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.revenues);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newRevenue: Revenue = {
    id: `REV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    ...body,
  };
  db.revenues.push(newRevenue);

  // Cập nhật công nợ
  const debt = db.debts.find(d => d.profileId === newRevenue.profileId || d.lawsuitId === newRevenue.lawsuitId);
  if (debt) {
    debt.paidAmount += newRevenue.amount;
    debt.remainAmount = Math.max(0, debt.totalAmount - debt.paidAmount);
    debt.status = debt.remainAmount <= 0 ? 'Đã thanh toán' : 'Đã thanh toán một phần';
  }

  logAction('NV-004', 'Kế toán', 'Ghi nhận doanh thu', `${newRevenue.amount.toLocaleString('vi-VN')}đ`);
  return NextResponse.json(newRevenue, { status: 201 });
}
