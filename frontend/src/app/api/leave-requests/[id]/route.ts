import { NextResponse } from 'next/server';
import { db, ensureInitialized } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.leaveRequests.findIndex(r => r.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy' }, { status: 404 });
  const body = await request.json();
  db.leaveRequests[index] = { ...db.leaveRequests[index], ...body };
  return NextResponse.json(db.leaveRequests[index]);
}
