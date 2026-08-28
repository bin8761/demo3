export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';
import type { Folder } from '@/lib/types';

export async function GET() {
  ensureInitialized();
  return NextResponse.json(db.folders);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newFolder: Folder = {
    id: `FOL-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    ...body,
  };
  db.folders.push(newFolder);
  logAction(newFolder.createdBy || 'NV-001', 'Admin', 'Tạo thư mục', newFolder.name);
  return NextResponse.json(newFolder, { status: 201 });
}
