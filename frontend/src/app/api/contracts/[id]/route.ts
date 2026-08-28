export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const contract = db.contracts.find(c => c.id === id);
  if (!contract) return NextResponse.json({ message: 'Không tìm thấy hợp đồng' }, { status: 404 });
  return NextResponse.json(contract);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.contracts.findIndex(c => c.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy hợp đồng' }, { status: 404 });
  const body = await request.json();
  db.contracts[index] = { ...db.contracts[index], ...body };
  logAction('NV-001', 'Admin', 'Cập nhật hợp đồng', db.contracts[index].title);
  return NextResponse.json(db.contracts[index]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.contracts.findIndex(c => c.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy' }, { status: 404 });
  const deleted = db.contracts.splice(index, 1)[0];
  logAction('NV-001', 'Admin', 'Xóa hợp đồng', deleted.title);
  return NextResponse.json({ message: 'Đã xóa' });
}
