import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';
import type { Lawsuit, Debt } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.lawsuits);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const id = `VA-2026-${String(db.lawsuits.length + 1).padStart(3, '0')}`;
  const newLawsuit: Lawsuit = {
    id,
    createdAt: new Date().toISOString().split('T')[0],
    ...body,
  };
  db.lawsuits.push(newLawsuit);

  const newDebt: Debt = {
    id: `CN-LA-${Date.now()}`,
    customerId: newLawsuit.customerId,
    lawsuitId: newLawsuit.id,
    totalAmount: body.fee || 0,
    paidAmount: 0,
    remainAmount: body.fee || 0,
    deadline: newLawsuit.createdAt,
    status: 'Chưa thanh toán',
  };
  if (body.fee) db.debts.push(newDebt);

  logAction('NV-001', 'Admin', 'Tạo vụ án', newLawsuit.title);
  return NextResponse.json(newLawsuit, { status: 201 });
}
