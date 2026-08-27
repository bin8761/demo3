export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';
import type { Customer } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.customers);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newCustomer: Customer = {
    id: `KH-${String(db.customers.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString().split('T')[0],
    ...body,
  };
  db.customers.push(newCustomer);
  logAction('NV-001', 'Admin', 'Thêm khách hàng', newCustomer.name);
  return NextResponse.json(newCustomer, { status: 201 });
}
