export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized } from '@/lib/db';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.systemLogs);
}
