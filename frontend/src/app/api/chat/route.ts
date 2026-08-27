import { NextResponse } from 'next/server';
import { db, ensureInitialized } from '@/lib/db';
import type { ChatMessage } from '@/lib/types';

export async function GET(request: Request) {
  ensureInitialized();
  const { searchParams } = new URL(request.url);
  const channelType = searchParams.get('channelType');
  const channelId = searchParams.get('channelId');

  let messages = db.chatMessages;
  if (channelType) messages = messages.filter(m => m.channelType === channelType);
  if (channelId) messages = messages.filter(m => m.channelId === channelId);

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  ensureInitialized();
  const body = await request.json();
  const newMsg: ChatMessage = {
    id: `CHAT-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...body,
  };
  db.chatMessages.push(newMsg);
  return NextResponse.json(newMsg, { status: 201 });
}
