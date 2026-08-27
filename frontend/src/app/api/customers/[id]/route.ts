export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const customer = db.customers.find(c => c.id === id);
  if (!customer) return NextResponse.json({ message: 'Không tìm thấy khách hàng' }, { status: 404 });

  const profiles = db.serviceProfiles.filter(p => p.customerId === customer.id);
  const lawsuits = db.lawsuits.filter(l => l.customerId === customer.id);
  const contracts = db.contracts.filter(c => c.customerId === customer.id);
  const debts = db.debts.filter(d => d.customerId === customer.id);
  const revenues = db.revenues.filter(r => r.customerId === customer.id);
  const schedules = db.schedules.filter(s => s.customerId === customer.id);

  return NextResponse.json({ ...customer, profiles, lawsuits, contracts, debts, revenues, schedules });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.customers.findIndex(c => c.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy khách hàng' }, { status: 404 });
  const body = await request.json();
  db.customers[index] = { ...db.customers[index], ...body };
  logAction('NV-001', 'Admin', 'Cập nhật khách hàng', db.customers[index].name);
  return NextResponse.json(db.customers[index]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.customers.findIndex(c => c.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy khách hàng' }, { status: 404 });
  const deleted = db.customers.splice(index, 1)[0];
  logAction('NV-001', 'Admin', 'Xóa khách hàng', deleted.name);
  return NextResponse.json({ message: 'Xóa thành công' });
}
