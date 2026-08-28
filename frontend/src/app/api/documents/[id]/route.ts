export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const doc = db.documents.find(d => d.id === id);
  if (!doc) return NextResponse.json({ message: 'Không tìm thấy tài liệu' }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.documents.findIndex(d => d.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy tài liệu' }, { status: 404 });
  const deleted = db.documents.splice(index, 1)[0];
  logAction(deleted.uploadedBy || 'NV-001', 'Nhân viên', 'Xóa tài liệu', deleted.name);
  return NextResponse.json({ message: 'Đã xóa tài liệu thành công' });
}
