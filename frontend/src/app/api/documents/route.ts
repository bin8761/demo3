export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized } from '@/lib/db';
import type { Document } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.documents);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newDoc: Document = {
    id: `DOC-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    ...body,
  };
  db.documents.push(newDoc);
  return NextResponse.json(newDoc, { status: 201 });
}
