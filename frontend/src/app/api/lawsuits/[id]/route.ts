export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db, ensureInitialized, logAction } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const lawsuit = db.lawsuits.find(l => l.id === id);
  if (!lawsuit) return NextResponse.json({ message: 'Không tìm thấy vụ án' }, { status: 404 });

  const customer = db.customers.find(c => c.id === lawsuit.customerId);
  const lawyer = db.staff.find(s => s.id === lawsuit.lawyerId);
  const support = lawsuit.supportId ? db.staff.find(s => s.id === lawsuit.supportId) : null;
  const tasks = db.tasks.filter(t => t.lawsuitId === lawsuit.id);
  const chatMessages = db.chatMessages.filter(m => m.channelType === 'lawsuit' && m.channelId === lawsuit.id);
  const documents = db.documents.filter(d => d.lawsuitId === lawsuit.id);
  const revenues = db.revenues.filter(r => r.lawsuitId === lawsuit.id);
  const expenses = db.expenses.filter(e => e.lawsuitId === lawsuit.id);
  const debt = db.debts.find(d => d.lawsuitId === lawsuit.id);

  return NextResponse.json({ ...lawsuit, customer, lawyer, support, tasks, chatMessages, documents, revenues, expenses, debt });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureInitialized();
  const { id } = await params;
  const index = db.lawsuits.findIndex(l => l.id === id);
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy vụ án' }, { status: 404 });
  const body = await request.json();
  db.lawsuits[index] = { ...db.lawsuits[index], ...body };
  logAction('NV-001', 'Admin', 'Cập nhật vụ án', db.lawsuits[index].title);
  return NextResponse.json(db.lawsuits[index]);
}
