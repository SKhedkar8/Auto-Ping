import { NextResponse } from 'next/server';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user-customer-1';
  const notifications = getNotifications(userId);
  return NextResponse.json({ data: notifications });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, userId, markAll } = body;

    if (markAll && userId) {
      const count = markAllNotificationsAsRead(userId);
      return NextResponse.json({ success: true, count });
    }

    if (id) {
      const success = markNotificationAsRead(id);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid notification patch parameters' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
