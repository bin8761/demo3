import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';
import type { Task } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.tasks);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newTask: Task = {
    id: `CV-${String(db.tasks.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString().split('T')[0],
    ...body,
  };
  db.tasks.push(newTask);
  logAction('NV-001', 'Admin', 'Giao công việc', newTask.title);
  return NextResponse.json(newTask, { status: 201 });
}
