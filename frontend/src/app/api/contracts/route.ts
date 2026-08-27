import { NextResponse } from 'next/server';
import { db, ensureInitialized } from '@/lib/db';
import type { Contract } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.contracts);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newContract: Contract = {
    id: `HD-${String(db.contracts.length + 1).padStart(3, '0')}`,
    ...body,
  };
  db.contracts.push(newContract);
  return NextResponse.json(newContract, { status: 201 });
}
