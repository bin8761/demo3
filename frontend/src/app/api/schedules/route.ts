import { NextResponse } from 'next/server';
import { db, ensureInitialized } from '@/lib/db';
import type { Schedule } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.schedules);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newSchedule: Schedule = {
    id: `L-${String(db.schedules.length + 1).padStart(3, '0')}`,
    ...body,
  };
  db.schedules.push(newSchedule);
  return NextResponse.json(newSchedule, { status: 201 });
}
