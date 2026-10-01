import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user-customer-1';
  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ data: user });
}

export async function PUT(request: Request) {
  try {
    const { userId, ...updates } = await request.json();
    const targetId = userId || 'user-customer-1';
    const updated = updateUser(targetId, updates);
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
