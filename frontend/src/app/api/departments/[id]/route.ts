import { NextResponse } from 'next/server';
import { db, ensureInitialized } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const dept = db.departments.find(d => d.id === id);
  if (!dept) return NextResponse.json({ message: 'Không tìm thấy phòng ban' }, { status: 404 });

  const staffList = db.staff.filter(s => s.departmentId === id);
  const tasks = db.tasks.filter(t => t.departmentId === id);
  const chatMessages = db.chatMessages.filter(m => m.channelType === 'department' && m.channelId === id);
  const timekeeping = db.timekeeping.filter(t => staffList.some(s => s.id === t.staffId));

  return NextResponse.json({ ...dept, staffList, tasks, chatMessages, timekeeping });
}
