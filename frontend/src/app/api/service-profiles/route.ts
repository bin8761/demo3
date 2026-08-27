import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';
import type { ServiceProfile, Debt } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.serviceProfiles);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const id = `HS-2026-${String(db.serviceProfiles.length + 1).padStart(3, '0')}`;
  const newProfile: ServiceProfile = {
    id,
    createdAt: new Date().toISOString().split('T')[0],
    ...body,
  };
  db.serviceProfiles.push(newProfile);

  // Tạo công nợ tự động
  const newDebt: Debt = {
    id: `CN-${Date.now()}`,
    customerId: newProfile.customerId,
    profileId: newProfile.id,
    totalAmount: newProfile.price,
    paidAmount: 0,
    remainAmount: newProfile.price,
    deadline: newProfile.deadline,
    status: 'Chưa thanh toán',
  };
  db.debts.push(newDebt);

  logAction('NV-001', 'Admin', 'Tạo hồ sơ dịch vụ', newProfile.title);
  return NextResponse.json(newProfile, { status: 201 });
}
