import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const task = db.tasks.find(t => t.id === id);
  if (!task) return NextResponse.json({ message: 'Không tìm thấy công việc' }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.tasks.findIndex(t => t.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy công việc' }, { status: 404 });
  const body = await request.json();
  db.tasks[index] = { ...db.tasks[index], ...body };
  logAction('NV-001', 'Admin', 'Cập nhật công việc', db.tasks[index].title);
  return NextResponse.json(db.tasks[index]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.tasks.findIndex(t => t.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy' }, { status: 404 });
  const deleted = db.tasks.splice(index, 1)[0];
  logAction('NV-001', 'Admin', 'Xóa công việc', deleted.title);
  return NextResponse.json({ message: 'Đã xóa' });
}
