import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';
import type { Expense } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.expenses);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newExpense: Expense = {
    id: `EXP-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    ...body,
  };
  db.expenses.push(newExpense);
  logAction('NV-004', 'Kế toán', 'Ghi nhận chi phí', `${newExpense.content} - ${newExpense.amount.toLocaleString('vi-VN')}đ`);
  return NextResponse.json(newExpense, { status: 201 });
}
