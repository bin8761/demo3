export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized } from '@/lib/db';
import type { LeaveRequest } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.leaveRequests);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newRequest: LeaveRequest = {
    id: `NP-${Date.now()}`,
    status: 'Chờ duyệt',
    ...body,
  };
  db.leaveRequests.push(newRequest);
  return NextResponse.json(newRequest, { status: 201 });
}
