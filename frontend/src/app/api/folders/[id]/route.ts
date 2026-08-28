export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  // Xóa thư mục và toàn bộ tài liệu bên trong
  const index = db.folders.findIndex(f => f.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy thư mục' }, { status: 404 });
  const deleted = db.folders.splice(index, 1)[0];
  // Di chuyển documents trong thư mục này lên root
  db.documents.forEach(d => { if (d.folderId === id) d.folderId = undefined; });
  // Xóa sub-folders
  db.folders.forEach((f, i, arr) => { if (f.parentId === id) arr.splice(i, 1); });
  logAction('NV-001', 'Admin', 'Xóa thư mục', deleted.name);
  return NextResponse.json({ message: 'Đã xóa thư mục' });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.folders.findIndex(f => f.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy thư mục' }, { status: 404 });
  const body = await request.json();
  db.folders[index] = { ...db.folders[index], ...body };
  return NextResponse.json(db.folders[index]);
}
