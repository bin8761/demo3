export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized } from '@/lib/db';
import type { Timekeeping } from '@/lib/types';

export async function GET(request: Request) {
  ensureInitialized();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const staffId = searchParams.get('staffId');

  let records = db.timekeeping;
  if (date) records = records.filter(r => r.date === date);
  if (staffId) records = records.filter(r => r.staffId === staffId);

  return NextResponse.json(records);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newRecord: Timekeeping = {
    id: `CC-${Date.now()}`,
    ...body,
  };
  db.timekeeping.push(newRecord);
  return NextResponse.json(newRecord, { status: 201 });
}
