export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const schedule = db.schedules.find(s => s.id === id);
  if (!schedule) return NextResponse.json({ message: 'Không tìm thấy lịch hẹn' }, { status: 404 });
  return NextResponse.json(schedule);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.schedules.findIndex(s => s.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy lịch hẹn' }, { status: 404 });
  const body = await request.json();
  db.schedules[index] = { ...db.schedules[index], ...body };
  logAction('NV-001', 'Admin', 'Cập nhật lịch làm việc', db.schedules[index].title);
  return NextResponse.json(db.schedules[index]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.schedules.findIndex(s => s.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy' }, { status: 404 });
  const deleted = db.schedules.splice(index, 1)[0];
  logAction('NV-001', 'Admin', 'Xóa lịch làm việc', deleted.title);
  return NextResponse.json({ message: 'Đã xóa' });
}
